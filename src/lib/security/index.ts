export function sanitizeText(text: string): string {
  if (!text) return '';
  // Strip prompt injection attempts commonly injected into HTML/DOM
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /system:\s*/gi,
    /admin\s+override\s*:\s*/gi,
    /disregard\s+the\s+above/gi,
  ];
  let clean = text;
  for (const pattern of injectionPatterns) {
    clean = clean.replace(pattern, '[REDACTED_POTENTIAL_INJECTION]');
  }
  return clean;
}

export function maskSecret(secret?: string | null): string {
  if (!secret) return 'Not configured';
  if (secret.length <= 8) return '********';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

export function validateSourceUrl(urlStr: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
    }

    const host = parsed.hostname.toLowerCase();

    // Allow localhost and demo portal port for local hackathon demo
    if (host === 'localhost' || host === '127.0.0.1') {
      if (parsed.port === '8080') {
        return { valid: true };
      }
      return { valid: false, reason: 'Localhost is only permitted for the authorized demo portal on port 8080.' };
    }

    // Deny generic private IP ranges to prevent SSRF
    const isPrivate =
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host === '169.254.169.254';

    if (isPrivate) {
      return { valid: false, reason: 'Access to private internal network addresses is prohibited for security.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format.' };
  }
}
