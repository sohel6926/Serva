import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Globe,
  Headphones,
  MapPin,
  Plus,
  Receipt,
  Sprout,
  Tag,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link } from '../lib/router.tsx';

/* 1. WALLET PAGE */
export function WalletPage() {
  const [wallet, setWallet] = useState<{ balance_paise: number } | null>(null);
  const [transactions, setTransactions] = useState<
    Array<{ id: string; type: string; amount_paise: number; description: string; created_at: string }>
  >([]);
  const [receipts, setReceipts] = useState<
    Array<{
      id: string;
      booking_id: string;
      booking_code: string;
      booking_title: string;
      receipt_number: string;
      method: string;
      amount_paise: number;
      created_at: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [topupRupees, setTopupRupees] = useState(500);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/wallet', { credentials: 'include' });
    const d = await res.json();
    if (res.ok) {
      setWallet(d.wallet);
      setTransactions(d.transactions ?? []);
      setReceipts(d.receipts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amountRupees: topupRupees }),
    });
    if (res.ok) {
      setNotice(`Added ₹${topupRupees.toLocaleString('en-IN')} to your SERVA Wallet.`);
      await load();
    }
  };

  if (loading) return <div className="serva-card p-8 h-56 animate-pulse bg-[#F5F9FF]" />;

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 bg-gradient-to-r from-[#0A1F5C] to-[#0B5FD9] text-white">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-blue-100 flex items-center gap-1.5">
            <Wallet className="w-4 h-4" /> SERVA Wallet & Receipts
          </p>
          <p className="text-3xl font-bold font-mono-num">
            ₹{Math.round((wallet?.balance_paise ?? 0) / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-blue-100">Available wallet balance for instant checkout</p>
        </div>

        <form onSubmit={handleTopup} className="flex items-center gap-2 bg-white/15 p-2 rounded-2xl">
          <input
            type="number"
            min={100}
            max={100000}
            aria-label="Top-up amount in rupees"
            value={topupRupees}
            onChange={(e) => setTopupRupees(Number(e.target.value))}
            className="w-28 min-h-[40px] px-3 rounded-xl bg-white text-[#0A1F5C] text-sm font-mono-num font-bold"
          />
          <button
            type="submit"
            className="min-h-[40px] px-4 rounded-xl bg-white text-[#0B5FD9] text-xs font-bold cursor-pointer"
          >
            Add Sample Credit
          </button>
        </form>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-sm text-[#16A34A] font-semibold">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="serva-card p-6 space-y-3">
          <h2 className="text-lg font-bold text-[#0A1F5C]">Wallet Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-xs text-[#5B6B8C]">No wallet transactions yet.</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-[#F5F9FF] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0A1F5C]">{tx.description}</p>
                    <p className="text-[#5B6B8C]">{tx.type}</p>
                  </div>
                  <span
                    className={`font-mono-num font-bold text-sm ${
                      tx.type === 'DEBIT' ? 'text-[#DC2626]' : 'text-[#16A34A]'
                    }`}
                  >
                    {tx.type === 'DEBIT' ? '−' : '+'}₹
                    {Math.round(tx.amount_paise / 100).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="serva-card p-6 space-y-3">
          <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0B5FD9]" /> Digital Payment Receipts
          </h2>
          {receipts.length === 0 ? (
            <p className="text-xs text-[#5B6B8C]">No booking payment receipts yet.</p>
          ) : (
            <ul className="space-y-2">
              {receipts.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/bookings/${r.booking_id}`}
                    className="p-3.5 rounded-xl bg-[#F5F9FF] hover:bg-[#EAF2FF] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-mono-num font-bold text-[#0A1F5C]">{r.receipt_number}</p>
                      <p className="text-[#5B6B8C]">
                        {r.booking_code} · {r.booking_title} · {r.method}
                      </p>
                    </div>
                    <span className="font-mono-num font-bold text-[#0B5FD9] text-sm">
                      ₹{Math.round(r.amount_paise / 100).toLocaleString('en-IN')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* 2. OFFERS PAGE */
export function OffersPage() {
  const [offers, setOffers] = useState<
    Array<{ id: string; code: string; title: string; description: string; category_slug: string; valid_until: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((d) => setOffers(d.offers ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">Offers & Deals</h1>
        <p className="text-sm text-[#5B6B8C]">
          Transparent savings applied automatically on eligible SERVA bookings.
        </p>
      </div>

      {loading ? (
        <div className="serva-card h-40 animate-pulse bg-[#F5F9FF]" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="serva-card p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono-num font-bold text-[#0B5FD9] bg-[#EAF2FF] px-3 py-1 rounded-full">
                  <Tag className="w-3.5 h-3.5" /> {offer.code}
                </span>
                <h2 className="text-lg font-bold text-[#0A1F5C]">{offer.title}</h2>
                <p className="text-xs text-[#5B6B8C] leading-relaxed">{offer.description}</p>
              </div>
              <div className="pt-3 border-t border-[#EAF2FF] flex items-center justify-between text-xs">
                <span className="text-[#5B6B8C]">Valid till {offer.valid_until}</span>
                <Link
                  to={`/${offer.category_slug || 'services'}`}
                  className="font-bold text-[#0B5FD9] inline-flex items-center gap-1 hover:underline"
                >
                  Book Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* 3. PROFILE & SAVED HOME/FARM LOCATIONS */
export function ProfilePage() {
  const { user, language, setLanguage, city, setCity } = useAuth();
  const [addresses, setAddresses] = useState<
    Array<{
      id: string;
      label: string;
      kind: string;
      line1: string;
      area: string | null;
      village_mandal: string | null;
      city: string;
      pincode: string;
      is_default: number;
    }>
  >([]);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'HOME' | 'FARM' | 'WORK' | 'SITE'>('HOME');
  const [line1, setLine1] = useState('');
  const [villageMandal, setVillageMandal] = useState('');
  const [addrCity, setAddrCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500081');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/profile/addresses', { credentials: 'include' });
    const d = await res.json();
    if (res.ok) setAddresses(d.addresses ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/profile/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ label, kind, line1, villageMandal, city: addrCity, pincode }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error || 'Could not add address.');
    else {
      setLabel('');
      setLine1('');
      setVillageMandal('');
      await load();
    }
  };

  const removeAddress = async (id: string) => {
    await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F5C]">{user?.name}</h1>
          <p className="text-sm text-[#5B6B8C]">
            {user?.role} · {user?.mobile || user?.email} · {city}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C]">
            <Globe className="w-4 h-4 text-[#0B5FD9]" />
            <span>Language:</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-h-[36px] px-3 rounded-full border cursor-pointer ${
                language === 'en' ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]' : 'border-[#DCE7F9]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`min-h-[36px] px-3 rounded-full border cursor-pointer ${
                language === 'te' ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]' : 'border-[#DCE7F9]'
              }`}
            >
              తెలుగు
            </button>
          </div>
          <select
            aria-label="Preferred City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="min-h-[38px] px-3 rounded-full border border-[#DCE7F9] text-xs font-semibold bg-white"
          >
            {['Hyderabad, TG', 'Warangal, TG', 'Nalgonda, TG', 'Vijayawada, AP', 'Bengaluru, KA'].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-lg font-bold text-[#0A1F5C]">Saved Home & Farm Locations</h2>
          {addresses.map((a) => (
            <div key={a.id} className="serva-card p-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] flex items-center justify-center shrink-0">
                  {a.kind === 'FARM' ? <Sprout className="w-5 h-5 text-[#16A34A]" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-sm text-[#0A1F5C]">
                    {a.label} ({a.kind})
                  </p>
                  <p className="text-[#5B6B8C]">
                    {a.line1}
                    {a.village_mandal ? `, ${a.village_mandal}` : ''}
                  </p>
                  <p className="text-[#5B6B8C] font-mono-num">
                    {a.city} — {a.pincode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Delete ${a.label}`}
                onClick={() => removeAddress(a.id)}
                className="p-2 text-[#DC2626] hover:bg-red-50 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addAddress} className="lg:col-span-5 serva-card p-6 space-y-3">
          <h2 className="text-base font-bold text-[#0A1F5C] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#0B5FD9]" /> Add Home or Farm Location
          </h2>
          {error && <p className="text-xs text-[#DC2626] font-semibold">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. Home / Farm)"
              className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
            />
            <select
              aria-label="Location Type"
              value={kind}
              onChange={(e) => setKind(e.target.value as 'HOME' | 'FARM' | 'WORK' | 'SITE')}
              className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs bg-white"
            >
              <option value="HOME">HOME</option>
              <option value="FARM">FARM</option>
              <option value="WORK">WORK</option>
              <option value="SITE">SITE</option>
            </select>
          </div>
          <input
            type="text"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street / Survey No. *"
            className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
          />
          {kind === 'FARM' && (
            <input
              type="text"
              value={villageMandal}
              onChange={(e) => setVillageMandal(e.target.value)}
              placeholder="Village & Mandal"
              className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={addrCity}
              onChange={(e) => setAddrCity(e.target.value)}
              placeholder="City / District"
              className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
            />
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="6-digit Pincode"
              className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs font-mono-num"
            />
          </div>
          <button type="submit" className="w-full serva-pill-btn text-xs">
            Save Location
          </button>
        </form>
      </div>
    </div>
  );
}

/* 4. SUPPORT PAGE */
export function SupportPage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);
  const [tickets, setTickets] = useState<
    Array<{ id: string; booking_code: string; category: string; description: string; status: string; resolution_note: string | null }>
  >([]);
  const [userBookings, setUserBookings] = useState<Array<{ id: string; booking_code: string; title: string }>>([]);

  const [bookingId, setBookingId] = useState('');
  const [category, setCategory] = useState('Missing or Damaged Item');
  const [description, setDescription] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const res = await fetch('/api/support', { credentials: 'include' });
    const d = await res.json();
    if (res.ok) {
      setFaqs(d.faqs ?? []);
      setTickets(d.tickets ?? []);
      setUserBookings(d.userBookings ?? []);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dataUrl: reader.result, prefix: 'support' }),
      });
      const d = await res.json();
      if (res.ok && d.url) setPhotoUrl(d.url);
    };
    reader.readAsDataURL(f);
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bookingId: bookingId || undefined,
        category,
        description,
        callbackPhone: callbackPhone || undefined,
        photos: photoUrl ? [photoUrl] : [],
      }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error || 'Could not submit ticket.');
    else {
      setNotice(d.message || 'Your complaint / missing item report has been submitted.');
      setDescription('');
      setPhotoUrl('');
      await load();
    }
  };

  const displayFaqs =
    faqs.length > 0
      ? faqs
      : [
          {
            q: 'Does SERVA provide vehicles for Moving and Shifting?',
            a: 'No. SERVA provides packing, loading, unloading, and shifting teams only. Customers arrange their own transport vehicle.',
          },
          {
            q: 'Why do Cooking and Painting require online payment?',
            a: 'Both services require online payment only so chefs can source fresh ingredients and artists confirm supplies upfront.',
          },
        ];

  return (
    <div className="space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-2">
        <span className="text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-1.5">
          <Headphones className="w-4 h-4" /> SERVA Help & Dispute Resolution
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">Help & Support Center</h1>
        <p className="text-sm text-[#5B6B8C]">
          Frequently asked questions, complaint filing, missing or damaged item reports, and callback requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0A1F5C]">Frequently Asked Questions</h2>
          {displayFaqs.map((item) => (
            <div key={item.q} className="serva-card p-5 space-y-1.5">
              <h3 className="text-sm font-bold text-[#0A1F5C]">{item.q}</h3>
              <p className="text-xs text-[#5B6B8C] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-6 space-y-6">
          {user ? (
            <form onSubmit={submitTicket} className="serva-card p-6 space-y-3">
              <h2 className="text-lg font-bold text-[#0A1F5C] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" /> Report Issue / Request Callback
              </h2>
              {error && <p className="text-xs text-[#DC2626] font-semibold">{error}</p>}
              {notice && <p className="text-xs text-[#16A34A] font-semibold">{notice}</p>}

              <select
                aria-label="Booking (optional)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs bg-white"
              >
                <option value="">General Support / Callback (No specific booking)</option>
                {userBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.booking_code} — {b.title}
                  </option>
                ))}
              </select>

              <select
                aria-label="Issue Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-xs bg-white"
              >
                <option>Missing or Damaged Item</option>
                <option>Work Incomplete</option>
                <option>Billing Dispute</option>
                <option>Schedule / Delay</option>
                <option>Request Support Callback</option>
              </select>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened..."
                className="w-full p-3 rounded-xl border border-[#DCE7F9] text-xs"
              />

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="tel"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Callback mobile (optional)"
                  className="flex-1 min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs"
                />
                <label className="min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{photoUrl ? 'Photo Attached' : 'Attach Photo'}</span>
                  <input type="file" accept="image/*" onChange={uploadPhoto} className="sr-only" />
                </label>
              </div>

              <button type="submit" className="w-full serva-pill-btn text-xs">
                Submit Support Request
              </button>
            </form>
          ) : (
            <div className="serva-card p-6 space-y-3">
              <h2 className="text-base font-bold text-[#0A1F5C]">Need help with a booking?</h2>
              <p className="text-xs text-[#5B6B8C]">
                Sign in to file a complaint, report missing or damaged items, or request a callback.
              </p>
              <Link to="/login?next=/support" className="serva-pill-btn text-xs">
                Sign In for Support
              </Link>
            </div>
          )}

          {tickets.length > 0 && (
            <div className="serva-card p-6 space-y-3">
              <h2 className="text-base font-bold text-[#0A1F5C]">Your Support Tickets</h2>
              {tickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-[#F5F9FF] text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#0A1F5C]">
                    <span>
                      {t.booking_code} · {t.category}
                    </span>
                    <span className="text-[#0B5FD9]">{t.status}</span>
                  </div>
                  <p className="text-[#5B6B8C]">{t.description}</p>
                  {t.resolution_note && (
                    <p className="text-[#16A34A] font-semibold">Resolution: {t.resolution_note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
