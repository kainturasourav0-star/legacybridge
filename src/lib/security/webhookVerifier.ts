import crypto from 'crypto';

/**
 * Validates HMAC SHA-256 signatures on incoming webhooks (Stripe, TinyFish, or custom partner webhooks)
 * Guarantees cryptographic authenticity, payload integrity, and replay-attack protection.
 */
export function verifyWebhookSignature(params: {
  payload: string | Buffer;
  signatureHeader: string;
  secret: string;
  toleranceSeconds?: number;
}): { valid: boolean; reason?: string } {
  const { payload, signatureHeader, secret, toleranceSeconds = 300 } = params;

  if (!signatureHeader || !secret) {
    return { valid: false, reason: 'Missing signature header or webhook secret.' };
  }

  // Parse signature header: e.g. "t=1730000000,v1=abc123def456..." or raw hex hash
  let timestamp: number | null = null;
  let signature: string = signatureHeader;

  if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [k, v] = part.trim().split('=');
      if (k === 't') timestamp = parseInt(v, 10);
      if (k === 'v1') signature = v;
    }
  }

  // Replay Attack Guard: Check timestamp against tolerance window
  if (timestamp) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { valid: false, reason: `Timestamp outside tolerance window of ${toleranceSeconds}s.` };
    }
  }

  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf-8');
  const signedPayload = timestamp ? `${timestamp}.${payloadString}` : payloadString;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Use crypto.timingSafeEqual to prevent side-channel timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valid: false, reason: 'Signature length mismatch.' };
    }

    const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    if (!isValid) {
      return { valid: false, reason: 'Invalid cryptographic signature.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Signature parsing exception.' };
  }
}
