import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  ImagePlus,
  ShieldCheck,
  Star,
  Tractor,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';

interface PartnerBooking {
  id: string;
  booking_code: string;
  category_slug: string;
  title: string;
  status: string;
  partner_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  total_paise: number;
}

interface ConstructionEnquiry {
  id: string;
  project_title: string;
  building_type: string;
  plot_size: string;
  budget_range: string;
  location: string;
  timeline: string;
  notes: string | null;
  customer_name: string;
  customer_mobile: string | null;
  customer_email: string | null;
  created_at: string;
}

interface OverviewPayload {
  partner: {
    id: string;
    business_name: string;
    verification_status: string;
    rating_avg: number;
    rating_count: number;
    service_area: string;
  };
  totalPayoutPaise: number;
  machineryRentalIncomePaise: number;
  payoutRows: Array<{
    id: string;
    booking_code: string;
    title: string;
    status: string;
    scheduled_date: string;
    partner_payout_paise: number;
  }>;
  machines: Array<{
    id: string;
    category: string;
    machine_type: string;
    make_model: string;
    hourly_rate_paise: number;
    daily_rate_paise: number;
    per_acre_rate_paise: number;
    operator_included: number;
    is_available: number;
    service_area: string;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    category_slug: string;
    media_type: string;
    media_url: string;
    moderation_status: string;
  }>;
  availability: Array<{
    id: string;
    date: string;
    is_available: number;
  }>;
  customRates: {
    baseServiceRateRupees?: number;
    smallBoxDims?: string;
    mediumBoxDims?: string;
    largeBoxDims?: string;
    xlBoxDims?: string;
  } | null;
}

const GENERIC_NEXT_MAP: Record<string, string> = {
  CONFIRMED: 'ON_THE_WAY',
  ON_THE_WAY: 'ARRIVED',
  ARRIVED: 'IN_PROGRESS',
  IN_PROGRESS: 'WORK_COMPLETED',
};

const AGRI_NEXT_MAP: Record<string, string> = {
  CONFIRMED: 'ON_THE_WAY',
  ON_THE_WAY: 'ARRIVED',
  ARRIVED: 'WORK_STARTED',
  WORK_STARTED: 'IN_PROGRESS',
  IN_PROGRESS: 'WORK_COMPLETED',
};

const MOVING_NEXT_MAP: Record<string, string> = {
  CONFIRMED: 'ON_THE_WAY',
  ON_THE_WAY: 'ARRIVED',
  ARRIVED: 'PACKING_IN_PROGRESS',
  PACKING_IN_PROGRESS: 'LOADING_IN_PROGRESS',
  LOADING_IN_PROGRESS: 'VEHICLE_DEPARTED',
  VEHICLE_DEPARTED: 'ARRIVED_AT_DESTINATION',
  ARRIVED_AT_DESTINATION: 'UNLOADING_IN_PROGRESS',
  UNLOADING_IN_PROGRESS: 'PLACEMENT_UNPACKING',
  PLACEMENT_UNPACKING: 'WORK_COMPLETED',
};

function getNextStatus(categorySlug: string, status: string): string | undefined {
  if (categorySlug === 'moving') return MOVING_NEXT_MAP[status];
  if (categorySlug === 'agriculture') return AGRI_NEXT_MAP[status];
  return GENERIC_NEXT_MAP[status];
}

