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

  it('stages write action in needs_approval status until explicit operator sign-off', async () => {
    const writeRun: Run = {
      id: `run-approval-${Date.now()}`,
      taskId: taskUserA.id,
      userId: 'user_alice_123',
      executionMode: 'demo',
      status: 'needs_approval',
      timeSavedMinutes: 45,
      startedAt: new Date().toISOString(),
      validatedData: { action: 'update_stock', sku: 'SKU-001', new_qty: 250 },
    };
    await dbCreateRun(writeRun);

    const retrieved = await dbGetRunById(writeRun.id, 'user_alice_123');
    expect(retrieved?.status).toBe('needs_approval');

    // Simulate operator approval
    const approved = await dbUpdateRun(writeRun.id, {
      status: 'succeeded',
      deliveryStatus: 'delivered',
      completedAt: new Date().toISOString(),
    }, 'user_alice_123');

    expect(approved?.status).toBe('succeeded');
    expect(approved?.deliveryStatus).toBe('delivered');
  });

  it('delivers data to Webhook and blocks malicious SSRF target', async () => {
    const { DeliveryService } = await import('../src/lib/delivery');
    
    // Malicious SSRF target
    const ssrfResult = await DeliveryService.deliverToWebhook(
      'http://169.254.169.254/latest/meta-data',
      { items: [{ id: 1 }] },
      'test-run-ssrf'
    );
    expect(ssrfResult.success).toBe(false);
    expect(ssrfResult.receipt).toContain('Blocked');

    // Valid webhook
    const validResult = await DeliveryService.deliverToWebhook(
      'https://webhook.site/mock-target',
      { items: [{ id: 1, name: 'Widget' }] },
      'test-run-valid-wh'
    );
    expect(validResult.success).toBe(true);
    expect(validResult.receipt).toContain('Dispatched JSON payload');
  });

  it('delivers data to PostgreSQL destination and enforces idempotent dispatch', async () => {
    const { DeliveryService } = await import('../src/lib/delivery');

    const pgResult = await DeliveryService.deliverToPostgres(
      'regional_sales_data',
      { items: [{ region: 'EMEA', revenue: 50000 }] },
      'test-run-pg-1'
    );
    expect(pgResult.success).toBe(true);
    expect(pgResult.receipt).toContain('Synchronized 1 validated records');

    // Idempotent retry with same runId
    const retryResult = await DeliveryService.deliverToPostgres(
      'regional_sales_data',
      { items: [{ region: 'EMEA', revenue: 50000 }] },
      'test-run-pg-1'
    );
    expect(retryResult.receipt).toContain('Idempotent: Already synced');
  });
});

