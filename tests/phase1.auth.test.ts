import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.ts';
import { resetDbForTests } from '../server/db/client.ts';
import { seedDatabase } from '../server/db/seed.ts';

let server: http.Server;
let baseUrl = '';

async function req(
  path: string,
  options: { method?: string; body?: unknown; cookie?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookie) {
    headers['Cookie'] = options.cookie;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : undefined;
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie };
}

describe('Phase 1: Schema, Seed, Auth & Access Control (Tests 18 & 19)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    resetDbForTests(':memory:');
    seedDatabase();
    const app = createApp({ skipSeed: true });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr !== 'string') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('seeds categories and demo users idempotently', async () => {
    seedDatabase(); // second run should remain idempotent
    const res = await req('/api/categories');
    expect(res.status).toBe(200);
    expect(res.data.categories).toHaveLength(5);
    expect(res.data.categories.map((c: { name: string }) => c.name)).toContain('Contractors');
  });

  it('Test 18: OTP send, wrong OTP error, resend, success, and rate limit after 5 tries', async () => {
    const mobile = '9876511111';
    const sendRes = await req('/api/auth/otp/send', {
      method: 'POST',
      body: { mobile, purpose: 'LOGIN' },
    });
    expect(sendRes.status).toBe(200);
    expect(sendRes.data.sent).toBe(true);
    const otp = sendRes.data.devPreviewOtp;
    expect(otp).toMatch(/^\d{6}$/);

    // Wrong OTP fails with 400
    const badRes = await req('/api/auth/otp/verify', {
      method: 'POST',
      body: { mobile, code: '000000', mode: 'LOGIN' },
    });
    expect(badRes.status).toBe(400);
    expect(badRes.data.error).toMatch(/Incorrect OTP/i);

    // Resend works
    const resendRes = await req('/api/auth/otp/send', {
      method: 'POST',
      body: { mobile, purpose: 'LOGIN' },
    });
    expect(resendRes.status).toBe(200);

    // Valid OTP succeeds and creates session cookie
    const okRes = await req('/api/auth/otp/verify', {
      method: 'POST',
      body: { mobile, code: resendRes.data.devPreviewOtp, mode: 'LOGIN' },
    });
    expect(okRes.status).toBe(200);
    expect(okRes.data.verified).toBe(true);
    expect(okRes.cookie).toBeTruthy();

    // Rate limiting after 5 wrong OTP attempts on a fresh mobile
    const rateMobile = '9876522222';
    await req('/api/auth/otp/send', {
      method: 'POST',
      body: { mobile: rateMobile, purpose: 'LOGIN' },
    });

    for (let i = 1; i <= 4; i++) {
      const r = await req('/api/auth/otp/verify', {
        method: 'POST',
        body: { mobile: rateMobile, code: '999999' },
      });
      expect(r.status).toBe(400);
    }

    // 5th attempt triggers 429 rate limit
    const fifth = await req('/api/auth/otp/verify', {
      method: 'POST',
      body: { mobile: rateMobile, code: '999999' },
    });
    expect(fifth.status).toBe(429);

    // Subsequent attempt remains blocked
    const sixth = await req('/api/auth/otp/verify', {
      method: 'POST',
      body: { mobile: rateMobile, code: '123456' },
    });
    expect(sixth.status).toBe(429);
  });

  it('Test 19: Role-based access control & partner earnings ownership', async () => {
    // Unauthenticated -> 401
    const unauth = await req('/api/admin/overview');
    expect(unauth.status).toBe(401);

    // Customer login
    const custLogin = await req('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'ananya@serva.demo', password: 'Serva@123' },
    });
    expect(custLogin.status).toBe(200);
    const custCookie = custLogin.cookie!;

    // Customer blocked from Partner & Admin APIs with 403
    const custToPartner = await req('/api/partner/earnings', { cookie: custCookie });
    expect(custToPartner.status).toBe(403);
    const custToAdmin = await req('/api/admin/overview', { cookie: custCookie });
    expect(custToAdmin.status).toBe(403);

    // Partner login
    const partLogin = await req('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'ramesh.partner@serva.demo', password: 'Serva@123' },
    });
    expect(partLogin.status).toBe(200);
    const partCookie = partLogin.cookie!;

    // Partner can read own earnings
    const ownEarnings = await req('/api/partner/earnings', { cookie: partCookie });
    expect(ownEarnings.status).toBe(200);

    // Partner CANNOT read another partner's earnings -> 403
    const otherEarnings = await req('/api/partner/earnings?partnerId=partner-verified-2', {
      cookie: partCookie,
    });
    expect(otherEarnings.status).toBe(403);

    // Partner CANNOT open admin routes -> 403
    const partToAdmin = await req('/api/admin/overview', { cookie: partCookie });
    expect(partToAdmin.status).toBe(403);

    // Admin login succeeds on admin route
    const adminLogin = await req('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'admin@serva.demo', password: 'Admin@123' },
    });
    expect(adminLogin.status).toBe(200);
    const adminOverview = await req('/api/admin/overview', { cookie: adminLogin.cookie! });
    expect(adminOverview.status).toBe(200);
    expect(adminOverview.data.counts.users).toBeGreaterThanOrEqual(5);
  });
});
