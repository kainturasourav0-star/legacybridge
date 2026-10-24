import { NextResponse } from 'next/server';
import { safetyTwinEngine } from '@/lib/twin/safetyTwin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';
  const originalRev = searchParams.get('originalRev') || 'v1.4.2-monolith';
  const proposedRev = searchParams.get('proposedRev') || 'v2.0.0-candidate';

  const result = await safetyTwinEngine.compareImplementations(projectId, originalRev, proposedRev);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || 'proj-acme-monolith-01';
    const originalRev = body.originalRev || 'v1.4.2-monolith';
    const proposedRev = body.proposedRev || 'v2.0.0-candidate';

    const result = await safetyTwinEngine.compareImplementations(projectId, originalRev, proposedRev);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Safety Twin execution failed' }, { status: 500 });
  }
}
