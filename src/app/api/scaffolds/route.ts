import { NextResponse } from 'next/server';
import { scaffoldGenerator } from '@/lib/migration/scaffolder';
import { SAMPLE_SERVICE_CANDIDATES } from '@/fixtures/legacy_monolith';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get('serviceId') || 'svc-orders';

  const candidate = SAMPLE_SERVICE_CANDIDATES.find((c) => c.id === serviceId) || SAMPLE_SERVICE_CANDIDATES[0];
  const scaffold = scaffoldGenerator.generateScaffold(candidate);

  return NextResponse.json(scaffold);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceId = body.serviceId || 'svc-orders';
    const candidate = SAMPLE_SERVICE_CANDIDATES.find((c) => c.id === serviceId) || SAMPLE_SERVICE_CANDIDATES[0];
    const scaffold = scaffoldGenerator.generateScaffold(candidate);

    return NextResponse.json(scaffold);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
