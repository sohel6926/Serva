import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  ImagePlus,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  Tractor,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';

type PartnerTab = 'overview' | 'orders' | 'wallet' | 'services' | 'reviews' | 'support';
type OrderFilter = 'active' | 'new' | 'completed';

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
  customer_name?: string;
  customer_mobile?: string;
  location?: string;
}

interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'COMMISSION_DEDUCTION' | 'WITHDRAWAL';
  grossPaise: number;
  commissionPaise: number;
  netPaise: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  referenceId: string;
}

interface WithdrawalRequest {
  id: string;
  amountPaise: number;
  payoutMode: 'UPI' | 'BANK';
  destination: string;
  date: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  adminNotes?: string;
}

interface CustomerReview {
  id: string;
  customerName: string;
  serviceTitle: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  lastReply: string;
}

interface MachineItem {
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
}

interface PortfolioItem {
  id: string;
  title: string;
  category_slug: string;
  media_type: string;
  media_url: string;
  moderation_status: string;
}

/* ────────────────────────────────────────────────────────────
 * Status stepper mappings per category (PDF §4)
 * ──────────────────────────────────────────────────────────── */
const STATUS_STEPS: Record<string, string[]> = {
  default: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_COMPLETED'],
  agriculture: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'WORK_STARTED', 'IN_PROGRESS', 'WORK_COMPLETED'],
  moving: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'PACKING_IN_PROGRESS', 'LOADING_IN_PROGRESS', 'VEHICLE_DEPARTED', 'ARRIVED_AT_DESTINATION', 'UNLOADING_IN_PROGRESS', 'WORK_COMPLETED'],
};

