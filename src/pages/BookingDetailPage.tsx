import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Receipt,
  Send,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';

interface BookingDetail {
  id: string;
  booking_code: string;
  confirmed_booking_id: string | null;
  category_slug: string;
  title: string;
  status: string;
  price_status: 'ESTIMATED' | 'CONFIRMED';
  payment_mode: string;
  payment_status: string;
  scheduled_date: string;
  scheduled_time: string;
  address: { line1?: string; area?: string; city?: string; pincode?: string };
  details: Record<string, any> & { completion_photos?: string[]; notes?: string };
  items: Array<{
    id: string;
    item_type: string;
    name: string;
    quantity: number;
    unit_price_paise: number;
    total_paise: number;
  }>;
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
  partnerPayout?: {
    payoutPaise: number;
  };
  partner: { business_name: string; rating_avg: number; verification_status: string } | null;
  quotations: Array<{
    id: string;
    version: number;
    status: string;
    is_revised: number;
    total_paise: number;
    notes: string | null;
    lines: Array<{ id: string; label: string; quantity: number; amount_paise: number }>;
  }>;
  payments: Array<{
    id: string;
    receipt_number: string;
    milestone_label: string;
    method: string;
    amount_paise: number;
    created_at: string;
  }>;
  messages: Array<{
    id: string;
    sender_name: string;
    sender_role: string;
    body: string;
    created_at: string;
  }>;
  reviews: Array<{ id: string; rating: number; comment: string }>;
  complaints: Array<{ id: string; category: string; description: string; status: string }>;
}

const TIMELINE_STEPS = [
  'REQUEST_SUBMITTED',
  'PROVIDER_ASSIGNED',
  'CONFIRMED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'COMPLETED',
];

const AGRI_TIMELINE_STEPS = [
  'REQUEST_SUBMITTED',
  'PROVIDER_ASSIGNED',
  'CONFIRMED',
  'ON_THE_WAY',
  'ARRIVED',
  'WORK_STARTED',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'COMPLETED',
];

