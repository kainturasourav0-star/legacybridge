import { NextRequest, NextResponse } from 'next/server';
import { dbGetRuns, dbGetTaskById } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id;
    // Find latest succeeded run for this task
    const runs = await dbGetRuns('user_hackathon_demo_lead', taskId);
    const latestSuccess = runs.find((r) => r.status === 'succeeded' && r.validatedData);

    if (!latestSuccess || !latestSuccess.validatedData) {
      return NextResponse.json({
        error: 'No validated feed data found for this task yet. Trigger a run first.',
        taskId,
      }, { status: 404 });
    }

    return NextResponse.json({
      meta: {
        source: 'LegacyBridge Instant API Feed Engine',
        taskId,
        runId: latestSuccess.id,
        executionMode: latestSuccess.executionMode,
        lastUpdated: latestSuccess.completedAt || latestSuccess.startedAt,
        validationScore: latestSuccess.validationReport?.score || 100,
        replayUrl: latestSuccess.replayUrl,
      },
      data: latestSuccess.validatedData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Feed retrieval error' }, { status: 500 });
  }
}
