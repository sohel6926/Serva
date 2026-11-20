import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Percent,
  Phone,
  Power,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Unlock,
  User,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';
import { BrandLogo } from '../components/common/BrandLogo.tsx';

/* Types for Admin Panel */
type AdminTab =
  | 'dashboard'
  | 'kyc'
  | 'commission'
  | 'coupons'
  | 'users'
  | 'partners'
  | 'withdrawals'
  | 'support'
  | 'announcements'
  | 'reports'
  | 'roles';

interface PartnerKYCRequest {
  id: string;
  partnerType: 'SHOP_BUSINESS' | 'INDIVIDUAL';
  businessName: string;
  ownerName: string;
  email: string;
  mobile: string;
  categories: string[];
  services: string[];
  serviceArea: string;
  experienceYears: number;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';
  rejectionReason?: string;
  // Documents
  panNumber?: string;
  panImageUrl?: string;
  gstNumber?: string;
  tradeLicenseUrl?: string;
  shopPhotoUrl?: string;
  // Payout Details
  payoutMode: 'BANK' | 'UPI';
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    holderName: string;
  };
  upiId?: string;
}

interface AdminCoupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageCount: number;
  usageLimit: number;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
  category?: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  totalBookings: number;
  totalSpendPaise: number;
  joinedDate: string;
  status: 'ACTIVE' | 'BLOCKED';
}

interface PlatformPartner {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  category: string;
  serviceArea: string;
  completedJobs: number;
  totalSalesPaise: number;
  commissionPaidPaise: number;
  rating: number;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

interface WithdrawalRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerMobile: string;
  amountPaise: number;
  payoutMode: 'BANK' | 'UPI';
  destination: string;
  requestedAt: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  transactionRef?: string;
  notes?: string;
}

interface AdminSupportTicket {
  id: string;
  reporterType: 'PARTNER' | 'CUSTOMER';
  reporterName: string;
  reporterMobile: string;
  category: 'PAYOUT' | 'KYC' | 'BOOKING_ISSUE' | 'COMMISSION' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  adminReply?: string;
}

/* Sample Initial Data for Admin Panel */
const INITIAL_KYC_REQUESTS: PartnerKYCRequest[] = [
  {
    id: 'KYC-881',
    partnerType: 'SHOP_BUSINESS',
    businessName: 'Telangana Electricals & Home Appliance Care',
    ownerName: 'Kishore Kumar',
    email: 'kishore.appliances@gmail.com',
    mobile: '9849012345',
    categories: ['Home Services'],
    services: ['Electrician & Wiring', 'AC Repair & Servicing', 'Geyser Installation'],
    serviceArea: 'Jubilee Hills, Banjara Hills, Madhapur, Hyderabad',
    experienceYears: 7,
    submittedAt: 'Today, 09:40 AM',
    status: 'PENDING',
    gstNumber: '36AAAAA0000A1Z5',
    tradeLicenseUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    shopPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    payoutMode: 'BANK',
    bankAccount: {
      accountNumber: '•••• •••• 4892',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank, Banjara Hills',
      holderName: 'Telangana Electricals',
    },
  },
  {
    id: 'KYC-882',
    partnerType: 'INDIVIDUAL',
    businessName: 'Venkat Tractor Rentals & Harvester Fleet',
    ownerName: 'Venkataiah G.',
    email: 'venkat.agri77@gmail.com',
    mobile: '9701234567',
    categories: ['Agriculture Services'],
    services: ['Tractor Rental with Operator', 'Harvester Machine', 'Farm Labor Team'],
    serviceArea: 'Warangal Rural, Nalgonda, Suryapet',
    experienceYears: 12,
    submittedAt: 'Today, 11:15 AM',
    status: 'PENDING',
    panNumber: 'ABCDE1234F',
    panImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    payoutMode: 'UPI',
    upiId: 'venkat.agri@okaxis',
  },
  {
    id: 'KYC-883',
    partnerType: 'SHOP_BUSINESS',
    businessName: 'Royal Grand Event Decorators & Sound',
    ownerName: 'Syed Mansoor',
    email: 'royalgrand.events@gmail.com',
    mobile: '9988776655',
    categories: ['Event Services'],
    services: ['Wedding Stage Decoration', 'Live DJ Sound Setup', 'Event Catering Support'],
    serviceArea: 'Hyderabad, Secunderabad, Cyberabad',
    experienceYears: 9,
    submittedAt: 'Yesterday, 04:30 PM',
    status: 'PENDING',
    gstNumber: '36ABCDE5678F1Z2',
    tradeLicenseUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    payoutMode: 'BANK',
    bankAccount: {
      accountNumber: '•••• •••• 9921',
      ifsc: 'SBIN0005678',
      bankName: 'State Bank of India',
      holderName: 'Royal Grand Events',
    },
  },
  {
    id: 'KYC-879',
    partnerType: 'INDIVIDUAL',
    businessName: 'Sri Balaji Deep Cleaning & Painting Experts',
    ownerName: 'Ramesh Reddy',
    email: 'ramesh.clean@gmail.com',
    mobile: '9876543210',
    categories: ['Home Services'],
    services: ['Full House Deep Cleaning', 'Bathroom Deep Cleaning', 'Interior Wall Painting'],
    serviceArea: 'Hyderabad (All Zones)',
    experienceYears: 6,
    submittedAt: '12 Nov 2026',
    status: 'APPROVED',
    panNumber: 'BPZPR4521K',
    panImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    payoutMode: 'BANK',
    bankAccount: {
      accountNumber: '•••• •••• 3412',
      ifsc: 'ICIC0000123',
      bankName: 'ICICI Bank, Hyderabad',
      holderName: 'Ramesh Reddy',
    },
  },
  {
    id: 'KYC-875',
    partnerType: 'INDIVIDUAL',
    businessName: 'FastMove Packers & Movers',
    ownerName: 'G. Naresh',
    email: 'fastmove.hyd@gmail.com',
    mobile: '9652011223',
    categories: ['Moving & Shifting'],
    services: ['1 BHK / 2 BHK Home Relocation', 'Mini Truck Rental', 'Packing & Loading Crew'],
    serviceArea: 'Hyderabad to Vijayawada, Warangal',
    experienceYears: 4,
    submittedAt: '10 Nov 2026',
    status: 'RESUBMIT',
    rejectionReason: 'The uploaded PAN image was blurred and unreadable. Please upload a clear photo or PDF scan.',
    panNumber: 'XYZPR9988M',
    panImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    payoutMode: 'UPI',
    upiId: 'fastmove@ybl',
  },
];