const MOVING_TIMELINE_STEPS = [
  'REQUEST_SUBMITTED',
  'PROVIDER_ASSIGNED',
  'CONFIRMED',
  'ON_THE_WAY',
  'ARRIVED',
  'PACKING_IN_PROGRESS',
  'LOADING_IN_PROGRESS',
  'VEHICLE_DEPARTED',
  'ARRIVED_AT_DESTINATION',
  'UNLOADING_IN_PROGRESS',
  'PLACEMENT_UNPACKING',
  'WORK_COMPLETED',
  'COMPLETED',
];

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const [scopeReason, setScopeReason] = useState('');
  const [extraWorkers, setExtraWorkers] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [issueCategory, setIssueCategory] = useState('Work Incomplete');
  const [issueDesc, setIssueDesc] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load booking.');
        return;
      }
      setBooking(data.booking);
    } catch {
      setError('Network error loading booking.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const approveQuote = async (qid: string) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}/quotations/${qid}/approve`, {
      method: 'POST',
      credentials: 'include',
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else setBooking(d.booking);
    setBusy(false);
  };

  const confirmStatus = async (targetStatus: string) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: targetStatus }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else setBooking(d.booking);
    setBusy(false);
  };

  const requestScopeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeReason.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/bookings/${bookingId}/scope`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: scopeReason.trim(), extraWorkers }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else {
      setBooking(d.booking);
      setScopeReason('');
      setExtraWorkers(0);
    }
    setBusy(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    const res = await fetch(`/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body: msgText.trim() }),
    });
    const d = await res.json();
    if (res.ok) {
      setBooking(d.booking);
      setMsgText('');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/bookings/${bookingId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating, comment: reviewComment }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else setBooking(d.booking);
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issueDesc.trim().length < 5) return;
    const res = await fetch(`/api/bookings/${bookingId}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ category: issueCategory, description: issueDesc.trim() }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else {
      setBooking(d.booking);
      setIssueDesc('');
    }
  };

  const cancelBooking = async () => {
    setBusy(true);
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason: 'Customer cancelled via booking detail' }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error);
    else setBooking(d.booking);
    setBusy(false);
  };

  if (loading) return <div className="serva-card p-8 h-64 animate-pulse bg-[#F5F9FF]" />;
  if (!booking) {
    return (
      <div className="serva-card p-8 text-center space-y-3">
        <p className="text-sm text-[#DC2626]">{error || 'Booking not found.'}</p>
        <Link to="/bookings" className="serva-pill-btn">
          Back to My Bookings
        </Link>
      </div>
    );
  }

  const pendingQuote = booking.quotations.find((q) => q.status === 'PENDING_APPROVAL');
  const steps =
    booking.category_slug === 'moving'
      ? MOVING_TIMELINE_STEPS
      : booking.category_slug === 'agriculture'
      ? AGRI_TIMELINE_STEPS
      : TIMELINE_STEPS;
  const activeStepIdx = steps.indexOf(booking.status);

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
          {error}
        </div>
      )}

      {/* Header Summary Card */}
      <section className="serva-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono-num text-[#5B6B8C]">
              {booking.confirmed_booking_id
                ? `Booking ID: ${booking.confirmed_booking_id}`
                : 'Booking ID issued after advance payment & vendor acceptance'}
            </p>
            <h1 className="text-2xl font-bold text-[#0A1F5C] mt-1">{booking.title}</h1>
            <p className="text-sm text-[#5B6B8C] mt-1">
              {booking.scheduled_date} at {booking.scheduled_time} · {booking.address.line1},{' '}
              {booking.address.city}
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#0B5FD9]">
              {booking.status.replace(/_/g, ' ')}
            </span>
            <p className="text-xl font-bold text-[#0A1F5C] font-mono-num">
              ₹{Math.round(booking.total_paise / 100).toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-[#5B6B8C]">
                ({booking.price_status === 'CONFIRMED' ? 'Confirmed' : 'Estimated'})
              </span>
            </p>
            {booking.customerPricing && (
              <p className="text-xs text-[#5B6B8C] font-mono-num">
                Service price ₹{Math.round(booking.customerPricing.servicePricePaise / 100).toLocaleString('en-IN')} · Offer discount −₹
                {Math.round(booking.customerPricing.offerDiscountPaise / 100).toLocaleString('en-IN')}
              </p>
            )}
            {booking.partnerPayout && (
              <p className="text-xs font-semibold text-[#16A34A] font-mono-num">
                Your Payout: ₹{Math.round(booking.partnerPayout.payoutPaise / 100).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="pt-4 border-t border-[#EAF2FF] overflow-x-auto">
          <div className="flex items-center justify-between gap-2 min-w-[680px]">
            {steps.map((step, idx) => {
              const reached = activeStepIdx >= idx || booking.status === 'PAID';
              return (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                      reached ? 'bg-[#0B5FD9] text-white' : 'bg-[#EAF2FF] text-[#5B6B8C]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-[11px] font-medium text-[#0A1F5C] mt-1">
                    {step.replace(/_/g, ' ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 pt-2">
          {booking.balance_paise > 0 && booking.status !== 'CANCELLED' && (
            <Link to={`/book/pay?id=${encodeURIComponent(booking.id)}`} className="serva-pill-btn text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{Math.round(booking.balance_paise / 100).toLocaleString('en-IN')}</span>
            </Link>
          )}
          {booking.category_slug === 'moving' &&
            booking.status === 'LOADING_IN_PROGRESS' &&
            user?.role === 'CUSTOMER' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmStatus('VEHICLE_DEPARTED')}
                className="min-h-[44px] px-5 rounded-full bg-[#0B5FD9] text-white font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Vehicle Departed</span>
              </button>
            )}
          {booking.status === 'WORK_COMPLETED' && user?.role === 'CUSTOMER' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => confirmStatus('COMPLETED')}
              className="min-h-[44px] px-6 rounded-full bg-[#16A34A] text-white font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Work Completed</span>
            </button>
          )}
          {!['COMPLETED', 'PAID', 'CANCELLED'].includes(booking.status) && (
            <button
              type="button"
              disabled={busy}
              onClick={cancelBooking}
              className="min-h-[44px] px-5 rounded-full border border-red-200 text-[#DC2626] font-semibold text-sm hover:bg-red-50 cursor-pointer"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </section>

      {/* Agriculture / Moving Specific Tracking Details & Itemised Estimate */}
      {(booking.category_slug === 'agriculture' || booking.category_slug === 'moving' || booking.items.length > 0) && (
        <section className="serva-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#0A1F5C]">
              {booking.category_slug === 'agriculture'
                ? 'Farm & Field Tracking Details'
                : booking.category_slug === 'moving'
                ? 'Shifting & Crew Tracking Details'
                : 'Itemised Booking Summary'}
            </h2>
            <span className="text-xs font-semibold text-[#5B6B8C]">
              Price Status: {booking.price_status === 'CONFIRMED' ? 'Confirmed' : 'Estimated'}
            </span>
          </div>

          {booking.category_slug === 'agriculture' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Crop &amp; Farm Area</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  {booking.details.cropType || 'Crop'} · {booking.details.areaConverted?.acres ?? booking.details.areaValue} ac (
                  {booking.details.areaConverted?.guntas ?? ''} guntas)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Farm Location</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  {booking.details.location?.village}, {booking.details.location?.mandal},{' '}
                  {booking.details.location?.district}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Workers &amp; Machinery</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  Workers: {booking.details.workerCount ?? 0} ·{' '}
                  {booking.details.machineId ? `Machine (${booking.details.machineryBilling})` : 'No rental machine'}
                </p>
              </div>
            </div>
          )}

          {booking.category_slug === 'moving' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Pickup &amp; Drop Access</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  Pickup Floor {booking.details.pickupAddress?.floor ?? 0} (
                  {booking.details.pickupAddress?.hasLift ? 'Lift' : 'Stairs'}) → Drop Floor{' '}
                  {booking.details.dropAddress?.floor ?? 0} (
                  {booking.details.dropAddress?.hasLift ? 'Lift' : 'Stairs'})
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Transport Policy</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  Customer-arranged ({String(booking.details.vehicleChoice || 'WILL_ARRANGE').replace(/_/g, ' ')}) · Zero SERVA vehicle charges
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F9FF]">
                <p className="text-[#5B6B8C]">Inventory &amp; Crew</p>
                <p className="font-bold text-[#0A1F5C] mt-0.5">
                  {booking.details.workerCount ?? 3} movers ·{' '}
                  {Array.isArray(booking.details.inventoryItems) ? booking.details.inventoryItems.length : 0} tagged items
                </p>
              </div>
            </div>
          )}

          {booking.items.length > 0 && (
            <div className="border-t border-[#EAF2FF] pt-3 space-y-1.5 text-xs">
              {booking.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span className="text-[#0A1F5C]">
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-mono-num font-bold text-[#0A1F5C]">
                    ₹{Math.round(it.total_paise / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pending Quotation Approval */}
      {pendingQuote && (
        <section className="serva-card p-6 border-[#0B5FD9] bg-[#EAF2FF]/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">
              {pendingQuote.is_revised ? 'Revised Quotation Pending Approval' : 'Quotation Ready'} (v
              {pendingQuote.version})
            </h2>
            <span className="text-lg font-bold text-[#0B5FD9] font-mono-num">
              ₹{Math.round(pendingQuote.total_paise / 100).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            {pendingQuote.lines.map((l) => (
              <div key={l.id} className="flex justify-between">
                <span>
                  {l.label} × {l.quantity}
                </span>
                <span className="font-mono-num font-semibold">
                  ₹{Math.round(l.amount_paise / 100).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          {pendingQuote.notes && <p className="text-xs text-[#5B6B8C]">{pendingQuote.notes}</p>}
          {user?.role === 'CUSTOMER' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => approveQuote(pendingQuote.id)}
              className="serva-pill-btn text-sm"
            >
              Approve & Confirm Quotation
            </button>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Payments & Scope Change */}
        <div className="lg:col-span-6 space-y-6">
          <section className="serva-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0B5FD9]" /> Digital Receipts
            </h2>
            {booking.payments.length === 0 ? (
              <p className="text-xs text-[#5B6B8C]">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {booking.payments.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] flex justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono-num font-bold text-[#0A1F5C]">{p.receipt_number}</p>
                      <p className="text-[#5B6B8C]">
                        {p.milestone_label} · {p.method}
                      </p>
                    </div>
                    <span className="font-mono-num font-bold text-[#16A34A]">
                      ₹{Math.round(p.amount_paise / 100).toLocaleString('en-IN')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!['COMPLETED', 'PAID', 'CANCELLED'].includes(booking.status) && (
            <form onSubmit={requestScopeChange} className="serva-card p-6 space-y-3">
              <h2 className="text-base font-bold text-[#0A1F5C]">Update Scope (Creates Revised Quote)</h2>
              <input
                type="text"
                value={scopeReason}
                onChange={(e) => setScopeReason(e.target.value)}
                placeholder="Reason (e.g. Added 1 extra floor or room)"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <div className="flex items-center gap-3">
                <label htmlFor="extra-workers" className="text-xs font-semibold text-[#5B6B8C]">
                  Extra workers:
                </label>
                <input
                  id="extra-workers"
                  type="number"
                  min={0}
                  max={20}
                  value={extraWorkers}
                  onChange={(e) => setExtraWorkers(Number(e.target.value))}
                  className="w-20 min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
                <button type="submit" disabled={busy} className="serva-pill-btn text-xs ml-auto">
                  Request Revised Quote
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: In-App Messaging, Rating, Complaint */}
        <div className="lg:col-span-6 space-y-6">
          <section className="serva-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0B5FD9]" /> In-App Messages
            </h2>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {booking.messages.length === 0 ? (
                <p className="text-xs text-[#5B6B8C]">No messages yet. Coordinate safely in-app.</p>
              ) : (
                booking.messages.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[#F5F9FF] text-xs">
                    <p className="font-bold text-[#0A1F5C]">
                      {m.sender_name} ({m.sender_role})
                    </p>
                    <p className="text-[#0A1F5C] mt-0.5">{m.body}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0B5FD9] text-white flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>

          {['COMPLETED', 'PAID'].includes(booking.status) && booking.reviews.length === 0 && (
            <form onSubmit={submitReview} className="serva-card p-6 space-y-3">
              <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Rate Service
              </h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm cursor-pointer ${
                      rating >= n ? 'bg-amber-400 text-white' : 'bg-[#EAF2FF] text-[#5B6B8C]'
                    }`}
                  >
                    {n}★
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <button type="submit" className="serva-pill-btn text-xs">
                Submit Review
              </button>
            </form>
          )}

          <form onSubmit={submitComplaint} className="serva-card p-6 space-y-3">
            <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" /> Report an Issue
            </h2>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              aria-label="Issue category"
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
            >
              <option>Work Incomplete</option>
              <option>Late Arrival</option>
              <option>Missing or Damaged Item</option>
              <option>Billing Dispute</option>
            </select>
            <input
              type="text"
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <button
              type="submit"
              className="min-h-[40px] px-4 rounded-full border border-red-200 text-[#DC2626] text-xs font-semibold hover:bg-red-50 cursor-pointer"
            >
              Submit Complaint
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
