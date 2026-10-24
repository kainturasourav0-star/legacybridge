import { NextResponse } from 'next/server';
import { SAMPLE_MIGRATION_PLAN, SAMPLE_SERVICE_CANDIDATES } from '@/fixtures/legacy_monolith';
import { MigrationPlan } from '@/types';

let currentPlan: MigrationPlan = { ...SAMPLE_MIGRATION_PLAN };

export async function GET() {
  return NextResponse.json({
    plan: currentPlan,
    candidates: SAMPLE_SERVICE_CANDIDATES,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'approve') {
      currentPlan = {
        ...currentPlan,
        isApproved: true,
        approvedBy: body.approvedBy || 'Principal Lead Architect',
        approvedAt: new Date().toISOString(),
      };
      return NextResponse.json(currentPlan);
    }

    if (body.phases) {
      currentPlan = {
        ...currentPlan,
        phases: body.phases,
      };
      return NextResponse.json(currentPlan);
    }

    return NextResponse.json(currentPlan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
