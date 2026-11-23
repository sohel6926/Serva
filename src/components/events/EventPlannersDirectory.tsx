import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Flame,
  Heart,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  Video,
  X,
  XCircle,
  Users,
  Compass,
  ChevronRight,
} from 'lucide-react';
import {
  EventPlanner,
  EventPortfolioMedia,
  EventPreDecidedPackage,
  EventInquiry,
  EVENT_PLANNERS_DATA,
} from '../../data/eventPlannersData.ts';
import { Link, useRouter } from '../../lib/router.tsx';

interface EventPlannersDirectoryProps {
  selectedEventType?: string;
  onSelectPlannerForQuote?: (planner: EventPlanner) => void;
}

export function EventPlannersDirectory({
  selectedEventType = 'Marriage / Wedding',
  onSelectPlannerForQuote,
}: EventPlannersDirectoryProps) {
  const { navigate } = useRouter();
  const [planners] = useState<EventPlanner[]>(EVENT_PLANNERS_DATA);

  // Filters & State
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'completed'>('rating');
  const [activeMediaTab, setActiveMediaTab] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');

  // Modal State
  const [selectedPlannerForQuote, setSelectedPlannerForQuote] = useState<EventPlanner | null>(null);
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<{
    media: EventPortfolioMedia;
    planner: EventPlanner;
  } | null>(null);

  // Quote Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-15');
  const [guestCount, setGuestCount] = useState<number>(350);
  const [venueLocation, setVenueLocation] = useState('Jubilee Hills, Hyderabad');
  const [budgetRange, setBudgetRange] = useState('₹1,50,000 – ₹2,50,000');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Filtered and Sorted Planners
  const filteredPlanners = planners
    .filter((p) => {
      if (selectedLocality !== 'All' && !p.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'completed') return b.completedEvents - a.completedEvents;
      return 0;
    });

  const handleOpenQuoteModal = (planner: EventPlanner) => {
    setSelectedPlannerForQuote(planner);
    setSubmittedInquiryId(null);

    // Pre-populate budget based on pre-decided package if available
    const pkg = planner.packages[selectedEventType];
    if (pkg) {
      setBudgetRange(`${pkg.priceDisplay} – Standard Package`);
    }

    if (onSelectPlannerForQuote) {
      onSelectPlannerForQuote(planner);
    }
  };

  const handleSubmitQuoteInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlannerForQuote) return;
    if (!customerName.trim() || !customerMobile.trim()) return;

    setIsSubmitting(true);
    const inqId = `EVT-INQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentPkg = selectedPlannerForQuote.packages[selectedEventType];
    const preDecidedPricePaise = currentPkg ? currentPkg.startingPricePaise : 15000000;
    const preDecidedPriceDisplay = currentPkg ? currentPkg.priceDisplay : '₹1,50,000';

    const newInquiry: EventInquiry = {
      id: inqId,
      plannerId: selectedPlannerForQuote.id,
      plannerName: selectedPlannerForQuote.name,
      plannerBusiness: selectedPlannerForQuote.businessName,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerEmail: customerEmail.trim() || undefined,
      eventType: selectedEventType,
      eventDate,
      guestCount,
      venueLocation: venueLocation.trim(),
      preDecidedPricePaise,
      preDecidedPriceDisplay,
      budgetRange,
      notes: specialNotes.trim() || undefined,
      status: 'NEW',
      createdAt: 'Just now',
    };

    try {
      const existing = localStorage.getItem('serva_event_inquiries');
      const list: EventInquiry[] = existing ? JSON.parse(existing) : [];
      list.unshift(newInquiry);
      localStorage.setItem('serva_event_inquiries', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedInquiryId(inqId);
    }, 450);
  };

  return (
    <section className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A1F5C] via-[#0B5FD9] to-[#0A1F5C] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold text-amber-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Event Planners &amp; Portfolios Near You</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Event Planners &amp; Pre-Decided Packages
            </h2>
            
            <p className="text-sm text-blue-100 leading-relaxed">
              Explore portfolios, past decor photos, walkthrough videos, and pre-decided event package pricing for{' '}
              <strong className="text-white underline decoration-amber-400 decoration-2">{selectedEventType}</strong>. Ask for a free instant quote directly from your preferred planner.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Nearby Planners</span>
            <span className="text-3xl font-black text-amber-400 mt-0.5">{filteredPlanners.length} Available</span>
            <span className="text-xs text-blue-100 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>Hyderabad Operating Hub</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Locality Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE7F9] p-3.5 sm:p-4 shadow-sm space-y-3.5">
        {/* Locality Quick Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-[#5B6B8C] flex items-center gap-1 mr-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-[#0B5FD9]" />
            <span>Locality:</span>
          </span>
          {['All', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Secunderabad', 'Kukatpally'].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setSelectedLocality(loc)}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLocality === loc
                  ? 'bg-[#0B5FD9] text-white shadow-xs'
                  : 'bg-[#F4F8FE] text-[#5B6B8C] hover:bg-[#EAF2FF] hover:text-[#0A1F5C] border border-[#DCE7F9]'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Sort & Media Filter Bar */}
        <div className="pt-2.5 border-t border-[#EAF2FF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sort By Filter */}
          <div className="flex items-center gap-2 text-xs text-[#5B6B8C] w-full sm:w-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span className="font-bold text-[#0A1F5C]">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'distance' | 'completed')}
              className="flex-1 sm:flex-none bg-[#F8FAFD] border border-[#DCE7F9] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
            >
              <option value="rating">Top Rated (4.9+)</option>
              <option value="distance">Nearest to Me (km)</option>
              <option value="completed">Most Completed Events</option>
            </select>
          </div>

          {/* Media Filter Tabs */}
          <div className="inline-flex rounded-xl p-0.5 bg-[#F4F8FE] border border-[#DCE7F9] w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setActiveMediaTab('ALL')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeMediaTab === 'ALL' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
              }`}
            >
              All Media
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('IMAGE')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeMediaTab === 'IMAGE' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
              }`}
            >
              Photos
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('VIDEO')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeMediaTab === 'VIDEO' ? 'bg-white text-[#0B5FD9] shadow-2xs' : 'text-[#5B6B8C]'
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Planner Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlanners.map((planner) => {
          // Pre-decided package for this event type
          const currentPackage: EventPreDecidedPackage | undefined = planner.packages[selectedEventType];

          // Portfolio media filtered by tab
          const displayMedia = planner.portfolio.filter((m) => {
            if (activeMediaTab === 'IMAGE') return m.mediaType === 'IMAGE';
            if (activeMediaTab === 'VIDEO') return m.mediaType === 'VIDEO';
            return true;
          });

          return (
            <div
              key={planner.id}
              className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                {/* Top: Planner Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className="relative cursor-pointer shrink-0 group"
                      onClick={() => navigate(`/events/planner/${planner.id}`)}
                      title={`View ${planner.name}'s Full Profile`}
                    >
                      <img
                        src={planner.avatar}
                        alt={planner.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0B5FD9] shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/events/planner/${planner.id}`}
                          className="text-base font-bold text-[#0A1F5C] hover:text-[#0B5FD9] transition-colors leading-snug flex items-center gap-1 group"
                        >
                          <span>{planner.name}</span>
                          <ChevronRight className="w-4 h-4 text-[#0B5FD9] group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified Planner</span>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0B5FD9]">{planner.businessName}</p>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#5B6B8C] flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{planner.rating}</span>
                          <span className="text-[10px] text-[#5B6B8C] font-normal">({planner.reviewCount})</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0B5FD9]" />
                          <span>{planner.locality}</span>
                          <strong className="text-[#0A1F5C]">({planner.distanceKm} km away)</strong>
                        </span>
                      </div>

                      {/* Bio snippet */}
                      {planner.bio && (
                        <p className="text-xs text-[#475569] mt-2 line-clamp-2 leading-relaxed">
                          {planner.bio}
                        </p>
                      )}

                      {/* Capacity & Guarantees Bar */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span>{planner.guestCapacityRange || '100 – 5,000+ Guests'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% On-Time Setup</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Completed</span>
                    <span className="text-base font-black text-[#0A1F5C]">{planner.completedEvents}+</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">{planner.onTimeRate} On-Time</span>
                  </div>
                </div>

                {/* Pre-Decided Event Package & Price Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white border border-[#D0E2FE] space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B5FD9] bg-[#EAF2FF] px-2 py-0.5 rounded-md">
                        Pre-Decided {selectedEventType} Package
                      </span>
                      <h4 className="text-sm font-bold text-[#0A1F5C] mt-1">
                        {currentPackage ? currentPackage.packageName : `Standard ${selectedEventType} Package`}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pre-Decided Starting Price</span>
                      <span className="text-lg font-black text-[#0B5FD9] font-mono-num">
                        {currentPackage ? currentPackage.priceDisplay : '₹1,50,000'}
                      </span>
                    </div>
                  </div>

                  {/* Highlights / Inclusions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentPackage?.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold text-[#0A1F5C] bg-white px-2 py-0.5 rounded-md border border-[#DCE7F9] shadow-2xs"
                      >
                        ✓ {h}
                      </span>
                    )) || (
                      <span className="text-[11px] text-[#5B6B8C]">
                        Customized theme decor, sound, lighting, and stage arrangements included.
                      </span>
                    )}
                  </div>

                  {/* Multiple package price preview */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#DCE7F9]/60 text-[11px]">
                    <span className="font-extrabold text-[#5B6B8C] text-[10px] uppercase">Other Packages:</span>
                    {Object.entries(planner.packages).slice(0, 3).map(([type, pkg]) => (
                      <span key={type} className="px-2 py-0.5 rounded-md bg-white/90 text-[#0A1F5C] font-black border border-[#DCE7F9] text-[10px]">
                        {type.split('/')[0].trim()}: {pkg.priceDisplay}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio Media Reel (Photos & Videos) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A1F5C] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#0B5FD9]" />
                      <span>Past Performance &amp; Work Portfolio ({displayMedia.length})</span>
                    </span>
                    <span className="text-[10px] text-[#5B6B8C]">Click any to inspect in HD</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {displayMedia.slice(0, 3).map((media) => (
                      <div
                        key={media.id}
                        onClick={() => setSelectedMediaForLightbox({ media, planner })}
                        className="group relative aspect-video rounded-xl bg-slate-900 overflow-hidden cursor-pointer shadow-2xs border border-[#EAF2FF]"
                      >
                        <img
                          src={media.thumbnailUrl || media.mediaUrl}
                          alt={media.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {media.mediaType === 'VIDEO' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 text-[#0B5FD9] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        )}

                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold text-white truncate">
                          {media.title}
                        </span>

                        {media.mediaType === 'VIDEO' && media.videoDuration && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                            {media.videoDuration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-[#F8FAFD] border-t border-[#EAF2FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#5B6B8C] truncate">
                  <span>Specialties: </span>
                  <strong className="text-[#0A1F5C]">{planner.specialties.slice(0, 2).join(', ')}</strong>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/events/planner/${planner.id}`}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#0B5FD9] text-[#0B5FD9] hover:bg-blue-50 text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0B5FD9]" />
                    <span>View Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenQuoteModal(planner)}
                    className="px-4 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask for a Quote</span>
                  </button>
                </div>
              </div>

              {/* Full Width Bottom Card Banner */}
              <Link
                to={`/events/planner/${planner.id}`}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 hover:from-blue-100 hover:to-indigo-100 border-t border-[#DCE7F9] flex items-center justify-between text-xs font-bold text-[#0B5FD9] transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#0B5FD9] shrink-0" />
                  <span className="text-[#0A1F5C] truncate">
                    Explore {planner.name}&apos;s full portfolio, packages, walkthrough videos &amp; guest reviews
                  </span>
                </div>
                <span className="flex items-center gap-1 font-black text-[#0B5FD9] group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                  <span>Details &amp; Packages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Quote Enquiry Form Modal */}
      {selectedPlannerForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DCE7F9] max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPlannerForQuote.avatar}
                  alt={selectedPlannerForQuote.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#0B5FD9]"
                />
                <div>
                  <h3 className="text-base font-bold text-[#0A1F5C]">
                    Ask for a Quote: {selectedPlannerForQuote.name}
                  </h3>
                  <p className="text-xs text-[#5B6B8C]">
                    {selectedPlannerForQuote.businessName} &bull; {selectedPlannerForQuote.locality} ({selectedPlannerForQuote.distanceKm} km away)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlannerForQuote(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedInquiryId ? (
              /* Success Confirmation */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#0A1F5C]">Quotation Request Submitted!</h4>
                  <p className="text-xs text-[#5B6B8C] max-w-sm mx-auto">
                    Your quote inquiry has been routed to <strong>{selectedPlannerForQuote.name}</strong>. Reference ID:{' '}
                    <span className="font-mono font-bold text-[#0B5FD9] bg-blue-50 px-2 py-0.5 rounded">
                      #{submittedInquiryId}
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs text-left space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-[#5B6B8C]">Event Type:</span>
                    <strong className="text-[#0A1F5C]">{selectedEventType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6B8C]">Pre-Decided Starting Rate:</span>
                    <strong className="text-[#0B5FD9]">
                      {selectedPlannerForQuote.packages[selectedEventType]?.priceDisplay || '₹1,50,000'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6B8C]">Planned Date:</span>
                    <strong className="text-[#0A1F5C]">{eventDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6B8C]">Expected Response Time:</span>
                    <strong className="text-emerald-700">Within 30 Minutes (Direct Call &amp; WhatsApp)</strong>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlannerForQuote(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Done &amp; Return to Events
                  </button>
                </div>
              </div>
            ) : (
              /* Quote Form */
              <form onSubmit={handleSubmitQuoteInquiry} className="space-y-4">
                {/* Pre-Decided Event Package Banner */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-800 block">Selected Event</span>
                    <strong className="text-sm font-bold text-[#0A1F5C]">{selectedEventType}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Pre-Decided Starting Package</span>
                    <span className="text-base font-extrabold text-[#0B5FD9] font-mono-num">
                      {selectedPlannerForQuote.packages[selectedEventType]?.priceDisplay || '₹1,50,000'}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>
                </div>

                {/* Event Date and Guests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Planned Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Estimated Guest Count</label>
                    <input
                      type="number"
                      min={20}
                      max={10000}
                      step={25}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>
                </div>

                {/* Venue Locality */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Venue or Locality in Hyderabad</label>
                  <input
                    type="text"
                    placeholder="e.g. Hitex Convention / Private Lawn, Jubilee Hills"
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                {/* Budget Range Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Estimated Budget Range</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      '₹25,000 – ₹50,000',
                      '₹50,000 – ₹1,00,000',
                      '₹1,00,000 – ₹2,00,000',
                      '₹2,00,000 – ₹3,50,000',
                      '₹3,50,000 – ₹5,00,000',
                      '₹5,00,000+ Luxury',
                    ].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudgetRange(b)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          budgetRange === b
                            ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                            : 'bg-[#F8FAFD] text-[#5B6B8C] border-[#DCE7F9] hover:bg-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Specific Theme or Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need yellow floral urli, live DJ sound box, and entrance archway."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#DCE7F9] rounded-xl text-xs font-medium text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>

                {/* Notice */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#5B6B8C] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your quote request is 100% free with no booking obligation. The planner will contact you directly with an itemized quote.
                  </span>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlannerForQuote(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Quote Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Media Lightbox Modal */}
      {selectedMediaForLightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl text-white space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">{selectedMediaForLightbox.media.title}</h4>
                <p className="text-xs text-slate-400">
                  {selectedMediaForLightbox.planner.name} &bull; {selectedMediaForLightbox.media.venueName || selectedMediaForLightbox.planner.locality}
                </p>
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
              {selectedMediaForLightbox.media.mediaType === 'VIDEO' ? (
                <video
                  src={selectedMediaForLightbox.media.mediaUrl}
                  poster={selectedMediaForLightbox.media.thumbnailUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedMediaForLightbox.media.mediaUrl}
                  alt={selectedMediaForLightbox.media.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
              <p className="text-slate-300 max-w-lg">{selectedMediaForLightbox.media.description}</p>
              <button
                type="button"
                onClick={() => {
                  const planner = selectedMediaForLightbox.planner;
                  setSelectedMediaForLightbox(null);
                  handleOpenQuoteModal(planner);
                }}
                className="px-4 py-2 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white font-bold shrink-0 cursor-pointer"
              >
                Request Quote for this Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
