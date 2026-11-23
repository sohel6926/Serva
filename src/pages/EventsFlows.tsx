import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Disc3,
  Info,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { PortfolioGallery } from '../components/gallery/PortfolioGallery.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';
import { EventPlannersDirectory } from '../components/events/EventPlannersDirectory.tsx';

interface LaunchService {
  slug: 'decoration' | 'catering' | 'dance' | 'singing' | 'photography' | 'dj';
  name: string;
  basePaise: number;
  samplePackagePaise: number;
  unitLabel: string;
  description: string;
}

interface DjProfile {
  id: string;
  partnerId: string;
  name: string;
  experienceYears: number;
  languages: string[];
  genres: string[];
  equipmentSummary: string;
  quotedPricePaise: number;
  availabilityDates: string[];
  videoUrl: string;
  rating: number;
}

interface AddonItem {
  id: string;
  name: string;
  pricePaise: number;
}

/* ============================================================================
 * 1. INDIVIDUAL EVENT SERVICE PAGE (including Standalone DJ with NO subcategories)
 * ========================================================================== */
export function EventServiceFlowPage({ serviceSlug }: { serviceSlug: string }) {
  const { user, city } = useAuth();
  const { navigate } = useRouter();

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [services, setServices] = useState<LaunchService[]>([]);
  const [djProfiles, setDjProfiles] = useState<DjProfile[]>([]);

  const [eventType, setEventType] = useState('Marriage / Wedding');
  const [eventName, setEventName] = useState('Celebration Event');
  const [eventDate, setEventDate] = useState('2026-11-28');
  const [startTime, setStartTime] = useState('06:00 PM');
  const [endTime, setEndTime] = useState('11:00 PM');
  const [venueType, setVenueType] = useState<'INDOOR' | 'OUTDOOR'>('INDOOR');
  const [guestCount, setGuestCount] = useState(250);
  const [selectedDjId, setSelectedDjId] = useState('dj-vikram');
  const [line1, setLine1] = useState('JRC Convention, Jubilee Hills');
  const [area, setArea] = useState('Jubilee Hills');
  const [pincode, setPincode] = useState('500033');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events/catalog')
      .then((r) => r.json())
      .then((d) => {
        setEventTypes(d.eventTypes ?? []);
        setServices(d.launchServices ?? []);
        setDjProfiles(d.djProfiles ?? []);
      })
      .catch(() => {});
  }, []);

  const currentService = useMemo(
    () => services.find((s) => s.slug === serviceSlug) ?? services[0],
    [services, serviceSlug]
  );

  const activeDj = useMemo(
    () => djProfiles.find((d) => d.id === selectedDjId) ?? djProfiles[0],
    [djProfiles, selectedDjId]
  );

  const estimatedTotalPaise =
    serviceSlug === 'dj' && activeDj
      ? activeDj.quotedPricePaise
      : serviceSlug === 'catering' && currentService
      ? currentService.basePaise * guestCount
      : currentService?.basePaise ?? 1200000;
  const advance30Paise = Math.round((estimatedTotalPaise * 30) / 100);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate(`/login?next=/events/${serviceSlug}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/events/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventType,
          eventName: eventName.trim() || `${eventType}`,
          eventDate,
          startTime,
          endTime,
          venueType,
          guestCount,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          selectedServiceSlugs: [serviceSlug as LaunchService['slug']],
          cateringPlates: guestCount,
          djProfileId: serviceSlug === 'dj' ? selectedDjId : undefined,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not create event quotation.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting event request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/events" className="hover:text-[#0B5FD9] font-medium">
          Events
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">
          {serviceSlug === 'dj' ? 'DJ (Standalone)' : currentService?.name || serviceSlug}
        </span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wide">
            {serviceSlug === 'dj' ? <Disc3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {serviceSlug === 'dj' ? 'Standalone Direct DJ Booking (No Subcategories)' : 'Individual Event Service'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
            {currentService?.name || 'Event Service'}
          </h1>
          <p className="text-sm text-[#5B6B8C] mt-1 max-w-2xl">
            {currentService?.description ||
              'Configure your event date, guests, and venue details. No advance payment = No confirmed booking.'}
          </p>
        </div>
        <Link to="/events/plan" className="serva-pill-btn text-xs">
          Combine with Other Event Services <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* DJ Profiles with Experience, Performance Videos, Availability & Quoted Price (Test 8) */}
      {serviceSlug === 'dj' && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0A1F5C]">Choose Your Verified DJ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {djProfiles.map((dj) => {
              const selected = selectedDjId === dj.id;
              return (
                <div
                  key={dj.id}
                  className={`serva-card p-5 space-y-4 border-2 transition-all ${
                    selected ? 'border-[#0B5FD9] bg-[#F5F9FF]/60' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1F5C]">{dj.name}</h3>
                      <p className="text-xs text-[#5B6B8C]">
                        {dj.experienceYears} years experience ·{' '}
                        <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {dj.rating}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0B5FD9] font-mono-num">
                        ₹{Math.round(dj.quotedPricePaise / 100).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] font-semibold text-[#5B6B8C]">Quoted package</span>
                    </div>
                  </div>

                  <video
                    src={dj.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-44 rounded-xl bg-black object-cover"
                  />

                  <div className="text-xs text-[#0A1F5C] space-y-1">
                    <p>
                      <strong>Equipment:</strong> {dj.equipmentSummary}
                    </p>
                    <p>
                      <strong>Languages:</strong> {dj.languages.join(', ')} · <strong>Genres:</strong>{' '}
                      {dj.genres.join(', ')}
                    </p>
                    <p className="text-[#16A34A] font-semibold">
                      Available dates: {dj.availabilityDates.join(', ')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDjId(dj.id)}
                    className={`w-full min-h-[44px] rounded-full text-xs font-bold cursor-pointer ${
                      selected
                        ? 'bg-[#0B5FD9] text-white'
                        : 'bg-[#EAF2FF] text-[#0B5FD9] hover:bg-blue-100'
                    }`}
                  >
                    {selected ? 'Selected for Booking ✓' : 'Select This DJ'}
                  </button>
                </div>
              );
            })}
          </div>
          <PortfolioGallery
            category="events"
            subCategory="dj"
            heading="DJ Live Reels"
            subtitle="Preview real mixing & lighting clips before locking your advance"
          />
        </section>
      )}

      {serviceSlug === 'decoration' && (
        <PortfolioGallery
          category="events"
          subCategory="decoration"
          heading="Mandap & Theme Gallery"
          subtitle="Browse sample stage, floral, and lighting setups"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleBook} className="lg:col-span-7 serva-card p-6 space-y-4">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-type" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Type
              </label>
              <select
                id="ev-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ev-name" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Name / Occasion
              </label>
              <input
                id="ev-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="ev-date" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Date
              </label>
              <input
                id="ev-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <div>
              <label htmlFor="ev-start" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Start Time
              </label>
              <input
                id="ev-start"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <div>
              <label htmlFor="ev-end" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                End Time
              </label>
              <input
                id="ev-end"
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-guests" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Guest Count
              </label>
              <input
                id="ev-guests"
                type="number"
                min={10}
                max={10000}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(10, Number(e.target.value)))}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>
            <div>
              <label htmlFor="ev-venue" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Venue Type
              </label>
              <select
                id="ev-venue"
                value={venueType}
                onChange={(e) => setVenueType(e.target.value as 'INDOOR' | 'OUTDOOR')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                <option value="INDOOR">Indoor Hall</option>
                <option value="OUTDOOR">Outdoor Lawn</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="ev-addr" className="block text-xs font-semibold text-[#0A1F5C]">
              Venue Address
            </label>
            <input
              id="ev-addr"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                aria-label="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <input
                type="text"
                aria-label="PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special requests, song preferences, dietary notes, or setup timings..."
            className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Generating Quotation...' : 'Review Quotation & Pay 30% Advance'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <aside className="lg:col-span-5 serva-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Advance Schedule</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5B6B8C]">Estimated Event Total</span>
              <span className="font-mono-num font-bold text-[#0A1F5C]">
                ₹{Math.round(estimatedTotalPaise / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-[#0B5FD9] font-bold">
              <span>30% Advance Required Now</span>
              <span className="font-mono-num">
                ₹{Math.round(advance30Paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#EAF2FF]/60 border border-[#C7DCFF] text-xs text-[#0A1F5C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
            <span>
              No advance payment = No confirmed booking. Your official Booking ID is issued only after advance payment succeeds and the vendor accepts.
            </span>
          </div>
        </aside>
      </div>

      {/* Verified Event Planners Portfolios & Pre-Decided Event Packages */}
      <EventPlannersDirectory selectedEventType={eventType} />
    </div>
  );
}

/* ============================================================================
 * 2. MULTI-SERVICE COMPLETE EVENT PLANNER (/events/plan — Test 6 & Test 7)
 * ========================================================================== */
export function EventsPlanPage() {
  const { user, city } = useAuth();
  const { navigate } = useRouter();

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [launchServices, setLaunchServices] = useState<LaunchService[]>([]);
  const [otherAddons, setOtherAddons] = useState<AddonItem[]>([]);

  const [eventType, setEventType] = useState('Marriage / Wedding');
  const [eventName, setEventName] = useState('Reddy Family Wedding (Sample)');
  const [eventDate, setEventDate] = useState('2026-12-12');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 PM');
  const [guestCount, setGuestCount] = useState(400);
  const [selectedSlugs, setSelectedSlugs] = useState<LaunchService['slug'][]>([
    'decoration',
    'catering',
    'photography',
  ]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [useMarriageSamplePreset, setUseMarriageSamplePreset] = useState(false);
  const [line1, setLine1] = useState('Hitex Convention Hall, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events/catalog')
      .then((r) => r.json())
      .then((d) => {
        setEventTypes(d.eventTypes ?? []);
        setLaunchServices(d.launchServices ?? []);
        setOtherAddons(d.otherAddons ?? []);
      })
      .catch(() => {});
  }, []);

  const loadSampleMarriage = () => {
    setEventType('Marriage / Wedding');
    setEventName('Complete Marriage Sample Package');
    setSelectedSlugs(['decoration', 'catering', 'photography', 'dance', 'singing', 'dj']);
    setSelectedAddonIds(['ev-other-bundle']);
    setUseMarriageSamplePreset(true);
  };

  const toggleService = (slug: LaunchService['slug']) => {
    setUseMarriageSamplePreset(false);
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleAddon = (id: string) => {
    setUseMarriageSamplePreset(false);
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const lines = useMemo(() => {
    const out: Array<{ label: string; amountPaise: number }> = [];
    for (const slug of selectedSlugs) {
      const s = launchServices.find((x) => x.slug === slug);
      if (!s) continue;
      const amt = useMarriageSamplePreset
        ? s.samplePackagePaise
        : slug === 'catering'
        ? s.basePaise * guestCount
        : s.basePaise;
      out.push({ label: s.name, amountPaise: amt });
    }
    for (const aid of selectedAddonIds) {
      const a = otherAddons.find((x) => x.id === aid);
      if (a) out.push({ label: a.name, amountPaise: a.pricePaise });
    }
    return out;
  }, [selectedSlugs, selectedAddonIds, launchServices, otherAddons, useMarriageSamplePreset, guestCount]);

  const totalPaise = lines.reduce((sum, l) => sum + l.amountPaise, 0);
  const advance30Paise = Math.round((totalPaise * 30) / 100);
  const preEvent40Paise = Math.round((totalPaise * 40) / 100);
  const balanceAfterAdvancePaise = totalPaise - advance30Paise;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/events/plan');
      return;
    }
    if (selectedSlugs.length === 0) {
      setError('Select at least one launch service to generate your event quotation.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/events/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventType,
          eventName,
          eventDate,
          startTime,
          endTime,
          venueType: 'INDOOR',
          guestCount,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          selectedServiceSlugs: selectedSlugs,
          selectedAddonIds,
          useMarriageSamplePreset,
          cateringPlates: guestCount,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not create event quotation.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting event quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/events" className="hover:text-[#0B5FD9] font-medium">
          Events
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">Complete Multi-Service Event Planner</span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wide">
            <Calendar className="w-4 h-4" /> Multi-Service Event Quotation
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
            Combine Multiple Services in One Event Quote
          </h1>
          <p className="text-sm text-[#5B6B8C] mt-1">
            Each service shows separately in your itemised quote. 30% advance confirms your booking.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleMarriage}
          className="min-h-[44px] px-5 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
        >
          Load Sample Marriage Quotation (₹2,90,000)
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 serva-card p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B8C]">
              1. Pick Services (6 Launch Services)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {launchServices.map((svc) => {
                const active = selectedSlugs.includes(svc.slug);
                return (
                  <button
                    key={svc.slug}
                    type="button"
                    onClick={() => toggleService(svc.slug)}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-2 cursor-pointer ${
                      active ? 'border-[#0B5FD9] bg-[#EAF2FF]/70' : 'border-[#DCE7F9] bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#0A1F5C]">{svc.name}</p>
                      <p className="text-xs font-mono-num text-[#0B5FD9] mt-0.5">
                        ₹{Math.round((useMarriageSamplePreset ? svc.samplePackagePaise : svc.basePaise) / 100).toLocaleString('en-IN')}{' '}
                        · {svc.unitLabel}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#0B5FD9] text-white' : 'border border-[#DCE7F9]'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B8C]">
              Optional Event Add-ons
            </p>
            <div className="flex flex-wrap gap-2">
              {otherAddons.map((a) => {
                const active = selectedAddonIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAddon(a.id)}
                    className={`min-h-[38px] px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                      active ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]' : 'border-[#DCE7F9] text-[#0A1F5C]'
                    }`}
                  >
                    {a.name} (₹{Math.round(a.pricePaise / 100).toLocaleString('en-IN')})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAF2FF]">
            <div>
              <label htmlFor="pl-type" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Type
              </label>
              <select
                id="pl-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pl-name" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Name
              </label>
              <input
                id="pl-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="pl-date" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Event Date
              </label>
              <input
                id="pl-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <div>
              <label htmlFor="pl-guests" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Guest Count Calculator
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#5B6B8C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="pl-guests"
                  type="number"
                  min={10}
                  max={10000}
                  value={guestCount}
                  onChange={(e) => {
                    setUseMarriageSamplePreset(false);
                    setGuestCount(Math.max(10, Number(e.target.value)));
                  }}
                  className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </div>
            </div>
            <div>
              <label htmlFor="pl-time" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Time Window
              </label>
              <input
                id="pl-time"
                type="text"
                value={`${startTime} - ${endTime}`}
                onChange={(e) => {
                  const [s, en] = e.target.value.split('-');
                  if (s) setStartTime(s.trim());
                  if (en) setEndTime(en.trim());
                }}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pl-addr" className="block text-xs font-semibold text-[#0A1F5C]">
              Venue Address
            </label>
            <input
              id="pl-addr"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                aria-label="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
              <input
                type="text"
                aria-label="PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Creating Multi-Service Quote...' : 'Lock Quote & Pay 30% Advance'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Right: Itemised Multi-Service Quote & Milestone Breakdown */}
        <aside className="lg:col-span-5 serva-card p-6 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Itemised Event Quote</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>

          <div className="space-y-2 text-sm border-b border-[#EAF2FF] pb-4">
            {lines.map((l) => (
              <div key={l.label} className="flex justify-between text-[#0A1F5C]">
                <span className="pr-2">{l.label}</span>
                <span className="font-mono-num font-semibold shrink-0">
                  ₹{Math.round(l.amountPaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-bold text-[#0A1F5C] text-base">
              <span>Combined Total</span>
              <span className="font-mono-num text-xl text-[#0B5FD9]">
                ₹{Math.round(totalPaise / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[#16A34A]">
              <span>30% Advance Due Now</span>
              <span className="font-mono-num">
                ₹{Math.round(advance30Paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#5B6B8C]">
              <span>40% Pre-Event Milestone</span>
              <span className="font-mono-num">
                ₹{Math.round(preEvent40Paise / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#5B6B8C]">
              <span>Remaining Balance After Advance</span>
              <span className="font-mono-num">
                ₹{Math.round(balanceAfterAdvancePaise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EAF2FF]/60 border border-[#C7DCFF] text-xs text-[#0A1F5C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
            <span>
              No advance payment = No confirmed booking. Pay the 30% advance to receive your confirmed Booking ID once vendors accept.
            </span>
          </div>
        </aside>
      </div>

      {/* Verified Event Planners Portfolios & Pre-Decided Event Packages */}
      <EventPlannersDirectory selectedEventType={eventType} />
    </div>
  );
}
