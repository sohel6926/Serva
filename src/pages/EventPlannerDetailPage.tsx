import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Home,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  Users,
  Video,
  X,
  ArrowLeft,
  Music,
  Tv,
  Check,
} from 'lucide-react';
import {
  EventPlanner,
  EventPortfolioMedia,
  EventPreDecidedPackage,
  EventInquiry,
  EVENT_PLANNERS_DATA,
} from '../data/eventPlannersData.ts';
import { Link, useRouter } from '../lib/router.tsx';

interface EventPlannerDetailPageProps {
  plannerId: string;
}

export function EventPlannerDetailPage({ plannerId }: EventPlannerDetailPageProps) {
  const { navigate } = useRouter();

  // Find planner or fallback to first
  const planner: EventPlanner =
    EVENT_PLANNERS_DATA.find((p) => p.id === plannerId) || EVENT_PLANNERS_DATA[0];

  // Available package keys
  const packageKeys = Object.keys(planner.packages);
  const [selectedEventType, setSelectedEventType] = useState<string>(
    packageKeys[0] || 'Marriage / Wedding'
  );

  // Active portfolio filter
  const [portfolioTab, setPortfolioTab] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<EventPortfolioMedia | null>(null);

  // Quote Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-20');
  const [guestCount, setGuestCount] = useState<number>(350);
  const [venueLocation, setVenueLocation] = useState('Jubilee Hills, Hyderabad');
  const [budgetRange, setBudgetRange] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Pre-fill budget when event type changes
  useEffect(() => {
    const pkg = planner.packages[selectedEventType];
    if (pkg) {
      setBudgetRange(`${pkg.priceDisplay} – Pre-decided Package`);
    }
  }, [selectedEventType, planner]);

  // Scroll to quote form
  const handleScrollToQuoteForm = (pkgType?: string) => {
    if (pkgType) setSelectedEventType(pkgType);
    const elem = document.getElementById('planner-quote-form');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentPackage: EventPreDecidedPackage | undefined = planner.packages[selectedEventType];

  // Filtered portfolio
  const displayPortfolio = planner.portfolio.filter((item) => {
    if (portfolioTab === 'IMAGE') return item.mediaType === 'IMAGE';
    if (portfolioTab === 'VIDEO') return item.mediaType === 'VIDEO';
    return true;
  });

  // Nearby planners (excluding current)
  const nearbyPlanners = EVENT_PLANNERS_DATA.filter((p) => p.id !== planner.id).slice(0, 3);

  const handleSubmitQuoteInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) return;

    setIsSubmitting(true);
    const refId = `EVT-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const preDecidedPricePaise = currentPackage ? currentPackage.startingPricePaise : 15000000;
    const preDecidedPriceDisplay = currentPackage ? currentPackage.priceDisplay : '₹1,50,000';

    const newInquiry: EventInquiry = {
      id: refId,
      plannerId: planner.id,
      plannerName: planner.name,
      plannerBusiness: planner.businessName,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerEmail: customerEmail.trim() || undefined,
      eventType: selectedEventType,
      eventDate,
      guestCount,
      venueLocation: venueLocation.trim(),
      preDecidedPricePaise,
      preDecidedPriceDisplay,
      budgetRange: budgetRange.trim() || preDecidedPriceDisplay,
      notes: specialNotes.trim() || undefined,
      status: 'NEW',
      createdAt: 'Just now',
    };

    try {
      // 1. Sync to event inquiries
      const existing = localStorage.getItem('serva_event_inquiries');
      const list: EventInquiry[] = existing ? JSON.parse(existing) : [];
      list.unshift(newInquiry);
      localStorage.setItem('serva_event_inquiries', JSON.stringify(list));

      // 2. Sync to general enquiries for admin & partner panel
      const generalEnquiries = JSON.parse(localStorage.getItem('serva_enquiries') || '[]');
      generalEnquiries.unshift({
        refId,
        name: customerName,
        mobile: customerMobile,
        category: 'Event Services',
        service: `${planner.businessName} - ${selectedEventType}`,
        notes: `Guests: ${guestCount} | Venue: ${venueLocation} | Budget: ${budgetRange || preDecidedPriceDisplay}. ${specialNotes}`,
        callTime: `${eventDate} (Event Date)`,
        date: new Date().toISOString(),
      });
      localStorage.setItem('serva_enquiries', JSON.stringify(generalEnquiries));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore storage errors
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedInquiryId(refId);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F6F9FD] pb-24">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <div className="bg-white border-b border-[#DCE7F9] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/events/plan')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A1F5C] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Events</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#5B6B8C]">
              <Link to="/events" className="hover:text-[#0B5FD9]">Events</Link>
              <span>/</span>
              <Link to="/events/plan" className="hover:text-[#0B5FD9]">Event Planners</Link>
              <span>/</span>
              <span className="font-bold text-[#0A1F5C] truncate max-w-[150px] sm:max-w-xs">{planner.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScrollToQuoteForm()}
              className="px-4 py-2 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask for a Quote</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* ── Hero Studio Cover & Profile Banner ── */}
        <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-72 w-full bg-slate-900 overflow-hidden">
            <img
              src={planner.coverImage}
              alt={planner.businessName}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-extrabold border border-white/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified SERVA Event Planner</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Govt. Registered &amp; Verified</span>
              </span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              {/* Avatar + Main Title */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative shrink-0">
                  <img
                    src={planner.avatar}
                    alt={planner.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                  <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0A1F5C]">{planner.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B5FD9] font-black text-xs border border-blue-200">
                      {planner.firmName || planner.businessName}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0B5FD9]">{planner.businessName}</p>
                  <div className="flex items-center gap-2 text-xs text-[#5B6B8C] flex-wrap pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-[#0A1F5C]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {planner.locality}, {planner.city}
                    </span>
                    <span>&bull;</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {planner.distanceKm} km away from your location
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold">{planner.experienceYears} Years Experience</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <a
                  href={`tel:${planner.phone}`}
                  className="px-4 py-3 rounded-2xl bg-white border border-[#DCE7F9] hover:bg-slate-50 text-[#0A1F5C] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Call Studio</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleScrollToQuoteForm()}
                  className="px-6 py-3 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-blue-200" />
                  <span>Ask for a Quote</span>
                </button>
              </div>
            </div>

            {/* 6 Performance Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-[#EAF2FF]">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Rating</span>
                </div>
                <p className="text-lg font-black text-[#0A1F5C] mt-1">{planner.rating}</p>
                <p className="text-[10px] text-[#5B6B8C] font-semibold">{planner.reviewCount} client reviews</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <Award className="w-3.5 h-3.5 text-[#0B5FD9]" />
                  <span>Completed</span>
                </div>
                <p className="text-lg font-black text-[#0B5FD9] mt-1">{planner.completedEvents}+</p>
                <p className="text-[10px] text-emerald-700 font-bold">Successful Events</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On-Time Rate</span>
                </div>
                <p className="text-lg font-black text-emerald-600 mt-1">{planner.onTimeRate}</p>
                <p className="text-[10px] text-[#5B6B8C] font-semibold">Zero delay record</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Guest Capacity</span>
                </div>
                <p className="text-sm font-black text-[#0A1F5C] mt-1">{planner.guestCapacityRange || '100 – 5,000+'}</p>
                <p className="text-[10px] text-[#5B6B8C] font-semibold">Scale handled</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Packages</span>
                </div>
                <p className="text-lg font-black text-indigo-600 mt-1">{packageKeys.length}</p>
                <p className="text-[10px] text-[#5B6B8C] font-semibold">Pre-decided rates</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#5B6B8C]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Setup Guarantee</span>
                </div>
                <p className="text-xs font-black text-[#0A1F5C] mt-1.5">100% On-Time</p>
                <p className="text-[10px] text-[#5B6B8C] font-semibold">SERVA Protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Studio Overview & Specialties ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-[#DCE7F9] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0B5FD9]" />
              <h2 className="text-lg font-black text-[#0A1F5C]">About {planner.name} &amp; Studio</h2>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">
              {planner.bio ||
                `${planner.name} is one of Hyderabad's most acclaimed event planners with over ${planner.experienceYears} years of expertise in executing grand royal weddings, luxury floral mandaps, and world-class celebrations across Telangana.`}
            </p>

            <div className="pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#5B6B8C] mb-2.5">
                Core Specialties &amp; Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {planner.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-[#0B5FD9] font-bold text-xs border border-blue-200"
                  >
                    #{spec}
                  </span>
                ))}
              </div>
            </div>

            {/* In-House Production Capabilities */}
            <div className="pt-3 border-t border-[#EAF2FF]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#5B6B8C] mb-2.5">
                In-House Equipment &amp; Execution Infrastructure
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#0A1F5C]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>German Aluminum Stage Trussing &amp; Rigging</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>JBL Line-Array Sound &amp; Live Concert Audio Rigs</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>P3 High-Definition Curved Video LED Walls</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fresh Exotic &amp; Temple Flower Cold Storage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Studio Guarantees Card */}
          <div className="bg-gradient-to-br from-[#0A1F5C] to-[#0D2B82] rounded-3xl p-6 text-white shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold">SERVA Assurance Guarantee</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong className="block text-white">100% On-Time Setup Guarantee</strong>
                    <span className="text-blue-100">Decor and technical stage handover at least 2 hours before guests arrive.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong className="block text-white">Pre-Decided Fixed Quotation</strong>
                    <span className="text-blue-100">No hidden day-of surcharges; transparent milestone payments via SERVA escrow.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <strong className="block text-white">Dedicated Day-Of Event Manager</strong>
                    <span className="text-blue-100">A senior coordinator assigned on-site to handle bride/groom entries, sound, and lighting cues.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleScrollToQuoteForm()}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#0A1F5C] text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Request Custom Event Quote</span>
                <ChevronRight className="w-4 h-4 text-[#0B5FD9]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Pre-Decided Event Packages Section ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7F9] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF2FF] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B5FD9] text-xs font-black mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Pre-Decided Packages with Fixed Starting Prices</span>
              </div>
              <h2 className="text-xl font-black text-[#0A1F5C]">
                Explore Packages &amp; Pricing by {planner.name}
              </h2>
            </div>
            <p className="text-xs text-[#5B6B8C]">
              Select an event type to see itemized inclusions and exact pre-decided starting rates.
            </p>
          </div>

          {/* Event Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {packageKeys.map((key) => {
              const isSelected = selectedEventType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedEventType(key)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B5FD9] text-white shadow-md shadow-blue-500/25'
                      : 'bg-[#F4F8FE] text-[#5B6B8C] hover:bg-blue-50 hover:text-[#0B5FD9]'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Selected Package Details Display */}
          {currentPackage ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-[#D0E2FE] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0B5FD9] bg-[#EAF2FF] px-2.5 py-0.5 rounded-md">
                    Pre-Decided {currentPackage.eventType}
                  </span>
                  <h3 className="text-xl font-black text-[#0A1F5C] mt-1.5">
                    {currentPackage.packageName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#5B6B8C] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Setup Time: <strong>{currentPackage.setupTimeHours} Hours</strong></span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0B5FD9]" />
                      <span>Dedicated Lead Coordinator Included</span>
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs uppercase font-extrabold text-[#5B6B8C] block">
                    Pre-Decided Starting Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#0B5FD9] font-mono-num">
                    {currentPackage.priceDisplay}
                  </span>
                  <span className="text-[11px] text-[#5B6B8C] block">Includes materials, transport &amp; labor</span>
                </div>
              </div>

              {/* Package Inclusions Checklist */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0A1F5C]">
                  Itemized Package Inclusions:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPackage.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs text-xs font-bold text-[#0A1F5C]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button inside package */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DCE7F9]">
                <span className="text-xs text-[#5B6B8C]">
                  Need extra guest seating, custom flower choices, or DJ stage? All packages can be tailored.
                </span>
                <button
                  type="button"
                  onClick={() => handleScrollToQuoteForm(currentPackage.eventType)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Select &amp; Ask for a Quote for This Package</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#5B6B8C] italic">No pre-decided package available for this category.</p>
          )}
        </div>

        {/* ── Verified Past Work Showcase (Photos & Walkthrough Videos) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7F9] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAF2FF] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#0B5FD9]" />
                <h2 className="text-lg font-black text-[#0A1F5C]">
                  Verified Past Work Showcase ({displayPortfolio.length} Items)
                </h2>
              </div>
              <p className="text-xs text-[#5B6B8C] mt-1">
                Authentic decor photos and 4K walkthrough videos from actual events managed by {planner.name}.
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-[#F4F8FE] border border-[#DCE7F9] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPortfolioTab('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  portfolioTab === 'ALL' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                }`}
              >
                All Media
              </button>
              <button
                type="button"
                onClick={() => setPortfolioTab('IMAGE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  portfolioTab === 'IMAGE' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                }`}
              >
                Photos Only
              </button>
              <button
                type="button"
                onClick={() => setPortfolioTab('VIDEO')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  portfolioTab === 'VIDEO' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                }`}
              >
                Walkthrough Videos
              </button>
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayPortfolio.map((media) => {
              const isVideo = media.mediaType === 'VIDEO';
              return (
                <div
                  key={media.id}
                  onClick={() => setSelectedMediaForLightbox(media)}
                  className="group relative rounded-2xl overflow-hidden border border-[#DCE7F9] bg-slate-900 shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <img
                      src={media.thumbnailUrl || media.mediaUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Video Play Badge */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#0B5FD9]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Badges on overlay */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold border border-white/20">
                        {media.eventType}
                      </span>
                      {isVideo && media.videoDuration && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black flex items-center gap-1 shadow-xs">
                          <Video className="w-3 h-3" />
                          <span>{media.videoDuration}</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs font-bold leading-snug line-clamp-1">{media.title}</p>
                      <p className="text-[10px] text-blue-200 mt-0.5 line-clamp-1">
                        {media.venueName || 'Hyderabad'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between text-xs border-t border-[#EAF2FF]">
                    <span className="text-[11px] font-bold text-[#0B5FD9] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Details</span>
                    </span>
                    {media.guestCapacity && (
                      <span className="text-[11px] text-[#5B6B8C] font-semibold">
                        {media.guestCapacity} Guests
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5-Step Turnkey Event Execution Roadmap ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7F9] shadow-sm space-y-6">
          <div className="border-b border-[#EAF2FF] pb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0B5FD9] bg-blue-50 px-2.5 py-0.5 rounded-md">
              How We Deliver Zero-Stress Events
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#0A1F5C] mt-1.5">
              5-Step Turnkey Event Execution Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-[#0B5FD9] text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-extrabold text-[#0A1F5C]">Theme &amp; Budget Brief</h4>
              <p className="text-[11px] text-[#5B6B8C] leading-relaxed">
                Initial phone call within 2 hours to align on guest count, aesthetic themes, and budget ceilings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-[#0B5FD9] text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-extrabold text-[#0A1F5C]">Venue Recce &amp; 3D Plan</h4>
              <p className="text-[11px] text-[#5B6B8C] leading-relaxed">
                Site visit to measure stage dimensions, guest entry corridors, power sockets, and acoustical layout.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-[#0B5FD9] text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-extrabold text-[#0A1F5C]">Vendor &amp; Decor Lock-in</h4>
              <p className="text-[11px] text-[#5B6B8C] leading-relaxed">
                Advance reservation of exotic fresh florals, sound rigs, LED displays, and custom couple signage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-[#0B5FD9] text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="text-xs font-extrabold text-[#0A1F5C]">Pre-Setup &amp; Sound Check</h4>
              <p className="text-[11px] text-[#5B6B8C] leading-relaxed">
                Truss fabrication, lighting tests, and audio level checks completed 4 hours prior to guest arrival.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                5
              </span>
              <h4 className="text-xs font-extrabold text-emerald-900">Live Coordination</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Senior on-site coordinator manages entry cues, garlands, photo sessions, and seamless tear-down.
              </p>
            </div>
          </div>
        </div>

        {/* ── Interactive Quote Request Form ── */}
        <div id="planner-quote-form" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7F9] shadow-lg space-y-6">
          <div className="border-b border-[#EAF2FF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B5FD9] text-xs font-black mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Dedicated Quote &amp; Date Lock-in</span>
              </div>
              <h2 className="text-xl font-black text-[#0A1F5C]">
                Ask for a Quote: {planner.name}
              </h2>
            </div>
            <p className="text-xs text-[#5B6B8C]">
              Direct enquiry to {planner.businessName} &bull; No middleman surcharges
            </p>
          </div>

          {submittedInquiryId ? (
            <div className="p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-950">Quote Request Successfully Submitted!</h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                  Your reference ID is <strong className="font-mono">{submittedInquiryId}</strong>. {planner.name}&apos;s team
                  has received your event scope for <strong>{selectedEventType}</strong> on <strong>{eventDate}</strong> and will call you on <strong>{customerMobile}</strong> within 2 hours.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittedInquiryId(null)}
                  className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Submit Another Event Scope
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/events/plan')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Browse More Planners
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuoteInquiry} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Varma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Mobile Number (For WhatsApp / Call) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Event Type
                  </label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  >
                    {packageKeys.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Event Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Guest Count: <span className="text-[#0B5FD9]">{guestCount} Guests</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-[#0B5FD9] mt-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5B6B8C] font-semibold mt-1">
                    <span>50</span>
                    <span>500</span>
                    <span>1,000</span>
                    <span>2,000+</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Venue Location / Area in Hyderabad
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. JRC Convention, Jubilee Hills"
                      value={venueLocation}
                      onChange={(e) => setVenueLocation(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                    Estimated Budget Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,50,000 – ₹2,50,000"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                  Specific Decor Requests or Themes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Pastel floral entryway, cold pyros for bridal entry, LED stage with custom monogram..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#DCE7F9] text-xs font-medium text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-xs text-[#5B6B8C]">
                  🔒 Your contact information is only shared with verified planner {planner.name}.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Quote Request...' : `Ask ${planner.name.split(' ')[0]} for a Quote →`}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Nearby Event Planners in Hyderabad ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE7F9] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#0A1F5C]">
                Other Verified Event Planners in Hyderabad
              </h3>
              <p className="text-xs text-[#5B6B8C]">
                Explore other top-rated specialists within 10 km.
              </p>
            </div>
            <Link
              to="/events/plan"
              className="text-xs font-bold text-[#0B5FD9] hover:underline flex items-center gap-1"
            >
              <span>View All Planners</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {nearbyPlanners.map((near) => (
              <div
                key={near.id}
                onClick={() => navigate(`/events/planner/${near.id}`)}
                className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] hover:border-[#0B5FD9] transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={near.avatar}
                    alt={near.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-black text-[#0A1F5C] group-hover:text-[#0B5FD9] transition-colors leading-snug">
                      {near.name}
                    </h4>
                    <p className="text-[11px] text-[#0B5FD9] font-bold">{near.businessName}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5B6B8C] mt-0.5">
                      <span className="font-bold text-amber-600">★ {near.rating}</span>
                      <span>&bull;</span>
                      <span>{near.locality} ({near.distanceKm} km)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                  <span className="text-[#5B6B8C]">{near.completedEvents}+ Events Done</span>
                  <span className="font-bold text-[#0B5FD9] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lightbox / Video Modal ── */}
      {selectedMediaForLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedMediaForLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMediaForLightbox(null)}
              className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedMediaForLightbox.mediaType === 'VIDEO' ? (
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={selectedMediaForLightbox.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative max-h-[70vh] w-full flex items-center justify-center bg-black">
                <img
                  src={selectedMediaForLightbox.mediaUrl}
                  alt={selectedMediaForLightbox.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="p-5 bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-bold">{selectedMediaForLightbox.title}</h3>
                <span className="px-3 py-1 rounded-full bg-blue-600/50 text-blue-200 text-xs font-bold">
                  {selectedMediaForLightbox.eventType}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedMediaForLightbox.description}
              </p>
              {selectedMediaForLightbox.venueName && (
                <p className="text-[11px] text-amber-300 font-semibold">
                  Venue: {selectedMediaForLightbox.venueName} &bull; {selectedMediaForLightbox.guestCapacity || 500} Guests
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
