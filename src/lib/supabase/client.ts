import { createClient } from '@supabase/supabase-js';
import { Task, Run, RunEvent } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Reliable in-memory fallback store when Supabase keys are not set up locally
const inMemoryStore = {
  tasks: new Map<string, Task>(),
  runs: new Map<string, Run>(),
  events: new Map<string, RunEvent[]>(),
};

// Initialize with Demo Task
const sampleTaskId = 'task-q3-sales-acme';
const sampleTask: Task = {
  id: sampleTaskId,
  userId: 'user_hackathon_demo_lead',
  name: 'Acme Inventory Q3 Regional Sales Extraction',
  prompt: 'Open the inventory portal, retrieve Q3 sales by region, and send the results to our operations Slack channel.',
  goal: 'Navigate to Acme Inventory v4.2 ERP. Login with stored session. Traverse menu to Reports -> Q3 Regional Sales Ledger. Paginate through records and extract Region, SKU, Product Name, Units Sold, and Revenue.',
  sourceUrl: 'http://localhost:8080',
  expectedSchema: {
    type: 'object',
    required: ['report_title', 'items', 'total_revenue'],
    properties: {
      report_title: { type: 'string' },
      period: { type: 'string' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['region', 'sku', 'units_sold', 'revenue'],
          properties: {
            region: { type: 'string' },
            sku: { type: 'string' },
            product_name: { type: 'string' },
            units_sold: { type: 'integer' },
            revenue: { type: 'number' },
          },
        },
      },
      total_revenue: { type: 'number' },
    },
  },
  destinationType: 'slack',
  destinationConfig: {
    slackChannel: '#ops-reports',
  },
  scheduleCron: '0 7 * * 1-5',
  scheduleHuman: 'Every weekday at 7:30 AM',
  isWriteAction: false,
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
};

inMemoryStore.tasks.set(sampleTaskId, sampleTask);

// Seed initial historical succeeded run
const sampleRunId = 'run-hist-demo-001';
const sampleRun: Run = {
  id: sampleRunId,
  taskId: sampleTaskId,
  userId: 'user_hackathon_demo_lead',
  executionMode: 'demo',
  status: 'succeeded',
  startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  completedAt: new Date(Date.now() - 3600000 * 2 + 180000).toISOString(),
  timeSavedMinutes: 120,
  replayUrl: 'https://agent.tinyfish.ai/replays/rf-demo-q3-acme-78192a',
  deliveryStatus: 'delivered',
  extractedData: {
    report_title: 'Acme Inventory Q3 Regional Sales Performance',
    period: 'Q3 2026',
    items: [
      { region: 'North America', sku: 'ACM-8812', product_name: 'UltraSensor Pro', units_sold: 4120, revenue: 103000.0 },
      { region: 'Europe West', sku: 'ACM-9941', product_name: 'HydraValves X', units_sold: 2840, revenue: 85200.0 },
      { region: 'Asia Pacific', sku: 'ACM-4410', product_name: 'OptiRelay 400', units_sold: 6190, revenue: 154750.0 },
      { region: 'Latin America', sku: 'ACM-2298', product_name: 'MicroActuator G2', units_sold: 1340, revenue: 33500.0 },
      { region: 'Middle East', sku: 'ACM-1104', product_name: 'ThermalFuse Max', units_sold: 950, revenue: 28500.0 },
    ],
    total_revenue: 404950.0,
  },
  validatedData: {
    report_title: 'Acme Inventory Q3 Regional Sales Performance',
    period: 'Q3 2026',
    items: [
      { region: 'North America', sku: 'ACM-8812', product_name: 'UltraSensor Pro', units_sold: 4120, revenue: 103000.0 },
      { region: 'Europe West', sku: 'ACM-9941', product_name: 'HydraValves X', units_sold: 2840, revenue: 85200.0 },
      { region: 'Asia Pacific', sku: 'ACM-4410', product_name: 'OptiRelay 400', units_sold: 6190, revenue: 154750.0 },
      { region: 'Latin America', sku: 'ACM-2298', product_name: 'MicroActuator G2', units_sold: 1340, revenue: 33500.0 },
      { region: 'Middle East', sku: 'ACM-1104', product_name: 'ThermalFuse Max', units_sold: 950, revenue: 28500.0 },
    ],
    total_revenue: 404950.0,
  },
  validationReport: {
    valid: true,
    score: 100,
    anomalies: [],
    errors: [],
    checks: [
      { name: 'Schema Invariants', passed: true, detail: 'All required fields present' },
      { name: 'Row Count Non-Zero', passed: true, detail: '5 records extracted' },
      { name: 'Null Value Ratio', passed: true, detail: '0% missing values' },
      { name: 'Historical Drift Baseline', passed: true, detail: 'Revenue within 15% tolerance' },
    ],
  },
};
inMemoryStore.runs.set(sampleRunId, sampleRun);

export async function dbGetTasks(userId: string): Promise<Task[]> {
  if (supabase) {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data as any) || [];
  }
  return Array.from(inMemoryStore.tasks.values()).filter(t => t.userId === userId || userId === 'user_hackathon_demo_lead');
}

export async function dbGetTaskById(taskId: string, userId: string): Promise<Task | null> {
  if (supabase) {
    const { data } = await supabase.from('tasks').select('*').eq('id', taskId).eq('user_id', userId).single();
    return (data as any) || null;
  }
  const task = inMemoryStore.tasks.get(taskId);
  return task || null;
}

export async function dbCreateTask(task: Task): Promise<Task> {
  if (supabase) {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single();
    if (error) throw error;
    return data as any;
  }
  inMemoryStore.tasks.set(task.id, task);
  return task;
}

export async function dbGetRuns(userId: string, taskId?: string): Promise<Run[]> {
  if (supabase) {
    let q = supabase.from('runs').select('*').eq('user_id', userId).order('started_at', { ascending: false });
    if (taskId) q = q.eq('task_id', taskId);
    const { data } = await q;
    return (data as any) || [];
  }
  let runs = Array.from(inMemoryStore.runs.values()).filter(r => r.userId === userId || userId === 'user_hackathon_demo_lead');
  if (taskId) runs = runs.filter(r => r.taskId === taskId);
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function dbGetRunById(runId: string, userId: string): Promise<Run | null> {
  if (supabase) {
    const { data } = await supabase.from('runs').select('*').eq('id', runId).eq('user_id', userId).single();
    return (data as any) || null;
  }
  const run = inMemoryStore.runs.get(runId);
  if (!run) return null;
  const events = inMemoryStore.events.get(runId) || [];
  return { ...run, events };
}

export async function dbCreateRun(run: Run): Promise<Run> {
  if (supabase) {
    const { data, error } = await supabase.from('runs').insert([run]).select().single();
    if (error) throw error;
    return data as any;
  }
  inMemoryStore.runs.set(run.id, run);
  return run;
}

export async function dbUpdateRun(runId: string, updates: Partial<Run>): Promise<Run> {
  if (supabase) {
    const { data, error } = await supabase.from('runs').update(updates).eq('id', runId).select().single();
    if (error) throw error;
    return data as any;
  }
  const existing = inMemoryStore.runs.get(runId);
  if (!existing) throw new Error('Run not found');
  const updated = { ...existing, ...updates };
  inMemoryStore.runs.set(runId, updated);
  return updated;
}

export async function dbAddRunEvent(event: RunEvent): Promise<void> {
  if (supabase) {
    await supabase.from('run_events').insert([event]);
    return;
  }
  const list = inMemoryStore.events.get(event.runId) || [];
  list.push(event);
  inMemoryStore.events.set(event.runId, list);
}
