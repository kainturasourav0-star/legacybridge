import { describe, it, expect } from 'vitest';
import { dbCreateTask, dbGetTaskById, dbCreateRun, dbGetRunById, dbUpdateRun } from '../src/lib/supabase/client';
import { Task, Run } from '../src/types';

describe('Tenant Isolation & IDOR Defense', () => {
  const taskUserA: Task = {
    id: `task-isolation-a-${Date.now()}`,
    userId: 'user_alice_123',
    name: 'Alice Private Inventory Pull',
    prompt: 'Extract inventory records',
    goal: 'Navigate to portal and extract',
    sourceUrl: 'http://localhost:8080',
    expectedSchema: { type: 'object' },
    destinationType: 'slack',
    destinationConfig: { slackChannel: '#alice-ops' },
    isWriteAction: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const runUserA: Run = {
    id: `run-isolation-a-${Date.now()}`,
    taskId: taskUserA.id,
    userId: 'user_alice_123',
    executionMode: 'demo',
    status: 'succeeded',
    timeSavedMinutes: 120,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    validatedData: { total: 100 },
  };

  it('allows owner Alice to retrieve her own task', async () => {
    await dbCreateTask(taskUserA);
    const retrieved = await dbGetTaskById(taskUserA.id, 'user_alice_123');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(taskUserA.id);
  });

  it('blocks Bob from retrieving Alice private task (IDOR Prevention)', async () => {
    const unauthorized = await dbGetTaskById(taskUserA.id, 'user_bob_999');
    expect(unauthorized).toBeNull();
  });

  it('blocks Bob from retrieving Alice private run (IDOR Prevention)', async () => {
    await dbCreateRun(runUserA);
    const unauthorizedRun = await dbGetRunById(runUserA.id, 'user_bob_999');
    expect(unauthorizedRun).toBeNull();
  });

  it('blocks Bob from updating Alice private run (Write Access Control)', async () => {
    await expect(
      dbUpdateRun(runUserA.id, { status: 'failed' }, 'user_bob_999')
    ).rejects.toThrow(/Forbidden/);
  });
});
