import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChefHat,
  CreditCard,
  Image as ImageIcon,
  Info,
  Paintbrush,
  Sparkles,
  Utensils,
  Wrench,
} from 'lucide-react';
import { PortfolioGallery } from '../components/gallery/PortfolioGallery.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

interface RepairOption {
  id: string;
  domain: 'Kitchen' | 'Bathroom' | 'Electrical' | 'Vehicle';
  name: string;
  subLabel: string;
  estimatedServicePricePaise: number;
}

interface CleaningOption {
  id: string;
  tab: 'Home Cleaning' | 'Vehicle Cleaning' | 'Washing';
  name: string;
  unitLabel: string;
  hasWorkerStepper: boolean;
  estimatedUnitServicePricePaise: number;
}

interface CleaningSupply {
  id: string;
  name: string;
  hint: string;
}

interface CookingDish {
  id: string;
  name: string;
  diet: 'VEG' | 'NON_VEG';
  category: string;
  perPlatePaise: number;
  imageUrl: string;
  ingredients: string[];
  tools: string[];
}

interface CatalogData {
  repairOptions: RepairOption[];
  cleaningOptions: CleaningOption[];
  requiredCleaningItems: CleaningSupply[];
  cookingDishes: CookingDish[];
}

function useHomeCatalog() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/home-services/catalog')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