export function PartnerRequestsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<
    'requests' | 'machinery' | 'portfolio' | 'availability' | 'rates' | 'enquiries' | 'payouts'
  >('requests');

  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [enquiries, setEnquiries] = useState<ConstructionEnquiry[]>([]);
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<Record<string, string>>({});

  // Machine form
  const [mCat, setMCat] = useState<'AGRICULTURE' | 'CONTRACTORS'>('AGRICULTURE');
  const [mType, setMType] = useState('Combine Harvester');
  const [mModel, setMModel] = useState('');
  const [mHour, setMHour] = useState(1800);
  const [mDay, setMDay] = useState(9500);
  const [mAcre, setMAcre] = useState(2200);
  const [mOp, setMOp] = useState(true);

  // Portfolio form
  const [pCat, setPCat] = useState('contractors');
  const [pTitle, setPTitle] = useState('');
  const [pUrl, setPUrl] = useState('/src/assets/images/hero_contractors_1794821794462.jpg');

  // Availability form
  const [availDate, setAvailDate] = useState('2026-11-28');
  const [availOpen, setAvailOpen] = useState(true);

  // Box / Rate manager
  const [smallBox, setSmallBox] = useState('12×10×10 in (30×25×25 cm)');
  const [mediumBox, setMediumBox] = useState('16×12×12 in (41×30×30 cm)');
  const [largeBox, setLargeBox] = useState('18×18×18 in (46×46×46 cm)');
  const [xlBox, setXlBox] = useState('24×18×18 in (61×46×46 cm)');

  const load = useCallback(async () => {
    setLoading(true);
    const [bRes, eRes, oRes] = await Promise.all([
      fetch('/api/bookings', { credentials: 'include' }),
      fetch('/api/contractors/enquiries', { credentials: 'include' }),
      fetch('/api/partner/overview', { credentials: 'include' }),
    ]);
    const bData = await bRes.json();
    const eData = eRes.ok ? await eRes.json() : { enquiries: [] };
    const oData = oRes.ok ? await oRes.json() : null;
    setBookings(bData.bookings ?? []);
    setEnquiries(eData.enquiries ?? []);
    setOverview(oData);
    if (oData?.customRates) {
      if (oData.customRates.smallBoxDims) setSmallBox(oData.customRates.smallBoxDims);
      if (oData.customRates.mediumBoxDims) setMediumBox(oData.customRates.mediumBoxDims);
      if (oData.customRates.largeBoxDims) setLargeBox(oData.customRates.largeBoxDims);
      if (oData.customRates.xlBoxDims) setXlBox(oData.customRates.xlBoxDims);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (url: string, body?: unknown, method = 'POST') => {
    setError(null);
    setNotice(null);
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await res.json();
    if (!res.ok) setError(d.error || 'Action failed.');
    else {
      await load();
      return d;
    }
    return null;
  };

  const verificationStatus =
    overview?.partner?.verification_status || user?.partner_verification_status || 'SUBMITTED';

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0A1F5C]">
              {overview?.partner?.business_name || 'Partner Dashboard'}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                verificationStatus === 'VERIFIED'
                  ? 'bg-green-50 text-[#16A34A]'
                  : verificationStatus === 'REJECTED'
                  ? 'bg-red-50 text-[#DC2626]'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> {verificationStatus}
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C] flex items-center gap-3">
            <span>Signed in as {user?.name}</span>
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5" /> {overview?.partner?.rating_avg ?? 0} (
              {overview?.partner?.rating_count ?? 0} reviews)
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#5B6B8C]">Your Total Payouts</p>
          <p className="text-2xl font-bold text-[#16A34A] font-mono-num">
            ₹{Math.round((overview?.totalPayoutPaise ?? 0) / 100).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'requests' as const, label: `Requests (${bookings.length})` },
          { id: 'machinery' as const, label: `Machinery & Fleet (${overview?.machines.length ?? 0})` },
          { id: 'portfolio' as const, label: `Portfolio (${overview?.portfolio.length ?? 0})` },
          { id: 'availability' as const, label: 'Availability' },
          { id: 'rates' as const, label: 'Rates & Boxes' },
          { id: 'enquiries' as const, label: `Construction (${enquiries.length})` },
          { id: 'payouts' as const, label: 'Payout History' },
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

      {/* TAB 1: Requests */}
      {tab === 'requests' && (
        loading ? (
          <div className="serva-card h-40 animate-pulse bg-[#F5F9FF]" />
        ) : bookings.length === 0 ? (
          <div className="serva-card p-8 text-center text-sm text-[#5B6B8C]">
            No open or assigned requests right now.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const nextStatus = getNextStatus(b.category_slug, b.status);
              return (
                <div key={b.id} className="serva-card p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono-num text-[#5B6B8C]">
                        {b.booking_code} · {b.status.replace(/_/g, ' ')}
                      </p>
                      <h2 className="text-lg font-bold text-[#0A1F5C]">{b.title}</h2>
                      <p className="text-xs text-[#5B6B8C]">
                        {b.scheduled_date} at {b.scheduled_time}
                      </p>
                    </div>
                    <Link
                      to={`/bookings/${b.id}`}
                      className="text-xs font-semibold text-[#0B5FD9] hover:underline inline-flex items-center gap-1"
                    >
                      Open Detail <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {!b.partner_id && (
                      <>
                        <button
                          type="button"
                          onClick={() => act(`/api/bookings/${b.id}/accept`)}
                          className="min-h-[40px] px-4 rounded-full bg-[#16A34A] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept Job
                        </button>
                        <button
                          type="button"
                          onClick={() => act(`/api/bookings/${b.id}/reject`)}
                          className="min-h-[40px] px-4 rounded-full border border-red-200 text-[#DC2626] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {b.partner_id && b.status === 'PROVIDER_ASSIGNED' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Quote ₹"
                          value={quoteAmount[b.id] ?? Math.round(b.total_paise / 100)}
                          onChange={(e) =>
                            setQuoteAmount((prev) => ({ ...prev, [b.id]: e.target.value }))
                          }
                          className="w-28 min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs font-mono-num"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const rupees = Number(quoteAmount[b.id] ?? Math.round(b.total_paise / 100));
                            act(`/api/bookings/${b.id}/quotations`, {
                              lines: [
                                {
                                  line_type: 'SERVICE',
                                  label: b.title,
                                  quantity: 1,
                                  unit_price_paise: Math.round(rupees * 100),
                                },
                              ],
                            });
                          }}
                          className="serva-pill-btn text-xs"
                        >
                          Send Quotation
                        </button>
                      </div>
                    )}

                    {b.partner_id && nextStatus && (
                      <button
                        type="button"
                        onClick={() => act(`/api/bookings/${b.id}/status`, { status: nextStatus })}
                        className="serva-pill-btn text-xs"
                      >
                        Mark {nextStatus.replace(/_/g, ' ')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: Machinery Owner Dashboard */}
      {tab === 'machinery' && (
        <div className="space-y-6">
          <div className="serva-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-[#16A34A] flex items-center justify-center">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0A1F5C]">Machinery Rental Income</h2>
                <p className="text-xs text-[#5B6B8C]">Agriculture & Contractors equipment payouts</p>
              </div>
            </div>
            <p className="text-xl font-bold text-[#16A34A] font-mono-num">
              ₹{Math.round((overview?.machineryRentalIncomePaise ?? 0) / 100).toLocaleString('en-IN')}
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!mModel.trim()) return;
              const ok = await act('/api/partner/machines', {
                category: mCat,
                machineType: mType,
                makeModel: mModel.trim(),
                hourlyRatePaise: mHour * 100,
                dailyRatePaise: mDay * 100,
                perAcreRatePaise: mAcre * 100,
                operatorIncluded: mOp,
                serviceArea: overview?.partner?.service_area || 'Hyderabad & Telangana',
              });
              if (ok) {
                setMModel('');
                setNotice('Machinery added to your fleet.');
              }
            }}
            className="serva-card p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-[#0A1F5C]">Register a Machine</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={mCat}
                onChange={(e) => setMCat(e.target.value as 'AGRICULTURE' | 'CONTRACTORS')}
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                <option value="AGRICULTURE">Agriculture</option>
                <option value="CONTRACTORS">Contractors</option>
              </select>
              <input
                type="text"
                value={mType}
                onChange={(e) => setMType(e.target.value)}
                placeholder="Type (e.g. Tractor, Drone, JCB)"
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <input
                type="text"
                value={mModel}
                onChange={(e) => setMModel(e.target.value)}
                placeholder="Make & Model *"
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="text-xs text-[#5B6B8C]">
                Hourly ₹
                <input
                  type="number"
                  value={mHour}
                  onChange={(e) => setMHour(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </label>
              <label className="text-xs text-[#5B6B8C]">
                Daily ₹
                <input
                  type="number"
                  value={mDay}
                  onChange={(e) => setMDay(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </label>
              <label className="text-xs text-[#5B6B8C]">
                Per Acre ₹
                <input
                  type="number"
                  value={mAcre}
                  onChange={(e) => setMAcre(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] pt-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mOp}
                  onChange={(e) => setMOp(e.target.checked)}
                />
                Operator included
              </label>
            </div>
            <button type="submit" className="serva-pill-btn text-xs">
              Add Machine
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview?.machines.map((m) => (
              <div key={m.id} className="serva-card p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#16A34A]">{m.category}</p>
                    <h4 className="text-base font-bold text-[#0A1F5C]">{m.make_model}</h4>
                    <p className="text-xs text-[#5B6B8C]">{m.machine_type} · {m.service_area}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      act(`/api/partner/machines/${m.id}`, { isAvailable: !m.is_available }, 'PATCH')
                    }
                    className={`min-h-[34px] px-3 rounded-full text-xs font-bold cursor-pointer ${
                      m.is_available ? 'bg-green-50 text-[#16A34A]' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m.is_available ? 'Available' : 'Paused'}
                  </button>
                </div>
                <p className="text-xs font-mono-num text-[#0A1F5C]">
                  ₹{Math.round(m.hourly_rate_paise / 100)}/hr · ₹{Math.round(m.daily_rate_paise / 100)}/day · ₹
                  {Math.round(m.per_acre_rate_paise / 100)}/acre
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Portfolio Manager */}
      {tab === 'portfolio' && (
        <div className="space-y-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!pTitle.trim()) return;
              const ok = await act('/api/partner/portfolio', {
                categorySlug: pCat,
                title: pTitle.trim(),
                mediaType: pUrl.endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
                mediaUrl: pUrl,
              });
              if (ok) {
                setPTitle('');
                setNotice('Portfolio showcase published.');
              }
            }}
            className="serva-card p-6 space-y-3"
          >
            <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-[#0B5FD9]" /> Add Portfolio Item
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={pCat}
                onChange={(e) => setPCat(e.target.value)}
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                <option value="home-services">Home Services</option>
                <option value="contractors">Contractors</option>
                <option value="events">Events</option>
              </select>
              <input
                type="text"
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                placeholder="Work Title *"
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <input
                type="text"
                value={pUrl}
                onChange={(e) => setPUrl(e.target.value)}
                placeholder="Asset URL"
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <button type="submit" className="serva-pill-btn text-xs">
              Publish to Gallery
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview?.portfolio.map((item) => (
              <div key={item.id} className="serva-card overflow-hidden">
                <img
                  src={item.media_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover"
                />
                <div className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#5B6B8C]">
                      {item.category_slug} · {item.moderation_status}
                    </p>
                    <p className="text-sm font-bold text-[#0A1F5C]">{item.title}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => act(`/api/partner/portfolio/${item.id}`, undefined, 'DELETE')}
                    className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Availability Calendar */}
      {tab === 'availability' && (
        <div className="serva-card p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B5FD9]" /> Availability Calendar
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={availDate}
              onChange={(e) => setAvailDate(e.target.value)}
              className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
              <input
                type="checkbox"
                checked={availOpen}
                onChange={(e) => setAvailOpen(e.target.checked)}
              />
              Available on this date
            </label>
            <button
              type="button"
              onClick={async () => {
                const ok = await act(
                  '/api/partner/availability',
                  { date: availDate, isAvailable: availOpen },
                  'PUT'
                );
                if (ok) setNotice(`Updated availability for ${availDate}.`);
              }}
              className="serva-pill-btn text-xs"
            >
              Save Date
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {overview?.availability.map((a) => (
              <span
                key={a.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-num font-bold ${
                  a.is_available ? 'bg-green-50 text-[#16A34A]' : 'bg-red-50 text-[#DC2626]'
                }`}
              >
                {a.date} · {a.is_available ? 'Open' : 'Blocked'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Partner Rates & Moving Box Dimensions */}
      {tab === 'rates' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await act(
              '/api/partner/rates',
              {
                smallBoxDims: smallBox,
                mediumBoxDims: mediumBox,
                largeBoxDims: largeBox,
                xlBoxDims: xlBox,
              },
              'PUT'
            );
            if (ok) setNotice('Box dimensions and rate presets saved.');
          }}
          className="serva-card p-6 space-y-4"
        >
          <h2 className="text-base font-bold text-[#0A1F5C]">
            Configurable Moving Box Dimensions (Provider Defaults)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-[#5B6B8C]">
              Small Box
              <input
                type="text"
                value={smallBox}
                onChange={(e) => setSmallBox(e.target.value)}
                className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm text-[#0A1F5C]"
              />
            </label>
            <label className="text-xs font-semibold text-[#5B6B8C]">
              Medium Box
              <input
                type="text"
                value={mediumBox}
                onChange={(e) => setMediumBox(e.target.value)}
                className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm text-[#0A1F5C]"
              />
            </label>
            <label className="text-xs font-semibold text-[#5B6B8C]">
              Large Box
              <input
                type="text"
                value={largeBox}
                onChange={(e) => setLargeBox(e.target.value)}
                className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm text-[#0A1F5C]"
              />
            </label>
            <label className="text-xs font-semibold text-[#5B6B8C]">
              Extra Large Box
              <input
                type="text"
                value={xlBox}
                onChange={(e) => setXlBox(e.target.value)}
                className="mt-1 w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-sm text-[#0A1F5C]"
              />
            </label>
          </div>
          <button type="submit" className="serva-pill-btn text-xs">
            Save Box Config
          </button>
        </form>
      )}

      {/* TAB 6: Home Construction Free Enquiries (Test 12) */}
      {tab === 'enquiries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enquiries.length === 0 ? (
            <div className="serva-card p-6 text-sm text-[#5B6B8C] md:col-span-2">
              No residential or apartment construction enquiries yet.
            </div>
          ) : (
            enquiries.map((enq) => (
              <div key={enq.id} className="serva-card p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#16A34A]">Free Promotion Enquiry</p>
                    <h3 className="text-base font-bold text-[#0A1F5C]">{enq.building_type}</h3>
                  </div>
                  <span className="text-xs font-semibold text-[#0B5FD9]">{enq.budget_range}</span>
                </div>
                <p className="text-xs text-[#0A1F5C]">
                  <strong>Customer:</strong> {enq.customer_name} ·{' '}
                  {enq.customer_mobile || enq.customer_email}
                </p>
                <p className="text-xs text-[#5B6B8C]">
                  Plot: {enq.plot_size} · Location: {enq.location} · Timeline: {enq.timeline}
                </p>
                {enq.notes && <p className="text-xs text-[#5B6B8C]">{enq.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 7: Payouts (Partner Payout ONLY) */}
      {tab === 'payouts' && (
        <div className="serva-card p-6 space-y-3">
          <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#16A34A]" /> Partner Payout Ledger
          </h2>
          {!overview || overview.payoutRows.length === 0 ? (
            <p className="text-xs text-[#5B6B8C]">No completed or assigned job payouts recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {overview.payoutRows.map((row) => (
                <div
                  key={row.id}
                  className="p-3.5 rounded-xl bg-[#F5F9FF] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0A1F5C]">{row.title}</p>
                    <p className="text-[#5B6B8C] font-mono-num">
                      {row.booking_code} · {row.scheduled_date} · {row.status}
                    </p>
                  </div>
                  <span className="font-mono-num font-bold text-[#16A34A] text-sm">
                    ₹{Math.round(row.partner_payout_paise / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
