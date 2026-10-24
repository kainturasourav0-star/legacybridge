import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetTaskById, dbDeleteTask } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const task = await dbGetTaskById(params.id, user.userId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const success = await dbDeleteTask(params.id, user.userId);
    if (!success) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id: params.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting task' }, { status: 500 });
  }
}
