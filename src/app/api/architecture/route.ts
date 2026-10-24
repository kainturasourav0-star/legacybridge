import { NextResponse } from 'next/server';
import { SAMPLE_MODULES, SAMPLE_EDGES, SAMPLE_SERVICE_CANDIDATES } from '@/fixtures/legacy_monolith';

export async function GET() {
  return NextResponse.json({
    modules: SAMPLE_MODULES,
    edges: SAMPLE_EDGES,
    candidates: SAMPLE_SERVICE_CANDIDATES,
  });
}
