import { describe, it, expect } from 'vitest';
import { dbCreateTask, dbGetTasks, dbGetTaskById, dbDeleteTask } from '../src/lib/supabase/client';
import { Task } from '../src/types';

describe('Task Library & Lifecycle Management', () => {
  it('creates, retrieves, and lists tasks for authenticated user', async () => {
    const userId = 'user_hackathon_demo_lead';
    const newTask: Task = {
      id: `task-test-${Date.now()}`,
      userId,
      name: 'Inventory Health Check',
      prompt: 'Extract stock count from warehouse ledger',
      goal: 'Navigate to inventory portal and collect stock rows',
      sourceUrl: 'http://localhost:8080',
      expectedSchema: { type: 'object', required: ['items'] },
      destinationType: 'slack',
      destinationConfig: { slackChannel: '#warehouse-alerts' },
      scheduleCron: null,
      scheduleHuman: 'Manual trigger',
      isWriteAction: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await dbCreateTask(newTask);
    expect(created.id).toBe(newTask.id);

    const retrieved = await dbGetTaskById(newTask.id, userId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Inventory Health Check');

    const list = await dbGetTasks(userId);
    expect(list.some((t) => t.id === newTask.id)).toBe(true);
  });

  it('prevents unauthorized users from deleting another user task (IDOR)', async () => {
    const ownerId = 'user_hackathon_demo_lead';
    const attackerId = 'user_unauthorized_attacker';
    const task: Task = {
      id: `task-secure-${Date.now()}`,
      userId: ownerId,
      name: 'Confidential Finance Pipe',
      prompt: 'Extract financial disclosures',
      goal: 'Collect ledgers',
      sourceUrl: 'http://localhost:8080',
      expectedSchema: { type: 'object', required: ['items'] },
      destinationType: 'slack',
      destinationConfig: { slackChannel: '#finance' },
      scheduleCron: null,
      scheduleHuman: 'Manual',
      isWriteAction: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbCreateTask(task);

    // Attacker attempts deletion
    await expect(dbDeleteTask(task.id, attackerId)).rejects.toThrow(/Forbidden/);

    // Verify task still exists
    const stillExists = await dbGetTaskById(task.id, ownerId);
    expect(stillExists).not.toBeNull();
  });

  it('allows owner to successfully delete their task', async () => {
    const ownerId = 'user_hackathon_demo_lead';
    const task: Task = {
      id: `task-delete-me-${Date.now()}`,
      userId: ownerId,
      name: 'Temporary Scratch Task',
      prompt: 'Temporary query',
      goal: 'Temporary',
      sourceUrl: 'http://localhost:8080',
      expectedSchema: { type: 'object', required: ['items'] },
      destinationType: 'slack',
      destinationConfig: { slackChannel: '#scratch' },
      scheduleCron: null,
      scheduleHuman: 'Manual',
      isWriteAction: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbCreateTask(task);
    const deleted = await dbDeleteTask(task.id, ownerId);
    expect(deleted).toBe(true);

    const afterDelete = await dbGetTaskById(task.id, ownerId);
    expect(afterDelete).toBeNull();
  });
});