const INITIAL_COUPONS: AdminCoupon[] = [
  {
    id: 'CPN-1',
    code: 'SERVA200',
    discountType: 'FLAT',
    discountValue: 200,
    minOrderValue: 999,
    usageCount: 428,
    usageLimit: 1000,
    validUntil: '31 Dec 2026',
    status: 'ACTIVE',
  },
  {
    id: 'CPN-2',
    code: 'FESTIVE15',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderValue: 1499,
    maxDiscount: 400,
    usageCount: 782,
    usageLimit: 2000,
    validUntil: '30 Nov 2026',
    status: 'ACTIVE',
  },
  {
    id: 'CPN-3',
    code: 'AGRIBOOST',
    discountType: 'FLAT',
    discountValue: 500,
    minOrderValue: 2999,
    usageCount: 154,
    usageLimit: 500,
    validUntil: '15 Jan 2027',
    status: 'ACTIVE',
    category: 'Agriculture Services',
  },
  {
    id: 'CPN-4',
    code: 'WELCOME50',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderValue: 499,
    maxDiscount: 150,
    usageCount: 1200,
    usageLimit: 1200,
    validUntil: '01 Nov 2026',
    status: 'EXPIRED',
  },
];

const INITIAL_USERS: PlatformUser[] = [
  {
    id: 'USR-101',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@gmail.com',
    mobile: '9876543210',
    city: 'Hyderabad, TG',
    totalBookings: 8,
    totalSpendPaise: 1845000, // ₹18,450
    joinedDate: '15 Aug 2026',
    status: 'ACTIVE',
  },
  {
    id: 'USR-102',
    name: 'Rajesh Goud',
    email: 'rajesh.goud@yahoo.com',
    mobile: '9848011223',
    city: 'Warangal, TG',
    totalBookings: 3,
    totalSpendPaise: 620000, // ₹6,200
    joinedDate: '02 Sep 2026',
    status: 'ACTIVE',
  },
  {
    id: 'USR-103',
    name: 'Pooja Varma',
    email: 'pooja.varma@outlook.com',
    mobile: '9966332211',
    city: 'Hyderabad, TG',
    totalBookings: 12,
    totalSpendPaise: 3450000, // ₹34,500
    joinedDate: '10 Jun 2026',
    status: 'ACTIVE',
  },
  {
    id: 'USR-104',
    name: 'Chandra Shekar Rao',
    email: 'csrao.agri@gmail.com',
    mobile: '9700112233',
    city: 'Nalgonda, TG',
    totalBookings: 5,
    totalSpendPaise: 2450000, // ₹24,500
    joinedDate: '20 Jul 2026',
    status: 'ACTIVE',
  },
  {
    id: 'USR-105',
    name: 'Fake Account Test',
    email: 'spammer99@test.com',
    mobile: '9123456780',
    city: 'Hyderabad, TG',
    totalBookings: 0,
    totalSpendPaise: 0,
    joinedDate: '14 Nov 2026',
    status: 'BLOCKED',
  },
];

const INITIAL_PARTNERS: PlatformPartner[] = [
  {
    id: 'PTR-501',
    businessName: 'Sri Balaji Deep Cleaning & Painting',
    ownerName: 'Ramesh Reddy',
    mobile: '9876543210',
    category: 'Home Services',
    serviceArea: 'Hyderabad (All Zones)',
    completedJobs: 94,
    totalSalesPaise: 28400000, // ₹2,84,000
    commissionPaidPaise: 2840000, // ₹28,400
    rating: 4.9,
    status: 'ACTIVE',
    joinedDate: '12 Nov 2026',
  },
  {
    id: 'PTR-502',
    businessName: 'Deccan Heavy Machinery & Tractor Hire',
    ownerName: 'Venkatesh Rao',
    mobile: '9849112233',
    category: 'Agriculture & Construction',
    serviceArea: 'Warangal, Nalgonda, Hyderabad',
    completedJobs: 62,
    totalSalesPaise: 38900000, // ₹3,89,000
    commissionPaidPaise: 2334000, // ₹23,340
    rating: 4.8,
    status: 'ACTIVE',
    joinedDate: '28 Aug 2026',
  },
  {
    id: 'PTR-503',
    businessName: 'Classic Event Sound & DJ Works',
    ownerName: 'Mirza Baig',
    mobile: '9900112244',
    category: 'Event Services',
    serviceArea: 'Hyderabad & Secunderabad',
    completedJobs: 45,
    totalSalesPaise: 22500000, // ₹2,25,000
    commissionPaidPaise: 2700000, // ₹27,000
    rating: 4.7,
    status: 'ACTIVE',
    joinedDate: '15 Sep 2026',
  },
  {
    id: 'PTR-504',
    businessName: 'QuickRelocate Movers',
    ownerName: 'Sunil Kumar',
    mobile: '9888771122',
    category: 'Moving & Shifting',
    serviceArea: 'Telangana & Andhra Pradesh',
    completedJobs: 38,
    totalSalesPaise: 19400000, // ₹1,94,000
    commissionPaidPaise: 1746000, // ₹17,460
    rating: 4.6,
    status: 'ACTIVE',
    joinedDate: '01 Oct 2026',
  },
];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'WTH-901',
    partnerId: 'PTR-501',
    partnerName: 'Sri Balaji Deep Cleaning (Ramesh Reddy)',
    partnerMobile: '9876543210',
    amountPaise: 650000, // ₹6,500
    payoutMode: 'BANK',
    destination: 'HDFC Bank A/C •••• 3412',
    requestedAt: 'Today, 10:15 AM',
    status: 'PENDING',
  },
  {
    id: 'WTH-902',
    partnerId: 'PTR-502',
    partnerName: 'Deccan Heavy Machinery (Venkatesh Rao)',
    partnerMobile: '9849112233',
    amountPaise: 1200000, // ₹12,000
    payoutMode: 'UPI',
    destination: 'deccan.fleet@okaxis',
    requestedAt: 'Today, 08:30 AM',
    status: 'PENDING',
  },
  {
    id: 'WTH-898',
    partnerId: 'PTR-503',
    partnerName: 'Classic Event Sound (Mirza Baig)',
    partnerMobile: '9900112244',
    amountPaise: 840000, // ₹8,400
    payoutMode: 'BANK',
    destination: 'ICICI Bank A/C •••• 9921',
    requestedAt: '15 Nov 2026',
    status: 'PAID',
    transactionRef: 'UPI/2611158912384',
  },
];

const INITIAL_TICKETS: AdminSupportTicket[] = [
  {
    id: 'TKT-701',
    reporterType: 'PARTNER',
    reporterName: 'Ramesh Reddy (Sri Balaji Cleaning)',
    reporterMobile: '9876543210',
    category: 'PAYOUT',
    subject: 'Request for instant withdrawal verification',
    message: 'Hello Admin team, I initiated a withdrawal for ₹6,500 this morning. Could you please approve it before banking cut-off?',
    status: 'OPEN',
    createdAt: 'Today, 10:20 AM',
  },
  {
    id: 'TKT-702',
    reporterType: 'CUSTOMER',
    reporterName: 'Ananya Reddy',
    reporterMobile: '9876543210',
    category: 'BOOKING_ISSUE',
    subject: 'Rescheduling requested for AC servicing',
    message: 'Can I shift my booking from Saturday to Sunday 11 AM due to sudden travel?',
    status: 'IN_PROGRESS',
    createdAt: 'Today, 09:10 AM',
    adminReply: 'Hi Ananya, our support team has updated the partner. They will confirm the Sunday 11 AM slot shortly.',
  },
  {
    id: 'TKT-699',
    reporterType: 'PARTNER',
    reporterName: 'G. Naresh (FastMove Movers)',
    reporterMobile: '9652011223',
    category: 'KYC',
    subject: 'Re-uploaded PAN card image for verification',
    message: 'I have uploaded the scan of my original PAN card as requested. Please check and approve my profile.',
    status: 'RESOLVED',
    createdAt: '13 Nov 2026',
    adminReply: 'Checked and verified. Your profile is now approved.',
  },
];

