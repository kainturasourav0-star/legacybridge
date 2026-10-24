/**
 * Enterprise Structured Logger with Automatic Credential Masking.
 * Prevents secrets, tokens, credit scores, and PII from leaking into logs or observability providers.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'api_key',
  'apikey',
  'cookie',
  'creditscore',
  'ssn',
  'credential',
]);

export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Mask potential JWTs
    if (/eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}/.test(data)) {
      return '[REDACTED_JWT]';
    }
    // Mask potential bearer tokens
    if (/bearer\s+[a-zA-Z0-9_\-\.]{10,}/i.test(data)) {
      return 'Bearer [REDACTED_TOKEN]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('key')) {
        sanitized[key] = '[REDACTED_SECRET]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }

  return data;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class StructuredLogger {
  private serviceName: string;

  constructor(serviceName = 'legacybridge') {
    this.serviceName = serviceName;
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...(meta ? { meta: sanitizeLogData(meta) } : {}),
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }

  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }
}

export const logger = new StructuredLogger('legacybridge-web');
