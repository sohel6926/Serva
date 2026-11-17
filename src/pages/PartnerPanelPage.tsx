import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Power,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

/* Types for Partner Panel */
type PanelTab = 'overview' | 'jobs' | 'wallet' | 'kyc' | 'reviews' | 'support';

interface PartnerJob {
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
  commissionRate: number; // e.g. 0.10 (10%)
  status: 'PENDING_ACCEPTANCE' | 'CONFIRMED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  notes?: string;
  paymentMode: 'ONLINE' | 'CASH';
}

interface WalletTransaction {
  id: string;
  date: string;
  type: 'PAYOUT_CREDIT' | 'COMMISSION_DEBIT' | 'WITHDRAWAL';
  description: string;
  referenceId: string;
  grossPaise?: number;
  commissionPaise?: number;
  netPaise: number;
  status: 'PAID' | 'PENDING' | 'REJECTED';
  destination?: string;
}

interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  serviceTitle: string;
  comment: string;
  partnerReply?: string;
}

interface SupportTicket {
  id: string;
  category: 'PAYOUT' | 'BOOKING_ISSUE' | 'KYC_DOCUMENTS' | 'CUSTOMER_DISPUTE' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  adminReply?: string;
}

const INITIAL_JOBS: PartnerJob[] = [
  {
    id: 'job-1',
    bookingCode: 'SRV-9821',
    customerName: 'Ananya Reddy',
    customerMobile: '9876543210',
    serviceCategory: 'Home Services',
    serviceTitle: 'Electrician & Switchboard Repair',
    address: 'Plot 42, Jubilee Hills, Road No. 36, Hyderabad',
    distanceKm: 2.4,
    scheduledDate: 'Today',
    scheduledTime: '11:30 AM',
    grossAmountPaise: 45000,
    commissionRate: 0.10,
    status: 'IN_PROGRESS',
    notes: '2 switchboards sparking and 1 ceiling fan speed regulator replacement.',
    paymentMode: 'ONLINE',
  },
  {
    id: 'job-2',
    bookingCode: 'SRV-9844',
    customerName: 'Vikram Joshi',
    customerMobile: '9848011223',
    serviceCategory: 'Home Services',
    serviceTitle: 'Kitchen & Bathroom Plumbing',
    address: 'Flat 304, Rainbow Towers, Madhapur, Hyderabad',
    distanceKm: 4.1,
    scheduledDate: 'Today',
    scheduledTime: '02:00 PM',
    grossAmountPaise: 65000,
    commissionRate: 0.10,
    status: 'CONFIRMED',
    notes: 'Kitchen sink pipe leakage under cabinet. Customer has spare washers.',
    paymentMode: 'ONLINE',
  },
  {
    id: 'job-3',
    bookingCode: 'SRV-9870',
    customerName: 'Kavitha Rao',
    customerMobile: '9988776655',
    serviceCategory: 'Home Services',
    serviceTitle: 'Ceiling Fan Installation & Wiring',
    address: 'House 12-4, Gachibowli, Near Bio-Diversity Park, Hyderabad',
    distanceKm: 5.6,
    scheduledDate: 'Today',
    scheduledTime: '04:30 PM',
    grossAmountPaise: 35000,
    commissionRate: 0.10,
    status: 'PENDING_ACCEPTANCE',
    notes: 'New fan installation in bedroom; hook is already fitted.',
    paymentMode: 'ONLINE',
  },
  {
    id: 'job-4',
    bookingCode: 'SRV-9712',
    customerName: 'Rajesh Sharma',
    customerMobile: '9811223344',
    serviceCategory: 'Home Services',
    serviceTitle: 'Main MCB & Inverter Line Setup',
    address: 'Villa 18, Palm Meadows, Kondapur, Hyderabad',
    distanceKm: 6.8,
    scheduledDate: 'Yesterday',
    scheduledTime: '10:00 AM',
    grossAmountPaise: 120000,
    commissionRate: 0.10,
    status: 'COMPLETED',
    notes: 'Inverter tripping issue fixed. Replaced 32A MCB switch.',
    paymentMode: 'ONLINE',
  },
  {
    id: 'job-5',
    bookingCode: 'SRV-9680',
    customerName: 'Pooja Varma',
    customerMobile: '9700112233',
    serviceCategory: 'Home Services',
    serviceTitle: 'Geyser Wiring & Power Socket Fitting',
    address: 'Apt 5B, Skyline Heights, Hitec City, Hyderabad',
    distanceKm: 3.5,
    scheduledDate: '15 Nov 2026',
    scheduledTime: '03:00 PM',
    grossAmountPaise: 55000,
    commissionRate: 0.10,
    status: 'COMPLETED',
    notes: 'Installed heavy 16A modular socket with safety earthing check.',
    paymentMode: 'ONLINE',
  },
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TXN-9014',
    date: '16 Nov 2026, 11:45 AM',
    type: 'PAYOUT_CREDIT',
    description: 'Job Payout: Main MCB & Inverter Setup (#SRV-9712)',
    referenceId: 'SRV-9712',
    grossPaise: 120000,
    commissionPaise: 12000,
    netPaise: 108000,
    status: 'PAID',
  },
  {
    id: 'TXN-8980',
    date: '15 Nov 2026, 04:30 PM',
    type: 'PAYOUT_CREDIT',
    description: 'Job Payout: Geyser Power Socket Fitting (#SRV-9680)',
    referenceId: 'SRV-9680',
    grossPaise: 55000,
    commissionPaise: 5500,
    netPaise: 49500,
    status: 'PAID',
  },
  {
    id: 'TXN-8840',
    date: '14 Nov 2026, 09:15 AM',
    type: 'WITHDRAWAL',
    description: 'Payout Transfer to Bank Account (HDFC Bank ****4821)',
    referenceId: 'WDR-4421',
    netPaise: 500000,
    status: 'PAID',
    destination: 'HDFC Bank ****4821',
  },
  {
    id: 'TXN-8720',
    date: '12 Nov 2026, 06:10 PM',
    type: 'PAYOUT_CREDIT',
    description: 'Job Payout: Full House Rewiring Inspection (#SRV-9510)',
    referenceId: 'SRV-9510',
    grossPaise: 250000,
    commissionPaise: 25000,
    netPaise: 225000,
    status: 'PAID',
  },
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Rajesh Sharma',
    rating: 5,
    date: 'Yesterday',
    serviceTitle: 'Main MCB & Inverter Line Setup',
    comment:
      'Very punctual, arrived with all required tools and safety gear. Diagnosed the inverter tripping fault immediately and replaced the MCB cleanly. Outstanding work!',
    partnerReply: 'Thank you Rajesh ji! Happy to help ensure your home wiring stays safe.',
  },
  {
    id: 'rev-2',
    customerName: 'Pooja Varma',
    rating: 5,
    date: '15 Nov 2026',
    serviceTitle: 'Geyser Power Socket Fitting',
    comment:
      'Polite technician. Installed the 16A power socket neatly with concealed earthing. Upfront transparent pricing as shown in the app.',
  },
  {
    id: 'rev-3',
    customerName: 'Srikanth N.',
    rating: 4,
    date: '11 Nov 2026',
    serviceTitle: 'Ceiling Fan & Chandelier Fitting',
    comment:
      'Good work and clean fitting. Slight delay due to traffic in Madhapur, but called in advance to inform. Recommended.',
    partnerReply: 'Apologies for the slight traffic delay Srikanth ji, glad the installation was to your satisfaction!',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-201',
    category: 'PAYOUT',
    subject: 'Confirmation on Diwali weekend commission rate',
    message: 'Hello team, is the 0% commission applicable automatically on all completed bookings this weekend?',
    status: 'RESOLVED',
    createdAt: '14 Nov 2026',
    adminReply: 'Yes Ramesh, all jobs completed between Saturday 00:00 to Monday 23:59 have 0% commission credited automatically to your wallet balance.',
  },
];

