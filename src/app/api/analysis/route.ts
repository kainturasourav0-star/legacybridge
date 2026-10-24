import { NextResponse } from 'next/server';
import { codeIntelligence } from '@/lib/analysis/codeIntelligence';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';

  const analysis = await codeIntelligence.analyzeProject(projectId);
  return NextResponse.json(analysis);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || 'proj-acme-monolith-01';

    const analysis = await codeIntelligence.analyzeProject(projectId);
    return NextResponse.json(analysis, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
