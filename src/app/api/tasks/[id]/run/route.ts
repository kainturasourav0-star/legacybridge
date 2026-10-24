import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetTaskById, dbCreateRun, dbUpdateRun, dbAddRunEvent, dbGetRuns } from '@/lib/supabase/client';
import { tinyFishClient } from '@/lib/tinyfish/client';
import { DataValidator } from '@/lib/validation';
import { DeliveryService } from '@/lib/delivery';
import { Run, RunEvent } from '@/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const task = await dbGetTaskById(params.id, user.userId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isDemo = process.env.DEMO_MODE === 'true' || !tinyFishClient.isConfigured();

    // 1. Create initial Run Record
    const initialRun: Run = {
      id: runId,
      taskId: task.id,
      userId: user.userId,
      executionMode: isDemo ? 'demo' : 'real',
      status: 'running',
      timeSavedMinutes: task.isWriteAction ? 45 : 120,
      startedAt: new Date().toISOString(),
      deliveryStatus: 'pending',
    };
    await dbCreateRun(initialRun);

    const logEvent = async (type: string, message: string, status: 'in_progress' | 'completed' | 'failed' = 'completed', details?: any) => {
      const event: RunEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        runId,
        eventType: type,
        status,
        message,
        details,
        createdAt: new Date().toISOString(),
      };
      await dbAddRunEvent(event);
    };

    await logEvent('task_received', `Task initiated: "${task.name}"`, 'completed');
    await logEvent('goal_prepared', `Target: ${task.sourceUrl} | Goal synthesized`, 'completed', { goal: task.goal });

    // 2. Execute TinyFish Browser Automation
    const tfResult = await tinyFishClient.executeTask(
      task.sourceUrl,
      task.goal,
      task.expectedSchema,
      async (step) => {
        await logEvent(step.type, step.message, 'completed');
      }
    );

    if (tfResult.status === 'FAILED') {
      const failedRun = await dbUpdateRun(runId, {
        status: 'failed',
        errorMessage: tfResult.errorMessage,
        completedAt: new Date().toISOString(),
      });
      await logEvent('browser_execution_failed', tfResult.errorMessage || 'Execution aborted', 'failed');
      return NextResponse.json(failedRun);
    }

    await logEvent('data_extraction_completed', 'Extracted structured data from legacy portal', 'completed', {
      replayUrl: tfResult.replayUrl,
    });

    // 3. Schema Validation & Quality Check
    await dbUpdateRun(runId, { status: 'validating' });
    await logEvent('validation_started', 'Validating payload against JSON schema invariants...', 'in_progress');

    // Fetch baseline from previous runs for drift detection
    const prevRuns = await dbGetRuns(user.userId, task.id);
    const lastValidRun = prevRuns.find((r) => r.id !== runId && r.status === 'succeeded' && r.validatedData);
    const baseline = lastValidRun ? lastValidRun.validatedData : undefined;

    const validationReport = DataValidator.validate(tfResult.extractedData, task.expectedSchema, baseline || undefined);

    if (!validationReport.valid) {
      const valFailedRun = await dbUpdateRun(runId, {
        status: 'validation_failed',
        extractedData: tfResult.extractedData,
        validationReport,
        replayUrl: tfResult.replayUrl,
        errorMessage: `Validation errors: ${validationReport.errors.join('; ')}`,
        completedAt: new Date().toISOString(),
      });
      await logEvent('validation_failed', `Schema validation rejected payload (Score: ${validationReport.score})`, 'failed', { errors: validationReport.errors });
      return NextResponse.json(valFailedRun);
    }

    await logEvent('validation_completed', `Pydantic & JSON Schema validation passed (Trust Score: ${validationReport.score}%)`, 'completed', {
      checks: validationReport.checks,
      anomalies: validationReport.anomalies,
    });

    // 4. Approval Gate Check for Write Actions
    if (task.isWriteAction) {
      const approvalRun = await dbUpdateRun(runId, {
        status: 'needs_approval',
        extractedData: tfResult.extractedData,
        validatedData: tfResult.extractedData,
        validationReport,
        replayUrl: tfResult.replayUrl,
      });
      await logEvent('approval_gate', 'Write action staged. Awaiting human operator sign-off before committing mutation.', 'in_progress');
      return NextResponse.json(approvalRun);
    }

    // 5. Delivery Phase
    await dbUpdateRun(runId, { status: 'delivering' });
    await logEvent('delivery_started', `Dispatching validated payload to ${task.destinationType.toUpperCase()}...`, 'in_progress');

    let deliveryOutcome = 'delivered';
    let deliveryReceipt = '';

    if (task.destinationType === 'slack') {
      const channel = task.destinationConfig?.slackChannel || '#ops-reports';
      const slk = await DeliveryService.deliverToSlack(channel, tfResult.extractedData!, runId, tfResult.replayUrl);
      deliveryOutcome = slk.success ? 'delivered' : 'failed';
      deliveryReceipt = slk.receipt;
    } else if (task.destinationType === 'sheets') {
      const sheet = task.destinationConfig?.sheetName || 'LegacyBridge_Export';
      const sht = await DeliveryService.deliverToSheets(sheet, tfResult.extractedData!, runId);
      deliveryOutcome = sht.success ? 'delivered' : 'failed';
      deliveryReceipt = sht.receipt;
    } else {
      deliveryReceipt = 'Ready for immediate CSV/JSON download';
    }

    await logEvent('delivery_completed', deliveryReceipt, deliveryOutcome === 'delivered' ? 'completed' : 'failed');

    // 6. Complete Run
    const finalRun = await dbUpdateRun(runId, {
      status: deliveryOutcome === 'delivered' ? 'succeeded' : 'failed',
      extractedData: tfResult.extractedData,
      validatedData: tfResult.extractedData,
      validationReport,
      tinyfishRunId: tfResult.runId,
      replayUrl: tfResult.replayUrl,
      deliveryStatus: deliveryOutcome,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json(finalRun);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Execution error' }, { status: 500 });
  }
}
