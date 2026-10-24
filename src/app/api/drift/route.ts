import { NextResponse } from 'next/server';
import { driftDetector } from '@/lib/drift/driftDetector';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';

  const driftResult = await driftDetector.analyzeDrift(projectId);
  return NextResponse.json(driftResult);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || 'proj-acme-monolith-01';

    const driftResult = await driftDetector.analyzeDrift(projectId);
    return NextResponse.json(driftResult, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Drift execution failed' }, { status: 500 });
  }
}
