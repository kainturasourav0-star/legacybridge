import { NextResponse } from 'next/server';
import { boundaryAdvisorEngine } from '@/lib/advisor/boundaryAdvisor';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';

  const result = await boundaryAdvisorEngine.evaluateBoundaries(projectId);
  return NextResponse.json(result);
}
