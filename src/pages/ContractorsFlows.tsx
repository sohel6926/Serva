import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Hammer,
  HardHat,
  Info,
  Sofa,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { PortfolioGallery } from '../components/gallery/PortfolioGallery.tsx';
import { InteriorDesignersDirectory } from '../components/contractors/InteriorDesignersDirectory.tsx';
import type { InteriorDesigner } from '../data/interiorDesignersData.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

interface WorkerTrade {
  id: string;
  name: string;
  dailyRatePaise: number;
  specialty: string;
}

interface MachineryItem {
  id: string;
  group: 'Earth-moving' | 'Material transport' | 'Concrete' | 'Road construction';
  name: string;
  ratePaise: number;
  unitLabel: string;
  operatorDefault: boolean;
}

const FURNITURE_CATEGORIES = ['Chair', 'Sofa', 'Bed', 'Table', 'Wardrobe', 'TV Unit', 'Modular Kitchen'];

export function ContractorsSectionPage({ section }: { section: string }) {
  const { user, city } = useAuth();
  const { navigate } = useRouter();

  const [workerTrades, setWorkerTrades] = useState<WorkerTrade[]>([]);
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);

  // Shared booking state
  const [scheduledDate, setScheduledDate] = useState('2026-11-24');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [line1, setLine1] = useState('Plot 22, Financial District, Nanakramguda');
  const [area, setArea] = useState('Gachibowli');
  const [pincode, setPincode] = useState('500032');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Workers state
  const [selectedTradeId, setSelectedTradeId] = useState('cw-mason');
  const [workerCount, setWorkerCount] = useState(4);
  const [days, setDays] = useState(5);

  // Machinery state
  const [machineGroup, setMachineGroup] = useState<string>('All');
  const [selectedMachineId, setSelectedMachineId] = useState('cm-jcb');
  const [durationUnits, setDurationUnits] = useState(4);
  const [operatorRequired, setOperatorRequired] = useState(true);

  // Interior / Furniture state
  const [selectedDesigner, setSelectedDesigner] = useState<InteriorDesigner | null>(null);
  const [interiorRoomType, setInteriorRoomType] = useState('Full 3 BHK Home');
  const [furnitureCategory, setFurnitureCategory] = useState('Sofa');

  // Home Construction Free Enquiry state (Test 12)
  const [buildingType, setBuildingType] = useState('Residential Independent House (G+1)');
  const [plotSize, setPlotSize] = useState('240 sq. yds (2,160 sq. ft.)');
  const [budgetRange, setBudgetRange] = useState('₹45 Lakhs – ₹65 Lakhs');
  const [location, setLocation] = useState('Kompally, Hyderabad');
  const [timeline, setTimeline] = useState('6–9 Months');
  const [enquirySent, setEnquirySent] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetch('/api/contractors/catalog')
      .then((r) => r.json())
      .then((d) => {
        setWorkerTrades(d.workerTrades ?? []);
        setMachinery(d.machinery ?? []);
      })
      .catch(() => {});
  }, []);

  const activeTrade = useMemo(
    () => workerTrades.find((t) => t.id === selectedTradeId) ?? workerTrades[0],
    [workerTrades, selectedTradeId]
  );

  const filteredMachinery = useMemo(
    () => (machineGroup === 'All' ? machinery : machinery.filter((m) => m.group === machineGroup)),
    [machinery, machineGroup]
  );

  const activeMachine = useMemo(
    () => machinery.find((m) => m.id === selectedMachineId) ?? machinery[0],
    [machinery, selectedMachineId]
  );

  const submitContractorBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate(`/login?next=/contractors/${section}`);
      return;
    }

    const serviceSlug =
      section === 'interior-design'
        ? 'interior-design'
        : section === 'furniture'
        ? 'furniture-design'
        : section === 'workers'
        ? 'site-workers'
        : activeMachine?.group === 'Material transport'
        ? 'material-transport'
        : activeMachine?.group === 'Concrete' || activeMachine?.group === 'Road construction'
        ? 'concrete-road-machinery'
        : 'jcb-excavator';

    setSubmitting(true);
    try {
      const res = await fetch('/api/contractors/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceSlug,
          scheduledDate,
          scheduledTime,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          workerTradeId: selectedTradeId,
          workerCount,
          days,
          machineId: selectedMachineId,
          durationUnits,
          operatorRequired,
          furnitureCategory,
          interiorRoomType,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not submit booking.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting contractor request.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitConstructionEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/contractors/home-construction');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contractors/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectTitle: `${buildingType} Enquiry`,
          buildingType,
          plotSize,
          budgetRange,
          location,
          timeline,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not send enquiry.');
      else setEnquirySent(d.enquiry);
    } catch {
      setError('Network error sending construction enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<string, { title: string; desc: string }> = {
    'interior-design': {
      title: 'Interior Design',
      desc: 'Browse interior designer photo & video portfolios by room and style, then request a consultation.',
    },
    furniture: {
      title: 'Furniture Design',
      desc: 'Select Chair, Sofa, Bed, Table, Wardrobe, or TV Unit designs crafted by verified carpenters.',
    },
    workers: {
      title: 'Skilled Construction Workers',
      desc: 'Book painters, masons, general labour, electricians, and carpenters by worker count and days.',
    },
    vehicles: {
      title: 'Vehicles & Construction Machinery',
      desc: 'Individual equipment bookings for Earth-moving, Material transport, Concrete, and Road construction.',
    },
    'home-construction': {
      title: 'Home Construction (Free Promotion)',
      desc: 'Browse completed residential & apartment projects and submit a free project enquiry directly to verified home contractors. Zero payment on SERVA.',
    },
  };

  const meta = titles[section] ?? titles['interior-design'];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/contractors" className="hover:text-[#0B5FD9] font-medium">
          Contractors
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">{meta.title}</span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <HardHat className="w-4 h-4" /> Contractors
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">{meta.title}</h1>
          <p className="text-sm text-[#5B6B8C] mt-1 max-w-2xl">{meta.desc}</p>
        </div>
        {section === 'home-construction' && (
          <span className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-xs font-bold text-[#16A34A]">
            Free Promotion · No Payment Taken
          </span>
        )}
      </section>

      {/* Portfolio showcase for Interior, Furniture, and Home Construction */}
      {section === 'interior-design' ? (
        <InteriorDesignersDirectory
          onSelectDesignerForForm={(designer) => {
            setSelectedDesigner(designer);
            setNotes((prev) => {
              const prefix = `Selected Verified Designer: ${designer.name} (${designer.businessName || designer.firmName}, ${designer.locality || designer.area})`;
              if (prev.includes(designer.name)) return prev;
              return prev ? `${prefix}\n${prev}` : prefix;
            });
            const formEl = document.getElementById('contractor-booking-form');
            if (formEl) {
              formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      ) : (section === 'furniture' || section === 'home-construction') ? (
        <PortfolioGallery
          category="contractors"
          subCategory={section}
          heading={`${meta.title} Portfolio`}
          subtitle="Verified photos and walkthrough videos uploaded by SERVA Contractors"
        />
      ) : null}

      {/* HOME CONSTRUCTION ENQUIRY FORM (NO PAYMENT STEP — Test 12) */}
      {section === 'home-construction' ? (
        <section className="serva-card p-6 sm:p-8 max-w-3xl space-y-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0B5FD9]" />
            <h2 className="text-xl font-bold text-[#0A1F5C]">I&apos;m Interested — Send Free Project Enquiry</h2>
          </div>

          {enquirySent ? (
            <div className="p-5 rounded-2xl bg-green-50 border border-green-200 space-y-2">
              <p className="text-base font-bold text-[#16A34A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Free Construction Enquiry Sent!
              </p>
              <p className="text-sm text-[#0A1F5C]">
                Your residential/apartment project enquiry has been routed to verified SERVA Home Contractors with zero payment required.
              </p>
            </div>
          ) : (
            <form onSubmit={submitConstructionEnquiry} className="space-y-4">
              {error && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hc-type" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Project / Building Type
                  </label>
                  <select
                    id="hc-type"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  >
                    <option>Residential Independent House (G+1)</option>
                    <option>Duplex Villa</option>
                    <option>Apartment Block (G+4 / G+5)</option>
                    <option>Renovation & Floor Extension</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hc-plot" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Plot Size
                  </label>
                  <input
                    id="hc-plot"
                    type="text"
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="hc-budget" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Estimated Budget Range
                  </label>
                  <input
                    id="hc-budget"
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="hc-timeline" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Target Timeline
                  </label>
                  <input
                    id="hc-timeline"
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hc-loc" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                  Plot Location
                </label>
                <input
                  id="hc-loc"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>

              <div>
                <label htmlFor="hc-notes" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                  Project Requirements (Optional)
                </label>
                <textarea
                  id="hc-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe bedrooms, elevation preference, or turnkey vs labour contract..."
                  className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>

              <button type="submit" disabled={submitting} className="serva-pill-btn">
                <span>{submitting ? 'Sending Free Enquiry...' : 'Submit Free Construction Enquiry'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </section>
      ) : (
        /* BOOKABLE CONTRACTOR SECTIONS: Workers, Vehicles, Interior, Furniture */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form id="contractor-booking-form" onSubmit={submitContractorBooking} className="lg:col-span-7 serva-card p-6 space-y-5">
            {error && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
                {error}
              </div>
            )}

            {section === 'workers' && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B8C] flex items-center gap-1.5">
                  <Hammer className="w-4 h-4 text-[#0B5FD9]" /> Select Trade, Count & Days
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {workerTrades.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTradeId(t.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer ${
                        selectedTradeId === t.id
                          ? 'border-[#0B5FD9] bg-[#EAF2FF]/70'
                          : 'border-[#DCE7F9] bg-white'
                      }`}
                    >
                      <p className="text-sm font-bold text-[#0A1F5C]">{t.name}</p>
                      <p className="text-xs text-[#5B6B8C]">{t.specialty}</p>
                      <p className="text-xs font-mono-num font-bold text-[#0B5FD9] mt-1">
                        Est. ₹{Math.round(t.dailyRatePaise / 100)} / worker / day
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cw-count" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Number of Workers
                    </label>
                    <input
                      id="cw-count"
                      type="number"
                      min={1}
                      max={100}
                      value={workerCount}
                      onChange={(e) => setWorkerCount(Math.max(1, Number(e.target.value)))}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                    />
                  </div>
                  <div>
                    <label htmlFor="cw-days" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Duration (Days)
                    </label>
                    <input
                      id="cw-days"
                      type="number"
                      min={1}
                      max={180}
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                    />
                  </div>
                </div>
              </div>
            )}

            {section === 'vehicles' && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B8C] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#0B5FD9]" /> Select Vehicle / Heavy Machinery
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Earth-moving', 'Material transport', 'Concrete', 'Road construction'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setMachineGroup(g)}
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                        machineGroup === g ? 'bg-[#0A1F5C] text-white' : 'bg-[#F1F6FF] text-[#5B6B8C]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredMachinery.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMachineId(m.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer ${
                        selectedMachineId === m.id
                          ? 'border-[#0B5FD9] bg-[#EAF2FF]/70'
                          : 'border-[#DCE7F9] bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-[#5B6B8C]">{m.group}</span>
                      <p className="text-sm font-bold text-[#0A1F5C]">{m.name}</p>
                      <p className="text-xs font-mono-num font-bold text-[#0B5FD9] mt-1">
                        Est. ₹{Math.round(m.ratePaise / 100).toLocaleString('en-IN')} {m.unitLabel}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label htmlFor="cm-dur" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Duration ({activeMachine?.unitLabel || 'units'})
                    </label>
                    <input
                      id="cm-dur"
                      type="number"
                      min={1}
                      max={100}
                      value={durationUnits}
                      onChange={(e) => setDurationUnits(Math.max(1, Number(e.target.value)))}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] pt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={operatorRequired}
                      onChange={(e) => setOperatorRequired(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5FD9]"
                    />
                    <span>Operator / Driver included (+₹500/unit)</span>
                  </label>
                </div>
              </div>
            )}

            {section === 'furniture' && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B8C] flex items-center gap-1.5">
                  <Sofa className="w-4 h-4 text-[#0B5FD9]" /> Select Furniture Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {FURNITURE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFurnitureCategory(cat)}
                      className={`min-h-[40px] px-4 rounded-xl text-xs font-bold border cursor-pointer ${
                        furnitureCategory === cat
                          ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]'
                          : 'border-[#DCE7F9] text-[#0A1F5C]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {section === 'interior-design' && (
              <div className="space-y-4">
                {selectedDesigner && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#EAF2FF] to-blue-50 border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedDesigner.avatar || selectedDesigner.avatarUrl}
                        alt={selectedDesigner.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0B5FD9] text-white">
                            Selected Designer
                          </span>
                          <span className="text-xs text-[#5B6B8C] font-semibold">
                            {selectedDesigner.distanceKm} km away
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0A1F5C] mt-0.5">{selectedDesigner.name}</h4>
                        <p className="text-xs text-[#5B6B8C]">
                          {selectedDesigner.businessName || selectedDesigner.firmName} &bull; {selectedDesigner.completedProjects} Completed Projects ({selectedDesigner.onTimeRate || `${selectedDesigner.onTimeDeliveryRate}%`} On-Time)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDesigner(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-all cursor-pointer"
                      title="Clear selected designer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label htmlFor="int-room" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Interior Scope
                  </label>
                  <select
                    id="int-room"
                    value={interiorRoomType}
                    onChange={(e) => setInteriorRoomType(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  >
                    <option>Full 3 BHK Home</option>
                    <option>Modular Kitchen Only</option>
                    <option>Living & Dining Room</option>
                    <option>Office / Commercial Interior</option>
                  </select>
                </div>
              </div>
            )}

            {/* Common Schedule & Site Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAF2FF]">
              <div>
                <label htmlFor="con-date" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                  Start Date
                </label>
                <input
                  id="con-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>
              <div>
                <label htmlFor="con-time" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                  Time Slot (12-hour)
                </label>
                <select
                  id="con-time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                >
                  {['08:00 AM', '09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="con-addr" className="block text-xs font-semibold text-[#0A1F5C]">
                Site Address
              </label>
              <input
                id="con-addr"
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
              placeholder="Site dimensions, access notes, or design instructions..."
              className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
            />

            <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
              <span>{submitting ? 'Submitting Request...' : 'Request Contractor Quote & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <aside className="lg:col-span-5 serva-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A1F5C]">Contractor Estimate</h2>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                Estimated
              </span>
            </div>
            <p className="text-sm font-mono-num font-bold text-[#0B5FD9]">
              {section === 'workers' && activeTrade
                ? `Est. ₹${Math.round(
                    (activeTrade.dailyRatePaise * workerCount * days) / 100
                  ).toLocaleString('en-IN')}`
                : section === 'vehicles' && activeMachine
                ? `Est. ₹${Math.round(
                    ((activeMachine.ratePaise + (operatorRequired ? 50000 : 0)) * durationUnits) / 100
                  ).toLocaleString('en-IN')}`
                : section === 'furniture'
                ? 'Est. ₹4,500 starting quote'
                : 'Est. ₹2,500 consultation'}
            </p>
            <div className="p-3.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#5B6B8C] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
              <span>
                Final charges are confirmed only after a verified SERVA Contractor reviews site scope and submits an itemised quotation for your approval.
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
