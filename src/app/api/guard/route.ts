import { NextResponse } from 'next/server';
import { continuousGuardEngine } from '@/lib/guard/continuousGuard';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';

  const result = await continuousGuardEngine.evaluateRevisionChange(projectId);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || 'proj-acme-monolith-01';
    const changedFiles = body.changedFiles || ['services/orders/fulfillment.js'];
    const commitMessage = body.commitMessage || 'feat: update stock verification pipeline';
    const author = body.author || 'engineer@acme-corp.com';

    const result = await continuousGuardEngine.evaluateRevisionChange(projectId, changedFiles, commitMessage, author);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Continuous guard check failed' }, { status: 500 });
  }
}
