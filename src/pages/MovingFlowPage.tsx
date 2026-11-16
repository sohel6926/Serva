import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Box, Info, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

interface BoxSpec {
  id: 'small' | 'medium' | 'large' | 'xl' | 'custom';
  label: string;
  dimensionsIn: string;
  dimensionsCm: string;
  unitPricePaise: number;
  warning?: string;
}

const SERVICE_TITLES: Record<string, string> = {
  'home-shifting': 'Home Shifting',
  'office-shifting': 'Office Shifting',
  packing: 'Packing',
  'loading-unloading': 'Loading & Unloading (Combined)',
  transport: 'Transport (Customer-Arranged)',
  'labour-only': 'Labour Only',
  'heavy-item-moving': 'Heavy Item Moving',
  'individual-item': 'Individual Item Shifting (Add-on)',
};

export function MovingFlowPage({ serviceSlug }: { serviceSlug: string }) {
  const { user, city } = useAuth();
  const { navigate } = useRouter();

  const [boxSpecs, setBoxSpecs] = useState<BoxSpec[]>([]);
  const [inventoryCats, setInventoryCats] = useState<string[]>([]);

  const [propertySize, setPropertySize] = useState('2 BHK');
  const [pickupLine1, setPickupLine1] = useState('Flat 301, Sri Nagar Colony');
  const [pickupFloor, setPickupFloor] = useState(2);
  const [pickupLift, setPickupLift] = useState(true);
  const [dropLine1, setDropLine1] = useState('Plot 18, Kondapur');
  const [dropFloor, setDropFloor] = useState(3);
  const [dropLift, setDropLift] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('2026-11-25');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');

  // Workers
  const [workerCount, setWorkerCount] = useState(3);

  // 3 Customer-Arranged Vehicle Choices (Hard Rule 2 + Test 9)
  const [vehicleChoice, setVehicleChoice] = useState<'ARRANGED' | 'WILL_ARRANGE' | 'NEED_GUIDANCE'>(
    'WILL_ARRANGE'
  );
  const [vehicleType, setVehicleType] = useState('Tata Ace / 8ft Pickup');
  const [vehicleArrivalTime, setVehicleArrivalTime] = useState('09:30 AM');
  const [vehicleReg, setVehicleReg] = useState('');

  // Packing boxes — 5 rows accepting zero (Test 10)
  const [providerSuppliesMaterials, setProviderSuppliesMaterials] = useState(true);
  const [boxes, setBoxes] = useState<Record<'small' | 'medium' | 'large' | 'xl' | 'custom', number>>({
    small: 4,
    medium: 4,
    large: 2,
    xl: 0,
    custom: 0,
  });
  const [customDimensions, setCustomDimensions] = useState('20×16×16 in (51×41×41 cm)');

  // Item Inventory
  const [itemCat, setItemCat] = useState('Furniture');
  const [itemName, setItemName] = useState('3-Seater Sofa');
  const [itemQty, setItemQty] = useState(1);
  const [itemFragile, setItemFragile] = useState(false);
  const [inventory, setInventory] = useState<
    Array<{ category: string; name: string; quantity: number; fragile: boolean }>
  >([
    { category: 'Appliances', name: 'Double-Door Refrigerator', quantity: 1, fragile: false },
    { category: 'Electronics', name: '55-inch Smart TV', quantity: 1, fragile: true },
  ]);

  const [individualItemMode, setIndividualItemMode] = useState('Packing and move');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/moving/catalog')
      .then((r) => r.json())
      .then((d) => {
        setBoxSpecs(d.boxSpecs ?? []);
        setInventoryCats(d.inventoryCategories ?? []);
      })
      .catch(() => {});
  }, []);

  const addItem = () => {
    if (!itemName.trim()) return;
    setInventory((prev) => [
      ...prev,
      { category: itemCat, name: itemName.trim(), quantity: Math.max(1, itemQty), fragile: itemFragile },
    ]);
    setItemName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate(`/login?next=/moving/${serviceSlug}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/moving/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceSlug,
          scheduledDate,
          scheduledTime,
          pickupAddress: { line1: pickupLine1, floor: pickupFloor, hasLift: pickupLift, city },
          dropAddress: { line1: dropLine1, floor: dropFloor, hasLift: dropLift, city },
          propertySize,
          workerCount,
          vehicleChoice,
          arrangedVehicleInfo:
            vehicleChoice === 'ARRANGED'
              ? { vehicleType, arrivalTime: vehicleArrivalTime, registrationNumber: vehicleReg }
              : undefined,
          providerSuppliesMaterials,
          boxes: { ...boxes, customDimensions },
          inventoryItems: inventory,
          individualItemMode: serviceSlug === 'individual-item' ? individualItemMode : undefined,
          notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not submit moving request.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting moving request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/moving" className="hover:text-[#0B5FD9] font-medium">
          Moving and Shifting
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">
          {SERVICE_TITLES[serviceSlug] || serviceSlug}
        </span>
      </div>

      {/* Prominent No-Vehicle Policy Banner (Hard Rule 2) */}
      <div role="note" className="serva-card p-5 bg-amber-50 border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-[#0A1F5C] space-y-1">
          <p className="font-bold text-sm">SERVA Does Not Provide Vehicles — No Vehicle Booking or Charges</p>
          <p className="text-[#5B6B8C]">
            Book verified packing, loading, unloading, and shifting teams only. You arrange your transport vehicle independently.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 serva-card p-6 space-y-6">
          <h1 className="text-2xl font-bold text-[#0A1F5C]">
            {SERVICE_TITLES[serviceSlug] || 'Moving & Shifting Request'}
          </h1>

          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          {serviceSlug === 'individual-item' && (
            <div>
              <p className="text-xs font-bold uppercase text-[#5B6B8C] mb-2">
                Individual Item Shifting Option
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['Move only', 'Packing and move', 'Loading and unloading only', 'Heavy-item handling'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIndividualItemMode(opt)}
                    className={`min-h-[42px] px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                      individualItemMode === opt
                        ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]'
                        : 'border-[#DCE7F9] text-[#0A1F5C]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pickup & Drop Addresses + Floors + Lifts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5F9FF] space-y-3">
              <p className="text-xs font-bold text-[#0A1F5C]">Pickup Location</p>
              <input
                type="text"
                aria-label="Pickup address"
                value={pickupLine1}
                onChange={(e) => setPickupLine1(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-[#5B6B8C]">
                  Floor:
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={pickupFloor}
                    onChange={(e) => setPickupFloor(Math.max(0, Number(e.target.value)))}
                    className="ml-2 w-16 min-h-[38px] px-2 rounded-lg border border-[#DCE7F9] bg-white font-mono-num"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupLift}
                    onChange={(e) => setPickupLift(e.target.checked)}
                    className="w-4 h-4 accent-[#0B5FD9]"
                  />
                  Lift available
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F9FF] space-y-3">
              <p className="text-xs font-bold text-[#0A1F5C]">Drop Location</p>
              <input
                type="text"
                aria-label="Drop address"
                value={dropLine1}
                onChange={(e) => setDropLine1(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-[#5B6B8C]">
                  Floor:
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={dropFloor}
                    onChange={(e) => setDropFloor(Math.max(0, Number(e.target.value)))}
                    className="ml-2 w-16 min-h-[38px] px-2 rounded-lg border border-[#DCE7F9] bg-white font-mono-num"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dropLift}
                    onChange={(e) => setDropLift(e.target.checked)}
                    className="w-4 h-4 accent-[#0B5FD9]"
                  />
                  Lift available
                </label>
              </div>
            </div>
          </div>

          {/* Customer-Arranged Transport Choices (Test 9: Exact 3 Choices) */}
          <div className="space-y-3 pt-2 border-t border-[#EAF2FF]">
            <p className="text-xs font-bold uppercase text-[#5B6B8C] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#DC2626]" /> Transport Arrangement (Customer-Arranged Only)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {([
                { id: 'ARRANGED', label: 'I have arranged my vehicle' },
                { id: 'WILL_ARRANGE', label: 'I will arrange my vehicle' },
                { id: 'NEED_GUIDANCE', label: 'I need guidance on vehicle size' },
              ] as const).map((vc) => (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => setVehicleChoice(vc.id)}
                  className={`min-h-[48px] p-3 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                    vehicleChoice === vc.id
                      ? 'border-[#0B5FD9] bg-[#EAF2FF] text-[#0B5FD9]'
                      : 'border-[#DCE7F9] text-[#0A1F5C]'
                  }`}
                >
                  {vc.label}
                </button>
              ))}
            </div>

            {vehicleChoice === 'ARRANGED' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F5F9FF]">
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="Vehicle type (e.g. Tata Ace)"
                  className="min-h-[40px] px-3 rounded-lg border border-[#DCE7F9] text-xs bg-white"
                />
                <input
                  type="text"
                  value={vehicleArrivalTime}
                  onChange={(e) => setVehicleArrivalTime(e.target.value)}
                  placeholder="Arrival time"
                  className="min-h-[40px] px-3 rounded-lg border border-[#DCE7F9] text-xs bg-white"
                />
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  placeholder="Reg. no (optional)"
                  className="min-h-[40px] px-3 rounded-lg border border-[#DCE7F9] text-xs bg-white"
                />
              </div>
            )}

            {vehicleChoice === 'NEED_GUIDANCE' && (
              <div className="p-3.5 rounded-xl bg-blue-50 text-xs text-[#0A1F5C]">
                <strong>Non-binding guidance for {propertySize}:</strong> Usually fits in a 8ft–10ft light commercial pickup or 14ft closed truck depending on furniture volume. SERVA provides only the crew—book your vehicle separately.
              </div>
            )}
          </div>

          {/* 5 Packing Box Sizes in Inches & cm accepting Zero Qty (Test 10) */}
          <div className="space-y-3 pt-2 border-t border-[#EAF2FF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase text-[#5B6B8C] flex items-center gap-1.5">
                <Box className="w-4 h-4 text-[#0B5FD9]" /> Packing Boxes (5 Sizes · Inches & cm)
              </p>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={providerSuppliesMaterials}
                  onChange={(e) => setProviderSuppliesMaterials(e.target.checked)}
                  className="w-4 h-4 accent-[#0B5FD9]"
                />
                <span>Provider supplies packing boxes (separate quote line)</span>
              </label>
            </div>

            <div className="space-y-2">
              {boxSpecs.map((spec) => (
                <div
                  key={spec.id}
                  className="p-3.5 rounded-xl border border-[#DCE7F9] flex flex-wrap items-center justify-between gap-3 bg-white"
                >
                  <div>
                    <p className="text-sm font-bold text-[#0A1F5C]">{spec.label}</p>
                    <p className="text-xs text-[#5B6B8C] font-mono-num">
                      {spec.dimensionsIn} · {spec.dimensionsCm}
                    </p>
                    {spec.id === 'custom' && (
                      <input
                        type="text"
                        aria-label="Custom carton dimensions"
                        value={customDimensions}
                        onChange={(e) => setCustomDimensions(e.target.value)}
                        className="mt-1 min-h-[34px] px-2.5 rounded-lg border border-[#DCE7F9] text-xs font-mono-num"
                      />
                    )}
                    {spec.warning && (
                      <p className="text-[11px] font-semibold text-amber-700 mt-1">{spec.warning}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`box-${spec.id}`} className="text-xs text-[#5B6B8C]">
                      Qty:
                    </label>
                    <input
                      id={`box-${spec.id}`}
                      type="number"
                      min={0}
                      max={200}
                      value={boxes[spec.id]}
                      onChange={(e) =>
                        setBoxes((prev) => ({
                          ...prev,
                          [spec.id]: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-20 min-h-[40px] px-3 rounded-lg border border-[#DCE7F9] text-sm font-mono-num"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Inventory */}
          <div className="space-y-3 pt-2 border-t border-[#EAF2FF]">
            <p className="text-xs font-bold uppercase text-[#5B6B8C]">
              Item Inventory & Fragile Tagging
            </p>
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Item category"
                value={itemCat}
                onChange={(e) => setItemCat(e.target.value)}
                className="min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs bg-white"
              >
                {inventoryCats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Add item (e.g. King Bed)"
                className="flex-1 min-w-[140px] min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
              />
              <input
                type="number"
                min={1}
                max={20}
                value={itemQty}
                onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                aria-label="Item quantity"
                className="w-16 min-h-[40px] px-2 rounded-xl border border-[#DCE7F9] text-xs font-mono-num"
              />
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0A1F5C]">
                <input
                  type="checkbox"
                  checked={itemFragile}
                  onChange={(e) => setItemFragile(e.target.checked)}
                />
                Fragile
              </label>
              <button
                type="button"
                onClick={addItem}
                className="min-h-[40px] px-4 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] text-xs font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {inventory.map((it, idx) => (
                <span
                  key={`${it.name}-${idx}`}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#0A1F5C]"
                >
                  {it.category}: {it.name} × {it.quantity} {it.fragile ? '· Fragile' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Crew, Property Size & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#EAF2FF]">
            <select
              aria-label="Property Size"
              value={propertySize}
              onChange={(e) => setPropertySize(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
            >
              {['1 BHK', '2 BHK', '3 BHK', '4 BHK+', 'PG / Single Room', 'Office'].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <select
              aria-label="Worker Crew Count"
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
              className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
            >
              {[2, 3, 4, 5, 6].map((w) => (
                <option key={w} value={w}>
                  {w} Workers
                </option>
              ))}
            </select>
            <input
              type="date"
              aria-label="Move Date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <select
              aria-label="Time Window"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
            >
              {['08:00 AM', '09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Society gate timing, lift permission, or special handling instructions..."
            className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
          />

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Submitting Moving Request...' : 'Get Itemised Moving Quote'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <aside className="lg:col-span-4 serva-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Moving Quote Policy</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            Crew: <strong className="text-[#0A1F5C]">{workerCount} workers</strong> · Property:{' '}
            <strong className="text-[#0A1F5C]">{propertySize}</strong>
          </p>
          <div className="p-3.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#5B6B8C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
            <span>
              Worker charges, combined loading &amp; unloading, and packing materials appear as separate quotation lines. Vehicle charges are never permitted.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
