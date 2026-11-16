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

describe('Phase 8: Wallet, Profile/Addresses, Offers, Support, Language & Final Checks', () => {
  let custCookie = '';
  let partnerCookie = '';

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
    partnerCookie = await login('ramesh.partner@serva.demo', 'Serva@123');
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Wallet balance, demo top-up, transactions, and digital receipts', async () => {
    const initial = await req('/api/wallet', { cookie: custCookie });
    expect(initial.status).toBe(200);
    const startBalance = initial.data.wallet.balance_paise;
    expect(startBalance).toBeGreaterThanOrEqual(150000);

    const invalidTopup = await req('/api/wallet/topup', {
      method: 'POST',
      cookie: custCookie,
      body: { amountRupees: 50 },
    });
    expect(invalidTopup.status).toBe(400);

    const topup = await req('/api/wallet/topup', {
      method: 'POST',
      cookie: custCookie,
      body: { amountRupees: 500 },
    });
    expect(topup.status).toBe(200);
    expect(topup.data.wallet.balance_paise).toBe(startBalance + 50000);

    const after = await req('/api/wallet', { cookie: custCookie });
    expect(after.status).toBe(200);
    expect(after.data.transactions.some((tx: any) => tx.amount_paise === 50000)).toBe(true);
  });

  it('Offers list returns active platform offers', async () => {
    const res = await req('/api/offers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.offers)).toBe(true);
    expect(res.data.offers.length).toBeGreaterThan(0);
  });

  it('Saved addresses & farm locations CRUD with strict ownership checks', async () => {
    const addFarm = await req('/api/profile/addresses', {
      method: 'POST',
      cookie: custCookie,
      body: {
        label: 'Mango Orchard - Suryapet',
        kind: 'FARM',
        line1: 'Survey 240, Canal Bank',
        area: 'Kodad Road',
        villageMandal: 'Suryapet Mandal',
        city: 'Suryapet',
        state: 'Telangana',
        pincode: '508213',
        isDefault: false,
      },
    });
    expect(addFarm.status).toBe(201);
    const farmId = addFarm.data.address.id;
    expect(addFarm.data.address.kind).toBe('FARM');
    expect(addFarm.data.address.village_mandal).toBe('Suryapet Mandal');

    const addHome = await req('/api/profile/addresses', {
      method: 'POST',
      cookie: custCookie,
      body: {
        label: 'Parents Home - Secunderabad',
        kind: 'HOME',
        line1: 'Plot 14, Marredpally',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500026',
      },
    });
    expect(addHome.status).toBe(201);

    const listRes = await req('/api/profile/addresses', { cookie: custCookie });
    expect(listRes.status).toBe(200);
    expect(listRes.data.addresses.some((a: any) => a.id === farmId)).toBe(true);

    // Another user cannot delete Ananya's address
    const forbiddenDel = await req(`/api/profile/addresses/${farmId}`, {
      method: 'DELETE',
      cookie: partnerCookie,
    });
    expect(forbiddenDel.status).toBe(403);

    const delOk = await req(`/api/profile/addresses/${farmId}`, {
      method: 'DELETE',
      cookie: custCookie,
    });
    expect(delOk.status).toBe(200);
  });

  it('Support FAQs, booking complaint ticket with photo, and general callback request', async () => {
    const supportInit = await req('/api/support', { cookie: custCookie });
    expect(supportInit.status).toBe(200);
    expect(supportInit.data.faqs.length).toBeGreaterThanOrEqual(5);

    // Create a fresh moving booking to file a complaint against
    const bkRes = await req('/api/moving/book', {
      method: 'POST',
      cookie: custCookie,
      body: {
        serviceSlug: 'home-shifting',
        scheduledDate: '2026-12-01',
        scheduledTime: '09:00 AM',
        pickupAddress: { line1: 'Madhapur Flat 402', floor: 4, hasLift: true, city: 'Hyderabad' },
        dropAddress: { line1: 'Kondapur Plot 12', floor: 2, hasLift: true, city: 'Hyderabad' },
        propertySize: '2 BHK',
        workerCount: 3,
        vehicleChoice: 'WILL_ARRANGE',
        providerSuppliesMaterials: false,
        boxes: { small: 0, medium: 0, large: 0, xl: 0, custom: 0 },
      },
    });
    expect(bkRes.status).toBe(201);
    const bookingId = bkRes.data.booking.id;

    const complaintRes = await req('/api/support/ticket', {
      method: 'POST',
      cookie: custCookie,
      body: {
        bookingId,
        category: 'Damaged Item',
        description: 'Glass dining table corner scratched during unloading.',
        photos: ['https://example.invalid/damage.jpg'],
      },
    });
    expect(complaintRes.status).toBe(201);
    expect(complaintRes.data.mode).toBe('BOOKING_COMPLAINT');
    expect(complaintRes.data.ticket.booking_id).toBe(bookingId);

    const callbackRes = await req('/api/support/ticket', {
      method: 'POST',
      cookie: custCookie,
      body: {
        category: 'General Inquiry',
        description: 'Need callback regarding weekend availability for deep cleaning.',
        callbackPhone: '9876543210',
      },
    });
    expect(callbackRes.status).toBe(201);
    expect(callbackRes.data.mode).toBe('CALLBACK');
  });

  it('Test 21: Language preference persists across sessions via PATCH /api/auth/preferences and GET /api/auth/me', async () => {
    const patchRes = await req('/api/auth/preferences', {
      method: 'PATCH',
      cookie: custCookie,
      body: { language: 'te', default_city: 'Vijayawada, AP' },
    });
    expect(patchRes.status).toBe(200);
    expect(patchRes.data.user.language).toBe('te');
    expect(patchRes.data.user.default_city).toBe('Vijayawada, AP');

    const meRes = await req('/api/auth/me', { cookie: custCookie });
    expect(meRes.status).toBe(200);
    expect(meRes.data.user.language).toBe('te');
    expect(meRes.data.user.default_city).toBe('Vijayawada, AP');

    // Restore to EN/Hyderabad
    await req('/api/auth/preferences', {
      method: 'PATCH',
      cookie: custCookie,
      body: { language: 'en', default_city: 'Hyderabad, TG' },
    });
  });

  it('Test 3 Monte Carlo: 200+ simulations produce integer discounts in [20, 50] with both endpoints hit', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const result = calculateHomeServicePricing({ workerPricePaise: 15000 });
      expect(Number.isInteger(result.discountRupees)).toBe(true);
      expect(result.discountRupees).toBeGreaterThanOrEqual(20);
      expect(result.discountRupees).toBeLessThanOrEqual(50);
      seen.add(result.discountRupees);
    }
    for (let i = 0; i < 600 && (!seen.has(20) || !seen.has(50)); i++) {
      const d = generateHomeServiceDiscountRupees();
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThanOrEqual(20);
      expect(d).toBeLessThanOrEqual(50);
      seen.add(d);
    }
    expect(seen.has(20)).toBe(true);
    expect(seen.has(50)).toBe(true);
  });
});