/* ────────────────────────────────────────────────────────────
   ADMIN AUTHENTICATION GATE
   Displayed when visiting /admin before authenticating as Admin
   ──────────────────────────────────────────────────────────── */
function AdminAuthGate() {
  const { loginAsDemo } = useAuth();
  const [email, setEmail] = useState('admin@serva.demo');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo('admin');
    } catch {
      setError('Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071330] text-white flex flex-col admin-portal">
      {/* Standalone Admin Header */}
      <header className="sticky top-0 z-40 bg-[#0A1F5C]/90 backdrop-blur-md border-b border-blue-900/80 px-4 sm:px-6 h-16 shadow-md">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="SERVA Home">
              <BrandLogo variant="horizontal" />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              ADMIN PORTAL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/partner/panel"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Partner Panel</span>
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-blue-200 hover:text-white transition-all"
            >
              Customer Site &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B5FD9] to-[#0A1F5C] text-white flex items-center justify-center mx-auto mb-4 shadow-xl border border-blue-400/30">
              <Shield className="w-8 h-8 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SERVA Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/70 mt-1.5">
              Restricted management console for KYC approvals, commission configuration, user directories, and financial payouts.
            </p>
          </div>

          <div className="bg-[#0D2253] rounded-3xl border border-blue-800/60 p-6 sm:p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-blue-200 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-blue-300/60 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09183C] border border-blue-700/60 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-200 mb-1.5">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-300/60 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09183C] border border-blue-700/60 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In as Super Admin'}</span>
              </button>

              <div className="pt-4 border-t border-blue-900/60 text-center">
                <p className="text-[11px] text-blue-300/70 mb-2">Evaluator / Demo Access:</p>
                <button
                  type="button"
                  onClick={async () => {
                    await loginAsDemo('admin');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ 1-Click Sign In as Operations Super Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AdminDashboardPage() {
  const { user, loginAsDemo, logout } = useAuth();
  const { navigate } = useRouter();

  if (user?.role !== 'ADMIN') {
    return <AdminAuthGate />;
  }

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Role toggle: Super Admin vs Sub-Admin
  const [adminRole, setAdminRole] = useState<'SUPER_ADMIN' | 'SUB_ADMIN'>('SUPER_ADMIN');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted state
  const [kycRequests, setKycRequests] = useState<PartnerKYCRequest[]>(() => {
    const saved = localStorage.getItem('serva_admin_kyc');
    return saved ? JSON.parse(saved) : INITIAL_KYC_REQUESTS;
  });

  const [coupons, setCoupons] = useState<AdminCoupon[]>(() => {
    const saved = localStorage.getItem('serva_admin_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [usersList, setUsersList] = useState<PlatformUser[]>(() => {
    const saved = localStorage.getItem('serva_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [partnersList, setPartnersList] = useState<PlatformPartner[]>(() => {
    const saved = localStorage.getItem('serva_admin_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('serva_admin_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  const [tickets, setTickets] = useState<AdminSupportTicket[]>(() => {
    const saved = localStorage.getItem('serva_admin_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  // Commission Setup State
  const [globalCommissionPercent, setGlobalCommissionPercent] = useState<number>(10);
  const [categoryCommissions, setCategoryCommissions] = useState<Record<string, number>>({
    'Home Services': 10,
    'Contractors & Construction': 8,
    'Agriculture Services': 6,
    'Event Services': 12,
    'Moving & Shifting': 9,
  });
  const [commissionSavedNotice, setCommissionSavedNotice] = useState(false);

  // Modals & Inspection
  const [selectedKyc, setSelectedKyc] = useState<PartnerKYCRequest | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionActionType, setRejectionActionType] = useState<'REJECT' | 'RESUBMIT'>('RESUBMIT');
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Create Coupon Modal
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'PERCENT' | 'FLAT'>('FLAT');
  const [newCouponValue, setNewCouponValue] = useState('250');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('999');
  const [newCouponLimit, setNewCouponLimit] = useState('500');
  const [newCouponDate, setNewCouponDate] = useState('31 Dec 2026');

  // Payout Approval Modal
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [payoutTxnRef, setPayoutTxnRef] = useState('UPI/' + Date.now().toString().slice(-9));

  // Broadcast Announcement State
  const [announcementAudience, setAnnouncementAudience] = useState<'ALL' | 'USERS' | 'PARTNERS'>('ALL');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementSentNotice, setAnnouncementSentNotice] = useState(false);

  // Ticket Reply State
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyTicketText, setReplyTicketText] = useState('');

  // Sync to localStorage
  const saveKyc = (updated: PartnerKYCRequest[]) => {
    setKycRequests(updated);
    localStorage.setItem('serva_admin_kyc', JSON.stringify(updated));
  };
  const saveWithdrawals = (updated: WithdrawalRequest[]) => {
    setWithdrawals(updated);
    localStorage.setItem('serva_admin_withdrawals', JSON.stringify(updated));
  };
  const saveCoupons = (updated: AdminCoupon[]) => {
    setCoupons(updated);
    localStorage.setItem('serva_admin_coupons', JSON.stringify(updated));
  };
  const saveUsers = (updated: PlatformUser[]) => {
    setUsersList(updated);
    localStorage.setItem('serva_admin_users', JSON.stringify(updated));
  };
  const savePartners = (updated: PlatformPartner[]) => {
    setPartnersList(updated);
    localStorage.setItem('serva_admin_partners', JSON.stringify(updated));
  };
  const saveTickets = (updated: AdminSupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('serva_admin_tickets', JSON.stringify(updated));
  };

  /* Helper Functions */
  const formatInr = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const handleApproveKyc = (id: string) => {
    const updated = kycRequests.map((k) => (k.id === id ? { ...k, status: 'APPROVED' as const } : k));
    saveKyc(updated);
    if (selectedKyc?.id === id) setSelectedKyc(null);
  };

  const handleConfirmRejectionOrResubmit = () => {
    if (!selectedKyc) return;
    const updated = kycRequests.map((k) =>
      k.id === selectedKyc.id
        ? {
            ...k,
            status: rejectionActionType === 'RESUBMIT' ? ('RESUBMIT' as const) : ('REJECTED' as const),
            rejectionReason: rejectionReasonText.trim() || 'Please verify and re-upload the requested documentation.',
          }
        : k
    );
    saveKyc(updated);
    setRejectionModalOpen(false);
    setSelectedKyc(null);
    setRejectionReasonText('');
  };

  const handleApprovePayout = (wthId: string) => {
    const updated = withdrawals.map((w) =>
      w.id === wthId
        ? {
            ...w,
            status: 'PAID' as const,
            transactionRef: payoutTxnRef.trim() || `BANK/REF/${Date.now().toString().slice(-8)}`,
          }
        : w
    );
    saveWithdrawals(updated);
    setSelectedWithdrawal(null);
  };

  const handleRejectPayout = (wthId: string, reason: string) => {
    const updated = withdrawals.map((w) =>
      w.id === wthId
        ? {
            ...w,
            status: 'REJECTED' as const,
            notes: reason,
          }
        : w
    );
    saveWithdrawals(updated);
    setSelectedWithdrawal(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const item: AdminCoupon = {
      id: `CPN-${Date.now().toString().slice(-4)}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: parseFloat(newCouponValue) || 100,
      minOrderValue: parseFloat(newCouponMinOrder) || 499,
      usageCount: 0,
      usageLimit: parseInt(newCouponLimit, 10) || 500,
      validUntil: newCouponDate || '31 Dec 2026',
      status: 'ACTIVE',
    };
    saveCoupons([item, ...coupons]);
    setShowCreateCoupon(false);
    setNewCouponCode('');
  };

  const handleToggleCoupon = (id: string) => {
    const updated = coupons.map((c) =>
      c.id === id ? { ...c, status: c.status === 'ACTIVE' ? ('EXPIRED' as const) : ('ACTIVE' as const) } : c
    );
    saveCoupons(updated);
  };

  const handleToggleUserBlock = (id: string) => {
    const updated = usersList.map((u) =>
      u.id === id ? { ...u, status: u.status === 'ACTIVE' ? ('BLOCKED' as const) : ('ACTIVE' as const) } : u
    );
    saveUsers(updated);
  };

  const handleTogglePartnerBlock = (id: string) => {
    const updated = partnersList.map((p) =>
      p.id === id ? { ...p, status: p.status === 'ACTIVE' ? ('SUSPENDED' as const) : ('ACTIVE' as const) } : p
    );
    savePartners(updated);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) return;
    setAnnouncementSentNotice(true);
    setTimeout(() => {
      setAnnouncementSentNotice(false);
      setAnnouncementTitle('');
      setAnnouncementBody('');
    }, 3000);
  };

  const handleReplyTicket = (ticketId: string) => {
    if (!replyTicketText.trim()) return;
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: 'RESOLVED' as const,
            adminReply: replyTicketText.trim(),
          }
        : t
    );
    saveTickets(updated);
    setReplyTicketId(null);
    setReplyTicketText('');
  };

  const exportCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingKycCount = kycRequests.filter((k) => k.status === 'PENDING').length;
  const pendingPayoutCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const openTicketCount = tickets.filter((t) => t.status === 'OPEN').length;

  const adminNavTabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kyc' as const, label: 'Partner KYC', icon: FileCheck, count: pendingKycCount },
    { id: 'commission' as const, label: 'Commission Setup', icon: Percent },
    { id: 'coupons' as const, label: 'Coupons & Deals', icon: Tag },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'partners' as const, label: 'Partners', icon: Building2 },
    { id: 'withdrawals' as const, label: 'Withdrawals', icon: Wallet, count: pendingPayoutCount },
    { id: 'support' as const, label: 'Support Tickets', icon: HelpCircle, count: openTicketCount },
    { id: 'announcements' as const, label: 'Broadcast', icon: Bell },
    { id: 'reports' as const, label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FD] text-[#0A1F5C] admin-portal pb-16">
      {/* Top Admin Bar & Role Switcher */}
      <div className="bg-[#0A1F5C] text-white border-b border-[#1E3A8A] px-4 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B5FD9] flex items-center justify-center font-bold text-white shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">SERVA ADMIN CONSOLE</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Centralized Control: Users, Partners, KYC, Commission, Coupons & Payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Super Admin vs Sub-Admin Switcher */}
            <div className="flex items-center bg-[#152B6B] rounded-lg p-0.5 border border-[#23429B] text-xs">
              <button
                type="button"
                onClick={() => setAdminRole('SUPER_ADMIN')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  adminRole === 'SUPER_ADMIN' ? 'bg-[#0B5FD9] text-white shadow-sm' : 'text-blue-200 hover:text-white'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setAdminRole('SUB_ADMIN')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  adminRole === 'SUB_ADMIN' ? 'bg-[#0B5FD9] text-white shadow-sm' : 'text-blue-200 hover:text-white'
                }`}
              >
                Sub-Admin
              </button>
            </div>

            {/* Quick Link to Partner Panel */}
            <Link
              to="/partner/panel"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 border border-white/15 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Partner Panel &rarr;</span>
            </Link>

            {/* Link to Customer Site */}
            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-blue-200 hover:text-white transition-all"
            >
              Customer Site &rarr;
            </Link>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/20 flex items-center gap-1 border border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileNavOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* ── Left Sidebar Navigation (Desktop) ── */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-4 z-20">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#DCE7F9] space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#5B6B8C] border-b border-[#EAF2FF] mb-1 flex items-center justify-between">
                <span>Admin Navigation</span>
                <span className="text-[10px] font-bold text-[#0B5FD9] bg-[#EBF2FE] px-2 py-0.5 rounded-full">
                  {adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub-Admin'}
                </span>
              </div>
              {adminNavTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0B5FD9] text-white shadow-sm font-bold'
                        : 'text-[#5B6B8C] hover:bg-[#F1F6FF] hover:text-[#0A1F5C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          active ? 'bg-white text-[#0B5FD9]' : 'bg-[#EF4444] text-white'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Mobile / Tablet Navigation via Hamburger Accordion (lg:hidden) ── */}
          <div className="lg:hidden w-full bg-white rounded-2xl p-3 shadow-sm border border-[#DCE7F9] mb-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer flex-1"
                aria-expanded={isMobileNavOpen}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B5FD9] flex items-center justify-center shrink-0">
                  {React.createElement(
                    adminNavTabs.find((t) => t.id === activeTab)?.icon || LayoutDashboard,
                    { className: 'w-4.5 h-4.5' }
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B8C]">
                      Admin Section
                    </span>
                    <span className="text-[10px] font-bold text-[#0B5FD9] bg-[#EBF2FE] px-1.5 py-0.2 rounded">
                      {adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub-Admin'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-[#0A1F5C] truncate">
                      {adminNavTabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
                    </span>
                    {(() => {
                      const currentTab = adminNavTabs.find((t) => t.id === activeTab);
                      return typeof currentTab?.count === 'number' && currentTab.count > 0 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EF4444] text-white">
                          {currentTab.count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F1F6FF] text-[#0B5FD9] hover:bg-[#E1EDFF] font-bold text-xs border border-[#DCE7F9] transition-all cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>{isMobileNavOpen ? 'Close' : 'Menu'}</span>
              </button>
            </div>

            {/* Collapsible Mobile Menu List */}
            {isMobileNavOpen && (
              <div className="mt-3 pt-3 border-t border-[#EAF2FF] space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B8C] px-2 pb-1">
                  Select Console Tab
                </p>
                {adminNavTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileNavOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0B5FD9] text-white shadow-sm font-bold'
                          : 'text-[#5B6B8C] hover:bg-[#F1F6FF] hover:text-[#0A1F5C]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {typeof tab.count === 'number' && tab.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            active ? 'bg-white text-[#0B5FD9]' : 'bg-[#EF4444] text-white'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Main Content Area (Right Column) ── */}
          <main className="flex-1 min-w-0 w-full space-y-6">

        {/* ===================== TAB 1: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F9] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5B6B8C] uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0A1F5C] mt-1">14,820</p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12.4% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5FD9] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F9] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5B6B8C] uppercase tracking-wider">Total Partners</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0A1F5C] mt-1">342</p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pendingKycCount} pending verification</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F9] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5B6B8C] uppercase tracking-wider">Total Platform GMV</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0A1F5C] mt-1">₹48,24,600</p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+18.9% QoQ</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F9] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#5B6B8C] uppercase tracking-wider">Admin Commission</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0B5FD9] mt-1">₹4,82,460</p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Avg 10.0% take rate</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0B5FD9] flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Graphs & Analytics Visualizers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earnings & Commission Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0A1F5C]">Platform Sales & Commission Trends</h3>
                    <p className="text-xs text-[#5B6B8C]">Weekly gross sales vs net admin commission retained</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF2FE] text-[#0B5FD9]">
                    Nov 2026
                  </span>
                </div>

                {/* SVG Mockup Chart */}
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Week 1', gmv: 980000, comm: 98000, pct: 60 },
                    { label: 'Week 2', gmv: 1240000, comm: 124000, pct: 78 },
                    { label: 'Week 3 (Diwali)', gmv: 1580000, comm: 158000, pct: 100 },
                    { label: 'Week 4 (Current)', gmv: 1024600, comm: 102460, pct: 65 },
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#0A1F5C]">
                        <span>{bar.label}</span>
                        <span>
                          GMV {formatInr(bar.gmv * 100)} &bull;{' '}
                          <strong className="text-[#0B5FD9]">Comm {formatInr(bar.comm * 100)}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-[#F1F6FF] rounded-full h-3 overflow-hidden flex">
                        <div
                          className="bg-[#0B5FD9] h-full rounded-full transition-all duration-500"
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
                <h3 className="text-base font-bold text-[#0A1F5C] mb-1">Category Share</h3>
                <p className="text-xs text-[#5B6B8C] mb-4">Gross booking volume by category</p>
                <div className="space-y-3">
                  {[
                    { name: 'Home Services', share: '38%', color: 'bg-blue-600' },
                    { name: 'Contractors & Machinery', share: '24%', color: 'bg-emerald-600' },
                    { name: 'Agriculture Services', share: '18%', color: 'bg-amber-500' },
                    { name: 'Event Services', share: '12%', color: 'bg-purple-600' },
                    { name: 'Moving & Shifting', share: '8%', color: 'bg-sky-500' },
                  ].map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span className="font-semibold text-[#0A1F5C]">{cat.name}</span>
                      </div>
                      <span className="font-bold text-[#5B6B8C]">{cat.share}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[#EAF2FF]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('commission')}
                    className="text-xs font-semibold text-[#0B5FD9] hover:underline flex items-center justify-between w-full"
                  >
                    <span>Configure Category Commissions</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Actionable Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Urgent Partner Verification Requests */}
              <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#0B5FD9]" />
                    <h3 className="text-sm font-bold text-[#0A1F5C]">Pending KYC Verifications</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('kyc')}
                    className="text-xs font-semibold text-[#0B5FD9] hover:underline"
                  >
                    View All ({kycRequests.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {kycRequests
                    .filter((k) => k.status === 'PENDING')
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-[#DCE7F9] bg-[#F9FBFF] flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0A1F5C]">{item.businessName}</p>
                          <p className="text-[11px] text-[#5B6B8C]">
                            {item.ownerName} &bull; {item.partnerType === 'SHOP_BUSINESS' ? 'Shop/Business' : 'Individual'}
                          </p>
                          <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                            {item.categories.join(', ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedKyc(item);
                            setActiveTab('kyc');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6] shrink-0"
                        >
                          Review KYC
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pending Withdrawals */}
              <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-[#0A1F5C]">Pending Partner Payout Requests</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('withdrawals')}
                    className="text-xs font-semibold text-[#0B5FD9] hover:underline"
                  >
                    View All ({withdrawals.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {withdrawals
                    .filter((w) => w.status === 'PENDING')
                    .map((wth) => (
                      <div
                        key={wth.id}
                        className="p-3.5 rounded-xl border border-[#DCE7F9] bg-[#F9FBFF] flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0A1F5C]">{wth.partnerName}</p>
                          <p className="text-[11px] text-[#5B6B8C]">
                            {wth.destination} &bull; {wth.requestedAt}
                          </p>
                          <p className="text-xs font-extrabold text-emerald-600 mt-0.5">
                            {formatInr(wth.amountPaise)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWithdrawal(wth);
                            setActiveTab('withdrawals');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shrink-0"
                        >
                          Process Payout
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: PARTNER KYC VERIFICATION ===================== */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Partner Registration & KYC Verification</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Verify individual PAN cards, business GST / trade licenses, and approve or request corrections.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#F1F6FF] p-1 rounded-xl text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-lg bg-[#0B5FD9] text-white">All ({kycRequests.length})</span>
                <span className="px-2.5 py-1 text-[#5B6B8C]">Pending ({pendingKycCount})</span>
                <span className="px-2.5 py-1 text-[#5B6B8C]">
                  Approved ({kycRequests.filter((k) => k.status === 'APPROVED').length})
                </span>
              </div>
            </div>

            {/* List of KYC Applications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kycRequests.map((partner) => (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                    partner.status === 'PENDING'
                      ? 'border-blue-200 ring-1 ring-blue-100'
                      : partner.status === 'APPROVED'
                      ? 'border-emerald-200'
                      : partner.status === 'RESUBMIT'
                      ? 'border-amber-200'
                      : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-[#0A1F5C]">{partner.businessName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            partner.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : partner.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : partner.status === 'RESUBMIT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {partner.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6B8C] mt-0.5">
                        Owner: <strong>{partner.ownerName}</strong> &bull;{' '}
                        {partner.partnerType === 'SHOP_BUSINESS' ? '🏪 Shop/Business' : '👤 Individual Partner'}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-[#5B6B8C] shrink-0">{partner.submittedAt}</span>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#5B6B8C] mb-4 bg-[#F8FAFD] p-3 rounded-xl border border-[#EAF2FF]">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Contact Info</span>
                      <span className="font-medium text-[#0A1F5C]">{partner.mobile}</span>
                      <span className="block truncate text-[11px]">{partner.email}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Service Area</span>
                      <span className="font-medium text-[#0A1F5C] truncate block">{partner.serviceArea}</span>
                      <span className="text-[11px]">{partner.experienceYears} yrs experience</span>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-[#EAF2FF]">
                      <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Services Offered</span>
                      <p className="text-xs font-semibold text-[#0B5FD9] mt-0.5">
                        {partner.categories.join(', ')} &mdash;{' '}
                        <span className="text-[#5B6B8C] font-normal">{partner.services.join(', ')}</span>
                      </p>
                    </div>

                    {/* Document details */}
                    <div className="col-span-2 pt-2 border-t border-[#EAF2FF] flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Verification Docs</span>
                        <p className="text-xs font-semibold text-[#0A1F5C]">
                          {partner.partnerType === 'SHOP_BUSINESS'
                            ? `GST / Trade Lic: ${partner.gstNumber || 'Uploaded Document'}`
                            : `PAN: ${partner.panNumber || 'Uploaded PAN Card'}`}
                        </p>
                      </div>

                      {/* Payout Details */}
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Registered Payout</span>
                        <p className="text-xs font-semibold text-[#0A1F5C]">
                          {partner.payoutMode === 'UPI' ? partner.upiId : partner.bankAccount?.accountNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {partner.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4">
                      <strong>Admin Correction Request:</strong> {partner.rejectionReason}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAF2FF]">
                    <button
                      type="button"
                      onClick={() => setSelectedKyc(partner)}
                      className="px-3 py-1.5 rounded-xl border border-[#DCE7F9] bg-white text-xs font-semibold text-[#0A1F5C] hover:bg-[#F1F6FF] flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0B5FD9]" />
                      <span>View Documents</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {partner.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApproveKyc(partner.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {partner.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKyc(partner);
                              setRejectionActionType('RESUBMIT');
                              setRejectionModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600"
                          >
                            Re-submit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKyc(partner);
                              setRejectionActionType('REJECT');
                              setRejectionModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: COMMISSION SETUP ===================== */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
              <h2 className="text-lg font-bold text-[#0A1F5C]">Commission Setup (Global & Category-wise)</h2>
              <p className="text-xs text-[#5B6B8C] mt-0.5">
                Define the percentage of gross booking value retained by SERVA. Partners receive earnings minus this commission.
              </p>

              {commissionSavedNotice && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Commission rules updated successfully and applied to all upcoming bookings!</span>
                </div>
              )}

              {/* Global Commission Setting */}
              <div className="mt-6 p-5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] max-w-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#0A1F5C]">Default Global Commission</label>
                  <span className="text-base font-extrabold text-[#0B5FD9]">{globalCommissionPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={globalCommissionPercent}
                  onChange={(e) => setGlobalCommissionPercent(parseFloat(e.target.value))}
                  className="w-full accent-[#0B5FD9] cursor-pointer"
                />
                <p className="text-[11px] text-[#5B6B8C] mt-2">
                  Applied as default to all service bookings unless overridden by category or partner specific agreements.
                </p>
              </div>

              {/* Category-Wise Overrides */}
              <div className="mt-8">
                <h3 className="text-sm font-bold text-[#0A1F5C] uppercase tracking-wider mb-4">
                  Category-Wise Commission Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryCommissions).map(([category, rate]) => (
                    <div key={category} className="p-4 rounded-xl border border-[#DCE7F9] bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0A1F5C]">{category}</span>
                        <span className="text-xs font-extrabold text-[#0B5FD9] bg-[#EBF2FE] px-2 py-0.5 rounded-full">
                          {rate}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        step="1"
                        value={rate}
                        onChange={(e) =>
                          setCategoryCommissions({ ...categoryCommissions, [category]: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-[#0B5FD9] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAF2FF] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCommissionSavedNotice(true);
                    setTimeout(() => setCommissionSavedNotice(false), 4000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B5FD9] text-white text-xs sm:text-sm font-semibold hover:bg-[#094FB6] shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Apply Commission Rules</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: COUPONS & PROMOTIONS ===================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Coupons & Promotional Deals</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Create, activate, expire and manage percentage or flat discount vouchers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateCoupon(true)}
                className="px-4 py-2 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6] flex items-center gap-2 shadow-sm"
              >
                <Tag className="w-4 h-4" />
                <span>+ Create New Coupon</span>
              </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-[#EAF2FF] text-[#5B6B8C] font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Coupon Code</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Min Order</th>
                      <th className="py-3 px-4">Redemptions / Limit</th>
                      <th className="py-3 px-4">Validity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF2FF]">
                    {coupons.map((cpn) => (
                      <tr key={cpn.id} className="hover:bg-[#F9FBFF]">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#0B5FD9] bg-[#EBF2FE] px-2.5 py-1 rounded-md border border-[#DCE7F9]">
                            {cpn.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0A1F5C]">
                          {cpn.discountType === 'FLAT' ? `₹${cpn.discountValue} Flat` : `${cpn.discountValue}% Off`}
                        </td>
                        <td className="py-3.5 px-4 text-[#5B6B8C]">₹{cpn.minOrderValue}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0A1F5C]">{cpn.usageCount}</span>
                          <span className="text-[#5B6B8C]"> / {cpn.usageLimit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#5B6B8C]">{cpn.validUntil}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              cpn.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cpn.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(cpn.id)}
                            className="px-2.5 py-1 rounded-lg border border-[#DCE7F9] text-xs font-semibold hover:bg-[#F1F6FF]"
                          >
                            {cpn.status === 'ACTIVE' ? 'Expire' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: USERS DIRECTORY ===================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">User Directory & Control</h2>
                <p className="text-xs text-[#5B6B8C]">
                  View all registered customer accounts, booking history, lifetime spend, and block/unblock.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#5B6B8C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DCE7F9] bg-[#F8FAFD] focus:outline-none focus:border-[#0B5FD9]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-[#EAF2FF] text-[#5B6B8C] font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Bookings</th>
                      <th className="py-3 px-4">Total Spend</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF2FF]">
                    {usersList
                      .filter(
                        (u) =>
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.mobile.includes(searchQuery)
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-[#F9FBFF]">
                          <td className="py-3.5 px-4 font-bold text-[#0A1F5C]">{u.name}</td>
                          <td className="py-3.5 px-4 text-[#5B6B8C]">
                            <div>{u.mobile}</div>
                            <div className="text-[11px] text-gray-500">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[#5B6B8C]">{u.city}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#0A1F5C]">{u.totalBookings}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">{formatInr(u.totalSpendPaise)}</td>
                          <td className="py-3.5 px-4 text-[#5B6B8C]">{u.joinedDate}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleUserBlock(u.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                u.status === 'ACTIVE'
                                  ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: PARTNERS DIRECTORY ===================== */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Partner Directory & Performance</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Category-wise partners, sales, commission paid to platform, ratings, and account status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/partner/panel"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6] flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Open Partner Portal</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-[#EAF2FF] text-[#5B6B8C] font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Partner / Business</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Completed Jobs</th>
                      <th className="py-3 px-4">Gross Sales</th>
                      <th className="py-3 px-4">Commission Paid</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF2FF]">
                    {partnersList.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F9FBFF]">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0A1F5C]">{p.businessName}</div>
                          <div className="text-[11px] text-[#5B6B8C]">
                            {p.ownerName} &bull; {p.mobile}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0B5FD9]">{p.category}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#0A1F5C]">{p.completedJobs}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{formatInr(p.totalSalesPaise)}</td>
                        <td className="py-3.5 px-4 font-bold text-[#0B5FD9]">{formatInr(p.commissionPaidPaise)}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{p.rating}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleTogglePartnerBlock(p.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              p.status === 'ACTIVE'
                                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {p.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 7: WITHDRAWAL REQUESTS & PAYOUTS ===================== */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Partner Withdrawal Requests & Payouts</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Approve withdrawals, record bank UTR / UPI transaction IDs, and maintain disbursement ledger.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  exportCsv(
                    'serva-partner-withdrawals.csv',
                    'ID,Partner,Amount,Destination,RequestedAt,Status,TransactionRef\n' +
                      withdrawals
                        .map(
                          (w) =>
                            `${w.id},"${w.partnerName}",${w.amountPaise / 100},"${w.destination}","${w.requestedAt}",${w.status},"${w.transactionRef || ''}"`
                        )
                        .join('\n')
                  )
                }
                className="px-3.5 py-1.5 rounded-xl border border-[#DCE7F9] text-xs font-semibold text-[#0A1F5C] hover:bg-[#F1F6FF] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#0B5FD9]" />
                <span>Export Payouts CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE7F9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-[#EAF2FF] text-[#5B6B8C] font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Partner</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payout Mode & Destination</th>
                      <th className="py-3 px-4">Requested At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF2FF]">
                    {withdrawals.map((wth) => (
                      <tr key={wth.id} className="hover:bg-[#F9FBFF]">
                        <td className="py-3.5 px-4 font-bold text-[#0B5FD9]">{wth.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0A1F5C]">{wth.partnerName}</div>
                          <div className="text-[11px] text-[#5B6B8C]">{wth.partnerMobile}</div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-base text-emerald-700">
                          {formatInr(wth.amountPaise)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0A1F5C]">{wth.destination}</span>
                          <span className="block text-[10px] text-[#5B6B8C] uppercase font-bold">{wth.payoutMode}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#5B6B8C]">{wth.requestedAt}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              wth.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : wth.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {wth.status}
                          </span>
                          {wth.transactionRef && (
                            <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                              Ref: {wth.transactionRef}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {wth.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedWithdrawal(wth)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-xs shadow-sm"
                              >
                                Mark Paid
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectPayout(wth.id, 'Invalid bank IFSC or account name mismatch')}
                                className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-semibold text-[11px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 8: SUPPORT TICKETS ===================== */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">Support Ticket Helpdesk</h2>
                <p className="text-xs text-[#5B6B8C]">
                  Customer & Partner support inquiries with direct admin reply and status resolution.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {openTicketCount} Open Tickets
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tickets.map((tkt) => (
                <div key={tkt.id} className="bg-white rounded-2xl p-5 border border-[#DCE7F9] shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-[#EBF2FE] text-[#0B5FD9] px-2 py-0.5 rounded-md">
                          {tkt.id}
                        </span>
                        <h3 className="font-bold text-sm text-[#0A1F5C]">{tkt.subject}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tkt.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tkt.status === 'OPEN'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tkt.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6B8C] mt-1">
                        Reported by: <strong>{tkt.reporterName}</strong> ({tkt.reporterType}) &bull; Mobile: {tkt.reporterMobile} &bull; {tkt.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#EAF2FF] text-xs text-[#0A1F5C] my-3">
                    {tkt.message}
                  </div>

                  {tkt.adminReply && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 mb-3">
                      <p className="font-bold text-emerald-800 mb-0.5">Admin Resolution Reply:</p>
                      <p>{tkt.adminReply}</p>
                    </div>
                  )}

                  {tkt.status !== 'RESOLVED' && (
                    <div>
                      {replyTicketId === tkt.id ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            rows={3}
                            placeholder="Type official admin reply to resolve ticket..."
                            value={replyTicketText}
                            onChange={(e) => setReplyTicketText(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyTicketId(null)}
                              className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplyTicket(tkt.id)}
                              className="px-4 py-1.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6] flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Reply & Resolve</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTicketId(tkt.id);
                            setReplyTicketText('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6]"
                        >
                          Reply & Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 9: BROADCAST ANNOUNCEMENTS ===================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm max-w-2xl">
              <h2 className="text-lg font-bold text-[#0A1F5C]">Broadcast Announcements</h2>
              <p className="text-xs text-[#5B6B8C] mt-0.5">
                Dispatch instantaneous in-app push notifications and alerts to all registered users or service partners.
              </p>

              {announcementSentNotice && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Broadcast alert delivered successfully across mobile apps and web push!</span>
                </div>
              )}

              <form onSubmit={handleSendAnnouncement} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">Target Audience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ALL', label: 'Everyone (Users + Partners)' },
                      { id: 'USERS', label: 'Customers Only' },
                      { id: 'PARTNERS', label: 'Partners Only' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnnouncementAudience(opt.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                          announcementAudience === opt.id
                            ? 'bg-[#0B5FD9] text-white border-[#0B5FD9] shadow-sm'
                            : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#0A1F5C] hover:bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0% Commission Weekend for all Agricultural Partners!"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1.5">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write detailed notification body..."
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6] flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Notification</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TAB 10: REPORTS & EXPORTS ===================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F9] shadow-sm">
              <h2 className="text-lg font-bold text-[#0A1F5C]">Financial & Operational Reports</h2>
              <p className="text-xs text-[#5B6B8C] mt-0.5">
                Download comprehensive Excel / CSV spreadsheets for accounting, audit and tax filings.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-5 rounded-2xl border border-[#DCE7F9] bg-[#F8FAFD] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B5FD9] flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0A1F5C]">Platform Sales & GMV Ledger</h3>
                    <p className="text-xs text-[#5B6B8C] mt-1">
                      Complete transactional ledger including customer details, booking codes, service amounts and discounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      exportCsv(
                        'serva-sales-report.csv',
                        'BookingCode,Service,Customer,GrossPaise,CommissionPaise,Date\n' +
                          'SRV-9821,Electrician,Ananya Reddy,149900,14990,2026-11-17\n' +
                          'SRV-9822,AC Repair,Rajesh Goud,89900,8990,2026-11-17\n' +
                          'SRV-9823,House Deep Clean,Pooja Varma,249900,24990,2026-11-16\n'
                      )
                    }
                    className="w-full py-2 rounded-xl bg-white border border-[#DCE7F9] text-xs font-semibold text-[#0B5FD9] hover:bg-[#F1F6FF] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sales CSV</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-[#DCE7F9] bg-[#F8FAFD] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0A1F5C]">Partner Payouts & Tax Summary</h3>
                    <p className="text-xs text-[#5B6B8C] mt-1">
                      Disbursement breakdown with partner PAN numbers, GSTIN details, bank accounts, and TDS references.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      exportCsv(
                        'serva-payouts-tax-report.csv',
                        'PartnerID,BusinessName,TotalEarnings,CommissionDeducted,NetPayouts\n' +
                          'PTR-501,Sri Balaji Deep Cleaning,284000,28400,255600\n' +
                          'PTR-502,Deccan Machinery Fleet,389000,23340,365660\n'
                      )
                    }
                    className="w-full py-2 rounded-xl bg-white border border-[#DCE7F9] text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Tax & Payout CSV</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-[#DCE7F9] bg-[#F8FAFD] space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0A1F5C]">Category Commission Audit</h3>
                    <p className="text-xs text-[#5B6B8C] mt-1">
                      Analysis of retained commission across Home Services, Agriculture, Contractors, Events and Moving.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      exportCsv(
                        'serva-commission-audit.csv',
                        'Category,GrossSales,CommissionRate,NetCommissionRetained\n' +
                          'Home Services,1833000,10%,183300\n' +
                          'Agriculture Services,868000,6%,52080\n' +
                          'Contractors & Machinery,1157000,8%,92560\n' +
                          'Event Services,578000,12%,69360\n' +
                          'Moving & Shifting,388000,9%,34920\n'
                      )
                    }
                    className="w-full py-2 rounded-xl bg-white border border-[#DCE7F9] text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Commission CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* ===================== MODAL 1: VIEW KYC DOCUMENTS ===================== */}
      {selectedKyc && !rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#DCE7F9]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAF2FF]">
              <div>
                <h3 className="font-bold text-base text-[#0A1F5C]">{selectedKyc.businessName}</h3>
                <p className="text-xs text-[#5B6B8C]">
                  {selectedKyc.ownerName} &bull; {selectedKyc.partnerType === 'SHOP_BUSINESS' ? 'Business Partner' : 'Individual Partner'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKyc(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFD] p-3 rounded-xl">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Mobile Number</span>
                  <span className="font-bold text-[#0A1F5C]">{selectedKyc.mobile} (OTP Verified)</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Email Address</span>
                  <span className="font-bold text-[#0A1F5C]">{selectedKyc.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Service Area</span>
                  <span className="font-bold text-[#0A1F5C]">{selectedKyc.serviceArea}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#8FA0C0]">Withdrawal Payout</span>
                  <span className="font-bold text-[#0B5FD9]">
                    {selectedKyc.payoutMode === 'UPI'
                      ? `UPI: ${selectedKyc.upiId}`
                      : `${selectedKyc.bankAccount?.bankName} - ${selectedKyc.bankAccount?.accountNumber}`}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="font-bold text-xs uppercase text-[#8FA0C0] mb-2">Uploaded Verification Proofs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedKyc.panImageUrl && (
                    <div className="border border-[#DCE7F9] rounded-xl p-2.5 bg-gray-50">
                      <p className="font-bold text-[#0A1F5C] mb-1">
                        PAN Card ({selectedKyc.panNumber || 'Individual'})
                      </p>
                      <img
                        src={selectedKyc.panImageUrl}
                        alt="PAN Preview"
                        className="w-full h-36 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {selectedKyc.tradeLicenseUrl && (
                    <div className="border border-[#DCE7F9] rounded-xl p-2.5 bg-gray-50">
                      <p className="font-bold text-[#0A1F5C] mb-1">
                        GST / Trade License ({selectedKyc.gstNumber})
                      </p>
                      <img
                        src={selectedKyc.tradeLicenseUrl}
                        alt="Trade License Preview"
                        className="w-full h-36 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {selectedKyc.shopPhotoUrl && (
                    <div className="border border-[#DCE7F9] rounded-xl p-2.5 bg-gray-50">
                      <p className="font-bold text-[#0A1F5C] mb-1">Shop / Establishment Photo</p>
                      <img
                        src={selectedKyc.shopPhotoUrl}
                        alt="Shop Photo Preview"
                        className="w-full h-36 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EAF2FF]">
              <button
                type="button"
                onClick={() => setSelectedKyc(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE7F9] text-xs font-semibold hover:bg-gray-50"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectionActionType('RESUBMIT');
                    setRejectionModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600"
                >
                  Request Corrections (Re-submit)
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveKyc(selectedKyc.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Partner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: REJECT / RE-SUBMIT WITH REASON ===================== */}
      {rejectionModalOpen && selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DCE7F9]">
            <h3 className="font-bold text-base text-[#0A1F5C] mb-1">
              {rejectionActionType === 'RESUBMIT' ? 'Request KYC Corrections' : 'Reject Partner Application'}
            </h3>
            <p className="text-xs text-[#5B6B8C] mb-4">
              Enter the reason so <strong>{selectedKyc.ownerName}</strong> receives a notification and can take corrective action.
            </p>

            <textarea
              rows={4}
              required
              placeholder={
                rejectionActionType === 'RESUBMIT'
                  ? 'e.g. Please upload a clear photo of PAN card. The previous upload was blurry.'
                  : 'e.g. Servicing category not currently supported in this geographical area.'
              }
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#DCE7F9] text-xs focus:outline-none focus:border-[#0B5FD9] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DCE7F9] text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectionOrResubmit}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold ${
                  rejectionActionType === 'RESUBMIT'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {rejectionActionType === 'RESUBMIT' ? 'Re-submission' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: CREATE COUPON ===================== */}
      {showCreateCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DCE7F9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF2FF] mb-4">
              <h3 className="font-bold text-base text-[#0A1F5C]">Create New Discount Coupon</h3>
              <button
                type="button"
                onClick={() => setShowCreateCoupon(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#0A1F5C] mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON300"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs bg-white"
                  >
                    <option value="FLAT">Flat ₹ Amount</option>
                    <option value="PERCENT">Percentage %</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={newCouponLimit}
                    onChange={(e) => setNewCouponLimit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0A1F5C] mb-1">Valid Until</label>
                <input
                  type="text"
                  value={newCouponDate}
                  onChange={(e) => setNewCouponDate(e.target.value)}
                  placeholder="31 Dec 2026"
                  className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAF2FF]">
                <button
                  type="button"
                  onClick={() => setShowCreateCoupon(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B5FD9] text-white text-xs font-semibold hover:bg-[#094FB6]"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: PROCESS WITHDRAWAL PAYOUT ===================== */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#DCE7F9]">
            <h3 className="font-bold text-base text-[#0A1F5C] mb-1">Disburse Partner Payout</h3>
            <p className="text-xs text-[#5B6B8C] mb-4">
              Payout of <strong>{formatInr(selectedWithdrawal.amountPaise)}</strong> to{' '}
              {selectedWithdrawal.partnerName}.
            </p>

            <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs space-y-1 mb-4">
              <div>
                <span className="text-[#5B6B8C]">Payout Mode:</span>{' '}
                <strong className="text-[#0A1F5C]">{selectedWithdrawal.payoutMode}</strong>
              </div>
              <div>
                <span className="text-[#5B6B8C]">Destination:</span>{' '}
                <strong className="text-[#0B5FD9]">{selectedWithdrawal.destination}</strong>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <label className="block text-xs font-bold text-[#0A1F5C]">Bank / UPI Transaction Reference ID</label>
              <input
                type="text"
                required
                placeholder="e.g. UPI/239019284912 or HDFC001283"
                value={payoutTxnRef}
                onChange={(e) => setPayoutTxnRef(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCE7F9] text-xs font-mono font-bold text-[#0A1F5C]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApprovePayout(selectedWithdrawal.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
              >
                Confirm Payout Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
