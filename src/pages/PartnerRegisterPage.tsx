import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useRouter } from '../lib/router.tsx';

const PARTNER_TYPES = [
  'Technician / Home Worker',
  'Home / Event Cook',
  'Painter & 3D Wall Artist',
  'Contractor & Site Crew',
  'Interior / Furniture Designer',
  'Vehicle / Agricultural Machinery Owner',
  'Event Vendor (Decor / Catering / Photo / Dance / Singing / DJ)',
  'Moving Team & Team Leader',
  'Agricultural Worker / Drone Operator',
];

const CATEGORY_OPTIONS = [
  { slug: 'home-services', label: 'Home Services' },
  { slug: 'contractors', label: 'Contractors' },
  { slug: 'events', label: 'Events' },
  { slug: 'agriculture', label: 'Agriculture' },
  { slug: 'moving', label: 'Moving and Shifting' },
];

export function PartnerRegisterPage() {
  const { user, refreshUser } = useAuth();
  const { navigate } = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name ?? '');
  const [mobile, setMobile] = useState(user?.mobile ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');

  const [partnerType, setPartnerType] = useState(PARTNER_TYPES[0]);
  const [businessName, setBusinessName] = useState('');
  const [isIndividual, setIsIndividual] = useState(true);
  const [categories, setCategories] = useState<string[]>(['home-services']);
  const [servicesText, setServicesText] = useState('electrician, plumbing');
  const [serviceArea, setServiceArea] = useState('Hyderabad, TG');
  const [experienceYears, setExperienceYears] = useState(3);
  const [teamSize, setTeamSize] = useState(1);

  const [identityDocRef, setIdentityDocRef] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioSampleUrl, setPortfolioSampleUrl] = useState('');
  const [portfolioSampleTitle, setPortfolioSampleTitle] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('2026-11-24');

  const [payoutMode, setPayoutMode] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [cancellationTerms, setCancellationTerms] = useState(
    'Free cancellation up to 24 hours before service time.'
  );
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toggleCategory = (slug: string) => {
    setCategories((prev) =>
      prev.includes(slug) ? (prev.length > 1 ? prev.filter((c) => c !== slug) : prev) : [...prev, slug]
    );
  };

  const handleSampleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (!user) {
          setPortfolioSampleUrl(String(reader.result).slice(0, 120) ? '/src/assets/images/hero_home_services_1794821794674.jpg' : '');
          setUploading(false);
          return;
        }
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ dataUrl: reader.result, prefix: 'partner-sample' }),
        });
        const d = await res.json();
        if (res.ok && d.url) setPortfolioSampleUrl(d.url);
        else setError(d.error || 'Upload failed.');
      } catch {
        setError('Could not upload sample file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!businessName.trim() || !identityDocRef.trim()) {
      setError('Please enter your Partner/Display Name and Identity Document Reference.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: user ? undefined : name,
          mobile: user ? undefined : mobile,
          email: user ? undefined : email,
          password: user ? undefined : password,
          partnerType,
          businessName,
          isIndividual,
          categories,
          services: servicesText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          serviceArea,
          experienceYears,
          teamSize,
          identityDocRef,
          bio,
          cancellationTerms,
          payoutAccount: {
            mode: payoutMode,
            upiId,
            accountHolder,
            accountNumber,
            ifsc,
          },
          agreedToTerms,
          portfolioSampleUrl: portfolioSampleUrl || undefined,
          portfolioSampleTitle: portfolioSampleTitle || undefined,
          availabilityDates: availabilityDate ? [availabilityDate] : [],
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || 'Could not submit partner registration.');
      } else {
        await refreshUser();
        setDone(true);
      }
    } catch {
      setError('Network error submitting partner registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto serva-card p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#16A34A] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1F5C]">Application Submitted</h1>
        <p className="text-sm text-[#5B6B8C]">
          Your partner profile <strong>{businessName}</strong> has status{' '}
          <span className="font-bold text-[#0B5FD9]">SUBMITTED</span>. Once an admin approves your
          documents, you can accept customer requests.
        </p>
        <button
          type="button"
          onClick={() => navigate('/partner/dashboard')}
          className="serva-pill-btn mx-auto"
        >
          <span>Open Partner Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="serva-card p-6 sm:p-8 space-y-2 bg-gradient-to-r from-[#0A1F5C] to-[#0B5FD9] text-white">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100">
          <ShieldCheck className="w-4 h-4" /> SERVA Partner Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">Become a SERVA Partner</h1>
        <p className="text-sm text-blue-100">
          Individuals can register without owning a company — join as a Worker, Cook, Painter,
          Contractor, Designer, Event Vendor, Machinery Owner, or Moving Team.
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-2">
        {['Account & Role', 'Services & Area', 'ID & Portfolio', 'Payout & Submit'].map((lbl, idx) => (
          <button
            key={lbl}
            type="button"
            onClick={() => setStep(idx + 1)}
            className={`min-h-[42px] px-2 rounded-xl text-xs font-bold border cursor-pointer ${
              step === idx + 1
                ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                : 'bg-white text-[#5B6B8C] border-[#DCE7F9]'
            }`}
          >
            {idx + 1}. {lbl}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="serva-card p-6 sm:p-8 space-y-5">
        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-semibold">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1F5C]">1. Account & Partner Role</h2>

            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F9FF]">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name *"
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit Mobile *"
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password (min 6 chars) *"
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
                />
              </div>
            )}

            <div>
              <label htmlFor="p-type" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                Primary Partner Type
              </label>
              <select
                id="p-type"
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm bg-white"
              >
                {PARTNER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-bname" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Display / Business Name *
                </label>
                <input
                  id="p-bname"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kiran Home Repairs or Individual Name"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0A1F5C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIndividual}
                    onChange={(e) => setIsIndividual(e.target.checked)}
                    className="w-4 h-4 accent-[#0B5FD9]"
                  />
                  <span>Registering as an individual (no company needed)</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="serva-pill-btn text-sm"
            >
              <span>Next: Services & Area</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1F5C]">2. Categories, Skills & Area</h2>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`min-h-[40px] px-4 rounded-full text-xs font-bold border cursor-pointer ${
                    categories.includes(c.slug)
                      ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                      : 'bg-white text-[#0A1F5C] border-[#DCE7F9]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="p-svcs" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                Specific Services / Skills (comma-separated)
              </label>
              <input
                id="p-svcs"
                type="text"
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="p-area" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Service Area
                </label>
                <input
                  id="p-area"
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>
              <div>
                <label htmlFor="p-exp" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Experience (Years)
                </label>
                <input
                  id="p-exp"
                  type="number"
                  min={0}
                  max={60}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </div>
              <div>
                <label htmlFor="p-team" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Team Size
                </label>
                <input
                  id="p-team"
                  type="number"
                  min={1}
                  max={200}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm font-mono-num"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] px-5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] cursor-pointer"
              >
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="serva-pill-btn text-sm">
                <span>Next: Identity & Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1F5C]">3. Identity Verification & Portfolio</h2>

            <div>
              <label htmlFor="p-idref" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                Identity Document Reference (Aadhaar / PAN / Trade Licence) *
              </label>
              <input
                id="p-idref"
                type="text"
                value={identityDocRef}
                onChange={(e) => setIdentityDocRef(e.target.value)}
                placeholder="e.g. AADHAAR-XXXX-9012"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>

            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio describing your past work, equipment, and specialties..."
              className="w-full p-3 rounded-xl border border-[#DCE7F9] text-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F9FF]">
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Sample Portfolio Title (optional)
                </label>
                <input
                  type="text"
                  value={portfolioSampleTitle}
                  onChange={(e) => setPortfolioSampleTitle(e.target.value)}
                  placeholder="e.g. Living Room 3D Wall Paint"
                  className="w-full min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A1F5C] mb-1">
                  Upload Work Photo/Video
                </label>
                <label className="min-h-[40px] px-3 rounded-xl border border-[#DCE7F9] bg-white text-xs font-semibold text-[#0B5FD9] inline-flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : portfolioSampleUrl ? 'Uploaded' : 'Choose Image'}</span>
                  <input type="file" accept="image/*" onChange={handleSampleFile} className="sr-only" />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="p-avail" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                First Available Date
              </label>
              <input
                id="p-avail"
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="min-h-[42px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] cursor-pointer"
              >
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="serva-pill-btn text-sm">
                <span>Next: Payout & Terms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1F5C]">4. Payout Details & Agreement</h2>

            <div className="flex gap-2">
              {(['UPI', 'BANK'] as const).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPayoutMode(pm)}
                  className={`min-h-[40px] px-4 rounded-xl text-xs font-bold border cursor-pointer ${
                    payoutMode === pm
                      ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                      : 'bg-white text-[#0A1F5C] border-[#DCE7F9]'
                  }`}
                >
                  {pm} Payout
                </button>
              ))}
            </div>

            {payoutMode === 'UPI' ? (
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID (e.g. partner@upi)"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Account Holder Name"
                  className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
                />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
                />
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="IFSC Code"
                  className="min-h-[44px] px-3 rounded-xl border border-[#DCE7F9] text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor="p-terms" className="block text-xs font-bold text-[#0A1F5C] mb-1">
                Cancellation Terms
              </label>
              <input
                id="p-terms"
                type="text"
                value={cancellationTerms}
                onChange={(e) => setCancellationTerms(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#DCE7F9] text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#0A1F5C] cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 accent-[#0B5FD9]"
              />
              <span>
                I confirm my documents are genuine and agree to SERVA Partner Terms & Quality Guidelines.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[44px] px-5 rounded-full border border-[#DCE7F9] text-sm font-semibold text-[#0A1F5C] cursor-pointer"
              >
                Back
              </button>
              <button type="submit" disabled={submitting} className="serva-pill-btn text-sm">
                <span>{submitting ? 'Submitting...' : 'Submit for Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
