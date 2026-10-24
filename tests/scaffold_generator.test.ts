import { describe, it, expect } from 'vitest';
import { scaffoldGenerator } from '../src/lib/migration/scaffolder';
import { SAMPLE_SERVICE_CANDIDATES } from '../src/fixtures/legacy_monolith';

describe('ServiceScaffoldGenerator', () => {
  it('generates complete Express / TypeScript microservice scaffold with Dockerfile and OpenAPI specs', () => {
    const ordersCandidate = SAMPLE_SERVICE_CANDIDATES.find((c) => c.id === 'svc-orders')!;
    const scaffold = scaffoldGenerator.generateScaffold(ordersCandidate);

    expect(scaffold).toBeDefined();
    expect(scaffold.serviceId).toBe('svc-orders');
    expect(scaffold.language).toBe('typescript');
    expect(scaffold.framework).toBe('express');

    // Verify generated files
    const indexFile = scaffold.files.find((f) => f.path === 'src/index.ts');
    expect(indexFile).toBeDefined();
    expect(indexFile?.content).toContain('app.use(helmet())');
    expect(indexFile?.content).toContain('/health');

    // Verify domain rules file contains verification TODO notice
    const rulesFile = scaffold.files.find((f) => f.path === 'src/domain/rules.ts');
    expect(rulesFile).toBeDefined();
    expect(rulesFile?.hasTodoNotice).toBe(true);
    expect(rulesFile?.content).toContain('TODO: HUMAN ARCHITECT REVIEW REQUIRED');

    // Verify Dockerfile
    expect(scaffold.dockerfile).toContain('FROM node:20-alpine');
    expect(scaffold.openApiSpec).toContain('"openapi": "3.1.0"');
  });

  it('generates FastAPI / Python microservice scaffold for supply chain inventory services', () => {
    const inventoryCandidate = SAMPLE_SERVICE_CANDIDATES.find((c) => c.id === 'svc-inventory')!;
    const scaffold = scaffoldGenerator.generateScaffold(inventoryCandidate);

    expect(scaffold.language).toBe('python');
    expect(scaffold.framework).toBe('fastapi');
    expect(scaffold.dockerfile).toContain('FROM python:3.11-slim');
    expect(scaffold.files[0].content).toContain('from fastapi import FastAPI');
  });
});
