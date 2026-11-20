import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
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

const STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'ON_THE_WAY', label: 'On Way', icon: Truck },
  { key: 'ARRIVED', label: 'Arrived', icon: MapPin },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
  { key: 'COMPLETED', label: 'Completed', icon: ShieldCheck },
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

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleVerifyOtpAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setOtpError('Please enter the 4-digit customer completion OTP.');
      return;
    }
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
    <div className="min-h-screen bg-[#F4F8FE] text-[#0A1F5C] flex flex-col font-sans antialiased pb-12">
      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7F9] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Left: Back + Brand */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  navigate('/partner');
                }
              }}
              className="p-1.5 rounded-xl border border-[#DCE7F9] bg-[#FAFCFF] hover:bg-[#EBF2FE] text-[#0A1F5C] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Return to Partner Console"
              aria-label="Back to Partner Console"
            >
              <ArrowLeft className="w-4 h-4 text-[#0B5FD9]" />
            </button>
            <Link to="/partner" aria-label="SERVA Partner Portal">
              <BrandLogo variant="horizontal" />
            </Link>
          </div>

          {/* Right: Job Code + Status Badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono-num text-[11px] sm:text-xs font-bold text-[#0B5FD9] px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
              #{job.bookingCode}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
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
                className={`w-1.5 h-1.5 rounded-full ${
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

      {/* ── Main Compact Container (max-w-3xl for easy single-column reading) ── */}
      <main className="max-w-3xl w-full mx-auto px-3.5 sm:px-6 py-4 space-y-3.5 sm:space-y-4">
        
        {/* ── CARD 1: Job Summary & Payout ── */}
        <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-[0_2px_10px_rgba(11,95,217,0.04)] p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#0B5FD9] bg-[#EBF2FE] px-2 py-0.5 rounded-md border border-[#DCE7F9]">
                  {job.serviceCategory}
                </span>
                <span className="text-[11px] text-[#5B6B8C] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#0B5FD9]" />
                  {job.scheduledDate} at {job.scheduledTime}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0A1F5C] mt-1">
                {job.serviceTitle}
              </h1>
            </div>

            {/* Payout Tag */}
            <div className="text-right shrink-0 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Your Payout</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono-num leading-tight block">
                {formatINR(netPaise)}
              </span>
              <span className="text-[9px] text-emerald-600 font-medium">
                Net (10% comm. deducted)
              </span>
            </div>
          </div>

          {/* Customer Problem Note */}
          {job.notes && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="font-bold">Customer Note:</strong> &ldquo;{job.notes}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* ── CARD 2: Compact Live Status Stepper & Immediate Action ── */}
        <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-[0_2px_10px_rgba(11,95,217,0.04)] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-[#0A1F5C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0B5FD9] animate-pulse" />
              <span>Live Service Progress</span>
            </h2>
            <span className="text-[11px] font-semibold text-[#5B6B8C]">
              {job.status === 'COMPLETED' ? '5 of 5 Complete' : `Step ${Math.max(1, currentStepIdx + 1)} of 5`}
            </span>
          </div>

          {/* Sleek Horizontal Stepper (replaces 5 giant stacked boxes!) */}
          <div className="py-1">
            <div className="flex items-center justify-between relative">
              {/* Background Connecting Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-300 -z-0"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100))}%`,
                }}
              />

              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        isPast
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-[#0B5FD9] text-white ring-4 ring-blue-100 scale-110'
                          : 'bg-white border border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] mt-1 font-semibold whitespace-nowrap ${
                        isCurrent
                          ? 'text-[#0B5FD9] font-bold'
                          : isPast
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immediate Action Section based on current stage */}
          <div className="pt-2 border-t border-slate-100">
            {job.status === 'PENDING_ACCEPTANCE' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRejectJob(job.id)}
                  className="flex-1 min-h-[40px] rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-all"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => onAcceptJob(job.id)}
                  className="flex-1 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
                >
                  ✓ Accept Job
                </button>
              </div>
            )}

            {job.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(job.id)}
                className="w-full min-h-[44px] rounded-xl bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Start Travel (On the Way) →</span>
              </button>
            )}

            {job.status === 'ON_THE_WAY' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(job.id)}
                className="w-full min-h-[44px] rounded-xl bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Mark Arrived at Location →</span>
              </button>
            )}

            {job.status === 'ARRIVED' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(job.id)}
                className="w-full min-h-[44px] rounded-xl bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>Start Work (In Progress) →</span>
              </button>
            )}

            {job.status === 'IN_PROGRESS' && (
              <form onSubmit={handleVerifyOtpAndComplete} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0A1F5C] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#0B5FD9]" />
                    <span>Enter Customer Completion OTP</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp('4821')}
                    className="text-[10px] text-[#0B5FD9] font-bold underline cursor-pointer"
                  >
                    Auto-fill Demo (4821)
                  </button>
                </div>

                {otpError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                    {otpError}
                  </div>
                )}
                {otpSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
                    ✓ Verified! Crediting {formatINR(netPaise)}...
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="4-digit PIN"
                    className="flex-1 text-center tracking-widest text-base font-mono-num font-bold min-h-[42px] rounded-xl border border-[#DCE7F9] bg-[#FAFCFF] focus:outline-none focus:border-[#0B5FD9]"
                  />
                  <button
                    type="submit"
                    className="px-4 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Job</span>
                  </button>
                </div>
              </form>
            )}

            {job.status === 'COMPLETED' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Job Completed & Verified</span>
                </span>
                <span className="font-bold font-mono-num text-emerald-700">
                  +{formatINR(netPaise)} Credited
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── CARD 3: Customer Details & 1-Click Contact/Navigation ── */}
        <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-[0_2px_10px_rgba(11,95,217,0.04)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-[#0A1F5C] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span>Customer & Location</span>
            </h2>
            <span className="text-[11px] font-bold text-[#0B5FD9] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {job.distanceKm} km away
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#0A1F5C]">
              {job.customerName} <span className="text-[#5B6B8C] font-normal">({job.customerMobile})</span>
            </p>
            <p className="text-xs text-[#5B6B8C] flex items-start gap-1 leading-snug">
              <MapPin className="w-3.5 h-3.5 text-[#0B5FD9] shrink-0 mt-0.5" />
              <span>{job.address}</span>
            </p>
          </div>

          {/* 3 Quick Action Buttons in 1 Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <a
              href={`tel:${job.customerMobile}`}
              className="min-h-[38px] rounded-xl bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/91${job.customerMobile}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-[38px] rounded-xl bg-[#FAFCFF] hover:bg-[#EBF2FE] border border-[#DCE7F9] text-[#0A1F5C] text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span>Maps</span>
            </a>
          </div>
        </div>

        {/* ── CARD 4: Compact Service Protocol Checklist ── */}
        <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-[0_2px_10px_rgba(11,95,217,0.04)] p-4 sm:p-5 space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold text-[#0A1F5C] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#0B5FD9]" />
            <span>Service Quality Checklist</span>
          </h2>

          <div className="space-y-1.5">
            {checklistItems.map((item, idx) => (
              <label
                key={idx}
                onClick={() => toggleCheck(idx)}
                className="p-2 rounded-lg border border-[#DCE7F9] bg-[#FAFCFF] hover:bg-white flex items-center gap-2.5 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={!!checkedItems[idx]}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 text-[#0B5FD9] rounded border-slate-300"
                />
                <span className="text-[#0A1F5C] font-medium leading-tight">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── CARD 5: Compact Help Hotline ── */}
        <div className="p-3 rounded-2xl bg-[#EBF3FE] border border-[#CDE0FC] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#0B5FD9] shrink-0" />
            <span className="font-bold text-[#0A1F5C]">Partner Hotline:</span>
            <a href="tel:18001234567" className="font-bold text-[#0B5FD9] hover:underline">
              1800-123-4567
            </a>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0"
          >
            WhatsApp Support
          </a>
        </div>

      </main>
    </div>
  );
}
