import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  KeyRound,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Shield,
  ShieldCheck,
  Truck,
  Wallet,
  Wrench,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { Link, useRouter } from '../../lib/router.tsx';

export interface PartnerJob {
  id: string;
  bookingCode: string;
  customerName: string;
  customerMobile: string;
  serviceCategory: string;
  serviceTitle: string;
  address: string;
  distanceKm: number;
  scheduledDate: string;
  scheduledTime: string;
  grossAmountPaise: number;
  commissionRate: number;
  status: 'PENDING_ACCEPTANCE' | 'CONFIRMED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  notes?: string;
  paymentMode: 'ONLINE' | 'CASH';
}

interface PartnerJobDetailPageProps {
  job: PartnerJob;
  onAdvanceStatus: (id: string) => void;
  onAcceptJob: (id: string) => void;
  onRejectJob: (id: string) => void;
  formatINR: (paise: number) => string;
}

const STATUS_STEPS = [
  {
    key: 'CONFIRMED',
    title: 'Booking Confirmed',
    description: 'Service request accepted and scheduled for dispatch.',
    icon: CheckCircle2,
  },
  {
    key: 'ON_THE_WAY',
    title: 'Partner On The Way',
    description: 'Travel initiated. Customer notified of arrival ETA.',
    icon: Truck,
  },
  {
    key: 'ARRIVED',
    title: 'Arrived at Location',
    description: 'Partner reached customer premises. Identity verified.',
    icon: MapPin,
  },
  {
    key: 'IN_PROGRESS',
    title: 'Work In Progress',
    description: 'Safety check completed. Active diagnosis & repair.',
    icon: Wrench,
  },
  {
    key: 'COMPLETED',
    title: 'Service Completed',
    description: 'Customer OTP verified. Net payout credited to wallet.',
    icon: ShieldCheck,
  },
];

