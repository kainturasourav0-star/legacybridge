import { NextResponse } from 'next/server';
import { tinyFishClient } from '@/lib/tinyfish/client';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'LegacyBridge Enterprise Engine',
    version: '1.0.0',
    demoMode: process.env.DEMO_MODE === 'true' || !tinyFishClient.isConfigured(),
    tinyFishConfigured: tinyFishClient.isConfigured(),
    timestamp: new Date().toISOString(),
  });
}
