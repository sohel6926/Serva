import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Flame,
  HardHat,
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
} from 'lucide-react';
import {
  DesignerPortfolioMedia,
  InteriorDesigner,
  INITIAL_INTERIOR_DESIGNERS,
  DesignerInquiry,
} from '../../data/interiorDesignersData.ts';

interface InteriorDesignersDirectoryProps {
  onSelectDesignerForForm?: (designer: InteriorDesigner) => void;
}

export function InteriorDesignersDirectory({ onSelectDesignerForForm }: InteriorDesignersDirectoryProps) {
  // Designers List
  const [designers] = useState<InteriorDesigner[]>(INITIAL_INTERIOR_DESIGNERS);

  // Filters & Search
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'projects'>('rating');
  const [activeMediaFilter, setActiveMediaFilter] = useState<'ALL' | 'VIDEO' | 'IMAGE'>('ALL');

  // Modal State
  const [selectedDesignerForContact, setSelectedDesignerForContact] = useState<InteriorDesigner | null>(null);
  const [selectedMediaForLightbox, setSelectedMediaForLightbox] = useState<{
    media: DesignerPortfolioMedia;
    designer: InteriorDesigner;
  } | null>(null);

  // Contact Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Plot 42, Road No. 36, Jubilee Hills, Hyderabad');
  const [interiorScope, setInteriorScope] = useState('Full 3 BHK Home');
  const [budgetRange, setBudgetRange] = useState('₹15 Lakhs – ₹25 Lakhs');
  const [consultDate, setConsultDate] = useState('2026-11-26');
  const [consultTime, setConsultTime] = useState('11:00 AM');
  const [projectNotes, setProjectNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Filtered & Sorted Designers
  const filteredDesigners = designers
    .filter((d) => {
      if (selectedLocality !== 'All' && !d.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
        return false;
      }
      if (selectedStyle !== 'All') {
        const hasStyle = d.portfolio.some((p) => p.style.toLowerCase().includes(selectedStyle.toLowerCase()));
        const hasSpecialty = d.specialties.some((s) => s.toLowerCase().includes(selectedStyle.toLowerCase()));
        if (!hasStyle && !hasSpecialty) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'projects') return b.completedProjects - a.completedProjects;
      return 0;
    });

  const handleOpenContactModal = (designer: InteriorDesigner) => {
    setSelectedDesignerForContact(designer);
    setSubmittedInquiryId(null);
    if (onSelectDesignerForForm) {
      onSelectDesignerForForm(designer);
    }
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignerForContact) return;
    if (!customerName.trim() || !customerMobile.trim()) return;

    setIsSubmitting(true);
    const refId = `DSG-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInquiry: DesignerInquiry = {
      id: refId,
      designerId: selectedDesignerForContact.id,
      designerName: selectedDesignerForContact.name,
      designerBusiness: selectedDesignerForContact.businessName,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerCity: 'Hyderabad',
      customerAddress: customerAddress.trim(),
      scope: interiorScope,
      estimatedBudget: budgetRange,
      preferredDate: `${consultDate}, ${consultTime}`,
      notes: projectNotes.trim() || 'Turnkey interior design consultation requested via SERVA portal.',
      status: 'NEW',
      createdAt: 'Just now',
    };

    // Save to localStorage for Admin Panel & Partner Panel sync
    try {
      const existingInquiries: DesignerInquiry[] = JSON.parse(
        localStorage.getItem('serva_designer_inquiries') || '[]'
      );
      existingInquiries.unshift(newInquiry);
      localStorage.setItem('serva_designer_inquiries', JSON.stringify(existingInquiries));

      // Also register into general enquiries
      const generalEnquiries = JSON.parse(localStorage.getItem('serva_enquiries') || '[]');
      generalEnquiries.unshift({
        refId,
        name: customerName,
        mobile: customerMobile,
        category: 'Interior Design',
        service: `${selectedDesignerForContact.businessName} - ${interiorScope}`,
        notes: `Budget: ${budgetRange}. ${projectNotes}`,
        callTime: `${consultDate} at ${consultTime}`,
        date: new Date().toISOString(),
      });
      localStorage.setItem('serva_enquiries', JSON.stringify(generalEnquiries));
    } catch {
      // Ignore storage errors
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedInquiryId(refId);
    }, 400);
  };

  return (
    <section className="space-y-6">
      {/* ── Section Header & Proximity Count Bar ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#DCE7F9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B5FD9] text-xs font-extrabold border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span>Verified Local Professionals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A1F5C] tracking-tight">
              Interior Designers Near You
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B8C] mt-1">
              Showing <strong className="text-[#0A1F5C]">{filteredDesigners.length} top-rated interior design studios</strong>{' '}
              nearby with past project delivery records, client ratings, and walkthrough videos.
            </p>
          </div>

          {/* Quick Sort Control */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#5B6B8C]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-xl border border-[#DCE7F9] bg-[#F8FAFD] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
            >
              <option value="rating">★ Highest Rating</option>
              <option value="distance">📍 Nearest to Me</option>
              <option value="projects">🏆 Most Projects Done</option>
            </select>
          </div>
        </div>

        {/* Proximity / Locality Chips */}
        <div className="space-y-2 pt-2 border-t border-[#EAF2FF]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B8C] mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0B5FD9]" /> Area:
            </span>
            {['All', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Kondapur'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocality(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLocality === loc
                    ? 'bg-[#0B5FD9] text-white shadow-xs'
                    : 'bg-[#F1F6FF] text-[#5B6B8C] hover:bg-[#E2EEFF] hover:text-[#0A1F5C]'
                }`}
              >
                {loc === 'All' ? 'All Nearby (Within 6 km)' : loc}
              </button>
            ))}
          </div>

          {/* Style & Media Type Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B8C] mr-1">Design Style:</span>
              {['All', 'Modern Luxury', 'Minimalist', 'Scandinavian', 'Neo-Classical', 'Warm Bohemian'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-[#0A1F5C] text-white'
                      : 'bg-[#F8FAFD] text-[#5B6B8C] border border-[#DCE7F9] hover:bg-[#EAF2FF]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#F1F6FF] p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMediaFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeMediaFilter === 'ALL' ? 'bg-white text-[#0B5FD9] font-bold shadow-xs' : 'text-[#5B6B8C]'
                }`}
              >
                All Works
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaFilter('VIDEO')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  activeMediaFilter === 'VIDEO' ? 'bg-white text-[#0B5FD9] font-bold shadow-xs' : 'text-[#5B6B8C]'
                }`}
              >
                <Video className="w-3 h-3 text-[#0B5FD9]" />
                <span>Walkthrough Videos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Designers Directory List ── */}
      <div className="space-y-6">
        {filteredDesigners.map((designer) => {
          const displayMedia = designer.portfolio.filter((m) => {
            if (activeMediaFilter === 'VIDEO') return m.mediaType === 'VIDEO';
            if (activeMediaFilter === 'IMAGE') return m.mediaType === 'IMAGE';
            return true;
          });

          return (
            <div
              key={designer.id}
              className="bg-white rounded-3xl border border-[#DCE7F9] shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Designer Card Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#F9FBFF] via-white to-[#F6F9FD] border-b border-[#EAF2FF]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={designer.avatar}
                        alt={designer.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#0A1F5C] leading-snug">
                          {designer.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0B5FD9]">
                          {designer.badges[0]}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#0B5FD9]">{designer.businessName}</p>
                      <div className="flex items-center gap-2 text-xs text-[#5B6B8C] mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-[#0A1F5C]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {designer.locality}
                        </span>
                        <span>&bull;</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md">
                          {designer.distanceKm} km away
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold">{designer.experienceYears} Years Exp.</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary "Contact Designer" Button */}
                  <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenContactModal(designer)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-200" />
                      <span>Contact {designer.name.split(' ')[1] || 'Designer'}</span>
                    </button>
                  </div>
                </div>

                {/* Performance Metrics Bar (Crucial user request) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#EAF2FF]">
                  <div className="p-3 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B8C]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Rating & Reviews</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-[#0A1F5C]">{designer.rating}</span>
                      <span className="text-[11px] text-[#5B6B8C] font-semibold">({designer.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B8C]">
                      <Award className="w-3.5 h-3.5 text-[#0B5FD9]" />
                      <span>Past Projects</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-[#0B5FD9]">{designer.completedProjects}</span>
                      <span className="text-[11px] text-emerald-700 font-bold">Completed</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B8C]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>On-Time Handover</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-emerald-600">{designer.onTimeRate}</span>
                      <span className="text-[11px] text-[#5B6B8C] font-semibold">({designer.avgTurnaroundDays}d avg)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#DCE7F9] shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B8C]">
                      <Tag className="w-3.5 h-3.5 text-purple-600" />
                      <span>Estimated Rates</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-black text-[#0A1F5C]">{designer.pricePerSqFt}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties & Client Testimonial */}
                <div className="mt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {designer.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-0.5 rounded-lg bg-[#EBF2FE] text-[#0B5FD9] font-bold text-[11px]"
                      >
                        #{spec}
                      </span>
                    ))}
                  </div>

                  {designer.featuredTestimonial && (
                    <p className="text-[11px] text-[#5B6B8C] italic bg-[#F1F6FF] px-3 py-1.5 rounded-xl border border-[#DCE7F9] max-w-xl">
                      &ldquo;{designer.featuredTestimonial.comment}&rdquo; —{' '}
                      <strong className="text-[#0A1F5C]">{designer.featuredTestimonial.client}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Photos & Videos Portfolio Reel (Direct User Request) ── */}
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-[#0B5FD9]">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0A1F5C]">
                      Verified Past Work Showcase ({displayMedia.length} Photos & Walkthrough Videos)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#5B6B8C]">Click any photo/video for details</span>
                </div>

                {displayMedia.length === 0 ? (
                  <p className="text-xs text-[#5B6B8C] italic py-4">No media available for current filter.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {displayMedia.map((media) => {
                      const isVideo = media.mediaType === 'VIDEO';
                      return (
                        <div
                          key={media.id}
                          onClick={() => setSelectedMediaForLightbox({ media, designer })}
                          className="group relative rounded-2xl overflow-hidden border border-[#DCE7F9] bg-slate-900 shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                        >
                          {/* Image / Video Thumbnail */}
                          <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-950">
                            <img
                              src={media.thumbnailUrl}
                              alt={media.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {/* Video Play Badge / Image Badge */}
                            {isVideo ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-11 h-11 rounded-full bg-[#0B5FD9]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                            ) : null}

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold border border-white/20">
                                {media.roomType}
                              </span>
                              {isVideo && media.videoDuration && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black flex items-center gap-1 shadow-xs">
                                  <Video className="w-3 h-3" />
                                  <span>{media.videoDuration}</span>
                                </span>
                              )}
                            </div>

                            {/* Bottom Info on Overlay */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                              <p className="text-xs font-bold leading-snug line-clamp-1">{media.title}</p>
                              <div className="flex items-center justify-between text-[10px] text-blue-200 mt-0.5">
                                <span>{media.style}</span>
                                {media.budgetEst && <span className="font-extrabold text-white">{media.budgetEst}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Quick Card Footer */}
                          <div className="p-2.5 bg-white flex items-center justify-between text-xs border-t border-[#EAF2FF]">
                            <span className="text-[11px] font-bold text-[#0B5FD9] flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Project</span>
                            </span>
                            <span className="text-[11px] text-[#5B6B8C] font-semibold">{media.sqft || 'Turnkey'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL 1: DEDICATED "CONTACT DESIGNER" PRE-FILLED FORM ── */}
      {selectedDesignerForContact && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDesignerForContact(null);
            }
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              maxHeight: 'min(92vh, 760px)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              zIndex: 1000000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#0A1F5C] to-[#0B5FD9] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDesignerForContact.avatar}
                  alt={selectedDesignerForContact.name}
                  className="w-10 h-10 rounded-xl object-cover border border-white/30"
                />
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    Contact {selectedDesignerForContact.name}
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    {selectedDesignerForContact.businessName} &bull; {selectedDesignerForContact.locality}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDesignerForContact(null)}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {submittedInquiryId ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0A1F5C]">Consultation Request Dispatched!</h4>
                    <p className="text-xs text-[#5B6B8C] mt-1 max-w-sm mx-auto leading-relaxed">
                      Your interior design requirements have been delivered directly to{' '}
                      <strong>{selectedDesignerForContact.name}</strong>. They will review your floor plan & call you
                      shortly.
                    </p>
                    <div className="mt-3 inline-block px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono font-bold text-[#0B5FD9]">
                      Inquiry Ref: #{submittedInquiryId}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-left text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#5B6B8C]">Assigned Designer:</span>
                      <strong className="text-[#0A1F5C]">{selectedDesignerForContact.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6B8C]">Estimated Budget:</span>
                      <strong className="text-[#0B5FD9]">{budgetRange}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6B8C]">Scope of Work:</span>
                      <strong className="text-[#0A1F5C]">{interiorScope}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDesignerForContact(null)}
                      className="w-full py-2.5 rounded-xl bg-[#0B5FD9] text-white text-xs font-bold hover:bg-[#094FB6]"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitContactForm} className="space-y-3.5">
                  {/* Pre-filled Designer Notice */}
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5FD9]">
                        Selected Designer
                      </span>
                      <p className="font-extrabold text-[#0A1F5C]">
                        {selectedDesignerForContact.name} ({selectedDesignerForContact.businessName})
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ★ {selectedDesignerForContact.rating}
                    </span>
                  </div>

                  {/* Customer Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sanjay Reddy"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                      />
                    </div>
                  </div>

                  {/* Interior Scope & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Interior Scope</label>
                      <select
                        value={interiorScope}
                        onChange={(e) => setInteriorScope(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#0B5FD9]"
                      >
                        <option>Full 3 BHK Home</option>
                        <option>Full 2 BHK Home</option>
                        <option>Modular Kitchen Only</option>
                        <option>Living & Dining Room</option>
                        <option>Villa / Independent House</option>
                        <option>Office / Commercial Interior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Expected Budget</label>
                      <select
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#0B5FD9]"
                      >
                        <option>₹5 Lakhs – ₹10 Lakhs (Standard Modular)</option>
                        <option>₹10 Lakhs – ₹18 Lakhs (Premium 3BHK)</option>
                        <option>₹18 Lakhs – ₹30 Lakhs (Luxury Turnkey)</option>
                        <option>₹30 Lakhs+ (Ultra-Luxury Villa / Penthouse)</option>
                      </select>
                    </div>
                  </div>

                  {/* Site Address */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Apartment / Site Address</label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="e.g. Flat 1204, DSR Fortune Prime, Madhapur"
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>

                  {/* Consultation Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Preferred Consultation Date</label>
                      <input
                        type="date"
                        value={consultDate}
                        onChange={(e) => setConsultDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Preferred Time Slot</label>
                      <select
                        value={consultTime}
                        onChange={(e) => setConsultTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-[#0B5FD9]"
                      >
                        <option>10:00 AM (Morning)</option>
                        <option>11:30 AM (Morning)</option>
                        <option>02:30 PM (Afternoon)</option>
                        <option>04:30 PM (Evening)</option>
                        <option>06:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Project Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                      Project Notes / Special Wishes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder="e.g. Require Italian kitchen finish, acoustic wooden panels, and false ceiling..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Dispatching to Designer...' : 'Submit Consultation Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: FULL-SCREEN PORTFOLIO MEDIA LIGHTBOX & VIDEO PLAYER ── */}
      {selectedMediaForLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedMediaForLightbox(null);
            }
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '820px',
              maxHeight: 'min(94vh, 850px)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0A1428',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              zIndex: 1000000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="px-5 py-3.5 bg-black/50 border-b border-white/10 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0B5FD9] text-white text-[10px] font-bold">
                  {selectedMediaForLightbox.media.roomType}
                </span>
                <span className="text-xs font-bold text-blue-200">
                  {selectedMediaForLightbox.designer.name} ({selectedMediaForLightbox.designer.businessName})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMediaForLightbox(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Media Player / Viewer */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[500px]">
              {selectedMediaForLightbox.media.mediaType === 'VIDEO' ? (
                <video
                  src={selectedMediaForLightbox.media.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[500px] object-contain"
                />
              ) : (
                <img
                  src={selectedMediaForLightbox.media.mediaUrl}
                  alt={selectedMediaForLightbox.media.title}
                  className="w-full h-full max-h-[500px] object-contain"
                />
              )}
            </div>

            {/* Lightbox Details & Contact Footer */}
            <div className="p-5 bg-[#0D1D3A] text-white space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {selectedMediaForLightbox.media.title}
                  </h4>
                  <p className="text-xs text-blue-200/80 mt-1">
                    Style: <strong>{selectedMediaForLightbox.media.style}</strong> &bull; Size:{' '}
                    <strong>{selectedMediaForLightbox.media.sqft || 'Turnkey'}</strong> &bull; Estimated Cost:{' '}
                    <strong className="text-emerald-400">{selectedMediaForLightbox.media.budgetEst}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const dsg = selectedMediaForLightbox.designer;
                    setSelectedMediaForLightbox(null);
                    handleOpenContactModal(dsg);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Similar Design Consultation</span>
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed border-t border-white/10 pt-2">
                {selectedMediaForLightbox.media.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
