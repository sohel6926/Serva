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
  const [workerDays, setWorkerDays] = useState(1);
  const [combineMachinery, setCombineMachinery] = useState(entryPath === 'machinery');
  const [selectedMachineId, setSelectedMachineId] = useState('m-tractor');
  const [machineryBilling, setMachineryBilling] = useState<'HOURLY' | 'DAILY' | 'PER_ACRE'>('HOURLY');
  const [machineryDuration, setMachineryDuration] = useState(4); // Default 4 hours
  const [includeOperator, setIncludeOperator] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);

  // Dynamic Agri Wage Settings (Synchronized with Admin Panel)
  const [agriWageSettings, setAgriWageSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('serva_agri_wage_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      workerDailyWagePaise: 60000, // ₹600 / worker / day
      tractorHourlyPaise: 90000, // ₹900 / hr
      droneHourlyPaise: 80000, // ₹800 / hr
      harvesterHourlyPaise: 180000, // ₹1,800 / hr
      operatorHourlyPaise: 30000, // ₹300 / hr
    };
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'serva_agri_wage_settings' && e.newValue) {
        try {
          setAgriWageSettings(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

  const activeMachine = useMemo(
    () => machinery.find((m) => m.id === selectedMachineId) ?? machinery[0],
    [machinery, selectedMachineId]
  );

  const estimateCalculation = useMemo(() => {
    let workerSubtotal = 0;
    const workerDailyRate = agriWageSettings.workerDailyWagePaise || 60000;
    const activeWorkers = mode === 'WORKERS' ? Math.max(1, workerCount) : workerCount;
    if (activeWorkers > 0) {
      workerSubtotal = activeWorkers * workerDays * workerDailyRate;
    }

    let serviceSubtotal = 0;
    if (mode === 'SERVICES' && selectedService) {
      const isPerAcre = selectedService.unitLabel.includes('acre');
      serviceSubtotal = Math.round(isPerAcre ? selectedService.ratePaise * Number(convertedArea.acres) : selectedService.ratePaise);
    }

    let machinerySubtotal = 0;
    let operatorSubtotal = 0;
    if (mode === 'MACHINERY' || combineMachinery) {
      const hourlyRate = activeMachine?.hourlyRatePaise || agriWageSettings.tractorHourlyPaise || 90000;
      if (machineryBilling === 'HOURLY') {
        machinerySubtotal = hourlyRate * machineryDuration;
        if (includeOperator) {
          operatorSubtotal = (activeMachine?.operatorFeePaise || agriWageSettings.operatorHourlyPaise || 30000) * machineryDuration;
        }
      } else if (machineryBilling === 'DAILY') {
        const dailyRate = activeMachine?.dailyRatePaise || 600000;
        machinerySubtotal = dailyRate * machineryDuration;
        if (includeOperator) {
          operatorSubtotal = (activeMachine?.operatorFeePaise || 30000) * 8 * machineryDuration;
        }
      } else {
        const acreRate = activeMachine?.perAcreRatePaise || 85000;
        machinerySubtotal = Math.round(acreRate * Number(convertedArea.acres));
        if (includeOperator) {
          operatorSubtotal = activeMachine?.operatorFeePaise || 30000;
        }
      }
    }

    const travelFee = 15000; // ₹150
    const platformFee = 5000; // ₹50
    const totalPaise = workerSubtotal + serviceSubtotal + machinerySubtotal + operatorSubtotal + travelFee + platformFee;

    return {
      activeWorkers,
      workerDailyRate,
      workerSubtotal,
      serviceSubtotal,
      machinerySubtotal,
      operatorSubtotal,
      travelFee,
      platformFee,
      totalPaise,
    };
  }, [
    workerCount,
    workerDays,
    agriWageSettings,
    mode,
    selectedService,
    convertedArea.acres,
    combineMachinery,
    activeMachine,
    machineryBilling,
    machineryDuration,
    includeOperator,
  ]);

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
          workerDays: mode === 'WORKERS' || workerCount > 0 ? workerDays : 1,
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

          {/* Workers team & Daily Basis Shift selection */}
          <div className="space-y-4 pt-4 border-t border-[#EAF2FF]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label htmlFor="ag-workers" className="text-xs font-bold text-[#0A1F5C] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#16A34A]" />
                  <span>Agricultural Workers (Daily Basis Shift)</span>
                </label>
                <p className="text-[11px] text-[#5B6B8C]">
                  Book verified farm labour teams on an approved daily basis wage.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-green-50 border border-green-200 text-xs font-bold text-[#16A34A]">
                ₹{Math.round((agriWageSettings.workerDailyWagePaise || 60000) / 100)} / worker / day (Daily Basis)
              </span>
            </div>

            {/* Worker Count Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-[#5B6B8C]">Worker Team Size:</span>
                <div className="flex gap-1.5">
                  {[0, 5, 10, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWorkerCount(preset)}
                      className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        workerCount === preset
                          ? 'bg-[#16A34A] text-white shadow-xs'
                          : 'bg-[#F1F6FF] text-[#0A1F5C] hover:bg-slate-200'
                      }`}
                    >
                      {preset === 0 ? 'None' : `${preset} workers`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="ag-workers"
                  type="number"
                  min={0}
                  max={200}
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Math.max(0, Number(e.target.value)))}
                  className="w-32 min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num font-bold text-[#0A1F5C]"
                />
                <span className="text-xs text-[#5B6B8C]">field workers</span>
              </div>
            </div>

            {/* Daily Shift Duration in Days (Daily Basis) */}
            {(mode === 'WORKERS' || workerCount > 0) && (
              <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="ag-worker-days" className="text-xs font-bold text-[#0A1F5C]">
                    Duration in Days (Daily Basis)
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWorkerDays(d)}
                        className={`min-h-[32px] px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          workerDays === d
                            ? 'bg-[#0A1F5C] text-white shadow-xs'
                            : 'bg-white border border-[#DCE7F9] text-[#5B6B8C] hover:text-[#0A1F5C]'
                        }`}
                      >
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="ag-worker-days"
                    type="number"
                    min={1}
                    max={90}
                    value={workerDays}
                    onChange={(e) => setWorkerDays(Math.max(1, Number(e.target.value)))}
                    className="w-32 min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num font-bold text-[#0A1F5C] bg-white"
                  />
                  <span className="text-xs text-[#5B6B8C]">
                    daily shift ({workerDays} {workerDays === 1 ? 'day' : 'days'} × {mode === 'WORKERS' ? Math.max(1, workerCount) : workerCount} workers = {(mode === 'WORKERS' ? Math.max(1, workerCount) : workerCount) * workerDays} man-days)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-[#5B6B8C]">Labour Wages Subtotal (Daily Basis):</span>
                  <span className="font-mono-num font-extrabold text-[#16A34A] text-sm">
                    ₹{(estimateCalculation.workerSubtotal / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Combine Machinery option (Hourly Basis Wages) */}
          <div className="space-y-3 pt-3 border-t border-[#EAF2FF]">
            <label className="flex items-center gap-2 text-sm font-bold text-[#0A1F5C] cursor-pointer">
              <input
                type="checkbox"
                checked={mode === 'MACHINERY' || combineMachinery}
                onChange={(e) => setCombineMachinery(e.target.checked)}
                className="w-4 h-4 accent-[#16A34A]"
              />
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#16A34A]" />
                <span>Include / Rent Agricultural Machinery (Hourly Basis)</span>
              </span>
            </label>

            {(mode === 'MACHINERY' || combineMachinery) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F9FF] border border-[#DCE7F9] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#0A1F5C]">Machinery Rental & Hourly Operator Wage</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B5FD9] text-[11px] font-bold">
                    Hourly Basis Preferred
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="ag-mach" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Machinery Model
                    </label>
                    <select
                      id="ag-mach"
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white font-semibold text-[#0A1F5C]"
                    >
                      {machinery.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — ₹{Math.round(m.hourlyRatePaise / 100)}/hr (Hourly Basis)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ag-mbill" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Billing Basis
                    </label>
                    <select
                      id="ag-mbill"
                      value={machineryBilling}
                      onChange={(e) => setMachineryBilling(e.target.value as 'HOURLY' | 'DAILY' | 'PER_ACRE')}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm bg-white font-semibold text-[#0A1F5C]"
                    >
                      <option value="HOURLY">Hourly Basis (Recommended)</option>
                      <option value="DAILY">Daily Basis</option>
                      <option value="PER_ACRE">Per Acre Basis</option>
                    </select>
                  </div>
                </div>

                {/* Hourly Duration Selector */}
                {machineryBilling === 'HOURLY' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label htmlFor="ag-mdur" className="text-xs font-bold text-[#0A1F5C]">
                        Machinery Hours (Hourly Basis)
                      </label>
                      <div className="flex gap-1.5">
                        {[2, 4, 6, 8].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setMachineryDuration(hrs)}
                            className={`min-h-[32px] px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              machineryDuration === hrs
                                ? 'bg-[#0B5FD9] text-white shadow-xs'
                                : 'bg-white border border-[#DCE7F9] text-[#5B6B8C] hover:text-[#0A1F5C]'
                            }`}
                          >
                            {hrs} Hours
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="ag-mdur"
                        type="number"
                        min={1}
                        max={100}
                        value={machineryDuration}
                        onChange={(e) => setMachineryDuration(Math.max(1, Number(e.target.value)))}
                        className="w-32 min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num font-bold text-[#0A1F5C] bg-white"
                      />
                      <span className="text-xs text-[#5B6B8C]">
                        operational hours @ ₹{Math.round((activeMachine?.hourlyRatePaise || 90000) / 100)} / hr
                      </span>
                    </div>
                  </div>
                )}

                {machineryBilling === 'DAILY' && (
                  <div>
                    <label htmlFor="ag-mdur-daily" className="block text-xs font-semibold text-[#0A1F5C] mb-1">
                      Machinery Duration (Days)
                    </label>
                    <input
                      id="ag-mdur-daily"
                      type="number"
                      min={1}
                      max={60}
                      value={machineryDuration}
                      onChange={(e) => setMachineryDuration(Math.max(1, Number(e.target.value)))}
                      className="w-32 min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm font-mono-num font-bold text-[#0A1F5C] bg-white"
                    />
                  </div>
                )}

                {/* Operator Checkbox with Hourly Operator Rate */}
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOperator}
                      onChange={(e) => setIncludeOperator(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5FD9]"
                    />
                    <span>Include Trained Machine Operator / Driver</span>
                  </label>
                  <span className="text-xs font-bold text-[#0B5FD9]">
                    +₹{Math.round((activeMachine?.operatorFeePaise || 30000) / 100)} / hr operator wage
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-100">
                  <span className="text-[#5B6B8C]">Machinery + Operator Subtotal:</span>
                  <span className="font-mono-num font-extrabold text-[#0B5FD9] text-sm">
                    ₹{((estimateCalculation.machinerySubtotal + estimateCalculation.operatorSubtotal) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
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
            <span>{submitting ? 'Submitting Request...' : `Review Farm Estimate (₹${(estimateCalculation.totalPaise / 100).toLocaleString('en-IN')}) & Submit`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Farm Estimate Itemized Sidebar ── */}
        <aside className="lg:col-span-4 serva-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EAF2FF] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0A1F5C]">Farm Estimate</h2>
              <p className="text-[11px] text-[#5B6B8C]">Itemized daily & hourly basis calculation</p>
            </div>
            <span className="text-xs font-extrabold text-[#16A34A] bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              Live Total
            </span>
          </div>

          <p className="text-xs text-[#5B6B8C]">
            Crop: <strong className="text-[#0A1F5C]">{cropType}</strong> &bull; Area:{' '}
            <strong className="text-[#0A1F5C]">
              {convertedArea.acres} ac ({convertedArea.guntas} guntas)
            </strong>
          </p>

          {/* Itemized Line Items */}
          <div className="space-y-3 pt-2 text-xs">
            {estimateCalculation.activeWorkers > 0 && (
              <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A1F5C]">Agricultural Labour (Daily Basis)</span>
                  <span className="font-bold text-[#16A34A] font-mono-num">
                    ₹{(estimateCalculation.workerSubtotal / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B8C]">
                  {estimateCalculation.activeWorkers} workers &times; {workerDays} {workerDays === 1 ? 'day' : 'days'} @ ₹{Math.round(estimateCalculation.workerDailyRate / 100)}/day
                </p>
              </div>
            )}

            {mode === 'SERVICES' && selectedService && (
              <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A1F5C]">Farm Service ({selectedService.name})</span>
                  <span className="font-bold text-[#0B5FD9] font-mono-num">
                    ₹{(estimateCalculation.serviceSubtotal / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B8C]">
                  {convertedArea.acres} acres @ ₹{Math.round(selectedService.ratePaise / 100)} {selectedService.unitLabel}
                </p>
              </div>
            )}

            {(mode === 'MACHINERY' || combineMachinery) && (
              <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#EAF2FF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A1F5C]">Machinery Rental ({machineryBilling === 'HOURLY' ? 'Hourly Basis' : machineryBilling})</span>
                  <span className="font-bold text-[#0B5FD9] font-mono-num">
                    ₹{((estimateCalculation.machinerySubtotal + estimateCalculation.operatorSubtotal) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#5B6B8C]">
                  {activeMachine?.name} &bull; {machineryDuration} {machineryBilling === 'HOURLY' ? 'hours' : 'units'} @ ₹{Math.round((activeMachine?.hourlyRatePaise || 90000) / 100)}/hr
                  {includeOperator && ` (+ ₹${Math.round((activeMachine?.operatorFeePaise || 30000) / 100)}/hr operator)`}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-[#5B6B8C] px-1">
              <span>Farm Mobilization & Transport</span>
              <span className="font-mono-num">₹{estimateCalculation.travelFee / 100}</span>
            </div>

            <div className="flex items-center justify-between text-[#5B6B8C] px-1">
              <span>Platform Safety & Verification Fee</span>
              <span className="font-mono-num">₹{estimateCalculation.platformFee / 100}</span>
            </div>

            {/* Total Estimated Cost */}
            <div className="pt-3 border-t border-[#EAF2FF] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#0A1F5C] block">Total Estimated Cost</span>
                <span className="text-[10px] text-[#5B6B8C]">Inclusive of daily & hourly wages</span>
              </div>
              <span className="text-2xl font-black text-[#16A34A] font-mono-num">
                ₹{(estimateCalculation.totalPaise / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-[11px] text-[#5B6B8C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span>
              Wages are calibrated with SERVA Rythu labour contractors. Workers receive approved daily basis shifts, and machinery is billed by operating hour.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
