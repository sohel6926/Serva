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
  Building2,
  Layers,
  Compass,
} from 'lucide-react';
import {
  InteriorDesigner,
  DesignerPortfolioMedia,
  INITIAL_INTERIOR_DESIGNERS,
  DesignerInquiry,
} from '../data/interiorDesignersData.ts';
import { Link, useRouter } from '../lib/router.tsx';

interface InteriorDesignerDetailPageProps {
  designerId: string;
}

export function InteriorDesignerDetailPage({ designerId }: InteriorDesignerDetailPageProps) {
  const { navigate } = useRouter();

  // Find designer or default to first
  const designer: InteriorDesigner =
    INITIAL_INTERIOR_DESIGNERS.find((d) => d.id === designerId) || INITIAL_INTERIOR_DESIGNERS[0];

  const otherDesigners = INITIAL_INTERIOR_DESIGNERS.filter((d) => d.id !== designer.id);

  // Portfolio Filters
  const [activeRoomFilter, setActiveRoomFilter] = useState<string>('All');
  const [activeMediaFilter, setActiveMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<DesignerPortfolioMedia | null>(null);

  // Consultation Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Jubilee Hills, Hyderabad');
  const [interiorScope, setInteriorScope] = useState('Full 3 BHK Home');
  const [selectedPackage, setSelectedPackage] = useState('3 BHK Premium Luxury (₹14.5 Lakhs)');
  const [budgetRange, setBudgetRange] = useState('₹15 Lakhs – ₹25 Lakhs');
  const [consultDate, setConsultDate] = useState('2026-11-26');
  const [consultTime, setConsultTime] = useState('11:00 AM');
  const [projectNotes, setProjectNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Unique Room Types
  const roomTypes = ['All', ...Array.from(new Set(designer.portfolio.map((m) => m.roomType)))];

  // Filtered Portfolio Media
  const filteredPortfolio = designer.portfolio.filter((item) => {
    if (activeRoomFilter !== 'All' && item.roomType !== activeRoomFilter) return false;
    if (activeMediaFilter === 'IMAGE' && item.mediaType === 'VIDEO') return false;
    if (activeMediaFilter === 'VIDEO' && item.mediaType !== 'VIDEO') return false;
    return true;
  });

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) return;

    setIsSubmitting(true);
    const inqId = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInquiry: DesignerInquiry = {
      id: inqId,
      designerId: designer.id,
      designerName: designer.name,
      designerBusiness: designer.businessName,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      scope: `${interiorScope} (${selectedPackage})`,
      roomType: interiorScope,
      budgetRange,
      scheduledDate: `${consultDate} at ${consultTime}`,
      notes: projectNotes.trim() || undefined,
      status: 'NEW',
      createdAt: 'Just now',
    };

    try {
      const existing = localStorage.getItem('serva_designer_inquiries');
      const list: DesignerInquiry[] = existing ? JSON.parse(existing) : [];
      list.unshift(newInquiry);
      localStorage.setItem('serva_designer_inquiries', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedInquiryId(inqId);
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── Breadcrumb & Back Button ── */}
      <div className="flex items-center justify-between gap-3 text-xs text-[#5B6B8C]">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#0B5FD9] font-medium flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link to="/contractors" className="hover:text-[#0B5FD9] font-medium">
            Contractors
          </Link>
          <span>/</span>
          <Link to="/contractors/interior-design" className="hover:text-[#0B5FD9] font-medium">
            Interior Design
          </Link>
          <span>/</span>
          <span className="text-[#0A1F5C] font-bold">{designer.name}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/contractors/interior-design')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE7F9] bg-white text-[#0A1F5C] text-xs font-bold hover:bg-[#F1F6FF] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0B5FD9]" />
          <span>Back to All Designers</span>
        </button>
      </div>

      {/* ── Hero Profile Header Card ── */}
      <div className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm overflow-hidden">
        {/* Cover Photo Banner */}
        <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={designer.coverImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80'}
            alt={designer.businessName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              {designer.locality}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              Verified Studio
            </span>
          </div>
        </div>

        {/* Profile Info Overlay & Top Bar */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-[#EAF2FF]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <img
                  src={designer.avatar}
                  alt={designer.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-[#0B5FD9]/30"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0A1F5C] tracking-tight">
                    {designer.name}
                  </h1>
                  {designer.badges.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#0B5FD9] border border-blue-200"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <p className="text-sm font-bold text-[#0B5FD9] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>{designer.businessName}</span>
                </p>

                <div className="flex items-center gap-3 text-xs text-[#5B6B8C] flex-wrap pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-[#0A1F5C]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{designer.locality}</span>
                    <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                      {designer.distanceKm} km away
                    </strong>
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold">{designer.experienceYears} Years Industry Exp.</span>
                  <span>&bull;</span>
                  <span className="text-[#0B5FD9] font-bold">COA Lic. #HYD-CA-4491</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <a
                href="#consultation-booking-form"
                className="flex-1 lg:flex-initial px-5 py-3 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book Free Consultation</span>
              </a>

              <a
                href={`tel:${designer.phone}`}
                className="px-4 py-3 rounded-2xl border border-[#DCE7F9] bg-[#F8FAFD] hover:bg-[#EAF2FF] text-[#0A1F5C] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#0B5FD9]" />
                <span>Call Studio</span>
              </a>

              <a
                href={`https://wa.me/91${designer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${designer.name}, I found your portfolio on SERVA and would like to consult with you for my home interiors.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 6 Metric Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Client Rating</span>
              <div className="flex items-center gap-1 text-base font-black text-[#0A1F5C]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{designer.rating}</span>
                <span className="text-[11px] text-[#5B6B8C] font-normal">/ 5.0</span>
              </div>
              <span className="text-[10px] text-[#5B6B8C] font-semibold block">{designer.reviewCount} Verified Reviews</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Handover Projects</span>
              <p className="text-base font-black text-[#0B5FD9] font-mono-num">{designer.completedProjects}+ Homes</p>
              <span className="text-[10px] text-emerald-700 font-bold block">100% Verified Quality</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">On-Time Execution</span>
              <p className="text-base font-black text-emerald-600 font-mono-num">{designer.onTimeRate}</p>
              <span className="text-[10px] text-[#5B6B8C] block">{designer.avgTurnaroundDays} Days Avg. Delivery</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Turnkey Rates</span>
              <p className="text-xs font-black text-[#0A1F5C] leading-snug">{designer.pricePerSqFt}</p>
              <span className="text-[10px] text-purple-700 font-semibold block">Transparent Pricing</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Total Space Done</span>
              <p className="text-base font-black text-[#0A1F5C] font-mono-num">180,000+</p>
              <span className="text-[10px] text-[#5B6B8C] block">Sq.ft Designed</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Warranty</span>
              <p className="text-base font-black text-emerald-700 font-mono-num">10 Years</p>
              <span className="text-[10px] text-emerald-600 font-bold block">Hardware &amp; Materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Left Content (8 cols) & Right Sidebar (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* About Designer & Design Approach */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAF2FF] pb-3">
              <Sparkles className="w-4 h-4 text-[#0B5FD9]" />
              <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C]">
                About {designer.name} &amp; Studio Philosophy
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {designer.bio} With over {designer.experienceYears} years of hands-on architectural experience across Hyderabad&apos;s prime residential belts, {designer.name} blends functional ergonomics with high-end European craftsmanship. Every project is executed with 3D photometric lighting analysis, precision factory-cut CNC carpentry, and zero-compromise BWR marine ply substrates.
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#0A1F5C] block">Design Specialties &amp; Signatures:</span>
              <div className="flex flex-wrap gap-2">
                {designer.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-xl bg-[#F4F8FE] text-[#0A1F5C] font-bold text-xs border border-[#DCE7F9]"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Coverage */}
            <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#E2EEFE] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0A1F5C] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0B5FD9]" />
                  <span>Prime Areas Serviced in Hyderabad:</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Free Site Visit Available
                </span>
              </div>
              <p className="text-slate-600">
                Jubilee Hills, Banjara Hills, Gachibowli, Financial District, Madhapur, Hitec City, Kondapur, Kokapet, Narsingi, Tellapur, and surrounding residential communities.
              </p>
            </div>
          </div>

          {/* Turnkey Pricing Packages */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAF2FF] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#0B5FD9]" />
                <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C]">
                  Standard Turnkey Packages &amp; Deliverables
                </h2>
              </div>
              <span className="text-xs text-[#5B6B8C]">Customizable per floorplan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Package 1 */}
              <div className="p-4 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#5B6B8C] tracking-wider">2 BHK Turnkey</span>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">Essential Modular Finish</h3>
                  <p className="text-xl font-black text-[#0B5FD9] font-mono-num">₹9.5 Lakhs <span className="text-xs font-normal text-slate-500">approx</span></p>
                  <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <li>✓ High-Gloss Acrylic Kitchen</li>
                    <li>✓ 2 Wardrobes with Lofts</li>
                    <li>✓ Living Room TV Console</li>
                    <li>✓ Concealed LED False Ceiling</li>
                  </ul>
                </div>
                <a
                  href="#consultation-booking-form"
                  onClick={() => setSelectedPackage('2 BHK Turnkey Modular (₹9.5 Lakhs)')}
                  className="w-full py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0B5FD9] font-bold text-xs text-center transition-colors block"
                >
                  Select Package
                </a>
              </div>

              {/* Package 2 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-white border-2 border-[#0B5FD9] shadow-sm space-y-3 flex flex-col justify-between relative">
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#0B5FD9] text-white text-[9px] font-black uppercase">
                  Most Popular
                </span>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#0B5FD9] tracking-wider">3 BHK Luxury</span>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">Full Turnkey Modern Living</h3>
                  <p className="text-xl font-black text-[#0B5FD9] font-mono-num">₹14.5 Lakhs <span className="text-xs font-normal text-slate-500">approx</span></p>
                  <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <li>✓ Italian PU Polish Modular Kitchen</li>
                    <li>✓ Fluted Veneer Panelling in Living Room</li>
                    <li>✓ 3 Sliding Wardrobes with Sensor LEDs</li>
                    <li>✓ Master Suite Acoustic Headboard &amp; Study</li>
                    <li>✓ Full Home Ambient COB Lighting</li>
                  </ul>
                </div>
                <a
                  href="#consultation-booking-form"
                  onClick={() => setSelectedPackage('3 BHK Premium Luxury (₹14.5 Lakhs)')}
                  className="w-full py-2 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white font-bold text-xs text-center transition-colors block shadow-xs"
                >
                  Select Package
                </a>
              </div>

              {/* Package 3 */}
              <div className="p-4 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-[#5B6B8C] tracking-wider">4 BHK / Villa</span>
                  <h3 className="text-sm font-bold text-[#0A1F5C]">Bespoke Architectural Luxury</h3>
                  <p className="text-xl font-black text-[#0B5FD9] font-mono-num">₹24.0 Lakhs <span className="text-xs font-normal text-slate-500">approx</span></p>
                  <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <li>✓ Imported Quartz Island Kitchen</li>
                    <li>✓ Italian Marble Cladded TV Unit</li>
                    <li>✓ Walk-in Wardrobes with Tinted Glass</li>
                    <li>✓ Acoustic Home Theatre Room Setup</li>
                    <li>✓ Balcony Vertical Garden &amp; Decking</li>
                  </ul>
                </div>
                <a
                  href="#consultation-booking-form"
                  onClick={() => setSelectedPackage('4 BHK / Villa Bespoke (₹24.0 Lakhs)')}
                  className="w-full py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0B5FD9] font-bold text-xs text-center transition-colors block"
                >
                  Select Package
                </a>
              </div>
            </div>
          </div>

          {/* ── Verified Portfolio Showcase (Direct User Request) ── */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF2FF] pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0B5FD9]" />
                  <span>Verified Project Showcase ({filteredPortfolio.length} Works)</span>
                </h2>
                <p className="text-xs text-[#5B6B8C]">
                  High-definition walkthrough videos and completed project photos with actual execution costs.
                </p>
              </div>

              {/* Media Type Toggle */}
              <div className="inline-flex rounded-xl p-0.5 bg-[#F4F8FE] border border-[#DCE7F9]">
                <button
                  type="button"
                  onClick={() => setActiveMediaFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMediaFilter === 'ALL' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
                  }`}
                >
                  All Works
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaFilter('IMAGE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMediaFilter === 'IMAGE' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
                  }`}
                >
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaFilter('VIDEO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeMediaFilter === 'VIDEO' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
                  }`}
                >
                  <Video className="w-3 h-3 text-[#0B5FD9]" />
                  <span>Videos</span>
                </button>
              </div>
            </div>

            {/* Room Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {roomTypes.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setActiveRoomFilter(room)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeRoomFilter === room
                      ? 'bg-[#0A1F5C] text-white shadow-xs'
                      : 'bg-[#F4F8FE] text-[#5B6B8C] hover:text-[#0A1F5C] border border-[#DCE7F9]'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPortfolio.map((media) => (
                <div
                  key={media.id}
                  onClick={() => setSelectedMediaForLightbox(media)}
                  className="group rounded-2xl border border-[#DCE7F9] overflow-hidden bg-white shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={media.thumbnailUrl || media.mediaUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                    {media.mediaType === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-[#0B5FD9] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold">
                        {media.roomType}
                      </span>
                      {media.mediaType === 'VIDEO' && media.videoDuration && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>{media.videoDuration}</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <div className="flex items-center justify-between text-white text-[11px] font-bold">
                        <span>{media.style}</span>
                        {media.budgetEst && (
                          <span className="font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                            {media.budgetEst}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0A1F5C] leading-snug group-hover:text-[#0B5FD9] transition-colors">
                      {media.title}
                    </h3>
                    <p className="text-[11px] text-[#5B6B8C] line-clamp-2 leading-relaxed">
                      {media.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#0B5FD9]">
                      <span>{media.sqft ? `${media.sqft} carpet area` : 'Full execution'}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Inspect Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Execution Timeline */}
          <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0B5FD9]" />
              <span>Turnkey Execution Timeline ({designer.avgTurnaroundDays}-Day Delivery Guarantee)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <span className="font-mono font-bold text-[#0B5FD9] text-[11px] block">Days 1–3</span>
                <strong className="text-[#0A1F5C] block">Site Survey &amp; 2D Floorplan</strong>
                <p className="text-[11px] text-[#5B6B8C]">Laser measurement &amp; preliminary layout briefing.</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <span className="font-mono font-bold text-[#0B5FD9] text-[11px] block">Days 4–10</span>
                <strong className="text-[#0A1F5C] block">3D Visuals &amp; Moodboard</strong>
                <p className="text-[11px] text-[#5B6B8C]">Photorealistic 3D renders &amp; material selection.</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <span className="font-mono font-bold text-[#0B5FD9] text-[11px] block">Days 11–25</span>
                <strong className="text-[#0A1F5C] block">Factory Modular Production</strong>
                <p className="text-[11px] text-[#5B6B8C]">CNC cutting, edge-banding &amp; PU lacquering in factory.</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <span className="font-mono font-bold text-[#0B5FD9] text-[11px] block">Days 26–36</span>
                <strong className="text-[#0A1F5C] block">On-Site Woodwork &amp; False Ceiling</strong>
                <p className="text-[11px] text-[#5B6B8C]">Assembly, painting, electrical wiring &amp; lights fitting.</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-mono font-bold text-emerald-700 text-[11px] block">Days 37–40</span>
                <strong className="text-emerald-900 block">Snag Cleaning &amp; Handover</strong>
                <p className="text-[11px] text-emerald-700">Deep polish, key handover &amp; 10-year warranty card.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Consultation Booking Form (4 cols) */}
        <div id="consultation-booking-form" className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl border-2 border-[#0B5FD9]/30 p-6 shadow-lg space-y-5">
            <div className="border-b border-[#EAF2FF] pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B5FD9] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                Direct Designer Dispatch
              </span>
              <h3 className="text-lg font-black text-[#0A1F5C] mt-1.5">
                Book Consultation with {designer.name.split(' ')[1] || designer.name}
              </h3>
              <p className="text-xs text-[#5B6B8C] mt-0.5">
                100% Free site measurement &amp; 3D quote. Zero advance required for consultation.
              </p>
            </div>

            {submittedInquiryId ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-[#0A1F5C]">Consultation Confirmed!</h4>
                  <p className="text-xs text-[#5B6B8C]">
                    Your request has been routed directly to {designer.name}. Reference:{' '}
                    <span className="font-mono font-bold text-[#0B5FD9]">#{submittedInquiryId}</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs text-left space-y-1">
                  <div>Date: <strong>{consultDate} at {consultTime}</strong></div>
                  <div>Designer Phone: <strong>+91 {designer.phone}</strong></div>
                  <div>Studio: <strong>{designer.businessName}</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmittedInquiryId(null)}
                  className="w-full py-2.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-bold hover:bg-[#094FB6]"
                >
                  Book Another Visit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsultation} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Property Address / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Rainbow Towers, Gachibowli"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#0A1F5C] mb-1">Property Scope</label>
                    <select
                      value={interiorScope}
                      onChange={(e) => setInteriorScope(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    >
                      <option value="Full 3 BHK Home">Full 3 BHK Home</option>
                      <option value="Full 2 BHK Home">Full 2 BHK Home</option>
                      <option value="4 BHK / Duplex Villa">4 BHK / Villa</option>
                      <option value="Modular Kitchen Only">Modular Kitchen</option>
                      <option value="Living Room & Foyer">Living &amp; Foyer</option>
                      <option value="Commercial / Office">Office Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0A1F5C] mb-1">Target Budget</label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    >
                      <option value="₹8 Lakhs – ₹15 Lakhs">₹8L – ₹15L</option>
                      <option value="₹15 Lakhs – ₹25 Lakhs">₹15L – ₹25L</option>
                      <option value="₹25 Lakhs – ₹40 Lakhs">₹25L – ₹40L</option>
                      <option value="₹40 Lakhs+ Bespoke">₹40L+ Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#0A1F5C] mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={consultDate}
                      onChange={(e) => setConsultDate(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0A1F5C] mb-1">Preferred Time</label>
                    <select
                      value={consultTime}
                      onChange={(e) => setConsultTime(e.target.value)}
                      className="w-full px-2.5 py-2 border border-[#DCE7F9] rounded-xl font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0A1F5C] mb-1">Special Requirements (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need Italian marble TV wall and smart lights."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCE7F9] rounded-xl font-medium text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified by SERVA. Direct studio dispatch within 30 mins.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching to Studio...' : 'Confirm Free Consultation'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Other Nearby Interior Designers in Hyderabad ── */}
      <div className="bg-white rounded-3xl border border-[#DCE7F9] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAF2FF] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0A1F5C]">
              Other Verified Designers Nearby
            </h2>
            <p className="text-xs text-[#5B6B8C]">Compare portfolios, rates, and past performance.</p>
          </div>
          <Link
            to="/contractors/interior-design"
            className="text-xs font-bold text-[#0B5FD9] hover:underline flex items-center gap-1"
          >
            <span>View All Designers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherDesigners.slice(0, 3).map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/contractors/interior-design/designer/${d.id}`)}
              className="p-4 rounded-2xl border border-[#DCE7F9] hover:border-[#0B5FD9] hover:shadow-md transition-all cursor-pointer bg-[#F8FAFD] space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={d.avatar}
                  alt={d.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#DCE7F9]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#0A1F5C] leading-snug">{d.name}</h4>
                  <p className="text-xs text-[#0B5FD9] font-medium">{d.businessName}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#5B6B8C] mt-0.5">
                    <span className="flex items-center gap-0.5 font-bold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{d.rating}</span>
                    </span>
                    <span>&bull;</span>
                    <span>{d.locality} ({d.distanceKm} km)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">{d.pricePerSqFt}</span>
                <span className="font-bold text-[#0B5FD9] flex items-center gap-1">
                  <span>View Profile</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Media Lightbox Modal ── */}
      {selectedMediaForLightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-white space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  {selectedMediaForLightbox.roomType} &bull; {selectedMediaForLightbox.style}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{selectedMediaForLightbox.title}</h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMediaForLightbox(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              {selectedMediaForLightbox.mediaType === 'VIDEO' ? (
                <video
                  src={selectedMediaForLightbox.mediaUrl}
                  poster={selectedMediaForLightbox.thumbnailUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedMediaForLightbox.mediaUrl}
                  alt={selectedMediaForLightbox.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <div className="space-y-1 max-w-xl">
                <p className="text-slate-300 leading-relaxed">{selectedMediaForLightbox.description}</p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  {selectedMediaForLightbox.sqft && <span>Area: <strong className="text-white">{selectedMediaForLightbox.sqft}</strong></span>}
                  {selectedMediaForLightbox.budgetEst && <span>Execution Cost: <strong className="text-emerald-400">{selectedMediaForLightbox.budgetEst}</strong></span>}
                </div>
              </div>

              <a
                href="#consultation-booking-form"
                onClick={() => {
                  setSelectedMediaForLightbox(null);
                  setProjectNotes(`Interested in design style of "${selectedMediaForLightbox.title}" (${selectedMediaForLightbox.roomType}).`);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white font-bold shrink-0 cursor-pointer text-center"
              >
                Request Quote for this Room
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
