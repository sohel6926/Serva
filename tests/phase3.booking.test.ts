import http from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.ts';
import { getDb, resetDbForTests } from '../server/db/client.ts';
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

describe('Phase 3: Booking State Machine, Quotations, Payments & Integrity (Tests 13, 14, 15, 20)', () => {
  let custCookie = '';
  let verifiedPartnerCookie = '';
  let verifiedPartner2Cookie = '';
  let unverifiedPartnerCookie = '';

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
    verifiedPartnerCookie = await login('ramesh.partner@serva.demo', 'Serva@123');
    verifiedPartner2Cookie = await login('lakshmi.partner@serva.demo', 'Serva@123');
    unverifiedPartnerCookie = await login('pending.partner@serva.demo', 'Serva@123');
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Test 20: ignores client-supplied manipulated prices and payment amounts', async () => {
    const db = getDb();
    const svc = db
      .prepare(`SELECT base_price_paise FROM services WHERE category_slug = 'contractors' AND slug = 'interior-design'`)
      .get() as { base_price_paise: number };
    expect(svc.base_price_paise).toBeGreaterThan(10000);

    // Client tries to force total_paise: 1 and price: 1
    const createRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'contractors',
        serviceSlug: 'interior-design',
        quantity: 2,
        scheduledDate: '2026-11-20',
        scheduledTime: '11:00 AM',
        address: { line1: 'Plot 12, Jubilee Hills', city: 'Hyderabad' },
        total_paise: 1,
        price: 1,
        unit_price_paise: 1,
      },
    });
    expect(createRes.status).toBe(201);
    const bk = createRes.data.booking;
    expect(bk.total_paise).toBe(svc.base_price_paise * 2);
    expect(bk.price_status).toBe('ESTIMATED');
    // Pricing breakdown must not leak to customer
    expect(bk.pricingBreakdown).toBeUndefined();

    // Client tries to pay amountPaise: 1 instead of server-computed balance
    const payRes = await req(`/api/bookings/${bk.id}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: {
        method: 'UPI',
        milestoneLabel: 'FULL',
        amountPaise: 1,
        amount: 1,
      },
    });
    expect(payRes.status).toBe(200);
    expect(payRes.data.receipt.amountPaise).toBe(svc.base_price_paise * 2);
    expect(payRes.data.booking.paid_paise).toBe(svc.base_price_paise * 2);
    expect(payRes.data.booking.balance_paise).toBe(0);
  });

  it('Tests 13, 14, 15: full booking lifecycle, unverified block, quote confirmation, revised quote lock, messaging, review & complaint', async () => {
    // 1. Customer creates a Contractors booking
    const createRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'contractors',
        serviceSlug: 'furniture-design',
        quantity: 1,
        scheduledDate: '2026-11-22',
        scheduledTime: '10:00 AM',
        address: { line1: 'H.No 8-2, Banjara Hills', city: 'Hyderabad' },
      },
    });
    expect(createRes.status).toBe(201);
    const bookingId = createRes.data.booking.id as string;
    expect(createRes.data.booking.status).toBe('REQUEST_SUBMITTED');

    // 2. Test 13: Unverified partner is blocked from accepting -> 403
    const unverifiedAccept = await req(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      cookie: unverifiedPartnerCookie,
    });
    expect(unverifiedAccept.status).toBe(403);
    expect(unverifiedAccept.data.error).toMatch(/verified/i);

    // 3. Verified partner accepts -> PROVIDER_ASSIGNED
    const acceptRes = await req(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      cookie: verifiedPartnerCookie,
    });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.data.booking.status).toBe('PROVIDER_ASSIGNED');

    // 4. Partner sends initial quotation -> QUOTATION_PENDING_APPROVAL + ESTIMATED
    const quoteRes = await req(`/api/bookings/${bookingId}/quotations`, {
      method: 'POST',
      cookie: verifiedPartnerCookie,
      body: {
        notes: 'Custom teakwood dining unit + polish',
        lines: [
          { line_type: 'MATERIAL', label: 'Teakwood frame', quantity: 1, unit_price_paise: 1200000 },
          { line_type: 'LABOUR', label: 'Carpentry labour', quantity: 2, unit_price_paise: 150000 },
        ],
      },
    });
    expect(quoteRes.status).toBe(201);
    expect(quoteRes.data.booking.status).toBe('QUOTATION_PENDING_APPROVAL');
    expect(quoteRes.data.booking.price_status).toBe('ESTIMATED');
    expect(quoteRes.data.booking.total_paise).toBe(1500000);
    const q1Id = quoteRes.data.booking.quotations[0].id;

    // 5. Test 14: Customer approves quotation -> CONFIRMED + price_status CONFIRMED
    const approve1 = await req(`/api/bookings/${bookingId}/quotations/${q1Id}/approve`, {
      method: 'POST',
      cookie: custCookie,
    });
    expect(approve1.status).toBe(200);
    expect(approve1.data.booking.status).toBe('CONFIRMED');
    expect(approve1.data.booking.price_status).toBe('CONFIRMED');

    // 6. Test 15: Scope change creates revised quote & blocks IN_PROGRESS / WORK_COMPLETED until approved
    const scopeRes = await req(`/api/bookings/${bookingId}/scope`, {
      method: 'PATCH',
      cookie: custCookie,
      body: {
        reason: 'Added 2 extra matching chairs',
        extraWorkers: 1,
        additionalAmountPaise: 400000,
      },
    });
    expect(scopeRes.status).toBe(200);
    expect(scopeRes.data.booking.status).toBe('QUOTATION_PENDING_APPROVAL');
    expect(scopeRes.data.booking.price_status).toBe('ESTIMATED');
    expect(scopeRes.data.booking.total_paise).toBe(1900000);
    const q2 = scopeRes.data.booking.quotations[0];
    expect(q2.is_revised).toBe(1);
    expect(q2.status).toBe('PENDING_APPROVAL');

    // Partner cannot jump to IN_PROGRESS or WORK_COMPLETED while revised quote awaits approval
    const blockedProgress = await req(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      cookie: verifiedPartnerCookie,
      body: { status: 'IN_PROGRESS' },
    });
    expect(blockedProgress.status).toBe(409);

    const blockedDone = await req(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      cookie: verifiedPartnerCookie,
      body: { status: 'WORK_COMPLETED' },
    });
    expect(blockedDone.status).toBe(409);

    // Customer approves revised quote -> CONFIRMED + price_status CONFIRMED
    const approve2 = await req(`/api/bookings/${bookingId}/quotations/${q2.id}/approve`, {
      method: 'POST',
      cookie: custCookie,
    });
    expect(approve2.status).toBe(200);
    expect(approve2.data.booking.status).toBe('CONFIRMED');
    expect(approve2.data.booking.price_status).toBe('CONFIRMED');

    // 7. Partner progresses timeline statuses
    for (const next of ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_COMPLETED']) {
      const st = await req(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        cookie: verifiedPartnerCookie,
        body: {
          status: next,
          completionPhotos: next === 'WORK_COMPLETED' ? ['/uploads/done1.jpg'] : undefined,
        },
      });
      expect(st.status).toBe(200);
      expect(st.data.booking.status).toBe(next);
    }

    // 8. Customer confirms completion -> COMPLETED
    const custConfirm = await req(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      cookie: custCookie,
      body: { status: 'COMPLETED' },
    });
    expect(custConfirm.status).toBe(200);
    expect(custConfirm.data.booking.status).toBe('COMPLETED');

    // 9. Customer pays online -> PAID + digital receipt
    const payRes = await req(`/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'CARD', milestoneLabel: 'FULL' },
    });
    expect(payRes.status).toBe(200);
    expect(payRes.data.receipt.receiptNumber).toMatch(/^RCPT-/);
    expect(payRes.data.booking.status).toBe('PAID');
    expect(payRes.data.booking.payment_status).toBe('PAID');

    // 10. Messaging & Rating
    const msgRes = await req(`/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      cookie: custCookie,
      body: { body: 'Thank you for the timely carpentry work!' },
    });
    expect(msgRes.status).toBe(201);
    expect(msgRes.data.booking.messages).toHaveLength(1);

    const revRes = await req(`/api/bookings/${bookingId}/reviews`, {
      method: 'POST',
      cookie: custCookie,
      body: { rating: 5, comment: 'Clean finish and polite carpenter team.' },
    });
    expect(revRes.status).toBe(201);
    expect(revRes.data.booking.reviews[0].rating).toBe(5);
  });

  it('supports partner rejection re-offering, cancellation refund to wallet, and complaints', async () => {
    const createRes = await req('/api/bookings', {
      method: 'POST',
      cookie: custCookie,
      body: {
        categorySlug: 'home-services',
        serviceSlug: 'electrician',
        quantity: 1,
        scheduledDate: '2026-11-25',
        scheduledTime: '02:00 PM',
        address: { line1: 'Road 45, Madhapur', city: 'Hyderabad' },
      },
    });
    const bookingId = createRes.data.booking.id as string;

    // Partner 1 rejects -> booking re-opens for Partner 2
    const rej = await req(`/api/bookings/${bookingId}/reject`, {
      method: 'POST',
      cookie: verifiedPartnerCookie,
    });
    expect(rej.status).toBe(200);
    expect(rej.data.booking.status).toBe('REQUEST_SUBMITTED');
    expect(rej.data.booking.partner_id).toBeNull();

    // Partner 1 does not see rejected job in feed anymore
    const p1List = await req('/api/bookings', { cookie: verifiedPartnerCookie });
    expect(p1List.data.bookings.some((b: { id: string }) => b.id === bookingId)).toBe(false);

    // Partner 2 sees and accepts the re-offered booking
    const p2List = await req('/api/bookings', { cookie: verifiedPartner2Cookie });
    expect(p2List.data.bookings.some((b: { id: string }) => b.id === bookingId)).toBe(true);

    const p2Accept = await req(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      cookie: verifiedPartner2Cookie,
    });
    expect(p2Accept.status).toBe(200);

    // Customer pays then cancels -> refunded to wallet
    const db = getDb();
    const walletBefore = db
      .prepare(`SELECT balance_paise FROM wallets WHERE user_id = ?`)
      .get('user-customer-1') as { balance_paise: number };

    const payRes = await req(`/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      cookie: custCookie,
      body: { method: 'UPI', milestoneLabel: 'FULL' },
    });
    expect(payRes.status).toBe(200);
    const paidAmount = payRes.data.receipt.amountPaise;

    const cancelRes = await req(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      cookie: custCookie,
      body: { reason: 'Postponed renovation' },
    });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.data.booking.status).toBe('CANCELLED');
    expect(cancelRes.data.booking.payment_status).toBe('REFUNDED');

    const walletAfter = db
      .prepare(`SELECT balance_paise FROM wallets WHERE user_id = ?`)
      .get('user-customer-1') as { balance_paise: number };
    expect(walletAfter.balance_paise).toBe(walletBefore.balance_paise + paidAmount);

    // Complaint can be filed on a booking
    const compRes = await req(`/api/bookings/${bookingId}/complaints`, {
      method: 'POST',
      cookie: custCookie,
      body: {
        category: 'Billing Dispute',
        description: 'Testing issue escalation record creation',
      },
    });
    expect(compRes.status).toBe(201);
    expect(compRes.data.booking.complaints).toHaveLength(1);
    expect(compRes.data.booking.status).toBe('ISSUE_RAISED');
  });
});
