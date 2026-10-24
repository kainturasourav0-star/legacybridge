import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetRunById } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    const run = await dbGetRunById(params.id, user.userId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    return NextResponse.json(run);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching run details' }, { status: 500 });
  }
}
