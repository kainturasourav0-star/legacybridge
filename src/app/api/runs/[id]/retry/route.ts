import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetRunById } from '@/lib/supabase/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const run = await dbGetRunById(params.id, user.userId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    // Trigger new execution for the same task
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/tasks/${run.taskId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const newRun = await res.json();
    return NextResponse.json(newRun);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Retry execution failed' }, { status: 500 });
  }
}
