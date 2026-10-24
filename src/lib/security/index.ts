export function sanitizeText(text: string): string {
  if (!text) return '';
  // Strip prompt injection attempts commonly injected into HTML/DOM
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /system:\s*/gi,
    /admin\s+override\s*:\s*/gi,
    /disregard\s+the\s+above/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
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

/**
 * Checks whether an IPv4 address is in a reserved or private range.
 */
function isPrivateIPv4(octets: number[]): boolean {
  const [a, b] = octets;
  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (Link-local, AWS/GCP metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

export function validateSourceUrl(urlStr: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
    }

    if (parsed.username || parsed.password) {
      return { valid: false, reason: 'Embedded user credentials in URLs are prohibited.' };
    }

    const host = parsed.hostname.toLowerCase();

    // Whitelist: Localhost Acme Inventory ERP exclusively on port 8080
    if (host === 'localhost' || host === '127.0.0.1') {
      if (parsed.port === '8080') {
        return { valid: true };
      }
      return { valid: false, reason: 'Localhost is only permitted for the authorized demo portal on port 8080.' };
    }

    // Prohibit cloud metadata service hostnames
    const blockedHosts = [
      'metadata.google.internal',
      'metadata.google.com',
      'instance-data',
      '169.254.169.254',
      '0.0.0.0',
      '::1',
      '[::1]',
    ];
    if (blockedHosts.includes(host)) {
      return { valid: false, reason: 'Access to internal cloud metadata and loopback services is prohibited.' };
    }

    // Check IPv6 Private/Local ranges
    if (host.startsWith('[') || host.includes(':')) {
      const cleanIpv6 = host.replace(/[\[\]]/g, '');
      if (
        cleanIpv6 === '::1' ||
        cleanIpv6 === '::' ||
        cleanIpv6.startsWith('fe80:') || // Link-local
        cleanIpv6.startsWith('fc00:') || // Unique local
        cleanIpv6.startsWith('fd00:')
      ) {
        return { valid: false, reason: 'Access to private IPv6 address spaces is prohibited.' };
      }
    }

    // Parse standard IPv4 (e.g. 192.168.1.1)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = host.match(ipv4Regex);
    if (ipv4Match) {
      const octets = [
        parseInt(ipv4Match[1], 10),
        parseInt(ipv4Match[2], 10),
        parseInt(ipv4Match[3], 10),
        parseInt(ipv4Match[4], 10),
      ];

      // Validate each octet <= 255
      if (octets.some((o) => o > 255)) {
        return { valid: false, reason: 'Malformed IPv4 address.' };
      }

      if (isPrivateIPv4(octets)) {
        return { valid: false, reason: 'Access to private internal network addresses is prohibited for security.' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format.' };
  }
}
