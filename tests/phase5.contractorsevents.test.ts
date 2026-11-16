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

describe('Phase 5: Contractors & Events (Tests 6, 7, 8, 12)', () => {
  let custCookie = '';
  let partner1Cookie = '';
  let partner2Cookie = '';

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
    partner2Cookie = await login('lakshmi.partner@serva.demo', 'Serva@123');
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Test 7 & Test 6: Multi-service Marriage sample quotation (₹2,90,000 / ₹87,000 / ₹2,03,000) & Events Advance Policy', async () => {
    const planRes = await req('/api/events/plan', {
      method: 'POST',
      cookie: custCookie,
      body: {
        eventType: 'Marriage / Wedding',
        eventName: 'Reddy Sample Marriage',
        eventDate: '2026-12-12',
        startTime: '09:00 AM',
        endTime: '10:00 PM',
        venueType: 'INDOOR',
        guestCount: 500,
        address: { line1: 'Hitex Convention, Madhapur', city: 'Hyderabad' },
        selectedServiceSlugs: ['decoration', 'catering', 'photography', 'dance', 'singing', 'dj'],
        selectedAddonIds: ['ev-other-bundle'],
        useMarriageSamplePreset: true,
      },
    });
    expect(planRes.status).toBe(201);
    const bk = planRes.data.booking;

    // Test 7: Exact line totals & 30% advance / balance
    expect(bk.items).toHaveLength(7);
    const itemsSum = bk.items.reduce((s: number, it: { total_paise: number }) => s + it.total_paise, 0);
    expect(itemsSum).toBe(29000000); // ₹2,90,000
    expect(bk.total_paise).toBe(29000000);
    expect(bk.advance_required_paise).toBe(8700000); // ₹87,000 (30%)
    expect(bk.milestones.balanceAfterAdvancePaise).toBe(20300000); // ₹2,03,000

    // Test 6: Advance unpaid -> AWAITING_ADVANCE and NO confirmed booking ID
    expect(bk.status).toBe('AWAITING_ADVANCE');
    expect(bk.confirmed_booking_id).toBeNull();

    // Even if vendor accepts before advance is paid, confirmed_booking_id stays null
    const earlyAccept = await req(`/api/bookings/${bk.id}/accept`, {
      method: 'POST',
      cookie: partner2Cookie,
    });
    expect(earlyAccept.status).toBe(200);
    expect(earlyAccept.data.booking.status).toBe('AWAITING_ADVANCE');
    expect(earlyAccept.data.booking.confirmed_booking_id).toBeNull();

    // Customer pays 30% advance -> becomes CONFIRMED with booking ID and receipt
    const advPay = await req(`/api/bookings/${bk.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'UPI', milestoneLabel: 'ADVANCE' },
    });
    expect(advPay.status).toBe(200);
    expect(advPay.data.receipt.amountPaise).toBe(8700000);
    expect(advPay.data.receipt.receiptNumber).toMatch(/^RCPT-/);
    expect(advPay.data.booking.status).toBe('CONFIRMED');
    expect(advPay.data.booking.price_status).toBe('CONFIRMED');
    expect(advPay.data.booking.confirmed_booking_id).toMatch(/^SRV-2026-/);
    expect(advPay.data.booking.balance_paise).toBe(20300000);
  });

  it('Test 8: DJ is a standalone service with no subcategories, showing experience, video, availability & quoted price', async () => {
    const evCat = await req('/api/events/catalog');
    expect(evCat.status).toBe(200);
    expect(evCat.data.launchServices).toHaveLength(6);
    expect(evCat.data.eventTypes).toHaveLength(16);
    expect(evCat.data.djProfiles.length).toBeGreaterThanOrEqual(2);
    const dj = evCat.data.djProfiles[0];
    expect(dj.experienceYears).toBeGreaterThan(0);
    expect(dj.videoUrl).toMatch(/\.mp4$/);
    expect(dj.availabilityDates.length).toBeGreaterThan(0);
    expect(dj.quotedPricePaise).toBe(1200000);

    // Subcategories for DJ do not exist in services metadata
    const djRes = await req('/api/events/plan', {
      method: 'POST',
      cookie: custCookie,
      body: {
        eventType: 'Birthday Parties',
        eventName: 'Sangeet DJ Night',
        eventDate: '2026-11-28',
        startTime: '07:00 PM',
        endTime: '11:30 PM',
        venueType: 'INDOOR',
        guestCount: 150,
        address: { line1: 'Clubhouse, Gachibowli', city: 'Hyderabad' },
        selectedServiceSlugs: ['dj'],
        djProfileId: dj.id,
      },
    });
    expect(djRes.status).toBe(201);
    expect(djRes.data.booking.service_slug).toBe('dj');
    expect(djRes.data.booking.total_paise).toBe(1200000);
  });

  it('Test 12: Home Construction is free promotion with no payment, and enquiry appears in Contractor dashboard', async () => {
    // Attempting to create a paid booking for home-construction is blocked
    const paidAttempt = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'contractors',
        serviceSlug: 'home-construction',
        scheduledDate: '2026-12-01',
        scheduledTime: '10:00 AM',
        address: { line1: 'Kompally Plot 9', city: 'Hyderabad' },
      },
    });
    expect(paidAttempt.status).toBe(400);

    // Free enquiry succeeds with zero payment
    const enqRes = await req('/api/contractors/enquiries', {
      method: 'POST',
      cookie: custCookie,
      body: {
        buildingType: 'Duplex Villa',
        plotSize: '300 sq. yds',
        budgetRange: '₹70 Lakhs',
        location: 'Kompally, Hyderabad',
        timeline: '8 Months',
        notes: 'Need turnkey elevation & G+1 plan',
      },
    });
    expect(enqRes.status).toBe(201);
    expect(enqRes.data.noPaymentRequired).toBe(true);

    // Enquiry appears in Contractor/Partner dashboard with customer details
    const dashRes = await req('/api/contractors/enquiries', { cookie: partner1Cookie });
    expect(dashRes.status).toBe(200);
    const match = dashRes.data.enquiries.find((e: { id: string }) => e.id === enqRes.data.enquiry.id);
    expect(match).toBeDefined();
    expect(match.customer_name).toBe('Ananya Reddy');
    expect(match.customer_mobile).toBe('9876543210');
    expect(match.building_type).toBe('Duplex Villa');
    expect(match.plot_size).toBe('300 sq. yds');
  });

  it('supports Contractors workers and vehicles bookings computed server-side', async () => {
    const workerRes = await req('/api/contractors/book', {
      method: 'POST',
      cookie: custCookie,
      body: {
        serviceSlug: 'site-workers',
        scheduledDate: '2026-11-24',
        scheduledTime: '09:00 AM',
        address: { line1: 'Nanakramguda Site 5', city: 'Hyderabad' },
        workerTradeId: 'cw-mason', // ₹1,100/day
        workerCount: 3,
        days: 4,
      },
    });
    expect(workerRes.status).toBe(201);
    expect(workerRes.data.booking.total_paise).toBe(110000 * 3 * 4);
  });
});
