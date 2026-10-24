import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetRuns } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId') || undefined;

    const runs = await dbGetRuns(user.userId, taskId);
    return NextResponse.json(runs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching runs' }, { status: 500 });
  }
}
