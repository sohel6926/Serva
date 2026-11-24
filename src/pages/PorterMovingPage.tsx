import React, { useState, useMemo } from 'react';
import {
  Truck,
  Bike,
  Package,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Tag,
  Star,
  Edit2,
  Navigation,
  Box,
  Layers,
  HelpCircle,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

export type MovingServiceType = 'TRUCK' | 'TWO_WHEELER' | 'PACKERS_MOVERS';

export interface VehicleSpec {
  id: string;
  name: string;
  category: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'TWO_WHEELER';
  capacityKg: number;
  capacityDisplay: string;
  dimensions: string;
  baseFare: number;
  perKmRate: number;
  image: string;
  popular?: boolean;
  description: string;
}

const VEHICLE_CATALOG: VehicleSpec[] = [
  {
    id: 'pickup-8ft',
    name: 'Pickup 8ft',
    category: 'MEDIUM',
    capacityKg: 1200,
    capacityDisplay: '1200 kg',
    dimensions: '8ft x 4.8ft x 4.8ft',
    baseFare: 3476,
    perKmRate: 28,
    image: 'https://images.unsplash.com/photo-1586191582152-44670a4a8f94?auto=format&fit=crop&w=400&q=80',
    popular: true,
    description: 'Most popular for 1-2 BHK shifting, industrial cargo, and large appliances.',
  },
  {
    id: 'tata-ace',
    name: 'Tata Ace (Chota Hathi)',
    category: 'LIGHT',
    capacityKg: 750,
    capacityDisplay: '750 kg',
    dimensions: '7ft x 4.8ft x 4.8ft',
    baseFare: 3341,
    perKmRate: 24,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
    popular: true,
    description: 'Perfect for small flat moves, single room furniture, and quick city goods transfer.',
  },
  {
    id: 'pickup-9ft',
    name: 'Pickup 9ft',
    category: 'MEDIUM',
    capacityKg: 1700,
    capacityDisplay: '1700 kg',
    dimensions: '9ft x 5.5ft x 6ft',
    baseFare: 4982,
    perKmRate: 34,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
    description: 'Heavy duty load capacity for full 2-3 BHK home shifting and heavy machinery.',
  },
  {
    id: 'three-wheeler',
    name: '3 Wheeler (Ape / Champion)',
    category: 'LIGHT',
    capacityKg: 500,
    capacityDisplay: '500 kg',
    dimensions: '5.5ft x 4ft x 4ft',
    baseFare: 2638,
    perKmRate: 19,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    description: 'Budget-friendly vehicle for quick boxes, luggage, electronics, and narrow lanes.',
  },
  {
    id: '14ft-open',
    name: '14ft (Open)',
    category: 'HEAVY',
    capacityKg: 3500,
    capacityDisplay: '3500 kg',
    dimensions: '14ft x 6ft x 6ft',
    baseFare: 6978,
    perKmRate: 45,
    image: 'https://images.unsplash.com/photo-1580674684081-7617f14b60e6?auto=format&fit=crop&w=400&q=80',
    description: 'High capacity open truck for complete 3 BHK villas, office setups, and timber.',
  },
  {
    id: '14ft-closed',
    name: '14ft (Closed Container)',
    category: 'HEAVY',
    capacityKg: 3500,
    capacityDisplay: '3500 kg',
    dimensions: '14ft x 6ft x 6ft',
    baseFare: 6978,
    perKmRate: 46,
    image: 'https://images.unsplash.com/photo-1580674684081-7617f14b60e6?auto=format&fit=crop&w=400&q=80',
    description: 'Weatherproof closed container ensuring 100% protection from rain and dust.',
  },
  {
    id: '17ft-open',
    name: '17ft Open',
    category: 'HEAVY',
    capacityKg: 6000,
    capacityDisplay: '6000 kg',
    dimensions: '17ft x 6.5ft x 7ft',
    baseFare: 9332,
    perKmRate: 58,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
    description: 'Commercial mega mover for 4+ BHK duplexes, industrial cargo, and intercity hauls.',
  },
  {
    id: '17ft-closed',
    name: '17ft Closed (Container)',
    category: 'HEAVY',
    capacityKg: 6000,
    capacityDisplay: '6000 kg',
    dimensions: '17ft x 6.5ft x 7ft',
    baseFare: 9332,
    perKmRate: 60,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
    description: 'Maximum security all-weather long distance transport with sealed container locks.',
  },
  {
    id: 'two-wheeler',
    name: 'Two Wheeler (Courier & Packets)',
    category: 'TWO_WHEELER',
    capacityKg: 20,
    capacityDisplay: '20 kg',
    dimensions: '40cm x 40cm x 40cm',
    baseFare: 149,
    perKmRate: 12,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    description: 'Instant bike delivery for keys, documents, small boxes, food, and clothes.',
  },
];

const CITIES = [
  'Hyderabad',
  'Secunderabad',
  'Warangal',
  'Nalgonda',
  'Karimnagar',
  'Nizamabad',
  'Mumbai',
  'Bengaluru',
];

export function PorterMovingPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  // Mode Selection
  const [selectedService, setSelectedService] = useState<MovingServiceType>('TRUCK');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');

  // Input fields for Quick Estimate
  const [senderName, setSenderName] = useState(user?.name || 'Mohammad Sohel');
  const [senderPhone, setSenderPhone] = useState(user?.mobile || '9951875507');
  const [pickupAddress, setPickupAddress] = useState('Hyderabad, Telangana, India');
  const [dropAddress, setDropAddress] = useState('Nalgonda, Telangana, India');
  const [userRole, setUserRole] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');

  // Address edit modal state
  const [editingAddressType, setEditingAddressType] = useState<'PICKUP' | 'DROP' | null>(null);
  const [tempAddressVal, setTempAddressVal] = useState('');

  // Shifting / Packers Details
  const [propertySize, setPropertySize] = useState('2 BHK');
  const [helpersCount, setHelpersCount] = useState<number>(2);
  const [packingQuality, setPackingQuality] = useState<'STANDARD' | 'MULTI_LAYER'>('MULTI_LAYER');
  const [shiftingDate, setShiftingDate] = useState('2026-11-26');

  // Vehicle Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('pickup-8ft');
  const [vehicleFilter, setVehicleFilter] = useState<'ALL' | 'LIGHT' | 'MEDIUM' | 'HEAVY'>('ALL');

  // Booking Confirmation State
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Filtered vehicles
  const displayedVehicles = useMemo(() => {
    if (selectedService === 'TWO_WHEELER') {
      return VEHICLE_CATALOG.filter((v) => v.category === 'TWO_WHEELER');
    }
    return VEHICLE_CATALOG.filter((v) => {
      if (v.category === 'TWO_WHEELER') return false;
      if (vehicleFilter === 'LIGHT') return v.category === 'LIGHT';
      if (vehicleFilter === 'MEDIUM') return v.category === 'MEDIUM';
      if (vehicleFilter === 'HEAVY') return v.category === 'HEAVY';
      return true;
    });
  }, [selectedService, vehicleFilter]);

  const selectedVehicle =
    VEHICLE_CATALOG.find((v) => v.id === selectedVehicleId) || displayedVehicles[0] || VEHICLE_CATALOG[0];

  // Calculated Pricing Breakdown
  const distanceKm = pickupAddress.toLowerCase().includes('nalgonda') || dropAddress.toLowerCase().includes('nalgonda') ? 95 : 18;
  const tripTimeEst = distanceKm > 50 ? '~2.5 Hours' : '~45 Mins';

  const basePrice = selectedVehicle.baseFare;
  const helpersCost = selectedService === 'PACKERS_MOVERS' ? helpersCount * 650 : 0;
  const packingCost = selectedService === 'PACKERS_MOVERS' ? (packingQuality === 'MULTI_LAYER' ? 1200 : 600) : 0;
  const discountAmount = Math.min(450, Math.round((basePrice + helpersCost + packingCost) * 0.15));
  const finalTotalPaise = (basePrice + helpersCost + packingCost - discountAmount) * 100;
  const finalTotalRupees = Math.round(finalTotalPaise / 100);

  const handleStartEstimate = () => {
    const el = document.getElementById('porter-estimation-booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveAddress = () => {
    if (editingAddressType === 'PICKUP' && tempAddressVal.trim()) {
      setPickupAddress(tempAddressVal.trim());
    } else if (editingAddressType === 'DROP' && tempAddressVal.trim()) {
      setDropAddress(tempAddressVal.trim());
    }
    setEditingAddressType(null);
  };

  const handleConfirmBooking = () => {
    setIsBookingSubmitting(true);
    const bookingRef = `SERVA-MVR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: bookingRef,
      serviceCategory: 'Moving and Shifting',
      serviceType: selectedService,
      vehicleName: selectedVehicle.name,
      vehicleCapacity: selectedVehicle.capacityDisplay,
      senderName,
      senderPhone,
      pickupAddress,
      dropAddress,
      distanceKm,
      tripTimeEst,
      propertySize: selectedService === 'PACKERS_MOVERS' ? propertySize : undefined,
      helpersCount: selectedService === 'PACKERS_MOVERS' ? helpersCount : undefined,
      packingQuality: selectedService === 'PACKERS_MOVERS' ? packingQuality : undefined,
      finalAmountRupees: finalTotalRupees,
      status: 'CONFIRMED',
      scheduledDate: shiftingDate,
      createdAt: new Date().toISOString(),
      driverPartner: {
        name: 'Ramesh Reddy',
        phone: '9848129845',
        vehicleReg: 'TS 09 UB 4821',
        rating: 4.88,
        etaMinutes: 15,
      },
    };

    try {
      const existingBookings = JSON.parse(localStorage.getItem('serva_bookings') || '[]');
      existingBookings.unshift(newBooking);
      localStorage.setItem('serva_bookings', JSON.stringify(existingBookings));

      // Also register to inquiries for Admin & Partner panel
      const generalEnquiries = JSON.parse(localStorage.getItem('serva_enquiries') || '[]');
      generalEnquiries.unshift({
        refId: bookingRef,
        name: senderName,
        mobile: senderPhone,
        category: 'Moving & Shifting',
        service: `${selectedVehicle.name} (${selectedService})`,
        notes: `From: ${pickupAddress} -> To: ${dropAddress} (${distanceKm} km). Helpers: ${helpersCount}. Fare: ₹${finalTotalRupees}`,
        callTime: `${shiftingDate} Morning`,
        date: new Date().toISOString(),
      });
      localStorage.setItem('serva_enquiries', JSON.stringify(generalEnquiries));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Storage fallback
    }

    setTimeout(() => {
      setIsBookingSubmitting(false);
      setConfirmedBookingId(bookingRef);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F6F9FD] pb-24">
      {/* ── Top Brand Bar ── */}
      <div className="bg-white border-b border-[#DCE7F9] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl sm:text-2xl font-black text-[#0A1F5C] tracking-tight">
              SERVA<span className="text-[#0B5FD9]">.</span>
            </Link>
            <span className="hidden sm:inline text-xs font-bold text-[#5B6B8C] border-l border-slate-200 pl-3">
              Logistics &amp; Packers Movers
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-[#5B6B8C]">
            <Link to="/partner/register" className="hover:text-[#0B5FD9] hidden sm:inline">
              Driver Partner
            </Link>
            <Link to="/support" className="hover:text-[#0B5FD9]">
              Support &amp; Help
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0B5FD9] border border-blue-200 font-extrabold">
              <MapPin className="w-3.5 h-3.5 text-[#0B5FD9]" />
              <span>{selectedCity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER: "Delivery Aapki, Transport Hamara" (Image 1 & 3) ── */}
      <section className="relative bg-gradient-to-r from-[#071746] via-[#0B2570] to-[#0A1F5C] text-white pt-10 sm:pt-14 pb-28 sm:pb-36 px-4 sm:px-8 overflow-hidden">
        {/* Background Decorative Blur & Vehicle Illustration Art */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden lg:block pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1586191582152-44670a4a8f94?auto=format&fit=crop&w=1200&q=80"
            alt="Transport Logistics"
            className="w-full h-full object-cover mix-blend-screen"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-extrabold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hyderabad &amp; Telangana&apos;s #1 Mini Truck &amp; Shifting Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Delivery Aapki, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
              Transport Hamara
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Effortless online mini truck booking, goods transportation, and verified packers &amp; movers.
            Transparent instant pricing, 15-minute driver arrival, and real-time tracking.
          </p>
        </div>

        {/* ── FLOATING ESTIMATE BAR (Exact Match to Images 1, 2 & 3) ── */}
        <div className="max-w-7xl mx-auto relative z-20 -mb-24 sm:-mb-32 mt-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DCE7F9] space-y-6 text-[#0A1F5C]">
            {/* Top Row: City Selector + Service Selection Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAF2FF] pb-5">
              {/* City Dropdown */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B5FD9] shrink-0" />
                <span className="text-xs font-bold text-[#5B6B8C]">City:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-[#F4F8FE] border border-[#DCE7F9] rounded-xl px-3 py-1.5 text-xs font-black text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9] cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 Service Cards: Truck | Two Wheeler | Packers & Movers */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full md:w-auto">
                {/* 1. Truck */}
                <button
                  type="button"
                  onClick={() => setSelectedService('TRUCK')}
                  className={`p-3 sm:px-5 sm:py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all cursor-pointer border ${
                    selectedService === 'TRUCK'
                      ? 'bg-blue-50/80 border-[#0B5FD9] text-[#0B5FD9] shadow-xs'
                      : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#5B6B8C] hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0B5FD9] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs sm:text-sm font-black block leading-none">Truck</span>
                    <span className="text-[10px] text-[#5B6B8C] hidden sm:inline">Mini Trucks</span>
                  </div>
                </button>

                {/* 2. Two Wheeler */}
                <button
                  type="button"
                  onClick={() => setSelectedService('TWO_WHEELER')}
                  className={`p-3 sm:px-5 sm:py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all cursor-pointer border ${
                    selectedService === 'TWO_WHEELER'
                      ? 'bg-blue-50/80 border-[#0B5FD9] text-[#0B5FD9] shadow-xs'
                      : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#5B6B8C] hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs sm:text-sm font-black block leading-none">Two Wheeler</span>
                    <span className="text-[10px] text-[#5B6B8C] hidden sm:inline">Instant Delivery</span>
                  </div>
                </button>

                {/* 3. Packers & Movers */}
                <button
                  type="button"
                  onClick={() => setSelectedService('PACKERS_MOVERS')}
                  className={`p-3 sm:px-5 sm:py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all cursor-pointer border ${
                    selectedService === 'PACKERS_MOVERS'
                      ? 'bg-blue-50/80 border-[#0B5FD9] text-[#0B5FD9] shadow-xs'
                      : 'bg-[#F8FAFD] border-[#DCE7F9] text-[#5B6B8C] hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs sm:text-sm font-black block leading-none">Packers &amp; Movers</span>
                    <span className="text-[10px] text-[#5B6B8C] hidden sm:inline">House Shifting</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Input Fields Bar (Image 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-black uppercase text-[#5B6B8C] block">
                  Pickup Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Sending From (e.g. Jubilee Hills)"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-black uppercase text-[#5B6B8C] block">
                  Drop Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    placeholder="Sending to (e.g. Kondapur)"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-[#5B6B8C] block">
                  Your Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleStartEstimate}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-xs font-black shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Get Estimate →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN ESTIMATE & VEHICLE SELECTION (Images 4 & 5) ── */}
      <section id="porter-estimation-booking-section" className="max-w-7xl mx-auto px-4 sm:px-8 pt-32 sm:pt-40 space-y-8">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Quote &bull; Live Calculated Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F5C]">
            Select Your Vehicle &amp; Review Shifting Details
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B8C]">
            Approximate distance: <strong>{distanceKm} km</strong> &bull; Estimated Transit: <strong>{tripTimeEst}</strong>
          </p>
        </div>

        {confirmedBookingId ? (
          /* Confirmation State */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-300 shadow-xl text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Booking Confirmed &bull; Driver Partner Dispatched
              </span>
              <h3 className="text-2xl font-black text-[#0A1F5C] pt-2">
                Your Shifting is Scheduled!
              </h3>
              <p className="text-xs text-[#5B6B8C] font-mono">
                Booking Reference ID: <strong className="text-[#0A1F5C]">{confirmedBookingId}</strong>
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5B6B8C]">Vehicle:</span>
                <strong className="text-[#0A1F5C]">{selectedVehicle.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B8C]">Pickup:</span>
                <span className="font-semibold text-[#0A1F5C] truncate max-w-[220px]">{pickupAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B8C]">Drop:</span>
                <span className="font-semibold text-[#0A1F5C] truncate max-w-[220px]">{dropAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B8C]">Assigned Driver:</span>
                <strong className="text-emerald-700">Ramesh Reddy (TS 09 UB 4821)</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span>Total Fare:</span>
                <span className="text-[#0B5FD9]">₹{finalTotalRupees}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/bookings"
                className="px-6 py-3 rounded-2xl bg-[#0B5FD9] text-white text-xs font-black shadow-md hover:bg-[#094FB6]"
              >
                Track Live in My Bookings
              </Link>
              <button
                type="button"
                onClick={() => setConfirmedBookingId(null)}
                className="px-6 py-3 rounded-2xl bg-white border border-[#DCE7F9] text-[#0A1F5C] text-xs font-bold hover:bg-slate-50"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN: Address Details Card (Image 4 & 5) ── */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#DCE7F9] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAF2FF] pb-4">
                <h3 className="text-base font-black text-[#0A1F5C]">Address Details</h3>
                <span className="text-xs text-[#0B5FD9] font-bold">{selectedCity} Hub</span>
              </div>

              {/* Pickup & Drop Points (Porter Exact Layout) */}
              <div className="space-y-4 relative">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-300" />

                {/* Pickup Block */}
                <div className="flex items-start justify-between gap-3 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border-2 border-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#0A1F5C]">{senderName}</span>
                        <span className="text-xs text-[#5B6B8C]">&bull; {senderPhone}</span>
                      </div>
                      <p className="text-xs text-[#5B6B8C] leading-snug">{pickupAddress}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressType('PICKUP');
                      setTempAddressVal(pickupAddress);
                    }}
                    className="text-xs font-black text-[#0B5FD9] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Drop Block */}
                <div className="flex items-start justify-between gap-3 relative pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border-2 border-rose-500">
                      <div className="w-2 h-2 rounded-full bg-rose-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#0A1F5C]">{senderName}</span>
                        <span className="text-xs text-[#5B6B8C]">&bull; {senderPhone}</span>
                      </div>
                      <p className="text-xs text-[#5B6B8C] leading-snug">{dropAddress}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressType('DROP');
                      setTempAddressVal(dropAddress);
                    }}
                    className="text-xs font-black text-[#0B5FD9] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Packers & Movers Specific Add-ons */}
              {selectedService === 'PACKERS_MOVERS' && (
                <div className="space-y-4 pt-4 border-t border-[#EAF2FF]">
                  <div>
                    <label className="text-xs font-black text-[#0A1F5C] block mb-1.5">
                      Select Property Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1 RK', '1 BHK', '2 BHK', '3+ BHK'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPropertySize(size)}
                          className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                            propertySize === size
                              ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                              : 'bg-slate-50 text-[#5B6B8C] border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-[#0A1F5C] block mb-1.5">
                      Helpers / Labours Required: <span className="text-[#0B5FD9]">{helpersCount} Helpers</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setHelpersCount(num)}
                          className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                            helpersCount === num
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-50 text-[#5B6B8C] border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {num} {num === 1 ? 'Helper' : 'Helpers'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-[#0A1F5C] block mb-1.5">
                      Packing Materials Tier
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPackingQuality('STANDARD')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                          packingQuality === 'STANDARD'
                            ? 'bg-blue-50 border-[#0B5FD9] text-[#0B5FD9] font-bold'
                            : 'bg-slate-50 border-slate-200 text-[#5B6B8C]'
                        }`}
                      >
                        <span className="block font-black">Standard Packing</span>
                        <span className="text-[10px] block opacity-80">Corrugated boxes &amp; tape (+₹600)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPackingQuality('MULTI_LAYER')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                          packingQuality === 'MULTI_LAYER'
                            ? 'bg-blue-50 border-[#0B5FD9] text-[#0B5FD9] font-bold'
                            : 'bg-slate-50 border-slate-200 text-[#5B6B8C]'
                        }`}
                      >
                        <span className="block font-black">Multi-Layer Bubble</span>
                        <span className="text-[10px] block opacity-80">Fragile wrapping &amp; foam (+₹1,200)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shifting Date Input */}
              <div className="pt-2 border-t border-[#EAF2FF]">
                <label className="text-xs font-black text-[#0A1F5C] block mb-1">
                  Scheduled Shifting Date
                </label>
                <input
                  type="date"
                  value={shiftingDate}
                  onChange={(e) => setShiftingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFD] border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
                />
              </div>

              {/* Transit Insurance Pill */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Free Transit Protection:</strong> Goods insured up to ₹50,000 against accidental transit damage.
                </span>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Select Vehicle List & Live Fares (Image 4 & 5) ── */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#DCE7F9] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF2FF] pb-4">
                <div>
                  <h3 className="text-base font-black text-[#0A1F5C]">Select Vehicle</h3>
                  <p className="text-xs text-[#5B6B8C]">Choose capacity tailored to your goods weight</p>
                </div>

                {/* Filter Tabs (Light / Medium / Heavy) */}
                {selectedService !== 'TWO_WHEELER' && (
                  <div className="inline-flex rounded-xl p-0.5 bg-[#F4F8FE] border border-[#DCE7F9] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setVehicleFilter('ALL')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        vehicleFilter === 'ALL' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleFilter('LIGHT')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        vehicleFilter === 'LIGHT' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                      }`}
                    >
                      &lt; 750kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleFilter('MEDIUM')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        vehicleFilter === 'MEDIUM' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                      }`}
                    >
                      750-2000kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleFilter('HEAVY')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        vehicleFilter === 'HEAVY' ? 'bg-white text-[#0B5FD9] shadow-xs' : 'text-[#5B6B8C]'
                      }`}
                    >
                      &gt; 2000kg
                    </button>
                  </div>
                )}
              </div>

              {/* ── TOP FEATURED SELECTED VEHICLE CARD (Image 4 exact highlight) ── */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-2 border-[#0B5FD9] shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl bg-white border border-[#DCE7F9] p-1.5 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-[#0A1F5C]">{selectedVehicle.name}</h4>
                        {selectedVehicle.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0B5FD9] text-[10px] font-extrabold">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5B6B8C] mt-1 font-semibold">
                        <span>Capacity: <strong className="text-[#0A1F5C]">{selectedVehicle.capacityDisplay}</strong></span>
                        <span>&bull;</span>
                        <span>Size: {selectedVehicle.dimensions}</span>
                      </div>
                      <p className="text-[11px] text-[#5B6B8C] mt-1 line-clamp-1">{selectedVehicle.description}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#5B6B8C] block">Estimated Fare</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0B5FD9] font-mono-num">
                      ₹ {selectedVehicle.baseFare}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── SCROLLABLE LIST OF ALL AVAILABLE VEHICLES (Images 4 & 5) ── */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {displayedVehicles.map((vehicle) => {
                  const isSelected = selectedVehicle.id === vehicle.id;
                  return (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/50 border-[#0B5FD9] shadow-xs'
                          : 'bg-white border-[#E2E8F0] hover:border-[#0B5FD9]/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-12 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#0A1F5C]">{vehicle.name}</span>
                            {vehicle.popular && (
                              <span className="text-[9px] font-bold text-[#0B5FD9] bg-blue-100 px-1.5 py-0.2 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#5B6B8C] font-semibold">
                            {vehicle.capacityDisplay} &bull; {vehicle.dimensions}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#0A1F5C] font-mono-num">
                          ₹ {vehicle.baseFare}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Offer Banner (Porter exact style) */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Get up to 30% off on your first order. *T&amp;C apply</span>
                </div>
                <span className="text-emerald-700 font-black">-₹{discountAmount}</span>
              </div>

              {/* Total Fare & "Book Now" Button (Image 4 & 5 CTA) */}
              <div className="pt-2 border-t border-[#EAF2FF] space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-[#5B6B8C] block">Total Amount Payable</span>
                    <span className="text-[11px] text-[#5B6B8C]">Includes fuel, toll taxes &amp; platform guarantee</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#0B5FD9] font-mono-num">
                      ₹ {finalTotalRupees}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isBookingSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#0B5FD9] hover:bg-[#094FB6] text-white text-base font-black shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Truck className="w-5 h-5 text-blue-200" />
                  <span>{isBookingSubmitting ? 'Confirming Driver Dispatch...' : 'Book Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── WHY CHOOSE PORTER-STYLE SERVA LOGISTICS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE7F9] shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-[#0A1F5C]">Why Choose SERVA Logistics &amp; Movers?</h3>
            <p className="text-xs sm:text-sm text-[#5B6B8C]">
              Built for speed, reliability, and guaranteed zero hidden charges across Telangana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B5FD9] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#0A1F5C]">15-Min Driver Arrival</h4>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">
                Nearest verified mini truck or two-wheeler dispatched immediately to your doorstep.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#0A1F5C]">₹50,000 Transit Insurance</h4>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">
                Complete coverage for furniture, electronics, and commercial shipments against accidental damage.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#0A1F5C]">Transparent Metered Fare</h4>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">
                Pre-decided rates based on exact distance. No bargaining or unexpected day-of surcharges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-[#DCE7F9] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-[#0A1F5C]">Live GPS Route Tracking</h4>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">
                Share tracking link with receivers and call your driver partner directly on the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADDRESS EDIT MODAL ── */}
      {editingAddressType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DCE7F9] shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-[#0A1F5C]">
                Edit {editingAddressType === 'PICKUP' ? 'Pickup' : 'Drop'} Address
              </h4>
              <button
                type="button"
                onClick={() => setEditingAddressType(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5B6B8C]">
                Detailed Location / Landmark
              </label>
              <textarea
                rows={3}
                value={tempAddressVal}
                onChange={(e) => setTempAddressVal(e.target.value)}
                placeholder="e.g. Flat 301, Sri Nagar Colony, Jubilee Hills, Hyderabad"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-[#DCE7F9] text-xs font-bold text-[#0A1F5C] focus:outline-none focus:border-[#0B5FD9]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAddressType(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5B6B8C] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                className="px-5 py-2 rounded-xl bg-[#0B5FD9] text-white text-xs font-black shadow-md hover:bg-[#094FB6]"
              >
                Update Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
