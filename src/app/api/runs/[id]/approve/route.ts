import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetRunById, dbGetTaskById, dbUpdateRun, dbAddRunEvent } from '@/lib/supabase/client';
import { DeliveryService } from '@/lib/delivery';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const run = await dbGetRunById(params.id, user.userId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    if (run.status !== 'needs_approval') {
      return NextResponse.json({ error: `Run is in status '${run.status}', not awaiting approval.` }, { status: 400 });
    }

    const body = await req.json();
    const { decision, comments } = body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Decision must be "approved" or "rejected"' }, { status: 400 });
    }

    const task = await dbGetTaskById(run.taskId, user.userId);

    if (decision === 'rejected') {
      await dbAddRunEvent({
        id: `evt-${Date.now()}`,
        runId: run.id,
        eventType: 'approval_gate',
        status: 'failed',
        message: `Human Approval REJECTED: ${comments || 'Action declined by operator.'}`,
        createdAt: new Date().toISOString(),
      });

      const updated = await dbUpdateRun(run.id, {
        status: 'failed',
        errorMessage: `Write action declined by human operator: ${comments || 'No comment provided'}`,
        completedAt: new Date().toISOString(),
      }, user.userId);

      return NextResponse.json(updated);
    }

    // Approved: proceed to delivery
    await dbAddRunEvent({
      id: `evt-${Date.now()}`,
      runId: run.id,
      eventType: 'approval_gate',
      status: 'completed',
      message: `Human Approval GRANTED by operator. Proceeding to delivery: ${comments || 'Action confirmed.'}`,
      createdAt: new Date().toISOString(),
    });

    await dbUpdateRun(run.id, { status: 'delivering' }, user.userId);

    let deliveryOutcome = 'delivered';
    let deliveryReceipt = '';
    const dest = task?.destinationType || 'slack';
    const channel = task?.destinationConfig?.slackChannel || '#ops-reports';
    const payload = run.validatedData || run.extractedData || {};

    if (dest === 'slack') {
      const slk = await DeliveryService.deliverToSlack(channel, payload, run.id, run.replayUrl);
      deliveryOutcome = slk.success ? 'delivered' : 'failed';
      deliveryReceipt = slk.receipt;
    } else if (dest === 'sheets') {
      const sheet = task?.destinationConfig?.sheetName || 'LegacyBridge_Export';
      const sht = await DeliveryService.deliverToSheets(sheet, payload, run.id);
      deliveryOutcome = sht.success ? 'delivered' : 'failed';
      deliveryReceipt = sht.receipt;
    } else if (dest === 'webhook') {
      const webhookUrl = task?.destinationConfig?.webhookUrl || process.env.DEFAULT_WEBHOOK_URL || 'https://webhook.site/mock-target';
      const wh = await DeliveryService.deliverToWebhook(webhookUrl, payload, run.id);
      deliveryOutcome = wh.success ? 'delivered' : 'failed';
      deliveryReceipt = wh.receipt;
    } else if (dest === 'postgres') {
      const table = task?.destinationConfig?.targetTable || 'legacy_exports';
      const pg = await DeliveryService.deliverToPostgres(table, payload, run.id);
      deliveryOutcome = pg.success ? 'delivered' : 'failed';
      deliveryReceipt = pg.receipt;
    } else {
      deliveryReceipt = 'Delivery dispatched and ready for export';
    }

    await dbAddRunEvent({
      id: `evt-${Date.now()}-deliv`,
      runId: run.id,
      eventType: 'delivery_completed',
      status: deliveryOutcome === 'delivered' ? 'completed' : 'failed',
      message: deliveryReceipt,
      createdAt: new Date().toISOString(),
    });

    const finalRun = await dbUpdateRun(run.id, {
      status: deliveryOutcome === 'delivered' ? 'succeeded' : 'failed',
      deliveryStatus: deliveryOutcome,
      completedAt: new Date().toISOString(),
    }, user.userId);

    return NextResponse.json(finalRun);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Approval processing error' }, { status: 500 });
  }
}
