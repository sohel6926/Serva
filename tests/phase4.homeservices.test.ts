import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.ts';
import { resetDbForTests } from '../server/db/client.ts';
import { seedDatabase } from '../server/db/seed.ts';
import {
  calculateHomeServicePricing,
  generateHomeServiceDiscountRupees,
} from '../server/domain/pricing.ts';

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

describe('Phase 4: Home Services Pricing Engine, Flows & Privacy (Tests 1–5)', () => {
  let custCookie = '';
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
    adminCookie = await login('admin@serva.demo', 'Admin@123');
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Test 1 & Test 2: Pricing formula (₹100->₹207->₹177) and half-up rounding (₹250->₹18->₹368)', () => {
    // Test 1: worker_price = ₹100 (10000p), discount ₹30 -> display ₹207, payable ₹177, worker payout ₹100, revenue ₹77
    const ex1 = calculateHomeServicePricing({
      workerPricePaise: 10000,
      platformPercent: 7,
      fixedAddonPaise: 10000,
      discountRupeesOverride: 30,
    });
    expect(ex1.displayPricePaise).toBe(20700);
    expect(ex1.discountPaise).toBe(3000);
    expect(ex1.payablePaise).toBe(17700);
    expect(ex1.workerPayoutPaise).toBe(10000);
    expect(ex1.platformRevenuePaise).toBe(7700);

    // Test 2: worker_price = ₹250 (25000p), 7% = 17.50 -> rounds half up to ₹18 -> display ₹368
    const ex2 = calculateHomeServicePricing({
      workerPricePaise: 25000,
      platformPercent: 7,
      fixedAddonPaise: 10000,
      discountRupeesOverride: 25,
    });
    expect(ex2.percentAddonPaise).toBe(1800);
    expect(ex2.displayPricePaise).toBe(36800);
    expect(ex2.payablePaise).toBe(34300);
  });

  it('Test 3: Discount stability across reloads & bounds [20, 50] over 200+ simulations', async () => {
    // Verify bounds across 200 simulated calculations and both boundary values occur
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const p = calculateHomeServicePricing({ workerPricePaise: 20000 });
      expect(Number.isInteger(p.discountRupees)).toBe(true);
      expect(p.discountRupees).toBeGreaterThanOrEqual(20);
      expect(p.discountRupees).toBeLessThanOrEqual(50);
      seen.add(p.discountRupees);
    }
    // Guarantee coverage check up to 600 draws if rare edge didn't appear in first 200
    for (let i = 0; i < 600 && (!seen.has(20) || !seen.has(50)); i++) {
      const d = generateHomeServiceDiscountRupees();
      expect(d).toBeGreaterThanOrEqual(20);
      expect(d).toBeLessThanOrEqual(50);
      seen.add(d);
    }
    expect(seen.has(20)).toBe(true);
    expect(seen.has(50)).toBe(true);

    // Verify HTTP booking locks discount permanently across reloads and failed payment attempts
    const createRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'home-cleaning',
        quantity: 1,
        scheduledDate: '2026-11-26',
        scheduledTime: '09:00 AM',
        address: { line1: 'Flat 402, Madhapur', city: 'Hyderabad' },
        details: { subFlow: 'cleaning', quantities: { 'cln-floor': 2 }, workers: 1 },
      },
    });
    expect(createRes.status).toBe(201);
    const bookingId = createRes.data.booking.id;
    const initialDiscount = createRes.data.booking.customerPricing.offerDiscountPaise;
    const initialPayable = createRes.data.booking.total_paise;
    expect(initialDiscount).toBeGreaterThanOrEqual(2000);
    expect(initialDiscount).toBeLessThanOrEqual(5000);

    // Reopen booking twice & trigger an invalid payment method attempt
    await req(`/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'WALLET' }, // insufficient wallet for full cleaning? let's check either way discount unchanged
    });
    const reopen = await req(`/api/bookings/${bookingId}`, { cookie: custCookie });
    expect(reopen.status).toBe(200);
    expect(reopen.data.booking.customerPricing.offerDiscountPaise).toBe(initialDiscount);
    expect(reopen.data.booking.total_paise).toBe(initialPayable);
  });

  it('Test 4: Customer never sees worker price, 7%, ₹100, split, or commission; Admin sees full ledger', async () => {
    const createRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'electrician',
        quantity: 1,
        scheduledDate: '2026-11-27',
        scheduledTime: '10:00 AM',
        address: { line1: 'Flat 402, Madhapur', city: 'Hyderabad' },
        details: { subFlow: 'repairing', selectedOptionIds: ['rep-e-bulb'], units: 1 },
      },
    });
    expect(createRes.status).toBe(201);
    const bk = createRes.data.booking;
    expect(bk.customerPricing.servicePricePaise).toBe(20700); // ₹100 worker -> ₹207 display

    const catRes = await req('/api/home-services/catalog');
    const estRes = await req('/api/home-services/estimate', {
      method: 'POST',
      body: {
        serviceSlug: 'electrician',
        quantity: 1,
        details: { subFlow: 'repairing', selectedOptionIds: ['rep-e-bulb'], units: 1 },
      },
    });
    const detailRes = await req(`/api/bookings/${bk.id}`, { cookie: custCookie });
    const payRes = await req(`/api/bookings/${bk.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'UPI', milestoneLabel: 'FULL' },
    });
    expect(payRes.status).toBe(200);

    const customerPayloads = JSON.stringify([catRes.data, estRes.data, createRes.data, detailRes.data, payRes.data]);
    expect(customerPayloads).not.toMatch(/worker_price|workerPrice|worker_payout|platform_percent|fixed_addon|platform_revenue|pricingBreakdown|commission|random/i);

    // Admin sees full internal breakdown
    const adminView = await req(`/api/bookings/${bk.id}`, { cookie: adminCookie });
    expect(adminView.status).toBe(200);
    expect(adminView.data.booking.pricingBreakdown.worker_price_paise).toBe(10000);
    expect(adminView.data.booking.pricingBreakdown.display_price_paise).toBe(20700);
    expect(adminView.data.booking.pricingBreakdown.worker_payout_paise).toBe(10000);
  });

  it('Test 5: Cooking estimate (₹40 × 10 + ₹500 = ₹900) and Online-Only enforcement for Cooking & Painting', async () => {
    // Verify Cooking estimate formula
    const cookEst = await req('/api/home-services/estimate', {
      method: 'POST',
      body: {
        serviceSlug: 'home-cooking',
        quantity: 1,
        details: { subFlow: 'cooking', dishId: 'dish-dosa', cookingType: 'HOME', people: 10 },
      },
    });
    expect(cookEst.status).toBe(200);
    expect(cookEst.data.estimate.onlinePaymentOnly).toBe(true);
    expect(cookEst.data.estimate.cookingBreakdown.dishSubtotalPaise).toBe(40000); // ₹400
    expect(cookEst.data.estimate.cookingBreakdown.cookServiceChargePaise).toBe(50000); // ₹500
    expect(cookEst.data.estimate.servicePricePaise).toBe(90000); // ₹900

    // Create Cooking booking -> CASH rejected with 400, UPI succeeds
    const cookBook = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'home-cooking',
        quantity: 1,
        scheduledDate: '2026-11-28',
        scheduledTime: '08:00 AM',
        address: { line1: 'Plot 14, Kondapur', city: 'Hyderabad' },
        details: { subFlow: 'cooking', dishId: 'dish-dosa', cookingType: 'HOME', people: 10 },
      },
    });
    expect(cookBook.status).toBe(201);
    expect(cookBook.data.booking.payment_mode).toBe('ONLINE_ONLY');
    expect(cookBook.data.booking.customerPricing.servicePricePaise).toBe(90000);

    const cookCash = await req(`/api/bookings/${cookBook.data.booking.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'CASH' },
    });
    expect(cookCash.status).toBe(400);

    const cookUpi = await req(`/api/bookings/${cookBook.data.booking.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'UPI', milestoneLabel: 'FULL' },
    });
    expect(cookUpi.status).toBe(200);

    // Create Painting booking -> CASH rejected with 400, CARD succeeds
    const paintBook = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'wall-painting',
        quantity: 1,
        scheduledDate: '2026-11-29',
        scheduledTime: '10:00 AM',
        address: { line1: 'Plot 14, Kondapur', city: 'Hyderabad' },
        details: { subFlow: 'painting', areaSqft: 300, rooms: 2, finish: 'ROYAL_WASHABLE' },
      },
    });
    expect(paintBook.status).toBe(201);
    expect(paintBook.data.booking.payment_mode).toBe('ONLINE_ONLY');

    const paintCash = await req(`/api/bookings/${paintBook.data.booking.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'CASH' },
    });
    expect(paintCash.status).toBe(400);

    const paintCard = await req(`/api/bookings/${paintBook.data.booking.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'CARD', milestoneLabel: 'FULL' },
    });
    expect(paintCard.status).toBe(200);
  });
});