function ScheduleAddressFields({
  date,
  setDate,
  time,
  setTime,
  line1,
  setLine1,
  area,
  setArea,
  pincode,
  setPincode,
}: {
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  line1: string;
  setLine1: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  pincode: string;
  setPincode: (v: string) => void;
}) {
  return (
    <div className="space-y-3 pt-2 border-t border-[#EAF2FF]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="hs-date" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
            Preferred Date
          </label>
          <input
            id="hs-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
          />
        </div>
        <div>
          <label htmlFor="hs-time" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
            Time Slot (12-hour)
          </label>
          <select
            id="hs-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
          >
            {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="hs-address" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
          Service Address
        </label>
        <input
          id="hs-address"
          type="text"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="House / Flat / Street"
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          aria-label="Area or Locality"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area"
          className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
        />
        <input
          type="text"
          aria-label="PIN code"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="PIN code"
          className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num bg-white"
        />
      </div>
    </div>
  );
}

/* ============================================================================
 * 1. REPAIRING PAGE (Spec §6.2)
 * ========================================================================== */
export function RepairingPage() {
  const { user, city } = useAuth();
  const { navigate } = useRouter();
  const { data: catalog, loading } = useHomeCatalog();

  const [domain, setDomain] = useState<'Kitchen' | 'Bathroom' | 'Electrical' | 'Vehicle'>('Electrical');
  const [selectedIds, setSelectedIds] = useState<string[]>(['rep-e-bulb']);
  const [units, setUnits] = useState(1);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('2026-11-18');
  const [time, setTime] = useState('10:00 AM');
  const [line1, setLine1] = useState('Flat 402, Sri Sai Residency, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [estimatePaise, setEstimatePaise] = useState<number>(20700);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domainOptions = useMemo(
    () => (catalog?.repairOptions ?? []).filter((o) => o.domain === domain),
    [catalog, domain]
  );

  useEffect(() => {
    if (selectedIds.length === 0) {
      setEstimatePaise(0);
      return;
    }
    fetch('/api/home-services/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceSlug: 'electrician',
        quantity: units,
        details: { subFlow: 'repairing', selectedOptionIds: selectedIds, units },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.estimate?.servicePricePaise !== undefined) {
          setEstimatePaise(d.estimate.servicePricePaise);
        }
      })
      .catch(() => {});
  }, [selectedIds, units]);

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/home-services/repairing');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Select at least one repair issue to continue.');
      return;
    }
    const serviceSlug =
      domain === 'Bathroom'
        ? 'plumbing'
        : domain === 'Vehicle'
        ? 'vehicle-repair'
        : domain === 'Kitchen'
        ? 'ac-service'
        : 'electrician';

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          categorySlug: 'home-services',
          serviceSlug,
          quantity: units,
          scheduledDate: date,
          scheduledTime: time,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          details: { subFlow: 'repairing', domain, selectedOptionIds: selectedIds, units, notes },
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Booking failed.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting repair booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/home-services" className="hover:text-[#0B5FD9] font-medium">
          Home Services
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">Repairing</span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5FD9] uppercase tracking-wide">
            <Wrench className="w-4 h-4" /> Repairing Services
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
            Kitchen, Bathroom, Electrical & Vehicle Repair
          </h1>
          <p className="text-sm text-[#5B6B8C] mt-1">
            Select one or more repair tasks below. Instant Special Offer discount applied at checkout.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleBook} className="lg:col-span-8 serva-card p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          {/* Domain Tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Repair domains">
            {(['Electrical', 'Kitchen', 'Bathroom', 'Vehicle'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={domain === tab}
                onClick={() => setDomain(tab)}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                  domain === tab
                    ? 'bg-[#0B5FD9] text-white'
                    : 'bg-[#F1F6FF] text-[#0A1F5C] hover:bg-[#EAF2FF]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-44 rounded-2xl bg-[#F5F9FF] animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {domainOptions.map((opt) => {
                const active = selectedIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleId(opt.id)}
                    className={`serva-card-press min-h-[68px] p-4 rounded-2xl border text-left flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      active
                        ? 'border-[#0B5FD9] bg-[#EAF2FF]/70'
                        : 'border-[#DCE7F9] bg-white hover:bg-[#F5F9FF]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#0A1F5C]">{opt.name}</p>
                      <p className="text-xs text-[#5B6B8C] mt-0.5">{opt.subLabel}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#0B5FD9] text-white' : 'border border-[#DCE7F9] bg-white'
                      }`}
                    >
                      {active && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-[#0A1F5C]">Units / Appliances</span>
            <div className="inline-flex items-center gap-3 border border-[#DCE7F9] rounded-xl p-1">
              <button
                type="button"
                aria-label="Decrease units"
                onClick={() => setUnits((u) => Math.max(1, u - 1))}
                className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-mono-num font-bold text-[#0A1F5C]">{units}</span>
              <button
                type="button"
                aria-label="Increase units"
                onClick={() => setUnits((u) => Math.min(20, u + 1))}
                className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="rep-notes" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
              Describe the problem (optional)
            </label>
            <textarea
              id="rep-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hall ceiling fan humming or kitchen tap dripping"
              className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
            />
          </div>

          <ScheduleAddressFields
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            line1={line1}
            setLine1={setLine1}
            area={area}
            setArea={setArea}
            pincode={pincode}
            setPincode={setPincode}
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Creating Booking...' : 'Continue to Price Summary & Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <aside className="lg:col-span-4 serva-card p-6 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Service Estimate</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            Selected tasks: <strong className="text-[#0A1F5C]">{selectedIds.length}</strong> · Units:{' '}
            <strong className="text-[#0A1F5C]">{units}</strong>
          </p>
          <div className="pt-3 border-t border-[#EAF2FF] flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#0A1F5C]">Service price</span>
            <span className="text-2xl font-bold text-[#0B5FD9] font-mono-num">
              ₹{Math.round(estimatePaise / 100).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-[#16A34A] font-medium">
            Special offer discount (₹20–₹50) applies automatically on the payment summary.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. CLEANING & WASHING PAGE (Spec §6.3)
 * ========================================================================== */
export function CleaningPage() {
  const { user, city } = useAuth();
  const { navigate } = useRouter();
  const { data: catalog, loading } = useHomeCatalog();

  const [tab, setTab] = useState<'Home Cleaning' | 'Vehicle Cleaning' | 'Washing'>('Home Cleaning');
  const [quantities, setQuantities] = useState<Record<string, number>>({ 'cln-floor': 2 });
  const [workers, setWorkers] = useState(1);
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>(['sup-scrubber', 'sup-liquid']);
  const [date, setDate] = useState('2026-11-19');
  const [time, setTime] = useState('09:00 AM');
  const [line1, setLine1] = useState('Flat 402, Sri Sai Residency, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [estimatePaise, setEstimatePaise] = useState(38000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabOptions = useMemo(
    () => (catalog?.cleaningOptions ?? []).filter((o) => o.tab === tab),
    [catalog, tab]
  );

  useEffect(() => {
    fetch('/api/home-services/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceSlug: tab === 'Washing' ? 'washing-service' : 'home-cleaning',
        quantity: 1,
        details: { subFlow: 'cleaning', quantities, workers },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.estimate?.servicePricePaise !== undefined) {
          setEstimatePaise(d.estimate.servicePricePaise);
        }
      })
      .catch(() => {});
  }, [quantities, workers, tab]);

  const setQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(30, (prev[id] ?? 0) + delta)),
    }));
  };

  const toggleSupply = (id: string) => {
    setSelectedSupplies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalCount = Object.values(quantities).reduce((s, n) => s + n, 0);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/home-services/cleaning');
      return;
    }
    if (totalCount === 0) {
      setError('Please select at least 1 cleaning item or room using the steppers.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          categorySlug: 'home-services',
          serviceSlug: tab === 'Washing' ? 'washing-service' : 'home-cleaning',
          quantity: 1,
          scheduledDate: date,
          scheduledTime: time,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          details: { subFlow: 'cleaning', tab, quantities, workers, selectedSupplies },
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Booking failed.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting cleaning booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/home-services" className="hover:text-[#0B5FD9] font-medium">
          Home Services
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">Cleaning & Washing</span>
      </div>

      <section className="serva-card p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5FD9] uppercase tracking-wide">
          <Sparkles className="w-4 h-4" /> Cleaning & Washing
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
          Home Cleaning, Vehicle Wash & Laundry
        </h1>
        <p className="text-sm text-[#5B6B8C] mt-1">
          Adjust quantities with the steppers and pick any Required Cleaning Items needed for the visit.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleBook} className="lg:col-span-8 serva-card p-6 space-y-6">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Cleaning categories">
            {(['Home Cleaning', 'Vehicle Cleaning', 'Washing'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-semibold cursor-pointer ${
                  tab === t ? 'bg-[#0B5FD9] text-white' : 'bg-[#F1F6FF] text-[#0A1F5C]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-48 rounded-2xl bg-[#F5F9FF] animate-pulse" />
          ) : (
            <div className="space-y-3">
              {tabOptions.map((opt) => {
                const qty = quantities[opt.id] ?? 0;
                return (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-[#DCE7F9] flex flex-wrap items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#0A1F5C]">{opt.name}</p>
                      <p className="text-xs text-[#5B6B8C]">Count in {opt.unitLabel}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 border border-[#DCE7F9] rounded-xl p-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${opt.name}`}
                        onClick={() => setQty(opt.id, -1)}
                        className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono-num font-bold text-[#0A1F5C]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${opt.name}`}
                        onClick={() => setQty(opt.id, 1)}
                        className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}

              {tab === 'Home Cleaning' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#0A1F5C]">Number of Cleaning Workers</p>
                    <p className="text-xs text-[#5B6B8C]">Recommended 2+ workers for multi-room deep clean</p>
                  </div>
                  <div className="inline-flex items-center gap-2 border border-[#DCE7F9] rounded-xl p-1 bg-white">
                    <button
                      type="button"
                      aria-label="Decrease workers"
                      onClick={() => setWorkers((w) => Math.max(1, w - 1))}
                      className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono-num font-bold text-[#0A1F5C]">
                      {workers}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase workers"
                      onClick={() => setWorkers((w) => Math.min(6, w + 1))}
                      className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Required Cleaning Items Card Grid (Spec §6.3) */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#0A1F5C]">Required Cleaning Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(catalog?.requiredCleaningItems ?? []).map((item) => {
                const checked = selectedSupplies.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-2 transition-colors min-h-[84px] ${
                      checked
                        ? 'border-[#0B5FD9] bg-[#EAF2FF]/60'
                        : 'border-[#DCE7F9] bg-white hover:bg-[#F5F9FF]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#0A1F5C] leading-snug">{item.name}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSupply(item.id)}
                        className="w-4 h-4 accent-[#0B5FD9] shrink-0"
                      />
                    </div>
                    <span className="text-[11px] text-[#5B6B8C]">{item.hint}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <ScheduleAddressFields
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            line1={line1}
            setLine1={setLine1}
            area={area}
            setArea={setArea}
            pincode={pincode}
            setPincode={setPincode}
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Creating Booking...' : 'Review Summary & Pay'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <aside className="lg:col-span-4 serva-card p-6 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Cleaning Summary</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            Selected units: <strong className="text-[#0A1F5C]">{totalCount}</strong> · Workers:{' '}
            <strong className="text-[#0A1F5C]">{workers}</strong> · Materials:{' '}
            <strong className="text-[#0A1F5C]">{selectedSupplies.length}</strong>
          </p>
          <div className="pt-3 border-t border-[#EAF2FF] flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#0A1F5C]">Service price</span>
            <span className="text-2xl font-bold text-[#0B5FD9] font-mono-num">
              ₹{Math.round(estimatePaise / 100).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-[#16A34A] font-medium">
            Special offer discount applies automatically on checkout.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. COOKING PAGE (Spec §6.4 + Test 5: Online Payment Only)
 * ========================================================================== */
const DISH_CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Curries', 'Rice Items', 'Snacks', 'Sweets'];

export function CookingPage() {
  const { user, city } = useAuth();
  const { navigate } = useRouter();
  const { data: catalog, loading } = useHomeCatalog();

  const [diet, setDiet] = useState<'VEG' | 'NON_VEG'>('VEG');
  const [cookingType, setCookingType] = useState<'HOME' | 'EVENT' | 'BULK'>('HOME');
  const [dishCategory, setDishCategory] = useState<string>('All');
  const [selectedDishId, setSelectedDishId] = useState<string>('dish-dosa');
  const [people, setPeople] = useState<number>(10);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedTools, setCheckedTools] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('08:00 AM');
  const [line1, setLine1] = useState('Flat 402, Sri Sai Residency, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [estimate, setEstimate] = useState<{
    servicePricePaise: number;
    cookingBreakdown?: { dishSubtotalPaise: number; cookServiceChargePaise: number; perPlatePaise: number; people: number };
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchingDishes = useMemo(() => {
    const all = (catalog?.cookingDishes ?? []).filter((d) => d.diet === diet);
    return dishCategory === 'All' ? all : all.filter((d) => d.category === dishCategory);
  }, [catalog, diet, dishCategory]);

  const activeDish = useMemo(() => {
    const all = catalog?.cookingDishes ?? [];
    return all.find((d) => d.id === selectedDishId) ?? matchingDishes[0] ?? null;
  }, [catalog, selectedDishId, matchingDishes]);

  useEffect(() => {
    if (activeDish) {
      const ing: Record<string, boolean> = {};
      activeDish.ingredients.forEach((x) => {
        ing[x] = true;
      });
      const tls: Record<string, boolean> = {};
      activeDish.tools.forEach((x) => {
        tls[x] = true;
      });
      setCheckedIngredients(ing);
      setCheckedTools(tls);
    }
  }, [activeDish?.id]);

  useEffect(() => {
    const firstMatching = matchingDishes[0];
    if (firstMatching && !matchingDishes.some((d) => d.id === selectedDishId)) {
      setSelectedDishId(firstMatching.id);
    }
  }, [diet, matchingDishes, selectedDishId]);

  useEffect(() => {
    fetch('/api/home-services/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceSlug: 'home-cooking',
        quantity: 1,
        details: { subFlow: 'cooking', dishId: selectedDishId, cookingType, people },
      }),
    })
      .then((r) => r.json())
      .then((d) => setEstimate(d.estimate ?? null))
      .catch(() => {});
  }, [selectedDishId, cookingType, people]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/home-services/cooking');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          categorySlug: 'home-services',
          serviceSlug: 'home-cooking',
          quantity: 1,
          scheduledDate: date,
          scheduledTime: time,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          details: {
            subFlow: 'cooking',
            diet,
            cookingType,
            dishId: selectedDishId,
            people,
            selectedIngredients: Object.keys(checkedIngredients).filter((k) => checkedIngredients[k]),
            selectedTools: Object.keys(checkedTools).filter((k) => checkedTools[k]),
          },
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Booking failed.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error creating cooking booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/home-services" className="hover:text-[#0B5FD9] font-medium">
          Home Services
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">Cooking</span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5FD9] uppercase tracking-wide">
            <ChefHat className="w-4 h-4" /> Home, Event & Bulk Cooking
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
            {diet === 'VEG' ? 'Veg Cooking – Dishes Booking' : 'Non-Veg Cooking – Dishes Booking'}
          </h1>
          <p className="text-sm text-[#5B6B8C] mt-1">
            Accepted chef purchases fresh ingredients and cooks at your home.
          </p>
        </div>
        <span className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 inline-flex items-center gap-1.5">
          <CreditCard className="w-4 h-4" /> Online payment only (No COD)
        </span>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Diet, Cooking Type, Dish Grid, Stepper, Schedule */}
        <form onSubmit={handleBook} className="lg:col-span-7 serva-card p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          {/* 1. Veg / Non-Veg first */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#5B6B8C]">
              1. Select Diet Preference
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDiet('VEG');
                  setDishCategory('All');
                }}
                className={`min-h-[46px] rounded-xl font-bold text-sm border cursor-pointer ${
                  diet === 'VEG'
                    ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                    : 'border-[#DCE7F9] text-[#0A1F5C]'
                }`}
              >
                Veg Dishes
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiet('NON_VEG');
                  setDishCategory('All');
                }}
                className={`min-h-[46px] rounded-xl font-bold text-sm border cursor-pointer ${
                  diet === 'NON_VEG'
                    ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                    : 'border-[#DCE7F9] text-[#0A1F5C]'
                }`}
              >
                Non-Veg Dishes
              </button>
            </div>
          </div>

          {/* 2. Cooking Type */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#5B6B8C]">
              2. Cooking Type
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'HOME', label: 'Home Cooking' },
                { id: 'EVENT', label: 'Event Cooking' },
                { id: 'BULK', label: 'Bulk Cooking' },
              ] as const).map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setCookingType(ct.id)}
                  className={`min-h-[44px] px-2 rounded-xl text-xs font-bold cursor-pointer ${
                    cookingType === ct.id
                      ? 'bg-[#0B5FD9] text-white'
                      : 'bg-[#F1F6FF] text-[#0A1F5C]'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category Chips & Dish Grid */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#5B6B8C]">
              3. Choose Dish
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DISH_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDishCategory(c)}
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                    dishCategory === c
                      ? 'bg-[#0A1F5C] text-white'
                      : 'bg-[#F1F6FF] text-[#5B6B8C]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="h-44 rounded-2xl bg-[#F5F9FF] animate-pulse" />
            ) : matchingDishes.length === 0 ? (
              <p className="text-sm text-[#5B6B8C] py-4">No dishes in this filter. Try &ldquo;All&rdquo;.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingDishes.map((dish) => {
                  const selected = activeDish?.id === dish.id;
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => setSelectedDishId(dish.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                        selected
                          ? 'border-[#0B5FD9] bg-[#EAF2FF]/70 shadow-sm'
                          : 'border-[#DCE7F9] bg-white hover:bg-[#F5F9FF]'
                      }`}
                    >
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0A1F5C] truncate">{dish.name}</p>
                        <p className="text-xs text-[#5B6B8C]">{dish.category}</p>
                        <p className="text-xs font-bold text-[#0B5FD9] font-mono-num mt-0.5">
                          ₹{Math.round(dish.perPlatePaise / 100)} / plate
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Number of People Stepper */}
          <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0A1F5C]">Number of People</p>
              <p className="text-xs text-[#5B6B8C]">Drives fresh ingredient quantities</p>
            </div>
            <div className="inline-flex items-center gap-2 border border-[#DCE7F9] rounded-xl p-1 bg-white">
              <button
                type="button"
                aria-label="Decrease people"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
              >
                -
              </button>
              <span className="w-10 text-center font-mono-num font-bold text-[#0A1F5C]">{people}</span>
              <button
                type="button"
                aria-label="Increase people"
                onClick={() => setPeople((p) => Math.min(200, p + 1))}
                className="w-10 h-10 rounded-lg bg-[#F1F6FF] font-bold text-[#0A1F5C] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <ScheduleAddressFields
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            line1={line1}
            setLine1={setLine1}
            area={area}
            setArea={setArea}
            pincode={pincode}
            setPincode={setPincode}
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Creating Cooking Booking...' : 'Continue to Online Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Right Panel: Selected Dish Required Items (Ingredients + Tools & Utensils) + Price Estimate */}
        <aside className="lg:col-span-5 serva-card p-6 space-y-5 lg:sticky lg:top-24">
          {activeDish && (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-[#EAF2FF]">
                <img
                  src={activeDish.imageUrl}
                  alt={activeDish.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#0B5FD9]">Required Items</span>
                  <h2 className="text-lg font-bold text-[#0A1F5C]">{activeDish.name}</h2>
                  <p className="text-xs text-[#5B6B8C] font-mono-num">
                    ₹{Math.round(activeDish.perPlatePaise / 100)} × {people} people
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-[#0A1F5C] uppercase tracking-wide">
                  Ingredients (Chef purchases fresh)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeDish.ingredients.map((ing) => (
                    <label key={ing} className="flex items-center gap-2 text-xs text-[#0A1F5C] cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={checkedIngredients[ing] ?? true}
                        onChange={(e) =>
                          setCheckedIngredients((prev) => ({ ...prev, [ing]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#0B5FD9]"
                      />
                      <span>{ing}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EAF2FF]">
                <p className="text-xs font-bold text-[#0A1F5C] uppercase tracking-wide flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#0B5FD9]" /> Tools & Utensils (Kitchen)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeDish.tools.map((tool) => (
                    <label key={tool} className="flex items-center gap-2 text-xs text-[#0A1F5C] cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={checkedTools[tool] ?? true}
                        onChange={(e) =>
                          setCheckedTools((prev) => ({ ...prev, [tool]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#0B5FD9]"
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {estimate?.cookingBreakdown && (
            <div className="pt-4 border-t border-[#EAF2FF] space-y-2 text-sm">
              <div className="flex justify-between text-[#5B6B8C]">
                <span>
                  Dishes (₹{Math.round(estimate.cookingBreakdown.perPlatePaise / 100)} ×{' '}
                  {estimate.cookingBreakdown.people})
                </span>
                <span className="font-mono-num font-semibold text-[#0A1F5C]">
                  ₹{Math.round(estimate.cookingBreakdown.dishSubtotalPaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#5B6B8C]">
                <span>Cook service charge</span>
                <span className="font-mono-num font-semibold text-[#0A1F5C]">
                  ₹{Math.round(estimate.cookingBreakdown.cookServiceChargePaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAF2FF] flex justify-between items-baseline">
                <span className="font-bold text-[#0A1F5C]">Estimated Total</span>
                <span className="text-2xl font-bold text-[#0B5FD9] font-mono-num">
                  ₹{Math.round(estimate.servicePricePaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#5B6B8C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
            <span>
              Online payment only. Cash and COD are disabled for Cooking so your chef can procure fresh ingredients immediately upon acceptance.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. WALL PAINTING & 3D WALL ART PAGE (Spec §6.5: Portfolio + Online Only)
 * ========================================================================== */
export function PaintingPage() {
  const { user, city } = useAuth();
  const { navigate } = useRouter();

  const [areaSqft, setAreaSqft] = useState(350);
  const [rooms, setRooms] = useState(2);
  const [finish, setFinish] = useState<'MATTE' | 'SATIN' | 'ROYAL_WASHABLE' | 'TEXTURE_3D'>('ROYAL_WASHABLE');
  const [referencePhotoUrl, setReferencePhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState('2026-11-21');
  const [time, setTime] = useState('10:00 AM');
  const [line1, setLine1] = useState('Flat 402, Sri Sai Residency, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [estimatePaise, setEstimatePaise] = useState(960000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/home-services/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceSlug: 'wall-painting',
        quantity: 1,
        details: { subFlow: 'painting', areaSqft, rooms, finish },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.estimate?.servicePricePaise !== undefined) {
          setEstimatePaise(d.estimate.servicePricePaise);
        }
      })
      .catch(() => {});
  }, [areaSqft, rooms, finish]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Reference photo must be under 5 MB.');
      return;
    }
    setUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ dataUrl: reader.result, prefix: 'paint' }),
        });
        const d = await res.json();
        if (!res.ok) setError(d.error || 'Upload failed.');
        else setReferencePhotoUrl(d.url);
      } catch {
        setError('Could not upload photo.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate('/login?next=/home-services/painting');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          categorySlug: 'home-services',
          serviceSlug: 'wall-painting',
          quantity: 1,
          scheduledDate: date,
          scheduledTime: time,
          address: { line1: line1.trim(), area: area.trim(), city, pincode: pincode.trim() },
          details: { subFlow: 'painting', areaSqft, rooms, finish, referencePhotoUrl },
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Booking failed.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting painting booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/home-services" className="hover:text-[#0B5FD9] font-medium">
          Home Services
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">Wall Painting & 3D Wall Art</span>
      </div>

      <section className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5FD9] uppercase tracking-wide">
            <Paintbrush className="w-4 h-4" /> Wall Painting & 3D Printing
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C] mt-1">
            Wall Painting & 3D Wall Art
          </h1>
          <p className="text-sm text-[#5B6B8C] mt-1">
            Browse real artist photos and walkthrough videos, pick a finish, and pay the full amount online.
          </p>
        </div>
        <span className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 inline-flex items-center gap-1.5">
          <CreditCard className="w-4 h-4" /> Full online payment only (No COD)
        </span>
      </section>

      <PortfolioGallery
        category="home-services"
        subCategory="painting"
        heading="Painter & 3D Wall Art Showcase"
        subtitle="Browse real photos and walkthrough videos from verified wall painters"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleBook} className="lg:col-span-7 serva-card p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paint-sqft" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Estimated Wall Area (sq. ft.)
              </label>
              <input
                id="paint-sqft"
                type="number"
                min={50}
                max={20000}
                value={areaSqft}
                onChange={(e) => setAreaSqft(Math.max(50, Number(e.target.value)))}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>

            <div>
              <label htmlFor="paint-rooms" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Number of Rooms / Accent Walls
              </label>
              <input
                id="paint-rooms"
                type="number"
                min={1}
                max={30}
                value={rooms}
                onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#0A1F5C] mb-2">Paint Type / Finish</p>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { id: 'MATTE', label: 'Matte Interior' },
                { id: 'SATIN', label: 'Satin Sheen' },
                { id: 'ROYAL_WASHABLE', label: 'Royal Washable' },
                { id: 'TEXTURE_3D', label: '3D Wall Art / Texture' },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    finish === f.id
                      ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]'
                      : 'border-[#DCE7F9] text-[#0A1F5C]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="paint-ref" className="block text-xs font-semibold text-[#0A1F5C] mb-1.5">
              Reference Wall Photo (optional, max 5 MB)
            </label>
            <label
              htmlFor="paint-ref"
              className="min-h-[46px] px-4 rounded-xl border border-dashed border-[#0B5FD9] bg-[#F5F9FF] flex items-center gap-2 text-xs font-semibold text-[#0B5FD9] cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>
                {uploading
                  ? 'Uploading photo...'
                  : referencePhotoUrl
                  ? 'Reference photo uploaded ✓'
                  : 'Upload wall or design inspiration photo'}
              </span>
            </label>
            <input
              id="paint-ref"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </div>

          <ScheduleAddressFields
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            line1={line1}
            setLine1={setLine1}
            area={area}
            setArea={setArea}
            pincode={pincode}
            setPincode={setPincode}
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Creating Painting Booking...' : 'Proceed to Online Payment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <aside className="lg:col-span-5 serva-card p-6 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Painting Estimate</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            {areaSqft} sq. ft. · {rooms} room(s) · {finish.replace(/_/g, ' ')}
          </p>
          <div className="pt-3 border-t border-[#EAF2FF] flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#0A1F5C]">Service price</span>
            <span className="text-2xl font-bold text-[#0B5FD9] font-mono-num">
              ₹{Math.round(estimatePaise / 100).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            Full online payment required; no cash or cash on delivery accepted.
          </p>
        </aside>
      </div>
    </div>
  );
}
