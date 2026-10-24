import { NextResponse } from 'next/server';
import { tinyFishClient } from '@/lib/tinyfish/client';
import { maskSecret } from '@/lib/security';

export async function GET() {
  const isDemo = process.env.DEMO_MODE === 'true';
  const tfKey = process.env.TINYFISH_API_KEY;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const sheetsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;

  return NextResponse.json({
    integrations: [
      {
        provider: 'tinyfish',
        name: 'TinyFish Web Agent API',
        configured: tinyFishClient.isConfigured(),
        status: isDemo ? 'demo_simulation' : (tinyFishClient.isConfigured() ? 'connected' : 'unconfigured'),
        maskedRef: maskSecret(tfKey),
        description: 'Autonomous browser agent for logging in, navigating menus, and extracting DOM structures.',
        docsUrl: 'https://docs.tinyfish.chat/',
      },
      {
        provider: 'slack',
        name: 'Slack Incoming Webhook',
        configured: !!slackUrl && !slackUrl.startsWith('https://hooks.slack.com/services/MOCK'),
        status: (slackUrl && !slackUrl.startsWith('https://hooks.slack.com/services/MOCK')) ? 'connected' : 'demo_mode',
        maskedRef: maskSecret(slackUrl),
        description: 'Dispatches validated tabular summaries and TinyFish live replay links to Slack channels.',
        docsUrl: 'https://api.slack.com/messaging/webhooks',
      },
      {
        provider: 'google_sheets',
        name: 'Google Sheets API',
        configured: !!sheetsJson,
        status: sheetsJson ? 'connected' : 'unconfigured',
        maskedRef: sheetsJson ? 'Service Account Configured' : 'Not configured',
        description: 'Appends extracted records directly to enterprise Google Sheets spreadsheets.',
        docsUrl: 'https://developers.google.com/sheets/api/guides/concepts',
      },
    ],
  });
}
