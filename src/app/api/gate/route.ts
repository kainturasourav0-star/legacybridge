import { NextResponse } from 'next/server';
import { confidenceGateEngine } from '@/lib/gate/confidenceGate';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';

  const result = await confidenceGateEngine.evaluateGate(projectId);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || 'proj-acme-monolith-01';
    const action = body.action;

    let report = await confidenceGateEngine.evaluateGate(projectId);

    if (action === 'sign_off') {
      const approvedBy = body.approvedBy || 'Principal Lead Architect';
      const justification = body.justification || 'Verified regression test exceptions and signed off on Phase 1 Strangler boundary.';
      report = await confidenceGateEngine.signOffGate(report, approvedBy, justification);
    }

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Confidence Gate evaluation failed' }, { status: 500 });
  }
}
