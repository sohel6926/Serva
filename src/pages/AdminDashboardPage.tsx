import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  DollarSign,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AdminOverview {
  counts: {
    users: number;
    partnersPending: number;
    partnersVerified: number;
    bookings: number;
  };
  partners: Array<{
    id: string;
    business_name: string;
    owner_name: string;
    owner_email: string | null;
    owner_mobile: string | null;
    service_area: string;
    experience_years: number;
    team_size: number;
    identity_doc_ref: string | null;
    verification_status: string;
    categories_json: string;
  }>;
  bookings: Array<{
    id: string;
    booking_code: string;
    category_slug: string;
    title: string;
    status: string;
    price_status: string;
    payment_status: string;
    total_paise: number;
    customer_name: string;
    partner_name: string | null;
  }>;
  settlements: Array<{
    booking_id: string;
    booking_code: string;
    title: string;
    customer_name: string;
    partner_name: string | null;
    worker_price_paise: number;
    platform_percent: number;
    fixed_addon_paise: number;
    display_price_paise: number;
    discount_paise: number;
    payable_paise: number;
    worker_payout_paise: number;
    platform_revenue_paise: number;
    ingredient_passthrough_paise: number;
  }>;
  settlementTotals: {
    totalCustomerPayablePaise: number;
    totalWorkerPayoutPaise: number;
    totalPlatformRevenuePaise: number;
    totalDiscountsPaise: number;
  };
  settings: Record<string, string>;
  portfolioItems: Array<{
    id: string;
    title: string;
    category_slug: string;
    partner_name: string;
    media_type: string;
    media_url: string;
    moderation_status: string;
  }>;
  complaints: Array<{
    id: string;
    booking_code: string;
    booking_title: string;
    reporter_name: string;
    category: string;
    description: string;
    status: string;
    resolution_note: string | null;
  }>;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<
    'approvals' | 'settlements' | 'bookings' | 'settings' | 'gallery' | 'complaints'
  >('approvals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Settings form state
  const [hsPercent, setHsPercent] = useState(7);
  const [hsFixedRupees, setHsFixedRupees] = useState(100);
  const [cookingMarkup, setCookingMarkup] = useState(false);
  const [autoConfirmHours, setAutoConfirmHours] = useState(48);
  const [eventsAdvancePct, setEventsAdvancePct] = useState(30);
  const [complaintNotes, setComplaintNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || 'Failed to load admin overview.');
      } else {
        setData(d);
        setHsPercent(Number(d.settings?.home_service_percent ?? 7));
        setHsFixedRupees(Math.round(Number(d.settings?.home_service_fixed_addon_paise ?? 10000) / 100));
        setCookingMarkup(d.settings?.cooking_markup_ingredients === '1');
        setAutoConfirmHours(Number(d.settings?.auto_confirm_hours ?? 48));
        setEventsAdvancePct(Number(d.settings?.events_advance_percent ?? 30));
      }
    } catch {
      setError('Network error loading admin panel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const verifyPartner = async (partnerId: string, status: string) => {
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/partners/${partnerId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error || 'Could not update partner status.');
    else {
      setNotice(`Partner status updated to ${status}.`);
      await load();
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        home_service_percent: hsPercent,
        home_service_fixed_addon_paise: hsFixedRupees * 100,
        cooking_markup_ingredients: cookingMarkup,
        auto_confirm_hours: autoConfirmHours,
        events_advance_percent: eventsAdvancePct,
      }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error || 'Could not save settings.');
    else {
      setNotice('Platform pricing and commission settings saved.');
      await load();
    }
  };

  const moderatePortfolio = async (id: string, moderationStatus: string) => {
    const res = await fetch(`/api/admin/portfolio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ moderationStatus }),
    });
    if (res.ok) {
      setNotice(`Gallery item marked ${moderationStatus}.`);
      await load();
    }
  };

  const resolveComplaint = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, resolutionNote: complaintNotes[id] || 'Reviewed by SERVA Support' }),
    });
    if (res.ok) {
      setNotice(`Complaint marked ${status}.`);
      await load();
    }
  };

  if (loading) return <div className="serva-card p-8 h-64 animate-pulse bg-[#F5F9FF]" />;

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 bg-gradient-to-r from-[#0A1F5C] to-[#0B5FD9] text-white space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-100">
          SERVA Governance Console
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Operations & Settlement Panel</h1>
        <p className="text-sm text-blue-100">
          Approve partner applications, audit Home Services pricing splits, configure commission rules, and resolve issues.
        </p>
      </div>

      {/* KPI Row */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="serva-card p-4">
            <p className="text-xs text-[#5B6B8C]">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600 font-mono-num">{data.counts.partnersPending}</p>
          </div>
          <div className="serva-card p-4">
            <p className="text-xs text-[#5B6B8C]">Verified Partners</p>
            <p className="text-2xl font-bold text-[#16A34A] font-mono-num">{data.counts.partnersVerified}</p>
          </div>
          <div className="serva-card p-4">
            <p className="text-xs text-[#5B6B8C]">Total Bookings</p>
            <p className="text-2xl font-bold text-[#0A1F5C] font-mono-num">{data.counts.bookings}</p>
          </div>
          <div className="serva-card p-4">
            <p className="text-xs text-[#5B6B8C]">Worker Payouts (HS)</p>
            <p className="text-xl font-bold text-[#0A1F5C] font-mono-num">
              ₹{Math.round(data.settlementTotals.totalWorkerPayoutPaise / 100).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="serva-card p-4">
            <p className="text-xs text-[#5B6B8C]">Platform Revenue (HS)</p>
            <p className="text-xl font-bold text-[#0B5FD9] font-mono-num">
              ₹{Math.round(data.settlementTotals.totalPlatformRevenuePaise / 100).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'approvals' as const, label: `Partner Approvals (${data?.partners.length ?? 0})` },
          { id: 'settlements' as const, label: `Settlement Ledger (${data?.settlements.length ?? 0})` },
          { id: 'bookings' as const, label: `All Bookings (${data?.bookings.length ?? 0})` },
          { id: 'settings' as const, label: 'Commission Settings' },
          { id: 'gallery' as const, label: `Gallery Moderation (${data?.portfolioItems.length ?? 0})` },
          { id: 'complaints' as const, label: `Complaints (${data?.complaints.length ?? 0})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[40px] px-4 rounded-full text-xs font-bold border cursor-pointer ${
              tab === item.id
                ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                : 'bg-white text-[#0A1F5C] border-[#DCE7F9]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-[#16A34A] font-semibold">
          {notice}
        </div>
      )}

      {/* Partner Approvals */}
      {tab === 'approvals' && data && (
        <div className="space-y-3">
          {data.partners.map((p) => (
            <div key={p.id} className="serva-card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B5FD9]" />
                  <h2 className="text-base font-bold text-[#0A1F5C]">{p.business_name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      p.verification_status === 'VERIFIED'
                        ? 'bg-green-50 text-[#16A34A]'
                        : p.verification_status === 'REJECTED'
                        ? 'bg-red-50 text-[#DC2626]'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.verification_status}
                  </span>
                </div>
                <p className="text-xs text-[#5B6B8C]">
                  Owner: {p.owner_name} ({p.owner_mobile || p.owner_email}) · {p.service_area} ·{' '}
                  {p.experience_years} yrs · Team: {p.team_size}
                </p>
                <p className="text-xs text-[#5B6B8C]">
                  Doc Ref: <strong>{p.identity_doc_ref || 'On file'}</strong> · Categories:{' '}
                  {JSON.parse(p.categories_json || '[]').join(', ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.verification_status !== 'VERIFIED' && (
                  <button
                    type="button"
                    onClick={() => verifyPartner(p.id, 'VERIFIED')}
                    className="min-h-[38px] px-4 rounded-full bg-[#16A34A] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve (Verify)
                  </button>
                )}
                {p.verification_status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => verifyPartner(p.id, 'UNDER_REVIEW')}
                    className="min-h-[38px] px-4 rounded-full border border-[#DCE7F9] text-[#0A1F5C] text-xs font-bold cursor-pointer"
                  >
                    Mark Under Review
                  </button>
                )}
                {p.verification_status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => verifyPartner(p.id, 'REJECTED')}
                    className="min-h-[38px] px-4 rounded-full border border-red-200 text-[#DC2626] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Home Services Settlement Ledger */}
      {tab === 'settlements' && data && (
        <div className="serva-card p-6 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#0B5FD9]" /> Home Services Settlement Ledger
            </h2>
            <span className="text-xs text-[#5B6B8C]">
              Internal Admin View Only (Customer UI never sees split)
            </span>
          </div>
          {data.settlements.length === 0 ? (
            <p className="text-sm text-[#5B6B8C]">No Home Services bookings in the ledger yet.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-[#DCE7F9] text-[#5B6B8C]">
                  <th className="py-2 pr-3">Booking</th>
                  <th className="py-2 pr-3">Worker Price</th>
                  <th className="py-2 pr-3">% + Fixed Add-on</th>
                  <th className="py-2 pr-3">Displayed</th>
                  <th className="py-2 pr-3">Discount</th>
                  <th className="py-2 pr-3">Customer Paid</th>
                  <th className="py-2 pr-3 text-[#16A34A]">Worker Payout</th>
                  <th className="py-2 pr-3 text-[#0B5FD9]">Platform Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.settlements.map((s) => (
                  <tr key={s.booking_id} className="border-b border-[#EAF2FF]">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-[#0A1F5C]">{s.booking_code}</p>
                      <p className="text-[#5B6B8C]">{s.title}</p>
                    </td>
                    <td className="py-3 pr-3 font-mono-num">
                      ₹{Math.round(s.worker_price_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-3 font-mono-num">
                      {s.platform_percent}% + ₹{Math.round(s.fixed_addon_paise / 100)}
                    </td>
                    <td className="py-3 pr-3 font-mono-num">
                      ₹{Math.round(s.display_price_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-3 font-mono-num text-amber-700">
                      −₹{Math.round(s.discount_paise / 100)}
                    </td>
                    <td className="py-3 pr-3 font-mono-num font-bold text-[#0A1F5C]">
                      ₹{Math.round(s.payable_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-3 font-mono-num font-bold text-[#16A34A]">
                      ₹{Math.round(s.worker_payout_paise / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-3 font-mono-num font-bold text-[#0B5FD9]">
                      ₹{Math.round(s.platform_revenue_paise / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All Bookings */}
      {tab === 'bookings' && data && (
        <div className="space-y-3">
          {data.bookings.map((b) => (
            <div key={b.id} className="serva-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-mono-num text-[#5B6B8C]">
                  {b.booking_code} · {b.category_slug} · {b.status}
                </p>
                <p className="text-sm font-bold text-[#0A1F5C]">{b.title}</p>
                <p className="text-[#5B6B8C]">
                  Customer: {b.customer_name} · Partner: {b.partner_name || 'Unassigned'}
                </p>
              </div>
              <div className="text-right font-mono-num">
                <p className="text-sm font-bold text-[#0A1F5C]">
                  ₹{Math.round(b.total_paise / 100).toLocaleString('en-IN')} ({b.price_status})
                </p>
                <p className="text-[#5B6B8C]">{b.payment_status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Settings */}
      {tab === 'settings' && (
        <form onSubmit={saveSettings} className="serva-card p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0B5FD9]" /> Pricing & Commission Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs font-bold text-[#0A1F5C]">
              Home Services Platform % (default 7)
              <input
                type="number"
                step="0.5"
                value={hsPercent}
                onChange={(e) => setHsPercent(Number(e.target.value))}
                className="mt-1 w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </label>
            <label className="text-xs font-bold text-[#0A1F5C]">
              Home Services Fixed Add-on ₹ (default 100)
              <input
                type="number"
                value={hsFixedRupees}
                onChange={(e) => setHsFixedRupees(Number(e.target.value))}
                className="mt-1 w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </label>
            <label className="text-xs font-bold text-[#0A1F5C]">
              Auto-confirm Completion Hours (default 48)
              <input
                type="number"
                value={autoConfirmHours}
                onChange={(e) => setAutoConfirmHours(Number(e.target.value))}
                className="mt-1 w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </label>
            <label className="text-xs font-bold text-[#0A1F5C]">
              Events Default Advance % (default 30)
              <input
                type="number"
                value={eventsAdvancePct}
                onChange={(e) => setEventsAdvancePct(Number(e.target.value))}
                className="mt-1 w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
            <input
              type="checkbox"
              checked={cookingMarkup}
              onChange={(e) => setCookingMarkup(e.target.checked)}
            />
            Apply markup to cooking ingredients (unchecked = raw ingredients passed through)
          </label>
          <button type="submit" className="serva-pill-btn text-xs">
            Save Commission Settings
          </button>
        </form>
      )}

      {/* Gallery Moderation */}
      {tab === 'gallery' && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.portfolioItems.map((item) => (
            <div key={item.id} className="serva-card overflow-hidden">
              <img
                src={item.media_url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-36 object-cover"
              />
              <div className="p-4 space-y-2">
                <p className="text-xs text-[#5B6B8C]">
                  {item.partner_name} · <strong>{item.moderation_status}</strong>
                </p>
                <p className="text-sm font-bold text-[#0A1F5C]">{item.title}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moderatePortfolio(item.id, 'APPROVED')}
                    className="min-h-[34px] px-3 rounded-full bg-green-50 text-[#16A34A] text-xs font-bold cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => moderatePortfolio(item.id, 'REJECTED')}
                    className="min-h-[34px] px-3 rounded-full bg-red-50 text-[#DC2626] text-xs font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaints */}
      {tab === 'complaints' && data && (
        <div className="space-y-3">
          {data.complaints.length === 0 ? (
            <div className="serva-card p-6 text-sm text-[#5B6B8C]">No customer complaints filed.</div>
          ) : (
            data.complaints.map((c) => (
              <div key={c.id} className="serva-card p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#DC2626] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {c.category} · {c.status}
                    </p>
                    <p className="text-sm font-bold text-[#0A1F5C]">
                      {c.booking_code} — {c.booking_title}
                    </p>
                    <p className="text-xs text-[#5B6B8C]">Filed by: {c.reporter_name}</p>
                  </div>
                </div>
                <p className="text-xs text-[#0A1F5C]">{c.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <input
                    type="text"
                    value={complaintNotes[c.id] ?? c.resolution_note ?? ''}
                    onChange={(e) => setComplaintNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Resolution note..."
                    className="flex-1 min-w-[200px] min-h-[38px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => resolveComplaint(c.id, 'RESOLVED')}
                    className="min-h-[38px] px-4 rounded-full bg-[#16A34A] text-white text-xs font-bold cursor-pointer"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
