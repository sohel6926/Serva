import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Info, Sprout, Users, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

interface AgriServiceOption {
  id: string;
  slug: string;
  name: string;
  category: string;
  ratePaise: number;
  unitLabel: string;
  requiresPesticideNotice?: boolean;
}

interface AgriMachinery {
  id: string;
  name: string;
  hourlyRatePaise: number;
  dailyRatePaise: number;
  perAcreRatePaise: number;
  operatorFeePaise: number;
}

export function AgricultureFlowPage({ entryPath }: { entryPath: 'workers' | 'services' | 'machinery' }) {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [services, setServices] = useState<AgriServiceOption[]>([]);
  const [machinery, setMachinery] = useState<AgriMachinery[]>([]);

  const [mode, setMode] = useState<'WORKERS' | 'SERVICES' | 'MACHINERY'>(
    entryPath === 'workers' ? 'WORKERS' : entryPath === 'machinery' ? 'MACHINERY' : 'SERVICES'
  );
  const [selectedServiceId, setSelectedServiceId] = useState('ag-drone');
  const [cropType, setCropType] = useState('Paddy (Rice)');
  const [areaValue, setAreaValue] = useState(2);
  const [areaUnit, setAreaUnit] = useState<'ACRES' | 'GUNTAS' | 'HECTARES'>('ACRES');
  const [workerCount, setWorkerCount] = useState(entryPath === 'workers' ? 5 : 0);
  const [combineMachinery, setCombineMachinery] = useState(entryPath === 'machinery');
  const [selectedMachineId, setSelectedMachineId] = useState('m-tractor');
  const [machineryBilling, setMachineryBilling] = useState<'HOURLY' | 'DAILY' | 'PER_ACRE'>('PER_ACRE');
  const [machineryDuration, setMachineryDuration] = useState(2);
  const [includeOperator, setIncludeOperator] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);

  // Farm location
  const [village, setVillage] = useState('Miryalaguda');
  const [mandal, setMandal] = useState('Miryalaguda');
  const [district, setDistrict] = useState('Nalgonda');
  const [scheduledDate, setScheduledDate] = useState('2026-11-23');
  const [scheduledTime, setScheduledTime] = useState('07:00 AM');

  // Conditional Service-Specific Extra Questions (Test 11)
  const [sprayMaterial, setSprayMaterial] = useState('Organic Neem & Micronutrient Foliar');
  const [windWindow, setWindWindow] = useState('Early morning calm wind');
  const [cropMoisture, setCropMoisture] = useState('Dry & standing crop');
  const [ploughImplement, setPloughImplement] = useState('Rotavator (2 passes)');
  const [dripSpacing, setDripSpacing] = useState('4 ft row spacing · Borewell supply');
  const [cottonRound, setCottonRound] = useState('1st Picking');
  const [cattleCount, setCattleCount] = useState(12);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(entryPath === 'workers' ? 'WORKERS' : entryPath === 'machinery' ? 'MACHINERY' : 'SERVICES');
    if (entryPath === 'workers' && workerCount === 0) setWorkerCount(5);
    if (entryPath === 'machinery') setCombineMachinery(true);
  }, [entryPath]);

  useEffect(() => {
    fetch('/api/agriculture/catalog')
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services ?? []);
        setMachinery(d.machinery ?? []);
      })
      .catch(() => {});
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0],
    [services, selectedServiceId]
  );

  // Live area conversion (1 acre = 40 guntas, 1 hectare ≈ 2.47 acres — Test 11)
  const convertedArea = useMemo(() => {
    const val = Math.max(0.1, areaValue || 1);
    const acres = areaUnit === 'GUNTAS' ? val / 40 : areaUnit === 'HECTARES' ? val * 2.47 : val;
    return {
      acres: acres.toFixed(2),
      guntas: (acres * 40).toFixed(0),
      hectares: (acres / 2.47).toFixed(2),
    };
  }, [areaValue, areaUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate(`/login?next=/agriculture/${entryPath}`);
      return;
    }

    const serviceSpecific: Record<string, unknown> = {};
    if (mode === 'SERVICES' && selectedService) {
      if (selectedService.slug === 'drone-spraying') {
        serviceSpecific.sprayMaterial = sprayMaterial;
        serviceSpecific.windWindow = windWindow;
      } else if (selectedService.slug === 'paddy-harvesting') {
        serviceSpecific.cropMoisture = cropMoisture;
      } else if (selectedService.slug === 'ploughing-rotavator') {
        serviceSpecific.ploughImplement = ploughImplement;
      } else if (selectedService.slug === 'drip-irrigation') {
        serviceSpecific.dripSpacing = dripSpacing;
      } else if (selectedService.slug === 'cotton-picking') {
        serviceSpecific.cottonRound = cottonRound;
      } else if (selectedService.slug === 'dairy-farm-cleaning') {
        serviceSpecific.cattleCount = cattleCount;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/agriculture/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entryMode: mode,
          serviceId: mode === 'SERVICES' ? selectedServiceId : undefined,
          cropType,
          areaValue,
          areaUnit,
          workerCount: mode === 'WORKERS' ? Math.max(1, workerCount) : workerCount,
          machineId: mode === 'MACHINERY' || combineMachinery ? selectedMachineId : undefined,
          machineryBilling,
          machineryDuration,
          includeOperator,
          isRecurring,
          location: { village, mandal, district },
          scheduledDate,
          scheduledTime,
          serviceSpecific,
        }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || 'Could not submit agriculture booking.');
      else navigate(`/book/pay?id=${encodeURIComponent(d.booking.id)}`);
    } catch {
      setError('Network error submitting agriculture request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5B6B8C]">
        <Link to="/agriculture" className="hover:text-[#0B5FD9] font-medium">
          Agriculture
        </Link>
        <span>/</span>
        <span className="text-[#0A1F5C] font-semibold">
          {mode === 'WORKERS'
            ? 'Book Agricultural Workers'
            : mode === 'MACHINERY'
            ? 'Rent Agricultural Machinery'
            : 'Book Agricultural Services'}
        </span>
      </div>

      {/* Three Entry Options Switcher (Test 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'WORKERS' as const, title: '1. Book Workers', icon: Users },
          { id: 'SERVICES' as const, title: '2. Book Services', icon: Sprout },
          { id: 'MACHINERY' as const, title: '3. Rent Machinery', icon: Wrench },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              setMode(opt.id);
              if (opt.id === 'WORKERS' && workerCount === 0) setWorkerCount(5);
              if (opt.id === 'MACHINERY') setCombineMachinery(true);
            }}
            className={`min-h-[52px] px-4 rounded-2xl border font-bold text-sm flex items-center gap-2.5 cursor-pointer ${
              mode === opt.id
                ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                : 'border-[#DCE7F9] bg-white text-[#0A1F5C]'
            }`}
          >
            <opt.icon className="w-4 h-4 shrink-0" />
            <span>{opt.title}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 serva-card p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
              {error}
            </div>
          )}

          {/* Service selection & conditional fields */}
          {mode === 'SERVICES' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="ag-svc" className="block text-xs font-bold uppercase text-[#5B6B8C] mb-1.5">
                  Select Agricultural Operation
                </label>
                <select
                  id="ag-svc"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white font-semibold text-[#0A1F5C]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Est. ₹{Math.round(s.ratePaise / 100)} {s.unitLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service-specific conditional fields ONLY for chosen service (Test 11) */}
              {selectedService?.slug === 'drone-spraying' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9] space-y-3">
                  <p className="text-xs font-bold text-[#0A1F5C]">Drone Spraying Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ag-spray" className="block text-xs font-semibold text-[#5B6B8C] mb-1">
                        Spray Material / Pesticide / Nutrient
                      </label>
                      <input
                        id="ag-spray"
                        type="text"
                        value={sprayMaterial}
                        onChange={(e) => setSprayMaterial(e.target.value)}
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="ag-wind" className="block text-xs font-semibold text-[#5B6B8C] mb-1">
                        Preferred Spraying Window
                      </label>
                      <input
                        id="ag-wind"
                        type="text"
                        value={windWindow}
                        onChange={(e) => setWindWindow(e.target.value)}
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Pesticide Safety Notice: All drone spraying follows DGCA & CIB&RC safety regulations, approved dosage guidelines, and protective gear protocols.
                    </span>
                  </div>
                </div>
              )}

              {selectedService?.slug === 'paddy-harvesting' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9]">
                  <label htmlFor="ag-moist" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Paddy Field & Moisture Condition
                  </label>
                  <input
                    id="ag-moist"
                    type="text"
                    value={cropMoisture}
                    onChange={(e) => setCropMoisture(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  />
                </div>
              )}

              {selectedService?.slug === 'ploughing-rotavator' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9]">
                  <label htmlFor="ag-plough" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Soil Type & Implement Preference
                  </label>
                  <input
                    id="ag-plough"
                    type="text"
                    value={ploughImplement}
                    onChange={(e) => setPloughImplement(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  />
                </div>
              )}

              {selectedService?.slug === 'drip-irrigation' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9]">
                  <label htmlFor="ag-drip" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Row Spacing & Water Source
                  </label>
                  <input
                    id="ag-drip"
                    type="text"
                    value={dripSpacing}
                    onChange={(e) => setDripSpacing(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  />
                </div>
              )}

              {selectedService?.slug === 'cotton-picking' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9]">
                  <label htmlFor="ag-cotton" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Cotton Picking Round
                  </label>
                  <input
                    id="ag-cotton"
                    type="text"
                    value={cottonRound}
                    onChange={(e) => setCottonRound(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  />
                </div>
              )}

              {selectedService?.slug === 'dairy-farm-cleaning' && (
                <div className="p-4 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9]">
                  <label htmlFor="ag-cattle" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                    Cattle / Livestock Count
                  </label>
                  <input
                    id="ag-cattle"
                    type="number"
                    min={1}
                    max={500}
                    value={cattleCount}
                    onChange={(e) => setCattleCount(Math.max(1, Number(e.target.value)))}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Crop & Area Units (1 acre = 40 guntas, 1 hectare = 2.47 acres) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="ag-crop" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Crop Type
              </label>
              <input
                id="ag-crop"
                type="text"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
            <div>
              <label htmlFor="ag-area-val" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Farm Area
              </label>
              <input
                id="ag-area-val"
                type="number"
                step="0.1"
                min="0.1"
                value={areaValue}
                onChange={(e) => setAreaValue(Math.max(0.1, Number(e.target.value)))}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
              />
            </div>
            <div>
              <label htmlFor="ag-area-unit" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                Area Unit
              </label>
              <select
                id="ag-area-unit"
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as 'ACRES' | 'GUNTAS' | 'HECTARES')}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                <option value="ACRES">Acres</option>
                <option value="GUNTAS">Guntas (40/acre)</option>
                <option value="HECTARES">Hectares (2.47 ac)</option>
              </select>
            </div>
          </div>

          <p className="text-xs font-mono-num text-[#16A34A] font-semibold">
            Equivalent Area: {convertedArea.acres} acres = {convertedArea.guntas} guntas ={' '}
            {convertedArea.hectares} hectares
          </p>

          {/* Workers team presets (5, 10, 20 or custom) */}
          <div className="space-y-2 pt-2 border-t border-[#EAF2FF]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="ag-workers" className="text-xs font-bold text-[#0A1F5C]">
                Agricultural Workers (Optional or Standalone)
              </label>
              <div className="flex gap-1.5">
                {[0, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWorkerCount(preset)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                      workerCount === preset
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F1F6FF] text-[#0A1F5C]'
                    }`}
                  >
                    {preset === 0 ? 'None' : `${preset} team`}
                  </button>
                ))}
              </div>
            </div>
            <input
              id="ag-workers"
              type="number"
              min={0}
              max={200}
              value={workerCount}
              onChange={(e) => setWorkerCount(Math.max(0, Number(e.target.value)))}
              className="w-32 min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
            />
          </div>

          {/* Combine Machinery option */}
          <div className="space-y-3 pt-2 border-t border-[#EAF2FF]">
            <label className="flex items-center gap-2 text-sm font-bold text-[#0A1F5C] cursor-pointer">
              <input
                type="checkbox"
                checked={mode === 'MACHINERY' || combineMachinery}
                onChange={(e) => setCombineMachinery(e.target.checked)}
                className="w-4 h-4 accent-[#16A34A]"
              />
              <span>Include / Rent Agricultural Machinery</span>
            </label>

            {(mode === 'MACHINERY' || combineMachinery) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F5F9FF]">
                <div className="sm:col-span-2">
                  <label htmlFor="ag-mach" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Machinery Type
                  </label>
                  <select
                    id="ag-mach"
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  >
                    {machinery.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ag-mbill" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                    Rate Mode
                  </label>
                  <select
                    id="ag-mbill"
                    value={machineryBilling}
                    onChange={(e) => setMachineryBilling(e.target.value as 'HOURLY' | 'DAILY' | 'PER_ACRE')}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                  >
                    <option value="PER_ACRE">Per Acre</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
                {machineryBilling !== 'PER_ACRE' && (
                  <div>
                    <label htmlFor="ag-mdur" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Hours / Days
                    </label>
                    <input
                      id="ag-mdur"
                      type="number"
                      min={1}
                      max={100}
                      value={machineryDuration}
                      onChange={(e) => setMachineryDuration(Math.max(1, Number(e.target.value)))}
                      className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num bg-white"
                    />
                  </div>
                )}
                <label className="sm:col-span-2 flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={includeOperator}
                    onChange={(e) => setIncludeOperator(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A]"
                  />
                  <span>Operator included</span>
                </label>
              </div>
            )}
          </div>

          {/* Village, Mandal, District & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EAF2FF]">
            <input
              type="text"
              aria-label="Village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="Village"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <input
              type="text"
              aria-label="Mandal"
              value={mandal}
              onChange={(e) => setMandal(e.target.value)}
              placeholder="Mandal"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <input
              type="text"
              aria-label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <input
              type="date"
              aria-label="Scheduled Date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <select
              aria-label="Time Window"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
            >
              {['06:00 AM', '07:00 AM', '09:00 AM', '03:00 PM', '05:00 PM'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-[#16A34A]"
              />
              <span>Recurring seasonal booking</span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
            <span>{submitting ? 'Submitting Request...' : 'Review Farm Estimate & Submit'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <aside className="lg:col-span-4 serva-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1F5C]">Farm Estimate</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Estimated
            </span>
          </div>
          <p className="text-xs text-[#5B6B8C]">
            Crop: <strong className="text-[#0A1F5C]">{cropType}</strong> · Area:{' '}
            <strong className="text-[#0A1F5C]">
              {convertedArea.acres} ac ({convertedArea.guntas} guntas)
            </strong>
          </p>
          <div className="p-3.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#5B6B8C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span>
              Separate line items for labour, machinery rental, operator, travel, and platform fee are computed server-side upon submission. Final quotation requires your approval.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
