import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, ShieldAlert } from 'lucide-react';
import { Link, useRouter } from '../lib/router.tsx';

interface BookingSummary {
  id: string;
  booking_code: string;
  confirmed_booking_id: string | null;
  category_slug: string;
  title: string;
  status: string;
  price_status: 'ESTIMATED' | 'CONFIRMED';
  payment_mode: 'ONLINE_ONLY' | 'ONLINE_OR_CASH';
  payment_status: string;
  total_paise: number;
  advance_required_paise: number;
  paid_paise: number;
  balance_paise: number;
  cancellation_terms: string;
  customerPricing?: {
    servicePricePaise: number;
    offerDiscountPaise: number;
    payablePaise: number;
    discountLabel: string;
  };
  items: Array<{ id: string; name: string; quantity: number; total_paise: number }>;
  payments: Array<{ id: string; receipt_number: string; amount_paise: number; method: string; milestone_label: string }>;
}

export function BookingPayPage() {
  const { search, navigate } = useRouter();
  const bookingId = new URLSearchParams(search).get('id') || '';

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'CASH'>('UPI');
  const [milestone, setMilestone] = useState<'FULL' | 'ADVANCE' | 'MILESTONE' | 'FINAL'>('FULL');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ receiptNumber: string; amountPaise: number } | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.booking) {
          setBooking(d.booking);
          if (d.booking.category_slug === 'events' && d.booking.paid_paise < d.booking.advance_required_paise) {
            setMilestone('ADVANCE');
          }
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptedTerms) {
      setError('Please review and acknowledge the cancellation & refund terms.');
      return;
    }
    if (!booking) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.id)}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method, milestoneLabel: milestone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment failed.');
        return;
      }
      setBooking(data.booking);
      setReceipt(data.receipt);
    } catch {
      setError('Network error processing payment.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="serva-card p-8 h-64 animate-pulse bg-[#F5F9FF]" />;
  }

  if (!booking) {
    return (
      <div className="serva-card p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-[#0A1F5C]">No booking selected</h1>
        <Link to="/bookings" className="serva-pill-btn">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const duePaise =
    milestone === 'ADVANCE'
      ? Math.max(0, booking.advance_required_paise - booking.paid_paise)
      : booking.balance_paise;

  const methods: Array<{ id: typeof method; label: string }> = [
    { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
    { id: 'CARD', label: 'Debit / Credit Card' },
    { id: 'NETBANKING', label: 'Netbanking' },
    { id: 'WALLET', label: 'SERVA Wallet' },
  ];
  if (booking.payment_mode !== 'ONLINE_ONLY') {
    methods.push({ id: 'CASH', label: 'Cash after service' });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {receipt && (
        <div className="serva-card p-6 bg-green-50 border-green-200 space-y-3">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-lg font-bold text-[#0A1F5C]">Payment Successful</h2>
          </div>
          <p className="text-sm text-[#0A1F5C]">
            Receipt <strong className="font-mono-num">{receipt.receiptNumber}</strong> for{' '}
            <strong className="font-mono-num">
              ₹{Math.round(receipt.amountPaise / 100).toLocaleString('en-IN')}
            </strong>{' '}
            recorded.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="serva-pill-btn text-sm"
          >
            Track Live Status <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="serva-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAF2FF] pb-4">
          <div>
            <p className="text-xs font-mono-num text-[#5B6B8C]">
              {booking.confirmed_booking_id
                ? `Booking ID: ${booking.confirmed_booking_id}`
                : 'Awaiting advance before Booking ID confirmation'}
            </p>
            <h1 className="text-2xl font-bold text-[#0A1F5C] mt-0.5">{booking.title}</h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              booking.price_status === 'CONFIRMED'
                ? 'bg-green-50 text-[#16A34A]'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {booking.price_status === 'CONFIRMED' ? 'Confirmed Price' : 'Estimated Price'}
          </span>
        </div>

        {/* Itemised Breakdown */}
        <div className="space-y-2 text-sm">
          {booking.items.map((item) => (
            <div key={item.id} className="flex justify-between text-[#0A1F5C]">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-mono-num">
                ₹{Math.round(item.total_paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
          {booking.customerPricing && (
            <>
              <div className="pt-2 border-t border-[#EAF2FF] flex justify-between text-[#0A1F5C]">
                <span>Service price</span>
                <span className="font-mono-num font-semibold">
                  ₹{Math.round(booking.customerPricing.servicePricePaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#16A34A] font-semibold">
                <span>{booking.customerPricing.discountLabel || 'Offer discount'}</span>
                <span className="font-mono-num">
                  −₹{Math.round(booking.customerPricing.offerDiscountPaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
            </>
          )}
          <div className="pt-3 border-t border-[#EAF2FF] flex justify-between font-bold text-[#0A1F5C]">
            <span>
              {booking.customerPricing
                ? `You pay (${booking.price_status === 'CONFIRMED' ? 'Confirmed' : 'Estimated'})`
                : `Total (${booking.price_status === 'CONFIRMED' ? 'Confirmed' : 'Estimated'})`}
            </span>
            <span className="font-mono-num text-lg text-[#0B5FD9]">
              ₹{Math.round(booking.total_paise / 100).toLocaleString('en-IN')}
            </span>
          </div>
          {booking.paid_paise > 0 && (
            <div className="flex justify-between text-xs text-[#16A34A] font-semibold">
              <span>Already Paid</span>
              <span className="font-mono-num">
                −₹{Math.round(booking.paid_paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-[#0A1F5C]">
            <span>Amount Due Now ({milestone})</span>
            <span className="font-mono-num">
              ₹{Math.round(duePaise / 100).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Cancellation, Rescheduling & Refund Conditions shown BEFORE payment */}
        <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9] space-y-2">
          <p className="text-xs font-bold text-[#0A1F5C] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#0B5FD9]" />
            Cancellation, Rescheduling & Refund Terms
          </p>
          <p className="text-xs text-[#5B6B8C] leading-relaxed">{booking.cancellation_terms}</p>
          <label className="flex items-center gap-2 text-xs text-[#0A1F5C] font-medium pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 accent-[#0B5FD9]"
            />
            <span>I agree to the cancellation and refund terms above.</span>
          </label>
        </div>

        {duePaise > 0 && (
          <form onSubmit={handlePay} className="space-y-4">
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-bold text-[#0A1F5C]">
                Select Payment Method {booking.payment_mode === 'ONLINE_ONLY' ? '(Online Only)' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`min-h-[46px] px-4 rounded-xl border text-left text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                      method === m.id
                        ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]'
                        : 'border-[#DCE7F9] text-[#0A1F5C] hover:bg-[#F5F9FF]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={paying} className="w-full serva-pill-btn">
              <span>
                {paying
                  ? 'Processing Payment...'
                  : `Pay ₹${Math.round(duePaise / 100).toLocaleString('en-IN')} Now`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 flex justify-between items-center text-xs">
          <Link to={`/bookings/${booking.id}`} className="text-[#0B5FD9] font-semibold hover:underline">
            View Booking Details & Status Timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