/* ────────────────────────────────────────────────────────────
   PARTNER AUTHENTICATION & KYC ONBOARDING GATE
   Shown when navigating to /partner before logging in or registering
   ──────────────────────────────────────────────────────────── */
interface PartnerAuthGateProps {
  onSignedIn: () => void;
}

function PartnerAuthGate({ onSignedIn }: PartnerAuthGateProps) {
  const { user, loginAsDemo } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('ramesh.partner@serva.demo');
  const [loginPassword, setLoginPassword] = useState('partner123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register State (Per PDF Section 2 KYC Form)
  const [partnerType, setPartnerType] = useState<'INDIVIDUAL' | 'SHOP_BUSINESS'>('INDIVIDUAL');
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [regPassword, setRegPassword] = useState('');
  const [category, setCategory] = useState('Home Services');
  const [servicesOffered, setServicesOffered] = useState('Electrician & Wiring, AC Repair, Geyser Care');
  const [serviceArea, setServiceArea] = useState('Hyderabad (All Zones)');

  // KYC Docs
  const [panNumber, setPanNumber] = useState('BPZPR4521K');
  const [panDocUploaded, setPanDocUploaded] = useState(true);
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [gstDocUploaded, setGstDocUploaded] = useState(false);

  // Payout Mode
  const [payoutMode, setPayoutMode] = useState<'BANK' | 'UPI'>('UPI');
  const [bankAccount, setBankAccount] = useState('50100239019283');
  const [bankIfsc, setBankIfsc] = useState('HDFC0001234');
  const [bankName, setBankName] = useState('HDFC Bank, Hyderabad');
  const [upiId, setUpiId] = useState('ramesh.partner@okhdfcbank');

  // OTP Simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(true);

  // KYC Confirmation Tracker
  const [submittedKyc, setSubmittedKyc] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await loginAsDemo('partner');
      onSignedIn();
    } catch {
      setLoginError('Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setOtpCode('5821');
    setRegError(null);
  };

  const handleVerifyOtp = () => {
    if (otpCode === '5821' || otpCode.length >= 4) {
      setOtpVerified(true);
      setRegError(null);
    } else {
      setRegError('Incorrect OTP code.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!fullName.trim() || !mobile.trim()) {
      setRegError('Please provide full name and mobile number.');
      return;
    }
    if (!otpVerified) {
      setRegError('Please verify your mobile number with OTP first.');
      return;
    }
    if (partnerType === 'INDIVIDUAL' && !panNumber.trim()) {
      setRegError('PAN card number is required for individual verification.');
      return;
    }
    if (partnerType === 'SHOP_BUSINESS' && (!shopName.trim() || !gstNumber.trim())) {
      setRegError('Shop name and GST/Trade License number are required for business verification.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const appData = {
        partnerType,
        fullName,
        mobile,
        email,
        category,
        servicesOffered,
        serviceArea,
        panNumber: partnerType === 'INDIVIDUAL' ? panNumber : undefined,
        shopName: partnerType === 'SHOP_BUSINESS' ? shopName : undefined,
        gstNumber: partnerType === 'SHOP_BUSINESS' ? gstNumber : undefined,
        payoutMode,
        payoutDest: payoutMode === 'UPI' ? upiId : `${bankName} - ${bankAccount}`,
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSubmittedKyc(appData);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2FE] text-[#0B5FD9] text-xs font-bold mb-3 border border-[#DCE7F9]">
          <ShieldCheck className="w-4 h-4 text-[#0B5FD9]" />
          <span>SERVA Partner Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1F5C] tracking-tight">
          Partner Access & Onboarding
        </h1>
        <p className="text-xs sm:text-sm text-[#5B6B8C] mt-1.5 max-w-md mx-auto">
          Sign in to your partner dashboard or register your service business to start receiving verified doorstep bookings.
        </p>

        {/* Notice if currently signed in as Customer */}
        {user && user.role !== 'PARTNER' && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-900">Signed in as Customer ({user.name})</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                The Partner Panel requires a verified Partner account. Please sign in with your partner credentials or complete the registration below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submitted Application Confirmation View */}
      {submittedKyc ? (
        <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              KYC Status: Pending Admin Verification
            </span>
            <h2 className="text-xl font-bold text-[#0A1F5C] mt-2.5">
              Registration & KYC Submitted!
            </h2>
            <p className="text-xs text-[#5B6B8C] mt-1">
              Thank you <strong>{submittedKyc.fullName}</strong>. Your partner profile for{' '}
              <strong>{submittedKyc.category}</strong> has been forwarded to SERVA Admin for verification.
            </p>
          </div>

          {/* Stepper Status Tracking */}
          <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] text-left text-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0A1F5C]">Application & Documents Submitted</p>
                <p className="text-[10px] text-[#5B6B8C]">Submitted at {submittedKyc.submittedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                2
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-800">Admin Document & Bank Verification</p>
                <p className="text-[10px] text-amber-700">In review by SERVA Operations team</p>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-700">Account Activation & Job Dispatch</p>
                <p className="text-[10px] text-gray-500">Unlocks automatically upon admin approval</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('partner');
                onSignedIn();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Admin Approval & Enter Partner Panel</span>
            </button>

            <button
              type="button"
              onClick={() => setSubmittedKyc(null)}
              className="text-xs font-semibold text-[#5B6B8C] hover:text-[#0B5FD9] py-1"
            >
              &larr; Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        /* Main Card: Sign In / Register Tabs */
        <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-xl overflow-hidden">
          {/* Tab Pill Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F1F6FF] border-b border-[#DCE7F9] text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`py-2.5 rounded-2xl transition-all cursor-pointer ${
                tab === 'signin' ? 'bg-white text-[#0B5FD9] shadow-sm' : 'text-[#5B6B8C] hover:text-[#0A1F5C]'
              }`}
            >
              Sign In to Partner Account
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2.5 rounded-2xl transition-all cursor-pointer ${
                tab === 'register' ? 'bg-white text-[#0B5FD9] shadow-sm' : 'text-[#5B6B8C] hover:text-[#0A1F5C]'
              }`}
            >
              Create Account (KYC)
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {/* ── TAB 1: SIGN IN ── */}
            {tab === 'signin' && (
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">
                    Registered Mobile Number or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5B6B8C] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543211 or partner@serva.demo"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCE7F9] text-xs font-medium focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#0A1F5C]">Partner Password</label>
                    <span className="text-[11px] text-[#0B5FD9] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5B6B8C] absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#DCE7F9] text-xs font-medium focus:outline-none focus:border-[#0B5FD9]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#5B6B8C] hover:text-[#0A1F5C]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                >
                  <span>{loginLoading ? 'Signing In...' : 'Sign In to Partner Panel'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Instant Demo Shortcut */}
                <div className="pt-4 border-t border-[#EAF2FF] text-center">
                  <p className="text-[11px] text-[#5B6B8C] mb-2 font-medium">Quick Evaluator / Testing Access:</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await loginAsDemo('partner');
                      onSignedIn();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                    <span>⚡ 1-Click Sign In as Ramesh Kumar (Verified Electrician)</span>
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-xs font-semibold text-[#0B5FD9] hover:underline cursor-pointer"
                  >
                    New partner? Register your business &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* ── TAB 2: CREATE PARTNER ACCOUNT (KYC) ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                    {regError}
                  </div>
                )}

                {/* Partner Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">Partner Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPartnerType('INDIVIDUAL')}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        partnerType === 'INDIVIDUAL'
                          ? 'bg-[#0B5FD9] text-white border-[#0B5FD9] shadow-sm'
                          : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#0A1F5C]'
                      }`}
                    >
                      👤 Individual Technician
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerType('SHOP_BUSINESS')}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        partnerType === 'SHOP_BUSINESS'
                          ? 'bg-[#0B5FD9] text-white border-[#0B5FD9] shadow-sm'
                          : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#0A1F5C]'
                      }`}
                    >
                      🏪 Shop / Business
                    </button>
                  </div>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    {partnerType === 'SHOP_BUSINESS' ? 'Owner / Contact Person Full Name' : 'Full Name (as per PAN)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                {/* Mobile Number & OTP Verification */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Mobile Number (OTP Verification)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        setOtpVerified(false);
                      }}
                      className="flex-1 p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                    />
                    {!otpVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3.5 py-2 rounded-xl bg-[#EBF2FE] text-[#0B5FD9] hover:bg-[#DCE7F9] text-xs font-bold shrink-0"
                      >
                        {otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Enter 4-digit OTP (5821)"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold tracking-widest text-[#0A1F5C]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shrink-0"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>

                {/* Category & Services */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs bg-white font-medium"
                    >
                      <option value="Home Services">Home Services</option>
                      <option value="Contractors & Construction">Contractors & Construction</option>
                      <option value="Agriculture Services">Agriculture Services</option>
                      <option value="Event Services">Event Services</option>
                      <option value="Moving & Shifting">Moving & Shifting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Service Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad, TG"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs"
                    />
                  </div>
                </div>

                {/* Business Specific or Individual Specific Fields */}
                {partnerType === 'SHOP_BUSINESS' ? (
                  <div className="space-y-3 bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#DCE7F9]">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Shop / Business Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Balaji Electricals & Services"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">GSTIN or Trade License No.</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 36AAAAA0000A1Z5"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#5B6B8C]">Upload GST / Trade License:</span>
                      <button
                        type="button"
                        onClick={() => setGstDocUploaded(!gstDocUploaded)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          gstDocUploaded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white border-[#DCE7F9] text-[#0B5FD9]'
                        }`}
                      >
                        {gstDocUploaded ? '✓ Document Uploaded' : '+ Attach Document'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#DCE7F9]">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">PAN Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="e.g. BPZPR4521K"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#5B6B8C]">Upload PAN Card Image:</span>
                      <button
                        type="button"
                        onClick={() => setPanDocUploaded(!panDocUploaded)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          panDocUploaded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white border-[#DCE7F9] text-[#0B5FD9]'
                        }`}
                      >
                        {panDocUploaded ? '✓ PAN Image Attached' : '+ Attach PAN Scan'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bank / UPI Details for Withdrawals */}
                <div className="bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#DCE7F9] space-y-2.5">
                  <label className="block text-xs font-bold text-[#0A1F5C]">
                    Bank / UPI Details (for Wallet Payouts)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMode('UPI')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        payoutMode === 'UPI' ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]' : 'bg-white border-[#DCE7F9]'
                      }`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMode('BANK')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        payoutMode === 'BANK' ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]' : 'bg-white border-[#DCE7F9]'
                      }`}
                    >
                      Bank Account
                    </button>
                  </div>

                  {payoutMode === 'UPI' ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="IFSC Code"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        className="w-full p-2 rounded-xl border border-[#DCE7F9] text-xs bg-white font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Create Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div className="text-[11px] text-[#5B6B8C]">
                  By submitting, you agree to SERVA Partner Terms, 10% standard commission rate, and doorstep service quality guidelines.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>{submitting ? 'Submitting Application...' : 'Submit KYC & Create Partner Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="text-xs font-semibold text-[#0B5FD9] hover:underline cursor-pointer"
                  >
                    Already have a partner account? Sign In &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PartnerPanelPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  // If not authenticated as PARTNER, ask to sign in or create account first
  const isPartner = user && user.role === 'PARTNER';
  if (!isPartner) {
    return <PartnerAuthGate onSignedIn={() => {}} />;
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState<PanelTab>('overview');

  // Online / Duty status
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return localStorage.getItem('serva_partner_online') !== 'false';
  });

  // State data (persisted in localStorage for demo / static Vercel reliability)
  const [jobs, setJobs] = useState<PartnerJob[]>(() => {
    const saved = localStorage.getItem('serva_partner_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [walletBalancePaise, setWalletBalancePaise] = useState<number>(() => {
    const saved = localStorage.getItem('serva_partner_balance');
    return saved ? parseInt(saved, 10) : 845000; // ₹8,450.00
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('serva_partner_txns');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('serva_partner_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('serva_partner_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  // Withdrawal form inputs
  const [withdrawAmount, setWithdrawAmount] = useState<string>('2000');
  const [withdrawMode, setWithdrawMode] = useState<'BANK' | 'UPI'>('BANK');
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // New Ticket form
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('PAYOUT');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  // Review reply state
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('serva_partner_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('serva_partner_balance', walletBalancePaise.toString());
  }, [walletBalancePaise]);

  useEffect(() => {
    localStorage.setItem('serva_partner_txns', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('serva_partner_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('serva_partner_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const toggleDuty = () => {
    const next = !isOnline;
    setIsOnline(next);
    localStorage.setItem('serva_partner_online', next.toString());
  };

  // Metrics
  const activeJobs = jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'REJECTED');
  const pendingRequests = jobs.filter((j) => j.status === 'PENDING_ACCEPTANCE');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');

  const todayEarningsPaise = completedJobs
    .filter((j) => j.scheduledDate === 'Today')
    .reduce((sum, j) => sum + Math.round(j.grossAmountPaise * (1 - j.commissionRate)), 0) + 155000; // simulated base today

  const totalGrossPaise = jobs
    .filter((j) => j.status === 'COMPLETED')
    .reduce((sum, j) => sum + j.grossAmountPaise, 0) + 7200000;

  const totalCommissionPaise = Math.round(totalGrossPaise * 0.10);
  const totalNetEarnedPaise = totalGrossPaise - totalCommissionPaise;

  // Format currency
  const formatINR = (paise: number) => {
    return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
  };

  // Job Actions
  const handleAcceptJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'CONFIRMED' } : j))
    );
  };

  const handleRejectJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'REJECTED' } : j))
    );
  };

  const handleAdvanceStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        let next: PartnerJob['status'] = j.status;
        if (j.status === 'CONFIRMED') next = 'ON_THE_WAY';
        else if (j.status === 'ON_THE_WAY') next = 'ARRIVED';
        else if (j.status === 'ARRIVED') next = 'IN_PROGRESS';
        else if (j.status === 'IN_PROGRESS') {
          next = 'COMPLETED';
          // Credit wallet on completion
          const net = Math.round(j.grossAmountPaise * (1 - j.commissionRate));
          setWalletBalancePaise((b) => b + net);
          setTransactions((txns) => [
            {
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              date: 'Just now',
              type: 'PAYOUT_CREDIT',
              description: `Job Completed: ${j.serviceTitle} (#${j.bookingCode})`,
              referenceId: j.bookingCode,
              grossPaise: j.grossAmountPaise,
              commissionPaise: Math.round(j.grossAmountPaise * j.commissionRate),
              netPaise: net,
              status: 'PAID',
            },
            ...txns,
          ]);
        }
        return { ...j, status: next };
      })
    );
  };

  // Withdrawal handler (Enforces PDF rule: Minimum amount ₹500)
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawNotice(null);
    setWithdrawError(null);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amountNum < 500) {
      setWithdrawError('Minimum withdrawal amount is ₹500 (per platform policy).');
      return;
    }
    const amountPaise = Math.round(amountNum * 100);
    if (amountPaise > walletBalancePaise) {
      setWithdrawError(`Insufficient balance. You can withdraw up to ${formatINR(walletBalancePaise)}.`);
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setWalletBalancePaise((b) => b - amountPaise);
      const newTxn: WalletTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        date: 'Just now',
        type: 'WITHDRAWAL',
        description: `Withdrawal to ${withdrawMode === 'BANK' ? 'HDFC Bank ****4821' : 'UPI (ramesh.partner@okhdfcbank)'}`,
        referenceId: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
        netPaise: amountPaise,
        status: 'PAID',
        destination: withdrawMode === 'BANK' ? 'HDFC Bank ****4821' : 'ramesh.partner@okhdfcbank',
      };
      setTransactions((t) => [newTxn, ...t]);
      setWithdrawNotice(`✓ Withdrawal of ${formatINR(amountPaise)} processed successfully to your ${withdrawMode === 'BANK' ? 'bank account' : 'UPI ID'}.`);
      setWithdrawAmount('');
      setIsWithdrawing(false);
    }, 600);
  };

  // Download Statement (PDF Scope Section 5)
  const handleDownloadStatement = () => {
    const header = 'SERVA PARTNER WALLET STATEMENT\nGenerated: ' + new Date().toLocaleString() + '\nPartner: Ramesh Kumar (SERVA ID: PTR-8821)\n' +
      '------------------------------------------------------------\n' +
      'Available Balance: ' + formatINR(walletBalancePaise) + '\n' +
      'Gross Job Earnings: ' + formatINR(totalGrossPaise) + '\n' +
      'Admin Commission (10%): ' + formatINR(totalCommissionPaise) + '\n' +
      'Net Partner Earnings: ' + formatINR(totalNetEarnedPaise) + '\n' +
      '------------------------------------------------------------\n\n' +
      'TRANSACTION HISTORY:\n';

    const rows = transactions
      .map(
        (t) =>
          `[${t.date}] ${t.id} | ${t.description} | Net: ${formatINR(t.netPaise)} | Status: ${t.status}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SERVA-Partner-Statement-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Submit Support Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(200 + Math.random() * 800)}`,
      category: newTicketCategory,
      subject: newTicketSubject.trim(),
      message: newTicketMessage.trim(),
      status: 'OPEN',
      createdAt: 'Today',
    };
    setTickets((prev) => [newTicket, ...prev]);
    setNewTicketSubject('');
    setNewTicketMessage('');
    setTicketNotice('✓ Your support ticket has been submitted. SERVA Operations will reply within 2 hours.');
    setTimeout(() => setTicketNotice(null), 4000);
  };

  // Reply to review
  const handleAddReviewReply = (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, partnerReply: text } : r))
    );
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    setReplyOpen((prev) => ({ ...prev, [reviewId]: false }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ── Top Header Banner: Partner Identity & Duty Toggle ── */}
      <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-[0_4px_24px_rgba(11,95,217,0.06)] p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B5FD9] to-[#0A1F5C] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A1F5C]">
                  {user?.name || 'Ramesh Kumar'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Partner
                </span>
                <span className="text-[11px] font-semibold text-[#5B6B8C] px-2 py-0.5 rounded-md bg-[#F1F6FF] border border-[#E2EEFE]">
                  ID: PTR-8821
                </span>
              </div>
              <p className="text-xs text-[#5B6B8C] mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[#0A1F5C]">Electrician & Home Services</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9 (142 reviews)
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[#5B6B8C]">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5FD9]" /> Hyderabad, Telangana
                </span>
              </p>
            </div>
          </div>

          {/* Right Side: Admin Portal Link & Duty Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center">
            <Link
              to="/admin"
              className="min-h-[42px] px-3.5 rounded-full text-xs font-bold text-[#0A1F5C] bg-[#F1F6FF] hover:bg-[#E2EEFE] border border-[#DCE7F9] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#0B5FD9]" />
              <span className="hidden sm:inline">Open Admin Console &rarr;</span>
              <span className="sm:hidden">Admin &rarr;</span>
            </Link>

            {/* Duty Toggle */}
            <button
              type="button"
              onClick={toggleDuty}
              className={`min-h-[42px] px-4 rounded-full text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-sm active:scale-95 ${
                isOnline
                  ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
              <span>{isOnline ? 'On Duty · Online' : 'Off Duty · Offline'}</span>
            </button>
          </div>
        </div>

        {/* ── Sub Header Navigation Tabs ── */}
        <div className="mt-6 pt-4 border-t border-[#EAF2FF] flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {[
            { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
            { id: 'jobs' as const, label: `Service Jobs (${activeJobs.length})`, icon: Clock, badge: pendingRequests.length > 0 ? pendingRequests.length : undefined },
            { id: 'wallet' as const, label: 'Wallet & Payouts', icon: Wallet },
            { id: 'kyc' as const, label: 'KYC & Profile', icon: FileCheck },
            { id: 'reviews' as const, label: `Reviews (${reviews.length})`, icon: Star },
            { id: 'support' as const, label: 'Support & Tickets', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[40px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B5FD9] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-[#F4F8FE] text-[#0A1F5C] hover:bg-[#EBF2FE] border border-[#DCE7F9]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-[#0B5FD9]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
       *  TAB 1: OVERVIEW (DASHBOARD)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Today's Earnings */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#DCE7F9] shadow-[0_2px_12px_rgba(11,95,217,0.05)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Today's Earnings</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-extrabold text-[#0A1F5C] font-mono-num">
                  {formatINR(todayEarningsPaise)}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  ✓ After 10% commission
                </p>
              </div>
            </div>

            {/* 2. Available Balance */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#DCE7F9] shadow-[0_2px_12px_rgba(11,95,217,0.05)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Wallet Balance</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0B5FD9] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-extrabold text-[#0B5FD9] font-mono-num">
                  {formatINR(walletBalancePaise)}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  className="text-[11px] text-[#0B5FD9] font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
                >
                  Withdraw Funds <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3. Completed Services */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#DCE7F9] shadow-[0_2px_12px_rgba(11,95,217,0.05)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Completed Jobs</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-extrabold text-[#0A1F5C]">
                  {completedJobs.length + 144}
                </p>
                <p className="text-[11px] text-[#5B6B8C] font-semibold mt-0.5">
                  98% Completion Rate
                </p>
              </div>
            </div>

            {/* 4. Active Rating */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#DCE7F9] shadow-[0_2px_12px_rgba(11,95,217,0.05)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Overall Rating</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <p className="text-xl sm:text-2xl font-extrabold text-[#0A1F5C]">4.9</p>
                  <span className="text-amber-500 font-bold text-sm">★★★★★</span>
                </div>
                <p className="text-[11px] text-[#5B6B8C] font-semibold mt-0.5">
                  Based on 142 reviews
                </p>
              </div>
            </div>
          </div>

          {/* Pending Action Alert if new request */}
          {pendingRequests.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    You have {pendingRequests.length} new service request waiting for your acceptance!
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Accept promptly to maintain high partner responsiveness rating.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Review Requests →
              </button>
            </div>
          )}

          {/* Active Job in Progress Banner */}
          {activeJobs.filter((j) => j.status !== 'PENDING_ACCEPTANCE').length > 0 && (
            <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  <h2 className="text-base font-bold text-[#0A1F5C]">Current Active Job</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="text-xs font-bold text-[#0B5FD9] hover:underline"
                >
                  View All Jobs →
                </button>
              </div>

              {activeJobs
                .filter((j) => j.status !== 'PENDING_ACCEPTANCE')
                .slice(0, 1)
                .map((job) => (
                  <div key={job.id} className="p-4 rounded-xl bg-[#F8FAFD] border border-[#E2EEFE] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono-num font-bold text-[#0B5FD9]">
                          #{job.bookingCode} · {job.serviceCategory}
                        </span>
                        <h3 className="text-sm font-bold text-[#0A1F5C] mt-0.5">{job.serviceTitle}</h3>
                        <p className="text-xs text-[#5B6B8C] mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0B5FD9]" />
                          <span>{job.address} ({job.distanceKm} km away)</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#5B6B8C]">Your Net Payout</p>
                        <p className="text-base font-bold text-emerald-600 font-mono-num">
                          {formatINR(Math.round(job.grossAmountPaise * (1 - job.commissionRate)))}
                        </p>
                        <span className="text-[10px] text-[#5B6B8C]">
                          Gross: {formatINR(job.grossAmountPaise)} (10% comm.)
                        </span>
                      </div>
                    </div>

                    {/* Status Tracker Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EAEFF8]">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        Status: {job.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(job.id)}
                        className="px-4 py-1.5 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {job.status === 'CONFIRMED' && 'Start Travel (On the Way) →'}
                        {job.status === 'ON_THE_WAY' && 'Mark Arrived at Location →'}
                        {job.status === 'ARRIVED' && 'Start Work →'}
                        {job.status === 'IN_PROGRESS' && '✓ Complete Work & Collect Payout'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quick Announcement Banner from Admin (PDF Section 6) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#0A1F5C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Diwali Festival Partner Bonanza</h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  0% platform commission on all weekend service requests completed between 10 AM to 6 PM!
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20 self-start sm:self-auto">
              Active Announcement
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
       *  TAB 2: SERVICE JOBS (PDF Section 4)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE7F9] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Service Jobs & Orders</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Accept incoming requests, manage active work in progress, and view completion history.
                </p>
              </div>
            </div>

            {/* List of Jobs */}
            <div className="space-y-4">
              {jobs.map((job) => {
                const netPaise = Math.round(job.grossAmountPaise * (1 - job.commissionRate));
                const commissionPaise = job.grossAmountPaise - netPaise;

                return (
                  <div
                    key={job.id}
                    className="p-4.5 rounded-2xl border border-[#DCE7F9] bg-[#FAFCFF] hover:border-[#0B5FD9]/40 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono-num text-xs font-bold text-[#0B5FD9] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                            #{job.bookingCode}
                          </span>
                          <span className="text-xs text-[#5B6B8C] font-semibold">{job.serviceCategory}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              job.status === 'PENDING_ACCEPTANCE'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : job.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : job.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#0A1F5C] mt-1.5">{job.serviceTitle}</h3>
                        <p className="text-xs text-[#5B6B8C] mt-0.5">
                          Customer: <strong className="text-[#0A1F5C]">{job.customerName}</strong> ({job.customerMobile})
                        </p>
                        <p className="text-xs text-[#5B6B8C] mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0B5FD9] shrink-0" />
                          <span>{job.address} · <strong className="text-[#0A1F5C]">{job.distanceKm} km</strong></span>
                        </p>
                        {job.notes && (
                          <p className="text-[11px] text-[#475569] mt-1.5 italic bg-white p-2 rounded-lg border border-slate-200">
                            "{job.notes}"
                          </p>
                        )}
                      </div>

                      {/* Payout Breakdown */}
                      <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-[#E2EEFE]">
                        <p className="text-[11px] text-[#5B6B8C]">Your Net Payout</p>
                        <p className="text-lg font-bold text-emerald-600 font-mono-num">{formatINR(netPaise)}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Customer Total: {formatINR(job.grossAmountPaise)}
                        </p>
                        <p className="text-[10px] text-amber-700 font-medium">
                          SERVA Commission (10%): -{formatINR(commissionPaise)}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar based on Status */}
                    <div className="pt-3 border-t border-[#EAEFF8] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
                        <Calendar className="w-3.5 h-3.5 text-[#0B5FD9]" />
                        <span>Scheduled: <strong>{job.scheduledDate}</strong> at <strong>{job.scheduledTime}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* New Request Actions */}
                        {job.status === 'PENDING_ACCEPTANCE' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRejectJob(job.id)}
                              className="px-3.5 py-1.5 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptJob(job.id)}
                              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/25 cursor-pointer"
                            >
                              ✓ Accept Request
                            </button>
                          </>
                        )}

                        {/* Ongoing Step Actions */}
                        {job.status !== 'PENDING_ACCEPTANCE' && job.status !== 'COMPLETED' && job.status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(job.id)}
                            className="px-4 py-1.5 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            {job.status === 'CONFIRMED' && '🚗 Start Travel (On the Way)'}
                            {job.status === 'ON_THE_WAY' && '📍 Mark Arrived at Location'}
                            {job.status === 'ARRIVED' && '🔨 Start Work (In Progress)'}
                            {job.status === 'IN_PROGRESS' && '✅ Complete Service & Credit Wallet'}
                          </button>
                        )}

                        {/* Completed Notice */}
                        {job.status === 'COMPLETED' && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Payout Credited to Wallet
                          </span>
                        )}
                        {job.status === 'REJECTED' && (
                          <span className="text-xs font-bold text-rose-600">
                            Request Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
       *  TAB 3: WALLET & WITHDRAWAL (PDF Section 5)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Top Wallet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Available for Withdrawal */}
            <div className="bg-gradient-to-br from-[#0B5FD9] to-[#0A1F5C] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                  Available Wallet Balance
                </span>
                <p className="text-3xl font-extrabold text-white font-mono-num mt-2">
                  {formatINR(walletBalancePaise)}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Ready for instant withdrawal to Bank or UPI.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/15 relative z-10 flex items-center justify-between text-xs">
                <span className="text-blue-100">Min. Withdrawal: ₹500</span>
                <span className="text-emerald-300 font-bold">✓ KYC Verified</span>
              </div>
            </div>

            {/* 2. Lifetime Earnings Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-[#DCE7F9] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#5B6B8C] uppercase tracking-wider">
                  Gross Earnings & Commission
                </span>
                <p className="text-2xl font-bold text-[#0A1F5C] font-mono-num mt-2">
                  {formatINR(totalGrossPaise)}
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-[#5B6B8C]">
                    <span>Admin Commission (10%):</span>
                    <span className="font-bold text-rose-600 font-mono-num">-{formatINR(totalCommissionPaise)}</span>
                  </div>
                  <div className="flex justify-between text-[#0A1F5C] font-bold pt-1 border-t border-slate-100">
                    <span>Net Credited to Wallet:</span>
                    <span className="text-emerald-600 font-mono-num">{formatINR(totalNetEarnedPaise)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Statement & Export */}
            <div className="bg-white p-6 rounded-3xl border border-[#DCE7F9] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#5B6B8C] uppercase tracking-wider">
                  Wallet Statements
                </span>
                <p className="text-sm font-bold text-[#0A1F5C] mt-2">
                  Download Official Tax & Payout Statement
                </p>
                <p className="text-xs text-[#5B6B8C] mt-1">
                  Includes complete itemized breakdown of bookings, platform commission, and bank transfers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadStatement}
                className="mt-4 w-full min-h-[42px] px-4 rounded-full bg-[#EBF2FE] hover:bg-[#DCE7F9] text-[#0B5FD9] font-bold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Statement (Receipt)</span>
              </button>
            </div>
          </div>

          {/* Withdrawal Form (PDF Rule: Min ₹500, Bank or UPI) */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF2FF] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A1F5C]">Request Withdrawal</h3>
                <p className="text-xs text-[#5B6B8C]">
                  Transfer earnings to your registered bank account or verified UPI address.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Rule: Min. ₹500
              </span>
            </div>

            {withdrawNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                {withdrawNotice}
              </div>
            )}
            {withdrawError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">
                    Amount to Withdraw (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#0A1F5C]">₹</span>
                    <input
                      type="number"
                      min={500}
                      step={100}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full min-h-[46px] pl-8 pr-4 rounded-xl border border-[#DCE7F9] font-mono-num text-sm font-bold text-[#0A1F5C] focus:border-[#0B5FD9] focus:outline-none"
                    />
                  </div>
                  {/* Quick Pills */}
                  <div className="flex items-center gap-2 mt-2">
                    {['500', '1000', '2500', '5000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt)}
                        className="px-2.5 py-1 rounded-lg bg-[#F1F6FF] hover:bg-[#E2EEFE] text-[11px] font-bold text-[#0B5FD9] cursor-pointer"
                      >
                        ₹{amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount((walletBalancePaise / 100).toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#EBF2FE] hover:bg-[#DCE7F9] text-[11px] font-bold text-[#0B5FD9] cursor-pointer"
                    >
                      All ({formatINR(walletBalancePaise)})
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">
                    Transfer Destination
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMode('BANK')}
                      className={`min-h-[46px] p-2 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                        withdrawMode === 'BANK'
                          ? 'border-[#0B5FD9] bg-blue-50/50 shadow-sm'
                          : 'border-[#DCE7F9] bg-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#0B5FD9]" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0A1F5C]">HDFC Bank</p>
                        <p className="text-[10px] text-[#5B6B8C] truncate">A/C: ****4821</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMode('UPI')}
                      className={`min-h-[46px] p-2 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                        withdrawMode === 'UPI'
                          ? 'border-[#0B5FD9] bg-blue-50/50 shadow-sm'
                          : 'border-[#DCE7F9] bg-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#0B5FD9]" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0A1F5C]">Verified UPI</p>
                        <p className="text-[10px] text-[#5B6B8C] truncate">ramesh@okhdfc</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full sm:w-auto min-h-[44px] px-8 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>{isWithdrawing ? 'Processing Transfer...' : 'Confirm & Request Payout →'}</span>
              </button>
            </form>
          </div>

          {/* Full Transaction History Table */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0A1F5C]">Transaction & Payout History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAF2FF] text-[#5B6B8C]">
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold text-right">Gross</th>
                    <th className="pb-3 font-semibold text-right">Commission (10%)</th>
                    <th className="pb-3 font-semibold text-right">Net Amount</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-[#F8FAFD]">
                      <td className="py-3 text-[#5B6B8C] whitespace-nowrap">{txn.date}</td>
                      <td className="py-3 text-[#0A1F5C] max-w-xs">{txn.description}</td>
                      <td className="py-3 font-mono-num text-[#5B6B8C]">{txn.referenceId}</td>
                      <td className="py-3 text-right font-mono-num text-[#5B6B8C]">
                        {txn.grossPaise ? formatINR(txn.grossPaise) : '—'}
                      </td>
                      <td className="py-3 text-right font-mono-num text-amber-700">
                        {txn.commissionPaise ? `-${formatINR(txn.commissionPaise)}` : '—'}
                      </td>
                      <td className={`py-3 text-right font-bold font-mono-num ${txn.type === 'WITHDRAWAL' ? 'text-blue-700' : 'text-emerald-600'}`}>
                        {txn.type === 'WITHDRAWAL' ? `-${formatINR(txn.netPaise)}` : `+${formatINR(txn.netPaise)}`}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
       *  TAB 4: KYC & PROFILE DOCUMENTS (PDF Section 2 & 3)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0A1F5C]">Partner KYC & Document Verification</h2>
              <p className="text-xs text-[#5B6B8C]">
                Official credentials, GST/PAN documentation, and withdrawal account settings.
              </p>
            </div>

            {/* Verification Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">KYC Status: Fully Verified</h4>
                  <p className="text-xs text-emerald-800">
                    Your profile and bank credentials were approved by Admin on 12 Oct 2026.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                Active & Approved
              </span>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Details */}
              <div className="p-4.5 rounded-2xl bg-[#F8FAFD] border border-[#E2EEFE] space-y-3">
                <h3 className="text-sm font-bold text-[#0A1F5C] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Personal & Contact Credentials</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">Registered Full Name:</span>
                    <span className="font-bold text-[#0A1F5C]">Ramesh Kumar</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">Mobile (OTP Verified):</span>
                    <span className="font-bold text-[#0A1F5C]">+91 98765 00001 ✓</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">Registered Email:</span>
                    <span className="font-bold text-[#0A1F5C]">ramesh.partner@serva.demo</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5B6B8C]">Operational Service Area:</span>
                    <span className="font-bold text-[#0A1F5C]">Hyderabad (15 km radius)</span>
                  </div>
                </div>
              </div>

              {/* Tax & Business Identification */}
              <div className="p-4.5 rounded-2xl bg-[#F8FAFD] border border-[#E2EEFE] space-y-3">
                <h3 className="text-sm font-bold text-[#0A1F5C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Government Identification & Tax</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">Partner Type:</span>
                    <span className="font-bold text-[#0A1F5C]">Individual Professional</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">PAN Card Number:</span>
                    <span className="font-mono-num font-bold text-[#0A1F5C]">ABCDE1234F</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#5B6B8C]">PAN Document Image:</span>
                    <span className="text-emerald-700 font-bold">Uploaded & Verified ✓</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5B6B8C]">Trade License / GSTIN:</span>
                    <span className="text-[#5B6B8C] italic">Not Required (Individual)</span>
                  </div>
                </div>
              </div>

              {/* Payout Bank Account */}
              <div className="p-4.5 rounded-2xl bg-[#F8FAFD] border border-[#E2EEFE] space-y-3 md:col-span-2">
                <h3 className="text-sm font-bold text-[#0A1F5C] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Withdrawal Bank Account & UPI Setup</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[#5B6B8C] block">Bank Name</span>
                    <span className="font-bold text-[#0A1F5C] text-sm mt-0.5 block">HDFC Bank</span>
                    <span className="text-[11px] text-[#5B6B8C]">Jubilee Hills Branch</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[#5B6B8C] block">Account Number & IFSC</span>
                    <span className="font-bold text-[#0A1F5C] text-sm font-mono-num mt-0.5 block">
                      50100482914821
                    </span>
                    <span className="text-[11px] text-[#5B6B8C] font-mono-num">IFSC: HDFC0001234</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[#5B6B8C] block">Primary UPI Address</span>
                    <span className="font-bold text-[#0A1F5C] text-sm mt-0.5 block truncate">
                      ramesh.partner@okhdfcbank
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">Direct Payout Enabled ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
       *  TAB 5: RATINGS & REVIEWS (PDF Section 4)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAF2FF] pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Customer Ratings & Reviews</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Real feedback from customers who booked your services.
                </p>
              </div>

              {/* Summary Score */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-2xl font-extrabold text-[#0A1F5C]">4.9</span>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-[#5B6B8C]">142 Verified Ratings</span>
                </div>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4.5 rounded-2xl border border-[#E4EEFC] bg-[#FAFCFF] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#0A1F5C]">{rev.customerName}</h4>
                      <p className="text-xs text-[#5B6B8C]">{rev.serviceTitle} · {rev.date}</p>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#334155] leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {/* Partner Reply */}
                  {rev.partnerReply ? (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-[#0A1F5C] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#0B5FD9] uppercase tracking-wider block">
                        Your Response:
                      </span>
                      <p className="italic">{rev.partnerReply}</p>
                    </div>
                  ) : (
                    <div>
                      {replyOpen[rev.id] ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            rows={2}
                            value={replyText[rev.id] || ''}
                            onChange={(e) =>
                              setReplyText((prev) => ({ ...prev, [rev.id]: e.target.value }))
                            }
                            placeholder="Write a polite response to this customer..."
                            className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyOpen((prev) => ({ ...prev, [rev.id]: false }))}
                              className="px-3 py-1 rounded-full text-xs text-[#5B6B8C] hover:bg-slate-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddReviewReply(rev.id)}
                              className="px-4 py-1 rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Post Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReplyOpen((prev) => ({ ...prev, [rev.id]: true }))}
                          className="text-xs font-bold text-[#0B5FD9] hover:underline cursor-pointer"
                        >
                          + Reply to customer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
       *  TAB 6: HELP & SUPPORT TICKETS (PDF Section 4 & 6)
       * ═══════════════════════════════════════════════ */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Raise a Ticket */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-[#DCE7F9] p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0A1F5C]">Raise a Partner Support Ticket</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Direct line to SERVA Partner Operations for payouts, booking issues, or re-verification.
                </p>
              </div>

              {ticketNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                  {ticketNotice}
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Issue Category</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as SupportTicket['category'])}
                    className="w-full min-h-[42px] px-3.5 rounded-xl border border-[#DCE7F9] text-xs font-medium text-[#0A1F5C] bg-white focus:outline-none focus:border-[#0B5FD9]"
                  >
                    <option value="PAYOUT">Payout / Wallet Withdrawal Issue</option>
                    <option value="BOOKING_ISSUE">Customer Booking Dispute or Scope Change</option>
                    <option value="KYC_DOCUMENTS">KYC Document Re-submission</option>
                    <option value="CUSTOMER_DISPUTE">Emergency Job Cancellation</option>
                    <option value="OTHER">Other Partner Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Subject</label>
                  <input
                    type="text"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full min-h-[42px] px-3.5 rounded-xl border border-[#DCE7F9] text-xs font-medium text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    placeholder="Provide details such as Booking ID, date, or specific request..."
                    className="w-full p-3 rounded-xl border border-[#DCE7F9] text-xs font-medium text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-full bg-[#0B5FD9] hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Support Ticket</span>
                </button>
              </form>
            </div>

            {/* Right: Partner Helpline & Ticket History */}
            <div className="lg:col-span-6 space-y-4">
              {/* Emergency Hotline Card */}
              <div className="bg-gradient-to-br from-[#EBF3FE] to-[#F8FAFD] border border-[#CDE0FC] p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B5FD9] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1F5C]">SERVA Partner Emergency Helpline</h3>
                    <p className="text-xs text-[#5B6B8C]">24/7 dedicated assistance for active on-site jobs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="tel:18001234567"
                    className="px-4 py-2 rounded-full bg-[#0B5FD9] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-blue-700"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call 1800-123-4567
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-emerald-700"
                  >
                    WhatsApp Support
                  </a>
                </div>
              </div>

              {/* My Active Tickets */}
              <div className="bg-white rounded-3xl border border-[#DCE7F9] p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[#0A1F5C]">My Recent Tickets</h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-[#5B6B8C]">No open tickets. Everything is running smoothly!</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-xl border border-slate-100 bg-[#FAFCFF] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono-num font-bold text-[#0B5FD9]">#{t.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0A1F5C]">{t.subject}</h4>
                        <p className="text-xs text-[#5B6B8C]">{t.message}</p>
                        {t.adminReply && (
                          <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-[#0A1F5C]">
                            <span className="font-bold text-[#0B5FD9] block">SERVA Operations Reply:</span>
                            <p>{t.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
