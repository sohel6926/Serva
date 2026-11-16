import crypto from 'crypto';
import { getDb } from '../db/client.ts';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'CASH';
export type MilestoneLabel = 'FULL' | 'ADVANCE' | 'MILESTONE' | 'FINAL';

export interface ChargeRequest {
  bookingId: string;
  userId: string;
  amountPaise: number;
  method: PaymentMethod;
  milestoneLabel: MilestoneLabel;
}

export interface ChargeResult {
  paymentId: string;
  receiptNumber: string;
  provider: string;
  providerRef: string;
  amountPaise: number;
  status: 'SUCCEEDED';
}

export interface PaymentProviderAdapter {
  name: string;
  charge(req: ChargeRequest): ChargeResult;
}

class MockPaymentAdapter implements PaymentProviderAdapter {
  name = 'MOCK';
  charge(req: ChargeRequest): ChargeResult {
    return {
      paymentId: crypto.randomUUID(),
      receiptNumber: `RCPT-${Date.now().toString().slice(-6)}-${crypto.randomInt(100, 999)}`,
      provider: 'MOCK',
      providerRef: `mock_pay_${crypto.randomBytes(6).toString('hex')}`,
      amountPaise: req.amountPaise,
      status: 'SUCCEEDED',
    };
  }
}

class RazorpayPaymentAdapter implements PaymentProviderAdapter {
  name = 'RAZORPAY';
  charge(req: ChargeRequest): ChargeResult {
    // When RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are configured, verify signature here.
    return {
      paymentId: crypto.randomUUID(),
      receiptNumber: `RCPT-RZP-${Date.now().toString().slice(-6)}`,
      provider: 'RAZORPAY',
      providerRef: `pay_${crypto.randomBytes(7).toString('hex')}`,
      amountPaise: req.amountPaise,
      status: 'SUCCEEDED',
    };
  }
}

export function getPaymentAdapter(): PaymentProviderAdapter {
  const hasRazorpayKeys = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.PAYMENT_PROVIDER === 'razorpay'
  );
  return hasRazorpayKeys ? new RazorpayPaymentAdapter() : new MockPaymentAdapter();
}

export function executeBookingPayment(req: ChargeRequest): ChargeResult {
  if (req.amountPaise <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  const db = getDb();

  if (req.method === 'WALLET') {
    const wallet = db
      .prepare(`SELECT id, balance_paise FROM wallets WHERE user_id = ?`)
      .get(req.userId) as { id: string; balance_paise: number } | undefined;

    if (!wallet || wallet.balance_paise < req.amountPaise) {
      throw new Error('Insufficient SERVA Wallet balance for this payment.');
    }

    db.prepare(`UPDATE wallets SET balance_paise = balance_paise - ?, updated_at = datetime('now') WHERE id = ?`).run(
      req.amountPaise,
      wallet.id
    );
    db.prepare(
      `INSERT INTO wallet_transactions (id, wallet_id, type, amount_paise, description, reference_id)
       VALUES (?, ?, 'DEBIT', ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      wallet.id,
      req.amountPaise,
      `Booking payment (${req.milestoneLabel})`,
      req.bookingId
    );
  }

  const adapter = getPaymentAdapter();
  const result = adapter.charge(req);

  db.prepare(
    `INSERT INTO payments (id, booking_id, user_id, milestone_label, method, provider, provider_ref, amount_paise, status, receipt_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCEEDED', ?)`
  ).run(
    result.paymentId,
    req.bookingId,
    req.userId,
    req.milestoneLabel,
    req.method,
    result.provider,
    result.providerRef,
    result.amountPaise,
    result.receiptNumber
  );

  return result;
}
