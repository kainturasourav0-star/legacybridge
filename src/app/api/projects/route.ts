import { NextResponse } from 'next/server';
import { SAMPLE_MONOLITH_PROJECT } from '@/fixtures/legacy_monolith';
import { Project } from '@/types';

// In-memory projects registry (with sample monolith initialized)
const projects: Project[] = [SAMPLE_MONOLITH_PROJECT];

export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: body.name || 'Untitled Legacy Project',
      description: body.description || 'Modernization workspace for legacy code intelligence.',
      sourceType: body.sourceType || 'sample_monolith',
      repoUrl: body.repoUrl,
      branch: body.branch || 'main',
      primaryLanguage: body.primaryLanguage || 'JavaScript / Node.js',
      detectedFramework: body.detectedFramework || 'Express / SQL',
      totalFiles: body.totalFiles || 34,
      linesOfCode: body.linesOfCode || 8420,
      status: 'imported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    return NextResponse.json(newProject, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 400 });
  }
}
