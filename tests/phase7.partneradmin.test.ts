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

async function login(identifier: string, password: string) {
  const res = await req('/api/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
  expect(res.status).toBe(200);
  return res.cookie!;
}

describe('Phase 7: Partner Onboarding, Machinery Dashboard & Admin Panel (Test 13 + Settlements)', () => {
  let custCookie = '';
  let partner1Cookie = '';
  let adminCookie = '';

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

    custCookie = await login('ananya@serva.demo', 'Serva@123');
    partner1Cookie = await login('ramesh.partner@serva.demo', 'Serva@123');
    adminCookie = await login('admin@serva.demo', 'Admin@123');
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Test 13: Partner registration submits as SUBMITTED, blocked with 403 until Admin verifies, then accepts 200', async () => {
    // Individual registers as new SERVA Partner without owning a company
    const regRes = await req('/api/partner/register', {
      method: 'POST',
      body: {
        name: 'Vikram Individual Tech',
        mobile: '9876544332',
        email: 'vikram.tech@serva.demo',
        password: 'Password@123',
        partnerType: 'Technician / Home Worker',
        businessName: 'Vikram Electricals',
        isIndividual: true,
        categories: ['home-services', 'agriculture'],
        services: ['electrician', 'drone-spraying'],
        serviceArea: 'Madhapur, Hyderabad',
        experienceYears: 5,
        teamSize: 1,
        identityDocRef: 'AADHAAR-8821-4402',
        payoutAccount: { mode: 'UPI', upiId: 'vikram@upi' },
        agreedToTerms: true,
        availabilityDates: ['2026-11-30'],
      },
    });
    expect(regRes.status).toBe(201);
    expect(regRes.data.partner.verification_status).toBe('SUBMITTED');
    const newPartnerId = regRes.data.partner.id;
    const newPartnerCookie = regRes.cookie!;
    expect(newPartnerCookie).toBeTruthy();

    // Customer creates a Home Services booking
    const bkRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'electrician',
        scheduledDate: '2026-11-29',
        scheduledTime: '10:00 AM',
        address: { line1: 'Madhapur Flat 402', city: 'Hyderabad' },
      },
    });
    expect(bkRes.status).toBe(201);
    const bookingId = bkRes.data.booking.id;

    // Unverified newly registered partner is blocked from accepting -> 403
    const blockedAccept = await req(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      cookie: newPartnerCookie,
    });
    expect(blockedAccept.status).toBe(403);

    // Non-admin cannot approve partner -> 403
    const nonAdminVerify = await req(`/api/admin/partners/${newPartnerId}/verify`, {
      method: 'PATCH',
      cookie: custCookie,
      body: { status: 'VERIFIED' },
    });
    expect(nonAdminVerify.status).toBe(403);

    // Admin marks UNDER_REVIEW then VERIFIED
    const reviewRes = await req(`/api/admin/partners/${newPartnerId}/verify`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { status: 'UNDER_REVIEW' },
    });
    expect(reviewRes.status).toBe(200);
    expect(reviewRes.data.partner.verification_status).toBe('UNDER_REVIEW');

    const verifyRes = await req(`/api/admin/partners/${newPartnerId}/verify`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { status: 'VERIFIED' },
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.data.partner.verification_status).toBe('VERIFIED');

    // Now verified partner accepts booking -> 200
    const okAccept = await req(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      cookie: newPartnerCookie,
    });
    expect(okAccept.status).toBe(200);
    expect(okAccept.data.booking.partner_id).toBe(newPartnerId);

    // Admin Settlement Ledger shows worker_payout_paise & platform_revenue_paise for the Home Services booking
    const adminOverview = await req('/api/admin/overview', { cookie: adminCookie });
    expect(adminOverview.status).toBe(200);
    const settlement = adminOverview.data.settlements.find(
      (s: { booking_id: string }) => s.booking_id === bookingId
    );
    expect(settlement).toBeDefined();
    expect(settlement.worker_payout_paise).toBeGreaterThan(0);
    expect(settlement.platform_revenue_paise).toBe(
      settlement.payable_paise - settlement.worker_payout_paise
    );
    expect(adminOverview.data.settlementTotals.totalWorkerPayoutPaise).toBeGreaterThan(0);

    // Partner Overview exposes ONLY own payout (no platform_revenue_paise or platform_percent)
    const partnerOverview = await req('/api/partner/overview', { cookie: newPartnerCookie });
    expect(partnerOverview.status).toBe(200);
    expect(partnerOverview.data.totalPayoutPaise).toBe(settlement.worker_payout_paise);
    expect(JSON.stringify(partnerOverview.data)).not.toContain('platform_revenue_paise');
    expect(JSON.stringify(partnerOverview.data)).not.toContain('platform_percent');
  });

  it('supports Machinery registration, availability calendar, portfolio moderation, and Admin settings', async () => {
    // Partner registers a new agricultural machine
    const machRes = await req('/api/partner/machines', {
      method: 'POST',
      cookie: partner1Cookie,
      body: {
        category: 'AGRICULTURE',
        machineType: 'Tractor',
        makeModel: 'Mahindra Yuvo Tech+ 575',
        hourlyRatePaise: 130000,
        dailyRatePaise: 800000,
        perAcreRatePaise: 150000,
        operatorIncluded: true,
      },
    });
    expect(machRes.status).toBe(201);
    expect(machRes.data.machine.make_model).toBe('Mahindra Yuvo Tech+ 575');

    // Partner toggles availability date
    const avRes = await req('/api/partner/availability', {
      method: 'PUT',
      cookie: partner1Cookie,
      body: { date: '2026-12-05', isAvailable: false },
    });
    expect(avRes.status).toBe(200);

    // Partner saves custom Moving box dimensions
    const rateRes = await req('/api/partner/rates', {
      method: 'PUT',
      cookie: partner1Cookie,
      body: { smallBoxDims: '12×10×10 in (30×25×25 cm)' },
    });
    expect(rateRes.status).toBe(200);

    // Partner adds portfolio item, Admin moderates it to REJECTED
    const portRes = await req('/api/partner/portfolio', {
      method: 'POST',
      cookie: partner1Cookie,
      body: {
        categorySlug: 'contractors',
        title: 'Duplex Staircase Woodwork',
        mediaType: 'IMAGE',
        mediaUrl: '/src/assets/images/hero_contractors_1794821794462.jpg',
      },
    });
    expect(portRes.status).toBe(201);
    const portId = portRes.data.item.id;

    const modRes = await req(`/api/admin/portfolio/${portId}`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { moderationStatus: 'REJECTED' },
    });
    expect(modRes.status).toBe(200);
    expect(modRes.data.item.moderation_status).toBe('REJECTED');

    // Admin updates commission settings
    const setRes = await req('/api/admin/settings', {
      method: 'PUT',
      cookie: adminCookie,
      body: {
        home_service_percent: 7,
        home_service_fixed_addon_paise: 10000,
        auto_confirm_hours: 48,
      },
    });
    expect(setRes.status).toBe(200);
    expect(setRes.data.settings.auto_confirm_hours).toBe('48');
  });
});
