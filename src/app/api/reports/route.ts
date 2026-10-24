import { NextResponse } from 'next/server';
import { SAMPLE_MODERNIZATION_REPORT } from '@/fixtures/legacy_monolith';
import { ModernizationReport } from '@/types';

let currentReport: ModernizationReport = { ...SAMPLE_MODERNIZATION_REPORT };

export async function GET() {
  return NextResponse.json(currentReport);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'sign_off') {
      currentReport = {
        ...currentReport,
        signedOff: true,
        signedOffBy: body.signedOffBy || 'Principal Lead Architect (Sourav Kaintura)',
        generatedAt: new Date().toISOString(),
      };
      return NextResponse.json(currentReport);
    }

    return NextResponse.json(currentReport);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