const STATUS_LABELS: Record<string, string> = {
  REQUEST_SUBMITTED: 'New Request',
  AWAITING_ADVANCE: 'Awaiting Advance',
  CONFIRMED: 'Order Confirmed',
  ON_THE_WAY: 'On The Way',
  ARRIVED: 'Arrived at Location',
  WORK_STARTED: 'Work Started',
  IN_PROGRESS: 'Work in Progress',
  PACKING_IN_PROGRESS: 'Packing in Progress',
  LOADING_IN_PROGRESS: 'Loading Items',
  VEHICLE_DEPARTED: 'In Transit',
  ARRIVED_AT_DESTINATION: 'Reached Destination',
  UNLOADING_IN_PROGRESS: 'Unloading Items',
  WORK_COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function PartnerRequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PartnerTab>('overview');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('active');
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(2485000); // in paise (₹24,850)
  const [todayEarnings, setTodayEarnings] = useState(345000); // in paise (₹3,450)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountRupees, setWithdrawAmountRupees] = useState('');
  const [withdrawMode, setWithdrawMode] = useState<'UPI' | 'BANK'>('UPI');
  const [withdrawUpi, setWithdrawUpi] = useState('ramesh@oksbi');
  const [withdrawBank, setWithdrawBank] = useState('HDFC Bank · A/C 9876543210 (IFSC: HDFC0001234)');

  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [newMachineType, setNewMachineType] = useState('Tractor 45HP');
  const [newMachineModel, setNewMachineModel] = useState('Mahindra 575 DI');
  const [newMachineHourly, setNewMachineHourly] = useState('1200');

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Payment / Withdrawal');
  const [ticketDesc, setTicketDesc] = useState('');

  // Initial Sample / Seed Loader
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, oRes] = await Promise.all([
        fetch('/api/bookings', { credentials: 'include' }).catch(() => null),
        fetch('/api/partner/overview', { credentials: 'include' }).catch(() => null),
      ]);

      const bData = bRes && bRes.ok ? await bRes.json() : null;
      const oData = oRes && oRes.ok ? await oRes.json() : null;

      // Bookings setup with robust sample fallback
      if (bData?.bookings && bData.bookings.length > 0) {
        setBookings(bData.bookings);
      } else {
        setBookings([
          {
            id: 'bk-active-1',
            booking_code: 'SRV-8941',
            category_slug: 'home-services',
            title: 'Electrician & Switchboard Rewiring',
            status: 'ON_THE_WAY',
            partner_id: user?.partner_id ?? 'partner-verified-1',
            scheduled_date: 'Today, 2:30 PM',
            scheduled_time: '2:30 PM - 3:30 PM',
            total_paise: 65000,
            customer_name: 'Ananya Reddy',
            customer_mobile: '+91 98765 43210',
            location: 'Madhapur, Hitech City, Hyderabad',
          },
          {
            id: 'bk-active-2',
            booking_code: 'SRV-8942',
            category_slug: 'home-services',
            title: 'Kitchen & Bathroom Pipe Leakage Repair',
            status: 'ARRIVED',
            partner_id: user?.partner_id ?? 'partner-verified-1',
            scheduled_date: 'Today, 4:00 PM',
            scheduled_time: '4:00 PM - 5:00 PM',
            total_paise: 80000,
            customer_name: 'Karthik V.',
            customer_mobile: '+91 98480 22338',
            location: 'Jubilee Hills, Road No. 36, Hyderabad',
          },
          {
            id: 'bk-new-1',
            booking_code: 'SRV-9012',
            category_slug: 'moving',
            title: '2 BHK Home Shifting & Loading Helpers',
            status: 'REQUEST_SUBMITTED',
            partner_id: null,
            scheduled_date: 'Tomorrow, 9:00 AM',
            scheduled_time: '9:00 AM - 1:00 PM',
            total_paise: 450000,
            customer_name: 'Vikram Sharma',
            customer_mobile: '+91 91234 56789',
            location: 'Kukatpally Housing Board (KPHB) to Gachibowli',
          },
          {
            id: 'bk-comp-1',
            booking_code: 'SRV-8820',
            category_slug: 'home-services',
            title: 'Ceiling Fan & Inverter Installation',
            status: 'WORK_COMPLETED',
            partner_id: user?.partner_id ?? 'partner-verified-1',
            scheduled_date: 'Yesterday, 11:00 AM',
            scheduled_time: '11:00 AM - 12:30 PM',
            total_paise: 120000,
            customer_name: 'Pooja Agarwal',
            customer_mobile: '+91 97000 11223',
            location: 'Kondapur, Hyderabad',
          },
        ]);
      }

      if (oData?.machines && oData.machines.length > 0) {
        setMachines(oData.machines);
      } else {
        setMachines([
          {
            id: 'm-1',
            category: 'AGRICULTURE',
            machine_type: 'Tractor 50HP with Rotavator',
            make_model: 'John Deere 5050D',
            hourly_rate_paise: 140000,
            daily_rate_paise: 1000000,
            per_acre_rate_paise: 180000,
            operator_included: 1,
            is_available: 1,
            service_area: 'Hyderabad, Rangareddy & Medak',
          },
          {
            id: 'm-2',
            category: 'CONTRACTORS',
            machine_type: 'JCB Backhoe Loader',
            make_model: 'JCB 3DX Super',
            hourly_rate_paise: 180000,
            daily_rate_paise: 1400000,
            per_acre_rate_paise: 0,
            operator_included: 1,
            is_available: 1,
            service_area: 'Hyderabad City & Outer Ring Road',
          },
        ]);
      }

      if (oData?.portfolio && oData.portfolio.length > 0) {
        setPortfolio(oData.portfolio);
      } else {
        setPortfolio([
          {
            id: 'p-1',
            title: 'Complete Modular Kitchen Wiring & Lighting',
            category_slug: 'home-services',
            media_type: 'IMAGE',
            media_url: '/src/assets/images/hero_home_services_1794821794674.jpg',
            moderation_status: 'APPROVED',
          },
          {
            id: 'p-2',
            title: 'Heavy Item Packing & 3 BHK Shifting',
            category_slug: 'moving',
            media_type: 'IMAGE',
            media_url: '/src/assets/images/svc_moving_shifting_1794825499341.jpg',
            moderation_status: 'APPROVED',
          },
        ]);
      }

      // Sample Ledger transactions with Admin Commission Deduction (PDF §5)
      setTransactions([
        {
          id: 'tx-1',
          type: 'CREDIT',
          grossPaise: 120000, // ₹1,200
          commissionPaise: 12000, // 10% = ₹120
          netPaise: 108000, // ₹1,080 credited
          description: 'Payment for Ceiling Fan & Inverter Installation (#SRV-8820)',
          date: 'Yesterday, 1:45 PM',
          status: 'COMPLETED',
          referenceId: 'PAY-8820',
        },
        {
          id: 'tx-2',
          type: 'WITHDRAWAL',
          grossPaise: 500000,
          commissionPaise: 0,
          netPaise: 500000,
          description: 'Payout Transfer to UPI: ramesh@oksbi',
          date: 'Nov 15, 2026',
          status: 'COMPLETED',
          referenceId: 'WDR-9021',
        },
        {
          id: 'tx-3',
          type: 'CREDIT',
          grossPaise: 250000,
          commissionPaise: 25000,
          netPaise: 225000,
          description: 'Payment for Full Flat Switchboard Repair (#SRV-8710)',
          date: 'Nov 14, 2026',
          status: 'COMPLETED',
          referenceId: 'PAY-8710',
        },
      ]);

      setWithdrawals([
        {
          id: 'w-1',
          amountPaise: 500000,
          payoutMode: 'UPI',
          destination: 'ramesh@oksbi',
          date: 'Nov 15, 2026',
          status: 'PAID',
          adminNotes: 'Transferred via IMPS / UPI Ref #89371284',
        },
        {
          id: 'w-2',
          amountPaise: 350000,
          payoutMode: 'BANK',
          destination: 'HDFC Bank ···4821',
          date: 'Nov 08, 2026',
          status: 'PAID',
          adminNotes: 'NEFT Transfer #N84918239',
        },
      ]);

      setReviews([
        {
          id: 'rev-1',
          customerName: 'Ananya Reddy',
          serviceTitle: 'Electrician & Switchboard Repair',
          rating: 5,
          date: 'Yesterday',
          comment: 'Ramesh was extremely professional, polite, and resolved our tripping MCB problem in less than 30 minutes. Very transparent pricing.',
          verified: true,
        },
        {
          id: 'rev-2',
          customerName: 'Pooja Agarwal',
          serviceTitle: 'Ceiling Fan & Inverter Installation',
          rating: 5,
          date: '3 days ago',
          comment: 'Super fast installation and very clean cleanup after the drilling work. Highly recommended!',
          verified: true,
        },
        {
          id: 'rev-3',
          customerName: 'Suresh Kumar',
          serviceTitle: 'Bathroom Plumbing & Tap Fitting',
          rating: 4,
          date: '1 week ago',
          comment: 'Good work on the bathroom mixer and flush valve. Arrived on time.',
          verified: true,
        },
      ]);

      setTickets([
        {
          id: 't-1',
          ticketNumber: 'TCK-2094',
          subject: 'Clarification regarding weekend night service bonus',
          category: 'Payment & Commission',
          status: 'RESOLVED',
          date: 'Nov 12, 2026',
          lastReply: 'Admin Team: Night bonus of ₹150 is credited automatically to your wallet on completed jobs.',
        },
      ]);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Status progression action
  const handleNextStatus = async (booking: PartnerBooking) => {
    const list = STATUS_STEPS[booking.category_slug] ?? STATUS_STEPS.default;
    const currentIdx = list.indexOf(booking.status);
    if (currentIdx === -1 || currentIdx >= list.length - 1) return;

    const next = list[currentIdx + 1];
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: next } : b))
    );

    // If completed, add to wallet
    if (next === 'WORK_COMPLETED') {
      const gross = booking.total_paise;
      const commission = Math.round(gross * 0.1); // 10% admin commission
      const net = gross - commission;
      setWalletBalance((prev) => prev + net);
      setTodayEarnings((prev) => prev + net);
      setNotice(`Job #${booking.booking_code} marked completed! ₹${Math.round(net / 100).toLocaleString('en-IN')} added to your wallet (after 10% admin commission).`);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'CREDIT',
          grossPaise: gross,
          commissionPaise: commission,
          netPaise: net,
          description: `Payment for ${booking.title} (#${booking.booking_code})`,
          date: 'Just now',
          status: 'COMPLETED',
          referenceId: `PAY-${Date.now()}`,
        },
        ...prev,
      ]);
    } else {
      setNotice(`Job #${booking.booking_code} status updated to: ${STATUS_LABELS[next] ?? next}`);
    }

    try {
      await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      });
    } catch {
      // offline safe
    }
  };

  // Accept a new request
  const handleAcceptRequest = async (booking: PartnerBooking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id ? { ...b, status: 'CONFIRMED', partner_id: user?.partner_id ?? 'partner-verified-1' } : b
      )
    );
    setNotice(`Accepted request #${booking.booking_code}! It is now in your active orders.`);
    try {
      await fetch(`/api/bookings/${booking.id}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // offline safe
    }
  };

  // Reject a request
  const handleRejectRequest = (booking: PartnerBooking) => {
    setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    setNotice(`Request #${booking.booking_code} has been declined.`);
  };

  // Submit withdrawal request (PDF §5: minimum amount rule)
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(withdrawAmountRupees);
    if (isNaN(rupees) || rupees < 500) {
      setError('Minimum withdrawal amount is ₹500.');
      return;
    }
    const paise = Math.round(rupees * 100);
    if (paise > walletBalance) {
      setError('Withdrawal amount cannot exceed your current available wallet balance.');
      return;
    }

    setWalletBalance((prev) => prev - paise);
    const newReq: WithdrawalRequest = {
      id: `w-${Date.now()}`,
      amountPaise: paise,
      payoutMode: withdrawMode,
      destination: withdrawMode === 'UPI' ? withdrawUpi : withdrawBank,
      date: 'Just now',
      status: 'PENDING',
      adminNotes: 'Processing bank transfer. Credited within 2-4 hours.',
    };
    setWithdrawals((prev) => [newReq, ...prev]);
    setShowWithdrawModal(false);
    setWithdrawAmountRupees('');
    setNotice(`Withdrawal request of ₹${rupees.toLocaleString('en-IN')} submitted! Status is PENDING admin payout.`);
  };

  // Submit a support ticket
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      setError('Provide ticket subject and description.');
      return;
    }

    const newT: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      status: 'OPEN',
      date: 'Just now',
      lastReply: 'Ticket registered. Our support executive will respond shortly.',
    };
    setTickets((prev) => [newT, ...prev]);
    setShowTicketModal(false);
    setTicketSubject('');
    setTicketDesc('');
    setNotice(`Support ticket #${newT.ticketNumber} created successfully.`);
  };

  // Add fleet machine
  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const hourly = parseInt(newMachineHourly, 10);
    const item: MachineItem = {
      id: `m-${Date.now()}`,
      category: 'AGRICULTURE',
      machine_type: newMachineType,
      make_model: newMachineModel,
      hourly_rate_paise: (hourly || 1000) * 100,
      daily_rate_paise: (hourly || 1000) * 800,
      per_acre_rate_paise: (hourly || 1000) * 150,
      operator_included: 1,
      is_available: 1,
      service_area: 'Hyderabad, TG',
    };
    setMachines((prev) => [item, ...prev]);
    setShowAddMachineModal(false);
    setNotice(`Added ${item.machine_type} (${item.make_model}) to your machinery fleet.`);
  };

  // Active / new / completed bookings split
  const activeBookings = bookings.filter((b) => b.status !== 'REQUEST_SUBMITTED' && b.status !== 'WORK_COMPLETED');
  const newBookings = bookings.filter((b) => b.status === 'REQUEST_SUBMITTED');
  const completedBookings = bookings.filter((b) => b.status === 'WORK_COMPLETED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* ────────────────────────────────────────────────────────────
       * TOP PARTNER BANNER & KYC VERIFICATION BADGE (PDF §3)
       * ──────────────────────────────────────────────────────────── */}
      <div className="serva-card p-4 sm:p-6 bg-gradient-to-br from-white via-[#F8FBFF] to-[#EFF5FD] border border-[#DCE7F9] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0B5FD9] to-[#2575FC] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                {user?.name?.charAt(0) ?? 'P'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-400'
                }`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#0A1F5C]">
                  {user?.name ?? 'Partner Operations'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Partner (KYC Approved)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6B8C] mt-1">
                <span className="inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5FD9]" />
                  Hyderabad & Outer Ring Road
                </span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8 Rating (42 Reviews)
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-[#0A1F5C]">ID: #{user?.partner_id ?? 'PART-8921'}</span>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#0A1F5C]">
                {isOnline ? 'Accepting Requests' : 'Currently Offline'}
              </p>
              <p className="text-[10px] text-[#5B6B8C]">
                {isOnline ? 'Visible to nearby customers' : 'Paused for bookings'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOnline((v) => !v);
                setNotice(isOnline ? 'You are now offline. Customers will not see your active status.' : 'You are now live and accepting orders!');
              }}
              className={`min-h-[42px] px-4 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
              <span>{isOnline ? '🟢 Live Online' : '⚪ Go Online'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice / Alert toast */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-[#0B5FD9] font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0B5FD9]" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
       * CLEAN TAB NAVIGATION BAR (PDF §4 & §5)
       * ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-[#E2EEFE]">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
          { id: 'orders', label: `Orders & Requests (${activeBookings.length + newBookings.length})`, icon: Clock },
          { id: 'wallet', label: 'Wallet & Withdrawals', icon: Wallet },
          { id: 'services', label: 'Services & Fleet', icon: Wrench },
          { id: 'reviews', label: 'Customer Reviews (42)', icon: Star },
          { id: 'support', label: 'Help & Tickets', icon: LifeBuoy },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as PartnerTab);
              setError(null);
            }}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0B5FD9] text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-[#DCE7F9] text-[#0A1F5C] hover:bg-[#F1F6FF]'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-[#0B5FD9]'}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
       * TAB 1: DASHBOARD OVERVIEW (PDF §4)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Today's Earnings */}
            <div className="serva-card p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-white to-[#F0FDF4] border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Today's Earnings</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono-num">
                  ₹{Math.round(todayEarnings / 100).toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">After 10% platform commission</p>
              </div>
            </div>

            {/* Card 2: Wallet Balance */}
            <div className="serva-card p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-white to-[#EFF6FF] border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Available Wallet</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B5FD9] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B5FD9] font-mono-num">
                  ₹{Math.round(walletBalance / 100).toLocaleString('en-IN')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(true)}
                  className="text-[10px] font-bold text-[#0B5FD9] hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
                >
                  Withdraw to Bank / UPI <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Active Jobs */}
            <div className="serva-card p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-white to-[#FAF5FF] border-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Active & Pending</span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-purple-900 font-mono-num">
                  {activeBookings.length} Active / {newBookings.length} New
                </h3>
                <p className="text-[10px] text-purple-600 mt-0.5 font-medium">Requires partner attention</p>
              </div>
            </div>

            {/* Card 4: Lifetime Completed */}
            <div className="serva-card p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-white to-[#FFFBEB] border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5B6B8C]">Lifetime Orders</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-900 font-mono-num">
                  42 Completed
                </h3>
                <p className="text-[10px] text-amber-700 mt-0.5 font-medium">100% on-time service rate</p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Live Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent / Live Jobs Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-base font-bold text-[#0A1F5C]">Live Active Jobs ({activeBookings.length})</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('orders'); setOrderFilter('active'); }}
                  className="text-xs font-bold text-[#0B5FD9] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  View All Orders <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {activeBookings.length === 0 ? (
                <div className="serva-card p-8 text-center space-y-2 text-[#5B6B8C]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-[#0A1F5C]">All active jobs completed!</p>
                  <p className="text-xs">New service requests will notify you in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <div
                      key={b.id}
                      className="serva-card p-4 sm:p-5 bg-white border border-[#DCE7F9] shadow-xs flex flex-col justify-between gap-3 hover:border-[#0B5FD9] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EBF4FE] text-[#0B5FD9]">
                              #{b.booking_code}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B5FD9] border border-blue-100">
                              {STATUS_LABELS[b.status] ?? b.status}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#0A1F5C] mt-1.5">{b.title}</h3>
                          <p className="text-xs text-[#5B6B8C] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0B5FD9] shrink-0" />
                            {b.location}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-[#5B6B8C]">Payout after Commission</p>
                          <p className="text-base sm:text-lg font-extrabold text-[#0B5FD9] font-mono-num">
                            ₹{Math.round((b.total_paise * 0.9) / 100).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Customer Details & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-[#0A1F5C]">
                          <User className="w-3.5 h-3.5 text-[#5B6B8C]" />
                          <span className="font-semibold">{b.customer_name}</span>
                          <span className="text-slate-300">·</span>
                          <a href={`tel:${b.customer_mobile}`} className="text-[#0B5FD9] font-semibold inline-flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" /> Call Customer
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNextStatus(b)}
                          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0B5FD9] to-[#1E6FE8] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span>Advance Status →</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Payout Summary Column (1 Col) */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#0A1F5C]">Wallet & Quick Payout</h2>
              <div className="serva-card p-5 bg-gradient-to-br from-[#0A1F5C] to-[#0B4DB2] text-white space-y-4 shadow-lg shadow-blue-900/15">
                <div>
                  <p className="text-xs text-blue-200">Net Withdrawable Balance</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-mono-num">
                    ₹{Math.round(walletBalance / 100).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-blue-200/80 mt-1">100% of admin commission already deducted.</p>
                </div>

                <div className="pt-3 border-t border-white/15 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-blue-100">
                    <span>Registered Payout Mode</span>
                    <span className="font-bold text-white">UPI (ramesh@oksbi)</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-100">
                    <span>Minimum Withdrawal</span>
                    <span className="font-bold text-white">₹500</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full min-h-[42px] rounded-xl bg-white text-[#0A1F5C] font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-md hover:bg-blue-50 active:scale-98 transition-all cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Request Instant Payout</span>
                </button>
              </div>

              {/* Commission Rule Transparency Box (PDF §5) */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Commission Transparency</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  SERVA charges a transparent 10% platform fee on completed bookings. You receive 90% guaranteed net payout directly in your wallet immediately upon job completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
       * TAB 2: ORDERS & REQUESTS (PDF §4)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderFilter('active')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  orderFilter === 'active'
                    ? 'bg-[#0B5FD9] text-white shadow-xs'
                    : 'bg-white border border-[#DCE7F9] text-[#0A1F5C]'
                }`}
              >
                In Progress ({activeBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('new')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  orderFilter === 'new'
                    ? 'bg-[#0B5FD9] text-white shadow-xs'
                    : 'bg-white border border-[#DCE7F9] text-[#0A1F5C]'
                }`}
              >
                New Requests ({newBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('completed')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  orderFilter === 'completed'
                    ? 'bg-[#0B5FD9] text-white shadow-xs'
                    : 'bg-white border border-[#DCE7F9] text-[#0A1F5C]'
                }`}
              >
                Completed Jobs ({completedBookings.length})
              </button>
            </div>
          </div>

          {/* New Incoming Requests with Accept / Reject (PDF §4) */}
          {orderFilter === 'new' && (
            <div className="space-y-3">
              {newBookings.length === 0 ? (
                <div className="serva-card p-8 text-center text-[#5B6B8C] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#0B5FD9] mx-auto" />
                  <p className="font-bold text-[#0A1F5C]">No pending new requests right now.</p>
                  <p className="text-xs">Make sure your status is toggled to "🟢 Live Online" to receive incoming leads.</p>
                </div>
              ) : (
                newBookings.map((b) => (
                  <div key={b.id} className="serva-card p-5 border-blue-200 bg-blue-50/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          ⚡ Direct Customer Request · #{b.booking_code}
                        </span>
                        <h3 className="text-base font-bold text-[#0A1F5C] mt-2">{b.title}</h3>
                        <p className="text-xs text-[#5B6B8C] flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0B5FD9]" /> {b.location}
                        </p>
                        <p className="text-xs text-[#5B6B8C] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#0B5FD9]" /> {b.scheduled_date} ({b.scheduled_time})
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[#5B6B8C]">Estimated Net Payout</p>
                        <p className="text-xl font-extrabold text-[#0B5FD9] font-mono-num">
                          ₹{Math.round((b.total_paise * 0.9) / 100).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(b)}
                        className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(b)}
                        className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept & Confirm
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Active / In Progress Orders with Live Status Progress Stepper */}
          {orderFilter === 'active' && (
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <div className="serva-card p-8 text-center text-[#5B6B8C] space-y-2">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-[#0A1F5C]">No orders currently in progress.</p>
                </div>
              ) : (
                activeBookings.map((b) => {
                  const steps = STATUS_STEPS[b.category_slug] ?? STATUS_STEPS.default;
                  const currentIdx = steps.indexOf(b.status);

                  return (
                    <div key={b.id} className="serva-card p-5 space-y-4 border-[#DCE7F9]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EBF4FE] text-[#0B5FD9]">
                              #{b.booking_code}
                            </span>
                            <span className="text-xs font-bold text-[#0A1F5C]">{b.customer_name}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#0A1F5C] mt-1">{b.title}</h3>
                          <p className="text-xs text-[#5B6B8C] mt-0.5">{b.location}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-[#5B6B8C]">Payout after 10% fee</p>
                          <p className="text-lg font-bold text-[#0B5FD9] font-mono-num">
                            ₹{Math.round((b.total_paise * 0.9) / 100).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Step by Step Status Progress Stepper (PDF §4) */}
                      <div className="bg-[#F8FBFF] p-3.5 rounded-2xl border border-[#EBF2FE]">
                        <p className="text-[11px] font-bold text-[#0A1F5C] mb-2">Live Progress Milestones</p>
                        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                          {steps.map((st, idx) => {
                            const isDone = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={st} className="flex-1 min-w-[70px] text-center">
                                <div
                                  className={`h-2 rounded-full mb-1 transition-all ${
                                    isDone ? 'bg-[#0B5FD9]' : 'bg-slate-200'
                                  }`}
                                />
                                <span
                                  className={`text-[9px] font-bold block truncate ${
                                    isCurrent ? 'text-[#0B5FD9]' : isDone ? 'text-[#0A1F5C]' : 'text-slate-400'
                                  }`}
                                >
                                  {STATUS_LABELS[st] ?? st}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <a
                          href={`tel:${b.customer_mobile}`}
                          className="text-xs font-bold text-[#0B5FD9] inline-flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Customer ({b.customer_mobile})
                        </a>
                        <button
                          type="button"
                          onClick={() => handleNextStatus(b)}
                          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0B5FD9] to-[#1E6FE8] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <span>Move to Next Step: {STATUS_LABELS[steps[currentIdx + 1]] ?? 'Complete'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Completed History */}
          {orderFilter === 'completed' && (
            <div className="space-y-3">
              {completedBookings.map((b) => (
                <div key={b.id} className="serva-card p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#5B6B8C]">#{b.booking_code}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Completed & Paid
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0A1F5C] mt-1">{b.title}</h4>
                    <p className="text-xs text-[#5B6B8C] mt-0.5">{b.scheduled_date} · Customer: {b.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-700 font-mono-num">
                      +₹{Math.round((b.total_paise * 0.9) / 100).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-slate-400">Credited to wallet</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
       * TAB 3: WALLET & WITHDRAWALS (PDF §5)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Main Wallet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 serva-card p-6 bg-gradient-to-br from-[#0A1F5C] via-[#0B4DB2] to-[#0B5FD9] text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-200">Available Payout Balance</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                    Net After 10% Fee
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 font-mono-num">
                  ₹{Math.round(walletBalance / 100).toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-blue-100/90 mt-1">
                  Ready for direct transfer to your registered UPI or Bank Account.
                </p>
              </div>

              <div className="pt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-6 py-2.5 rounded-full bg-white text-[#0A1F5C] text-xs font-extrabold inline-flex items-center gap-2 shadow-lg hover:bg-blue-50 active:scale-95 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Request Withdrawal (Min ₹500)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotice('Wallet statement downloaded.')}
                  className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Statement
                </button>
              </div>
            </div>

            {/* Payout Details Card */}
            <div className="serva-card p-5 space-y-3 bg-white">
              <h3 className="text-sm font-bold text-[#0A1F5C] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0B5FD9]" /> Registered Payout Info
              </h3>
              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5">
                <p className="text-slate-500 font-medium">Primary UPI ID</p>
                <p className="font-bold text-[#0A1F5C] font-mono">ramesh@oksbi</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified UPI
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5">
                <p className="text-slate-500 font-medium">Primary Bank Account</p>
                <p className="font-bold text-[#0A1F5C]">HDFC Bank · A/C ****4821</p>
                <p className="text-[10px] text-slate-500">IFSC: HDFC0001234 (Ramesh Kumar)</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Requests Tracking (PDF §5: Status shown as Pending, Paid or Rejected) */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0A1F5C]">Withdrawal Requests & History</h3>
            <div className="serva-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        w.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {w.status === 'PAID' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A1F5C]">
                          ₹{Math.round(w.amountPaise / 100).toLocaleString('en-IN')} via {w.payoutMode}
                        </p>
                        <p className="text-xs text-[#5B6B8C] mt-0.5">
                          Sent to: {w.destination} · {w.date}
                        </p>
                        {w.adminNotes && <p className="text-[11px] text-[#0B5FD9] mt-0.5 font-medium">{w.adminNotes}</p>}
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        w.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : w.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Transaction History with Admin Commission Breakdown (PDF §5) */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0A1F5C]">Earnings & Commission Statement Ledger</h3>
            <div className="serva-card overflow-hidden">
              <div className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#0A1F5C] text-sm">{tx.description}</p>
                      <div className="flex items-center gap-2 text-[#5B6B8C] mt-1">
                        <span>{tx.date}</span>
                        <span>·</span>
                        <span>Ref: {tx.referenceId}</span>
                        {tx.commissionPaise > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Admin Commission: -₹{Math.round(tx.commissionPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm font-extrabold ${tx.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}₹{Math.round(tx.netPaise / 100).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize">{tx.status.toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
       * TAB 4: SERVICES & FLEET (PDF §2, §4)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Registered Categories */}
          <div className="serva-card p-5 space-y-3">
            <h3 className="text-base font-bold text-[#0A1F5C]">Offered Service Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Home Services (Electrical & Plumbing)', status: 'Active', count: '4 sub-services' },
                { name: 'Construction & Site Workers', status: 'Active', count: 'Masons & Helpers' },
                { name: 'Moving & Residential Shifting', status: 'Active', count: '1-3 BHK Crew' },
              ].map((c) => (
                <div key={c.name} className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/20">
                  <p className="font-bold text-xs text-[#0A1F5C]">{c.name}</p>
                  <p className="text-[11px] text-[#5B6B8C] mt-1">{c.count}</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Machinery Fleet Manager (Contractor & Agriculture Machinery Owners) */}
          <div className="serva-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A1F5C]">Machinery & Equipment Fleet</h3>
                <p className="text-xs text-[#5B6B8C]">Manage heavy machinery, tractors, harvesters, and rental rates.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMachineModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#0B5FD9] text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Machine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0B5FD9]">
                        {m.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#0A1F5C] mt-1.5">{m.machine_type}</h4>
                      <p className="text-xs text-[#5B6B8C]">{m.make_model} · {m.service_area}</p>
                    </div>
                    <Tractor className="w-6 h-6 text-[#0B5FD9]" />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#5B6B8C]">Hourly Rate:</span>{' '}
                      <strong className="text-[#0B5FD9] font-mono">₹{Math.round(m.hourly_rate_paise / 100)}/hr</strong>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                      Operator Included
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio & Project Showcase */}
          <div className="serva-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A1F5C]">Verified Project Portfolio</h3>
                <p className="text-xs text-[#5B6B8C]">Photos shown to customers on your SERVA public profile.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotice('Select an image to add to portfolio.')}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-[#0A1F5C] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5" /> Upload Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portfolio.map((p) => (
                <div key={p.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                  <img src={p.media_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <p className="text-[10px] font-bold text-white line-clamp-1">{p.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
       * TAB 5: CUSTOMER REVIEWS & RATINGS (PDF §4)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="serva-card p-6 text-center space-y-2 bg-gradient-to-br from-white to-amber-50/30">
              <h3 className="text-3xl font-extrabold text-[#0A1F5C]">4.8</h3>
              <div className="flex justify-center text-amber-400 gap-1">
                {[1, 2, 3, 4, 5].map((k) => (
                  <Star key={k} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#5B6B8C] font-semibold">Based on 42 customer reviews</p>
            </div>
            <div className="sm:col-span-2 serva-card p-5 space-y-2 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#0A1F5C]">5 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="w-[85%] h-full bg-amber-400 rounded-full" />
                </div>
                <span className="w-8 text-right font-medium text-slate-500">85%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#0A1F5C]">4 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="w-[12%] h-full bg-amber-400 rounded-full" />
                </div>
                <span className="w-8 text-right font-medium text-slate-500">12%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#0A1F5C]">3 Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="w-[3%] h-full bg-amber-400 rounded-full" />
                </div>
                <span className="w-8 text-right font-medium text-slate-500">3%</span>
              </div>
            </div>
          </div>

          <div className="serva-card divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0A1F5C]">{rev.customerName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Verified Booking
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{rev.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((k) => (
                      <Star key={k} className={`w-3.5 h-3.5 ${k <= rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#0B5FD9]">{rev.serviceTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
       * TAB 6: SUPPORT & TICKETS (PDF §4)
       * ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C]">Partner Support & Tickets</h2>
              <p className="text-xs text-[#5B6B8C]">Need assistance with a job, customer, or payout? Raise a ticket.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#0B5FD9] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Raise Support Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <Phone className="w-5 h-5 text-[#0B5FD9]" />
              <h4 className="font-bold text-xs text-[#0A1F5C]">Partner Helpline Desk</h4>
              <p className="text-xs text-[#5B6B8C]">Direct priority line for verified partners.</p>
              <p className="font-mono font-bold text-sm text-[#0B5FD9]">+91 1800 425 8899</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-xs text-emerald-900">WhatsApp Dispatch Desk</h4>
              <p className="text-xs text-emerald-700">Immediate location & live job updates.</p>
              <p className="font-mono font-bold text-sm text-emerald-700">+91 98480 12345</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <Clock className="w-5 h-5 text-purple-700" />
              <h4 className="font-bold text-xs text-purple-900">Operational Hours</h4>
              <p className="text-xs text-purple-700">7:00 AM to 10:00 PM (Everyday)</p>
              <span className="inline-block text-[10px] font-bold text-purple-800">Average response: &lt; 15 mins</span>
            </div>
          </div>

          <div className="serva-card divide-y divide-slate-100">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#0B5FD9]">#{t.ticketNumber}</span>
                    <span className="text-xs font-bold text-[#0A1F5C]">{t.subject}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-[#5B6B8C]">Category: {t.category} · Created: {t.date}</p>
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100">
                  {t.lastReply}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
       * MODAL 1: WITHDRAWAL REQUEST (PDF §5: Minimum rule, UPI / Bank)
       * ──────────────────────────────────────────────────────────── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0A1F5C]">Request Withdrawal</h3>
                <p className="text-xs text-[#5B6B8C]">Minimum withdrawal rule: ₹500</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Amount to Withdraw (Available: ₹{Math.round(walletBalance / 100).toLocaleString('en-IN')})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="500"
                    max={Math.round(walletBalance / 100)}
                    required
                    value={withdrawAmountRupees}
                    onChange={(e) => setWithdrawAmountRupees(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Payout Destination</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMode('UPI')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      withdrawMode === 'UPI' ? 'bg-blue-50 border-[#0B5FD9] text-[#0B5FD9]' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMode('BANK')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      withdrawMode === 'BANK' ? 'bg-blue-50 border-[#0B5FD9] text-[#0B5FD9]' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Bank Account
                  </button>
                </div>

                {withdrawMode === 'UPI' ? (
                  <input
                    type="text"
                    value={withdrawUpi}
                    onChange={(e) => setWithdrawUpi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#0A1F5C]"
                    placeholder="name@upi"
                  />
                ) : (
                  <input
                    type="text"
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-[#0A1F5C]"
                    placeholder="Bank details"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#0B5FD9] text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Confirm & Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
       * MODAL 2: ADD FLEET MACHINERY
       * ──────────────────────────────────────────────────────────── */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0A1F5C]">Add Machinery to Fleet</h3>
              <button
                type="button"
                onClick={() => setShowAddMachineModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMachine} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Equipment Type</label>
                <input
                  type="text"
                  required
                  value={newMachineType}
                  onChange={(e) => setNewMachineType(e.target.value)}
                  placeholder="e.g. Combine Harvester, Tractor, JCB"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Make & Model</label>
                <input
                  type="text"
                  required
                  value={newMachineModel}
                  onChange={(e) => setNewMachineModel(e.target.value)}
                  placeholder="e.g. Mahindra 575 DI, Kubota DC70"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Hourly Rental Rate (₹/hr)</label>
                <input
                  type="number"
                  required
                  value={newMachineHourly}
                  onChange={(e) => setNewMachineHourly(e.target.value)}
                  placeholder="1200"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 rounded-full border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#0B5FD9] text-white text-xs font-bold">
                  Save to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
       * MODAL 3: RAISE SUPPORT TICKET
       * ──────────────────────────────────────────────────────────── */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0A1F5C]">Raise Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  <option value="Payment / Withdrawal">Payment / Withdrawal</option>
                  <option value="Customer Dispute">Customer Dispute</option>
                  <option value="Booking Cancellation">Booking Cancellation</option>
                  <option value="Account / Verification">Account / Verification</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Withdrawal pending more than 4 hours"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Explain the issue with relevant booking ID if applicable..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 rounded-full border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#0B5FD9] text-white text-xs font-bold">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
