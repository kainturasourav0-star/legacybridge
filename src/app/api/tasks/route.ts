import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbGetTasks, dbCreateTask } from '@/lib/supabase/client';
import { CreateTaskSchema } from '@/lib/validation';
import { validateSourceUrl, sanitizeText } from '@/lib/security';
import { Task } from '@/types';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const tasks = await dbGetTasks(user.userId);
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();

    const parsed = CreateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { name, prompt, sourceUrl, destinationType, destinationConfig, expectedSchema, scheduleCron, scheduleHuman, isWriteAction } = parsed.data;

    // Security check: validate source URL
    const urlCheck = validateSourceUrl(sourceUrl);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.reason }, { status: 400 });
    }

    // Security check: sanitize natural language prompt against prompt-injection
    const cleanPrompt = sanitizeText(prompt);
    const cleanName = sanitizeText(name);

    // Synthesize structured goal from natural language prompt
    const goal = `Navigate to ${sourceUrl}. Execute instruction: "${cleanPrompt}". Authenticate if required, traverse navigation menus, paginate across all data tables, and extract records conforming to schema.`;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.userId,
      name: cleanName,
      prompt: cleanPrompt,
      goal,
      sourceUrl,
      expectedSchema: Object.keys(expectedSchema).length > 0 ? expectedSchema : {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['region', 'units_sold', 'revenue'],
              properties: {
                region: { type: 'string' },
                units_sold: { type: 'integer' },
                revenue: { type: 'number' },
              },
            },
          },
        },
      },
      destinationType: destinationType || 'slack',
      destinationConfig: destinationConfig || { slackChannel: '#ops-reports' },
      scheduleCron: scheduleCron || null,
      scheduleHuman: scheduleHuman || null,
      isWriteAction: isWriteAction || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await dbCreateTask(newTask);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create task' }, { status: 500 });
  }
}
