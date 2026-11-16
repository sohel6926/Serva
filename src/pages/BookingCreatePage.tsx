import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Clock, Info, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

interface ServiceInfo {
  id: string;
  category_slug: string;
  slug: string;
  name: string;
  description: string;
  base_price_paise: number;
  unit_label: string;
  online_payment_only: number;
}

export function BookingCreatePage({
  categorySlug,
  serviceSlug,
}: {
  categorySlug: string;
  serviceSlug: string;
}) {
  const { user, city } = useAuth();
  const { navigate } = useRouter();
  const [service, setService] = useState<ServiceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('2026-11-18');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [line1, setLine1] = useState('Flat 402, Sri Sai Residency, Madhapur');
  const [area, setArea] = useState('Madhapur');
  const [pincode, setPincode] = useState('500081');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/services?category=${encodeURIComponent(categorySlug)}`)
      .then((r) => r.json())
      .then((d) => {
        const match = (d.services ?? []).find((s: ServiceInfo) => s.slug === serviceSlug) ?? null;
        setService(match);
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [categorySlug, serviceSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/book/${categorySlug}/${serviceSlug}`)}`);
      return;
    }
    if (line1.trim().length < 3) {
      setError('Please enter your service address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          categorySlug,
          serviceSlug,
          quantity,
          scheduledDate,
          scheduledTime,
          address: {
            line1: line1.trim(),
            area: area.trim(),
            city,
            pincode: pincode.trim(),
          },
          details: { notes: notes.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create booking.');
        return;
      }
      navigate(`/book/pay?id=${encodeURIComponent(data.booking.id)}`);
    } catch {
      setError('Network error submitting booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="serva-card p-8 h-64 animate-pulse bg-[#F5F9FF]" />;
  }

  if (!service) {
    return (
      <div className="serva-card p-8 text-center space-y-3">
        <h1 className="text-xl font-bold text-[#0A1F5C]">Service not found</h1>
        <Link to="/services" className="serva-pill-btn">
          Browse Services
        </Link>
      </div>
    );
  }

  const estimatedTotal = Math.round((service.base_price_paise * quantity) / 100);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form onSubmit={handleSubmit} className="lg:col-span-7 serva-card p-6 sm:p-8 space-y-5">
        <div>
          <p className="text-xs font-semibold text-[#0B5FD9] uppercase tracking-wide">
            {categorySlug.replace('-', ' ')}
          </p>
          <h1 className="text-2xl font-bold text-[#0A1F5C] mt-1">{service.name}</h1>
          <p className="text-sm text-[#5B6B8C] mt-1">{service.description}</p>
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bk-date" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
              Preferred Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="bk-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bk-time" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
              Time Slot (12-hour)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="bk-time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                {['09:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bk-qty" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
            Quantity / Units ({service.unit_label})
          </label>
          <div className="inline-flex items-center gap-3 border border-[#DCE7F9] rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg bg-[#F1F6FF] text-[#0A1F5C] font-bold cursor-pointer"
            >
              -
            </button>
            <span id="bk-qty" className="w-10 text-center font-mono-num font-bold text-[#0A1F5C]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              className="w-10 h-10 rounded-lg bg-[#F1F6FF] text-[#0A1F5C] font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="bk-addr" className="block text-sm font-semibold text-[#0A1F5C]">
            Service Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-3.5" />
            <input
              id="bk-addr"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House / Flat / Street"
              className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#DCE7F9] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              aria-label="Area or Locality"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
            />
            <input
              type="text"
              aria-label="PIN Code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="PIN code"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bk-notes" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
            Instructions / Details
          </label>
          <textarea
            id="bk-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what needs to be done..."
            className="w-full p-3.5 rounded-xl border border-[#DCE7F9] text-sm"
          />
        </div>

        <button type="submit" disabled={submitting} className="w-full serva-pill-btn">
          <span>{submitting ? 'Submitting Request...' : 'Review Summary & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <aside className="lg:col-span-5 serva-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A1F5C]">Price Summary</h2>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Estimated
          </span>
        </div>

        <div className="space-y-2 text-sm border-b border-[#EAF2FF] pb-4">
          <div className="flex justify-between text-[#5B6B8C]">
            <span>
              {service.name} × {quantity}
            </span>
            <span className="font-mono-num font-semibold text-[#0A1F5C]">
              ₹{estimatedTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#0A1F5C]">Estimated Total</span>
          <span className="text-2xl font-bold text-[#0B5FD9] font-mono-num">
            ₹{estimatedTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5F9FF] border border-[#DCE7F9] text-xs text-[#5B6B8C] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#0B5FD9] shrink-0 mt-0.5" />
          <span>
            Final confirmed charges are locked after provider acceptance or quotation approval. No
            extra charges without your approval.
          </span>
        </div>
      </aside>
    </div>
  );
}
