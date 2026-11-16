import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from '../lib/router.tsx';

interface BookingListItem {
  id: string;
  booking_code: string;
  confirmed_booking_id: string | null;
  category_slug: string;
  title: string;
  status: string;
  price_status: 'ESTIMATED' | 'CONFIRMED';
  payment_status: string;
  scheduled_date: string;
  scheduled_time: string;
  total_paise: number;
  balance_paise: number;
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');

  useEffect(() => {
    setLoading(true);
    fetch('/api/bookings', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (tab === 'COMPLETED') return ['COMPLETED', 'PAID'].includes(b.status);
    if (tab === 'CANCELLED') return ['CANCELLED', 'ISSUE_RAISED'].includes(b.status);
    return !['COMPLETED', 'PAID', 'CANCELLED', 'ISSUE_RAISED'].includes(b.status);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F5C]">My Bookings</h1>
          <p className="text-sm text-[#5B6B8C]">Track live progress, approve quotes, and download receipts.</p>
        </div>
        <Link to="/services" className="serva-pill-btn text-sm">
          Book New Service <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="inline-flex p-1 rounded-2xl bg-[#EAF2FF]">
        {(['ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold cursor-pointer ${
              tab === t ? 'bg-white text-[#0A1F5C] shadow-sm' : 'text-[#5B6B8C]'
            }`}
          >
            {t === 'ACTIVE' ? 'Active' : t === 'COMPLETED' ? 'Completed' : 'Cancelled / Issues'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((k) => (
            <div key={k} className="serva-card h-32 animate-pulse bg-[#F5F9FF]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="serva-card p-8 text-center space-y-3">
          <p className="text-sm text-[#5B6B8C]">No bookings in this tab yet.</p>
          <Link to="/services" className="serva-pill-btn text-sm">
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="serva-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6B8C]">
                  <span className="font-mono-num font-bold text-[#0A1F5C]">
                    {b.confirmed_booking_id || 'Awaiting Advance'}
                  </span>
                  <span>·</span>
                  <span>{b.status.replace(/_/g, ' ')}</span>
                  <span>·</span>
                  <span className={b.price_status === 'CONFIRMED' ? 'text-[#16A34A] font-semibold' : 'text-amber-700 font-semibold'}>
                    {b.price_status === 'CONFIRMED' ? 'Confirmed' : 'Estimated'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0A1F5C]">{b.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6B8C]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {b.scheduled_date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {b.scheduled_time}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                <p className="text-lg font-bold text-[#0B5FD9] font-mono-num">
                  ₹{Math.round(b.total_paise / 100).toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-2">
                  {b.balance_paise > 0 && b.status !== 'CANCELLED' && (
                    <Link
                      to={`/book/pay?id=${encodeURIComponent(b.id)}`}
                      className="min-h-[38px] px-4 rounded-full bg-[#EAF2FF] text-[#0B5FD9] text-xs font-semibold inline-flex items-center"
                    >
                      Pay Now
                    </Link>
                  )}
                  <Link
                    to={`/bookings/${b.id}`}
                    className="min-h-[38px] px-4 rounded-full bg-[#0B5FD9] text-white text-xs font-semibold inline-flex items-center gap-1"
                  >
                    Track <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
