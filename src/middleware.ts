import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { globalRateLimiter } from '@/lib/security/rateLimiter';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next (Next.js internals, static files, chunks)
     * 2. /favicon.ico, /images, /static (public static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
  ],
};

function handleSecurityAndRateLimit(req: NextRequest): NextResponse | null {
  // 1. Block dangerous / prohibited HTTP methods
  const method = req.method.toUpperCase();
  if (['TRACE', 'TRACK'].includes(method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // 2. Rate Limiting across API routes
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/')) {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateCheck = globalRateLimiter.check(clientIp, 120, 60_000); // 120 requests/min per IP

    if (!rateCheck.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please wait before retrying.',
          retryAfterMs: rateCheck.resetMs,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  return null;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content-Security-Policy (Strict yet compatible with Next.js inline styles, Clerk, Supabase, and TinyFish)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: blob: https://img.clerk.com;
    connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://agent.tinyfish.ai https://api.search.tinyfish.ai https://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com;
    frame-ancestors 'self';
    form-action 'self';
    base-uri 'self';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder')
);

export default isClerkConfigured
  ? clerkMiddleware((auth, req) => {
      const blocked = handleSecurityAndRateLimit(req);
      if (blocked) return blocked;
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    })
  : function middleware(req: NextRequest) {
      const blocked = handleSecurityAndRateLimit(req);
      if (blocked) return blocked;
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    };
