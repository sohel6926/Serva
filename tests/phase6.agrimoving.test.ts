import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.ts';
import { convertFarmArea } from '../server/data/agriMovingCatalog.ts';
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

describe('Phase 6: Agriculture and Moving & Shifting (Tests 9, 10, 11)', () => {
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

  it('Test 9: Moving has exact 7 main services, no SERVA vehicles, and rejects vehicle quotation lines with 400', async () => {
    const catRes = await req('/api/moving/catalog');
    expect(catRes.status).toBe(200);
    expect(catRes.data.vehicleProvidedByServa).toBe(false);
    expect(catRes.data.mainServices).toHaveLength(7);

    const slugs = catRes.data.mainServices.map((s: { slug: string }) => s.slug);
    expect(slugs).toEqual([
      'home-shifting',
      'office-shifting',
      'packing',
      'loading-unloading',
      'transport',
      'labour-only',
      'heavy-item-moving',
    ]);
    // Loading and Unloading is one combined service
    expect(catRes.data.mainServices.filter((s: { name: string }) => /loading/i.test(s.name))).toHaveLength(1);

    // Book Moving with customer-arranged option & zero boxes
    const bookRes = await req('/api/moving/book', {
      method: 'POST',
      cookie: custCookie,
      body: {
        serviceSlug: 'home-shifting',
        scheduledDate: '2026-11-25',
        scheduledTime: '09:00 AM',
        pickupAddress: { line1: 'Madhapur Flat 301', floor: 2, hasLift: true, city: 'Hyderabad' },
        dropAddress: { line1: 'Kondapur Plot 18', floor: 3, hasLift: false, city: 'Hyderabad' },
        propertySize: '2 BHK',
        workerCount: 3,
        vehicleChoice: 'WILL_ARRANGE',
        providerSuppliesMaterials: false,
        boxes: { small: 0, medium: 0, large: 0, xl: 0, custom: 0 },
      },
    });
    expect(bookRes.status).toBe(201);
    const bk = bookRes.data.booking;
    expect(bk.details.vehicleProvidedByServa).toBe(false);
    expect(bk.price_status).toBe('ESTIMATED');

    // No vehicle line items exist on moving booking
    const itemTypes = bk.items.map((it: { item_type: string }) => it.item_type);
    expect(itemTypes).not.toContain('VEHICLE');
    expect(itemTypes).toContain('WORKER_CHARGES');
    expect(itemTypes).toContain('LOADING_UNLOADING');

    // Partner 1 accepts moving job
    const acceptRes = await req(`/api/bookings/${bk.id}/accept`, {
      method: 'POST',
      cookie: partner1Cookie,
    });
    expect(acceptRes.status).toBe(200);

    // API rejects quotation line of type 'vehicle' with 400 (Hard Rule 2 & Test 9)
    const badQuoteRes = await req(`/api/bookings/${bk.id}/quotations`, {
      method: 'POST',
      cookie: partner1Cookie,
      body: {
        lines: [
          { line_type: 'worker_charges', label: '3 Moving Workers', quantity: 3, unit_price_paise: 80000 },
          { line_type: 'vehicle', label: 'Tata Ace Tempo', quantity: 1, unit_price_paise: 250000 },
        ],
      },
    });
    expect(badQuoteRes.status).toBe(400);
    expect(badQuoteRes.data.error).toMatch(/does not provide vehicles/i);

    // Valid quotation without vehicle succeeds, customer approves -> CONFIRMED, Moving statuses progress including Customer VEHICLE_DEPARTED
    const goodQuote = await req(`/api/bookings/${bk.id}/quotations`, {
      method: 'POST',
      cookie: partner1Cookie,
      body: {
        lines: [
          { line_type: 'worker_charges', label: '3 Moving Workers', quantity: 3, unit_price_paise: 80000 },
          { line_type: 'loading_unloading', label: 'Combined Loading & Unloading', quantity: 1, unit_price_paise: 120000 },
        ],
      },
    });
    expect(goodQuote.status).toBe(201);
    const quoteId = goodQuote.data.booking.quotations[0].id;

    const appRes = await req(`/api/bookings/${bk.id}/quotations/${quoteId}/approve`, {
      method: 'POST',
      cookie: custCookie,
    });
    expect(appRes.status).toBe(200);
    expect(appRes.data.booking.price_status).toBe('CONFIRMED');
    expect(appRes.data.booking.status).toBe('CONFIRMED');

    for (const s of ['ON_THE_WAY', 'ARRIVED', 'PACKING_IN_PROGRESS', 'LOADING_IN_PROGRESS']) {
      const st = await req(`/api/bookings/${bk.id}/status`, {
        method: 'POST',
        cookie: partner1Cookie,
        body: { status: s },
      });
      expect(st.status).toBe(200);
    }

    // Customer confirms VEHICLE_DEPARTED
    const departRes = await req(`/api/bookings/${bk.id}/status`, {
      method: 'POST',
      cookie: custCookie,
      body: { status: 'VEHICLE_DEPARTED' },
    });
    expect(departRes.status).toBe(200);
    expect(departRes.data.booking.status).toBe('VEHICLE_DEPARTED');
  });

  it('Test 10: Packing box specs have 5 sizes in inches & cm, XL warning, accept zero, and separate PACKING_MATERIALS line', async () => {
    const catRes = await req('/api/moving/catalog');
    expect(catRes.status).toBe(200);
    expect(catRes.data.boxSpecs).toHaveLength(5);

    const ids = catRes.data.boxSpecs.map((b: { id: string }) => b.id);
    expect(ids).toEqual(['small', 'medium', 'large', 'xl', 'custom']);
    for (const spec of catRes.data.boxSpecs) {
      expect(spec.dimensionsIn).toMatch(/in/);
      expect(spec.dimensionsCm).toMatch(/cm/);
    }
    const xl = catRes.data.boxSpecs.find((b: { id: string }) => b.id === 'xl');
    expect(xl.warning).toMatch(/Do not pack heavy items/i);

    // Book with providerSuppliesMaterials = true and mixed 0 & positive box quantities
    const res = await req('/api/moving/book', {
      method: 'POST',
      cookie: custCookie,
      body: {
        serviceSlug: 'packing',
        scheduledDate: '2026-11-26',
        scheduledTime: '11:00 AM',
        pickupAddress: { line1: 'Banjara Hills Rd 12', floor: 1, hasLift: true, city: 'Hyderabad' },
        dropAddress: { line1: 'Jubilee Hills Rd 36', floor: 0, hasLift: true, city: 'Hyderabad' },
        propertySize: '3 BHK',
        workerCount: 4,
        vehicleChoice: 'ARRANGED',
        arrangedVehicleInfo: { vehicleType: '14ft Closed Truck', arrivalTime: '11:30 AM' },
        providerSuppliesMaterials: true,
        boxes: { small: 5, medium: 0, large: 2, xl: 0, custom: 0 },
      },
    });
    expect(res.status).toBe(201);
    const items = res.data.booking.items as Array<{ item_type: string; total_paise: number }>;
    const materialLine = items.find((i) => i.item_type === 'PACKING_MATERIALS');
    expect(materialLine).toBeDefined();
    // 5 * ₹60 (6000p) + 2 * ₹120 (12000p) = 54000p (₹540)
    expect(materialLine!.total_paise).toBe(54000);
  });

  it('Test 11: Agriculture supports 3 entry paths, acre/gunta/hectare conversion, combined machinery+labour, and tracking', async () => {
    // Verify exact unit conversions
    expect(convertFarmArea(1, 'ACRES').guntas).toBe(40);
    expect(convertFarmArea(40, 'GUNTAS').acres).toBe(1);
    expect(convertFarmArea(1, 'HECTARES').acres).toBeCloseTo(2.47, 2);

    const catRes = await req('/api/agriculture/catalog');
    expect(catRes.status).toBe(200);
    expect(catRes.data.services.length).toBeGreaterThanOrEqual(6);
    expect(catRes.data.machinery.length).toBeGreaterThanOrEqual(6);

    // Book Drone Spraying with 80 guntas (2 acres) + 5 workers + Tractor machinery combined
    const agRes = await req('/api/agriculture/book', {
      method: 'POST',
      cookie: custCookie,
      body: {
        entryMode: 'SERVICES',
        serviceId: 'ag-drone',
        cropType: 'Paddy (Sona Masuri)',
        areaValue: 80,
        areaUnit: 'GUNTAS',
        workerCount: 5,
        machineId: 'm-drone',
        machineryBilling: 'PER_ACRE',
        includeOperator: true,
        location: { village: 'Miryalaguda', mandal: 'Miryalaguda', district: 'Nalgonda' },
        scheduledDate: '2026-11-27',
        scheduledTime: '06:00 AM',
        serviceSpecific: { sprayMaterial: 'Neem Bio-Spray', windWindow: '06:00 AM - 08:30 AM' },
      },
    });
    expect(agRes.status).toBe(201);
    const bk = agRes.data.booking;
    expect(bk.details.areaConverted.acres).toBe(2);
    expect(bk.details.areaConverted.guntas).toBe(80);
    expect(bk.details.pesticideSafetyAcknowledged).toBe(true);
    expect(bk.details.serviceSpecific.sprayMaterial).toBe('Neem Bio-Spray');
    expect(bk.details.serviceSpecific.cattleCount).toBeUndefined();

    // Check separate estimate lines: Workers, Service, Machinery, Operator, Travel, Platform Fee
    const lineNames = bk.items.map((l: { name: string }) => l.name);
    expect(lineNames.some((n: string) => /Agricultural Workers/i.test(n))).toBe(true);
    expect(lineNames.some((n: string) => /Drone Spraying/i.test(n))).toBe(true);
    expect(lineNames.some((n: string) => /Machinery Rental/i.test(n))).toBe(true);
    expect(lineNames.some((n: string) => /Trained Machine Operator/i.test(n))).toBe(true);
    expect(lineNames.some((n: string) => /Field Travel Allowance/i.test(n))).toBe(true);
    expect(lineNames.some((n: string) => /Platform Support Fee/i.test(n))).toBe(true);

    // Partner 2 accepts, submits quotation, customer approves -> CONFIRMED, then progresses Agriculture sub-statuses
    const acc = await req(`/api/bookings/${bk.id}/accept`, {
      method: 'POST',
      cookie: partner2Cookie,
    });
    expect(acc.status).toBe(200);
    expect(acc.data.booking.status).toBe('PROVIDER_ASSIGNED');

    const quoteRes = await req(`/api/bookings/${bk.id}/quotations`, {
      method: 'POST',
      cookie: partner2Cookie,
      body: {
        lines: [
          { line_type: 'LABOUR', label: '5 Agricultural Workers', quantity: 5, unit_price_paise: 60000 },
          { line_type: 'MACHINERY', label: 'Agriculture Spraying Drone (2 acres)', quantity: 2, unit_price_paise: 65000 },
          { line_type: 'OPERATOR', label: 'Trained Drone Operator', quantity: 1, unit_price_paise: 25000 },
        ],
      },
    });
    expect(quoteRes.status).toBe(201);
    const quoteId = quoteRes.data.booking.quotations[0].id;

    const appRes = await req(`/api/bookings/${bk.id}/quotations/${quoteId}/approve`, {
      method: 'POST',
      cookie: custCookie,
    });
    expect(appRes.status).toBe(200);
    expect(appRes.data.booking.status).toBe('CONFIRMED');
    expect(appRes.data.booking.price_status).toBe('CONFIRMED');

    for (const s of ['ON_THE_WAY', 'ARRIVED', 'WORK_STARTED', 'IN_PROGRESS', 'WORK_COMPLETED']) {
      const st = await req(`/api/bookings/${bk.id}/status`, {
        method: 'POST',
        cookie: partner2Cookie,
        body: { status: s },
      });
      expect(st.status).toBe(200);
      expect(st.data.booking.status).toBe(s);
    }
  });
});