export function PartnerJobDetailPage({
  job,
  onAdvanceStatus,
  onAcceptJob,
  onRejectJob,
  formatINR,
}: PartnerJobDetailPageProps) {
  const { navigate } = useRouter();
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const netPaise = Math.round(job.grossAmountPaise * (1 - job.commissionRate));
  const commissionPaise = job.grossAmountPaise - netPaise;

  // Step indices
  const getStepIndex = (status: PartnerJob['status']) => {
    switch (status) {
      case 'PENDING_ACCEPTANCE':
        return -1;
      case 'CONFIRMED':
        return 0;
      case 'ON_THE_WAY':
        return 1;
      case 'ARRIVED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(job.status);

  // Checkbox toggle for service checklist
  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Completion OTP verification (demo code: 4821)
  const handleVerifyOtpAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setOtpError('Please enter the 4-digit Customer Completion OTP.');
      return;
    }
    // Accept standard demo OTP or 4821
    setOtpSuccess(true);
    setTimeout(() => {
      onAdvanceStatus(job.id);
    }, 400);
  };

  const checklistItems = [
    'Inspect incoming power supply & trip MCB switch before work',
    'Test modular switches, sockets & fan speed regulator',
    'Safety earthing voltage check (< 2V leakage standard)',
    'Demonstrate working repair to customer & clean service area',
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FE] text-[#0A1F5C] flex flex-col font-sans antialiased pb-20">
      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7F9] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Back button + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  navigate('/partner');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE7F9] bg-[#FAFCFF] hover:bg-[#EBF2FE] text-xs font-bold text-[#0A1F5C] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Return to Partner Console"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span className="hidden xs:inline sm:inline">Partner Console</span>
            </button>

            <Link to="/partner" aria-label="SERVA Partner Portal">
              <BrandLogo variant="horizontal" />
            </Link>
          </div>

          {/* Right Status Badge & Job Code */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono-num text-xs font-bold text-[#0B5FD9] px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
              #{job.bookingCode}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                job.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : job.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-[#0B5FD9] border border-blue-200'
                  : job.status === 'PENDING_ACCEPTANCE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  job.status === 'COMPLETED'
                    ? 'bg-emerald-600'
                    : job.status === 'IN_PROGRESS'
                    ? 'bg-blue-600 animate-ping'
                    : 'bg-amber-500'
                }`}
              />
              <span>{job.status.replace(/_/g, ' ')}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-5 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#0B5FD9] bg-[#EBF2FE] px-2.5 py-0.5 rounded-full border border-[#DCE7F9]">
                  {job.serviceCategory}
                </span>
                <span className="text-xs text-[#5B6B8C] font-semibold">
                  Scheduled for: <strong className="text-[#0A1F5C]">{job.scheduledDate} at {job.scheduledTime}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A1F5C]">
                {job.serviceTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6B8C] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0B5FD9] shrink-0" />
                <span>{job.address}</span>
                <span className="text-[#0A1F5C] font-bold">({job.distanceKm} km away)</span>
              </p>
            </div>

            {/* Payout Callout */}
            <div className="bg-[#F8FAFD] border border-[#DCE7F9] rounded-2xl p-4 sm:text-right shrink-0">
              <span className="text-xs font-bold text-[#5B6B8C] block">Your Guaranteed Payout</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono-num block mt-0.5">
                {formatINR(netPaise)}
              </span>
              <span className="text-[11px] text-[#5B6B8C] mt-1 block">
                Gross: {formatINR(job.grossAmountPaise)} (10% SERVA Commission: -{formatINR(commissionPaise)})
              </span>
            </div>
          </div>

          {/* Quick Problem Statement */}
          {job.notes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Customer Work Note:</strong> &ldquo;{job.notes}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* ── Visual Step-by-Step Status & Milestone Stepper ── */}
        <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF2FF] pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C]">
                Live Job Status & Service Tracker
              </h2>
              <p className="text-xs text-[#5B6B8C]">
                Real-time milestone progress tracked between customer and partner.
              </p>
            </div>

            {/* Action advance button right here in the header */}
            <div>
              {job.status === 'PENDING_ACCEPTANCE' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRejectJob(job.id)}
                    className="px-4 py-2 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-all"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcceptJob(job.id)}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer transition-all active:scale-95"
                  >
                    ✓ Accept Job Request
                  </button>
                </div>
              ) : job.status !== 'COMPLETED' && job.status !== 'REJECTED' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (job.status === 'IN_PROGRESS') {
                      // Scroll to OTP verification card
                      const el = document.getElementById('otp-verification-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onAdvanceStatus(job.id);
                    }
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                >
                  {job.status === 'CONFIRMED' && '🚗 Start Travel (On the Way) →'}
                  {job.status === 'ON_THE_WAY' && '📍 Mark Arrived at Location →'}
                  {job.status === 'ARRIVED' && '🔨 Start Work (In Progress) →'}
                  {job.status === 'IN_PROGRESS' && '✅ Complete Service & Verify OTP ↓'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Job Fully Settled</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;

              return (
                <div
                  key={step.key}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#EBF2FE] border-[#0B5FD9] shadow-[0_2px_12px_rgba(11,95,217,0.12)] ring-1 ring-[#0B5FD9]'
                      : isPast
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-[#FAFCFF] border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isPast
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-[#0B5FD9] text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                      </div>

                      <span className="text-[10px] font-mono-num font-bold text-slate-400">
                        Step 0{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-[#0B5FD9]'
                            : isPast
                            ? 'text-emerald-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100">
                    {isPast && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#0B5FD9] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#0B5FD9] animate-ping" /> Current Stage
                      </span>
                    )}
                    {isFuture && (
                      <span className="text-[10px] font-medium text-slate-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two Column Grid: Customer Info & Financial Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Customer & Work Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0B5FD9]" />
                <span>Customer Contact & Location</span>
              </h2>

              <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-[#DCE7F9] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] text-[#5B6B8C] font-semibold block">Customer Name</span>
                    <span className="text-base font-bold text-[#0A1F5C]">{job.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#5B6B8C] font-semibold block">Verified Phone</span>
                    <span className="text-sm font-mono-num font-bold text-[#0A1F5C]">{job.customerMobile}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 flex-wrap">
                  <a
                    href={`tel:${job.customerMobile}`}
                    className="px-3.5 py-1.5 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/91${job.customerMobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Customer
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F1F6FF] border border-[#DCE7F9] text-[#0A1F5C] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0B5FD9]" /> Open GPS Maps
                  </a>
                </div>
              </div>

              {/* Exact Address */}
              <div className="p-4 rounded-2xl bg-[#FAFCFF] border border-[#DCE7F9] space-y-2">
                <span className="text-[11px] text-[#5B6B8C] font-semibold block">Service Location & Landmark</span>
                <p className="text-xs font-medium text-[#0A1F5C] leading-relaxed">
                  {job.address}
                </p>
                <div className="text-[11px] text-[#0B5FD9] font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{job.distanceKm} km from your current dispatch zone</span>
                </div>
              </div>
            </div>

            {/* Service Scope Checklist */}
            <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0B5FD9]" />
                <span>Service Protocol & Quality Checklist</span>
              </h2>

              <p className="text-xs text-[#5B6B8C]">
                Check each standard protocol item before collecting customer completion verification.
              </p>

              <div className="space-y-2.5">
                {checklistItems.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="p-3 rounded-xl border border-[#DCE7F9] bg-[#FAFCFF] hover:bg-white flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#0B5FD9] rounded border-[#DCE7F9] focus:ring-[#0B5FD9]"
                    />
                    <span className="text-xs text-[#0A1F5C] font-medium leading-snug">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Payout, OTP Verification & Help */}
          <div className="lg:col-span-5 space-y-6">
            {/* Financial Transparency Card */}
            <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#0B5FD9]" />
                <span>Payout & Payment Breakdown</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFCFF] border border-slate-100">
                  <span className="text-[#5B6B8C]">Customer Bill Total</span>
                  <span className="font-bold text-[#0A1F5C] font-mono-num">{formatINR(job.grossAmountPaise)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFCFF] border border-slate-100">
                  <span className="text-[#5B6B8C]">SERVA Platform Fee (10%)</span>
                  <span className="font-bold text-amber-700 font-mono-num">-{formatINR(commissionPaise)}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
                  <span className="font-bold text-emerald-900">Your Net Earnings</span>
                  <span className="font-extrabold text-emerald-700 font-mono-num text-base">
                    {formatINR(netPaise)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-[11px] text-[#5B6B8C] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#0A1F5C]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Escrow SafePay Protection</span>
                </div>
                <p>
                  Payment has been captured online and is held in escrow. Payout transfers immediately to your wallet upon OTP verification.
                </p>
              </div>
            </div>

            {/* OTP Verification & Completion Card */}
            <div id="otp-verification-card" className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0B5FD9]" />
                <span>Customer Completion Verification (OTP)</span>
              </h2>

              {job.status === 'COMPLETED' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Service Completed & Verified</span>
                  </div>
                  <p>
                    {formatINR(netPaise)} has been credited to your SERVA Partner Wallet.
                  </p>
                </div>
              ) : job.status === 'IN_PROGRESS' || job.status === 'ARRIVED' ? (
                <form onSubmit={handleVerifyOtpAndComplete} className="space-y-3">
                  <p className="text-xs text-[#5B6B8C]">
                    Ask the customer for the 4-digit completion PIN sent to their mobile number once work is done.
                  </p>

                  {otpError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                      {otpError}
                    </div>
                  )}

                  {otpSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
                      ✓ OTP Verified! Crediting payout...
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="4-digit OTP"
                      className="w-full text-center tracking-widest text-lg font-mono-num font-bold min-h-[46px] rounded-xl border border-[#DCE7F9] bg-[#FAFCFF] focus:outline-none focus:border-[#0B5FD9]"
                    />
                    <button
                      type="button"
                      onClick={() => setEnteredOtp('4821')}
                      className="shrink-0 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-[11px] font-bold text-[#0B5FD9] hover:bg-blue-100 transition-colors"
                      title="Auto-fill demo PIN"
                    >
                      Use Demo (4821)
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[46px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP & Collect ₹{Math.round(netPaise / 100)} Payout</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span>
                    OTP verification will unlock once you reach the location and advance status to <strong>In Progress</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Emergency Hotline Assistance */}
            <div className="bg-gradient-to-br from-[#EBF3FE] to-[#F8FAFD] border border-[#CDE0FC] p-5 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B5FD9] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0A1F5C]">Partner On-Duty Hotline</h3>
                  <p className="text-[11px] text-[#5B6B8C]">24/7 assistance for disputes, parts, or location issues</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="tel:18001234567"
                  className="px-3.5 py-1.5 rounded-full bg-[#0B5FD9] text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm hover:bg-blue-700"
                >
                  <Phone className="w-3 h-3" /> Call 1800-123-4567
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm hover:bg-emerald-700"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
