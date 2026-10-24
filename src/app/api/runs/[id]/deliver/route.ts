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

    if (!run.validatedData) {
      return NextResponse.json({ error: 'Cannot deliver: Run has no validated data' }, { status: 400 });
    }

    const task = await dbGetTaskById(run.taskId, user.userId);
    const dest = task?.destinationType || 'slack';
    const channel = task?.destinationConfig?.slackChannel || '#ops-reports';
    const manualKey = `${run.id}-manual-deliver`;

    let deliveryResult;
    if (dest === 'slack') {
      deliveryResult = await DeliveryService.deliverToSlack(channel, run.validatedData, manualKey, run.replayUrl);
    } else if (dest === 'sheets') {
      const sheet = task?.destinationConfig?.sheetName || 'LegacyBridge_Export';
      deliveryResult = await DeliveryService.deliverToSheets(sheet, run.validatedData, manualKey);
    } else if (dest === 'webhook') {
      const webhookUrl = task?.destinationConfig?.webhookUrl || process.env.DEFAULT_WEBHOOK_URL || 'https://webhook.site/mock-target';
      deliveryResult = await DeliveryService.deliverToWebhook(webhookUrl, run.validatedData, manualKey);
    } else if (dest === 'postgres') {
      const table = task?.destinationConfig?.targetTable || 'legacy_exports';
      deliveryResult = await DeliveryService.deliverToPostgres(table, run.validatedData, manualKey);
    } else {
      deliveryResult = { destination: 'csv', success: true, receipt: 'Validated records prepared for CSV export' };
    }

    await dbAddRunEvent({
      id: `evt-${Date.now()}`,
      runId: run.id,
      eventType: 'manual_delivery',
      status: deliveryResult.success ? 'completed' : 'failed',
      message: deliveryResult.receipt,
      createdAt: new Date().toISOString(),
    });

    const updated = await dbUpdateRun(run.id, {
      deliveryStatus: deliveryResult.success ? 'delivered' : 'failed',
    });

    return NextResponse.json({ run: updated, receipt: deliveryResult.receipt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delivery error' }, { status: 500 });
  }
}
