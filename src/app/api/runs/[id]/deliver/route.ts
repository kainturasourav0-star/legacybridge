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

    const deliveryResult = await DeliveryService.deliverToSlack(channel, run.validatedData, `${run.id}-manual-deliver`, run.replayUrl);

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
