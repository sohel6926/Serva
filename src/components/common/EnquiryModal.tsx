import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, PhoneCall, MessageSquare, Clock, User, Phone, Send, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialService?: string;
}

const CATEGORIES = [
  'Home Services',
  'Construction & Contractors',
  'Agriculture Services',
  'Event Services',
  'Moving & Shifting',
  'Other / General Enquiry',
];

function normalizeCategory(raw?: string): string {
  if (!raw) return 'Home Services';
  const lower = raw.toLowerCase();
  if (lower.includes('agri') || lower.includes('tractor') || lower.includes('farm')) return 'Agriculture Services';
  if (lower.includes('event') || lower.includes('wedding') || lower.includes('dj')) return 'Event Services';
  if (lower.includes('moving') || lower.includes('shift') || lower.includes('packer')) return 'Moving & Shifting';
  if (lower.includes('construct') || lower.includes('contractor') || lower.includes('interior') || lower.includes('worker') || lower.includes('machinery')) return 'Construction & Contractors';
  if (lower.includes('home') || lower.includes('clean') || lower.includes('repair') || lower.includes('plumb') || lower.includes('electr') || lower.includes('cook') || lower.includes('paint')) return 'Home Services';
  if (CATEGORIES.includes(raw)) return raw;
  return 'Home Services';
}

export function EnquiryModal({
  isOpen,
  onClose,
  initialCategory = 'Home Services',
  initialService = '',
}: EnquiryModalProps) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState(() => normalizeCategory(initialCategory));
  const [service, setService] = useState(initialService);
  const [notes, setNotes] = useState('');
  const [callTime, setCallTime] = useState('Within 15 mins (Urgent)');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name || '');
        setMobile(user.mobile || '');
      }
      setCategory(normalizeCategory(initialCategory));
      setService(initialService || '');
      setSubmittedRef(null);
    }
  }, [isOpen, user, initialCategory, initialService]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    setSubmitting(true);
    const refId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Send to contractors enquiries or save local
      await fetch('/api/contractors/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectTitle: `${category} Enquiry: ${service || 'General'}`,
          buildingType: category,
          plotSize: service || 'Doorstep Service',
          budgetRange: 'Standard Rates',
          location: 'Customer Location',
          timeline: callTime,
          notes: `Customer: ${name} (${mobile}). Requirement: ${notes}`,
        }),
      }).catch(() => null);

      // Store in localStorage for user session history
      const prev = JSON.parse(localStorage.getItem('serva_enquiries') || '[]');
      prev.unshift({
        refId,
        name,
        mobile,
        category,
        service,
        notes,
        callTime,
        date: new Date().toISOString(),
      });
      localStorage.setItem('serva_enquiries', JSON.stringify(prev.slice(0, 20)));

      setSubmittedRef(refId);
    } catch {
      setSubmittedRef(refId);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'min(90vh, 720px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          zIndex: 1000000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0A1F5C] to-[#0B5FD9] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id="enquiry-modal-title" className="text-base font-bold leading-tight text-white">Enquire Now</h2>
              <p className="text-[11px] text-blue-100">Get a fast callback & free transparent quote</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close Enquiry Modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {submittedRef ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center border-2 border-green-200 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0A1F5C]">Enquiry Received!</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
                  Our verified service team has received your request. We will contact you at{' '}
                  <span className="font-semibold text-[#0A1F5C]">{mobile}</span> shortly.
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-mono font-semibold text-[#0B5FD9]">
                  Ref: {submittedRef}
                </div>
              </div>

              {/* Direct Instant Action Options */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                <a
                  href={`tel:9876543210`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 text-[#0B5FD9] font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Support Direct
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B5FD9] text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Category & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-[#0B5FD9]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1">Specific Service (Optional)</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="e.g. Plumbing / Deep Clean"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              {/* Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A1F5C] mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                  />
                </div>
              </div>

              {/* Preferred Call Time */}
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Preferred Callback Time
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Within 15 mins (Urgent)',
                    'Morning (9 AM - 12 PM)',
                    'Afternoon (12 PM - 5 PM)',
                    'Evening (5 PM - 8 PM)',
                  ].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setCallTime(time)}
                      className={`py-2 px-2.5 rounded-lg border text-[11px] font-medium transition-all text-left cursor-pointer ${
                        callTime === time
                          ? 'border-[#0B5FD9] bg-blue-50 text-[#0B5FD9] font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Requirement Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us what you need help with, preferred date, or address..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#0B5FD9]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#0B5FD9] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting Enquiry...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Direct Call / WhatsApp row */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Need urgent assistance?</span>
                <a
                  href="tel:9876543210"
                  className="font-bold text-[#0B5FD9] inline-flex items-center gap-1 hover:underline"
                >
                  <PhoneCall className="w-3 h-3" />
                  Call 9876543210
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
