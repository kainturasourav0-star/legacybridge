import { NextResponse } from 'next/server';
import { tinyfishResearchAgent } from '@/lib/tinyfish/research';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'proj-acme-monolith-01';
  const query = searchParams.get('query') || undefined;

  const research = await tinyfishResearchAgent.researchMigration({
    projectId,
    sourceFramework: 'Express 4.16 / Node 14',
    targetFramework: 'FastAPI / Next.js REST Microservices',
    runtime: 'Node.js 20 LTS & Python 3.11',
    query,
  });

  return NextResponse.json(research);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const research = await tinyfishResearchAgent.researchMigration({
      projectId: body.projectId || 'proj-acme-monolith-01',
      sourceFramework: body.sourceFramework || 'Express 4.16',
      targetFramework: body.targetFramework || 'FastAPI / Next.js',
      runtime: body.runtime || 'Node.js 20 & Python 3.11',
      query: body.query,
    });

    return NextResponse.json(research, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Research failed' }, { status: 500 });
  }
}
