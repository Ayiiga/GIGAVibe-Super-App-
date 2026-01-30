import React, { useEffect, useMemo, useState } from 'react';
import { X, MapPin, ShieldCheck, Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { appState, BusinessProfile, BusinessVerificationStatus } from '../services/appState';

interface BusinessVerificationProps {
  onClose: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

export default function BusinessVerification({ onClose }: BusinessVerificationProps) {
  const initialProfile = useMemo<BusinessProfile>(() => {
    return (
      appState.getBusinessProfile() || {
        businessName: '',
        ownerName: '',
        phone: '',
        email: '',
        businessType: 'Retail',
        address: '',
        documents: {}
      }
    );
  }, []);

  const [status, setStatus] = useState<BusinessVerificationStatus>(() => appState.getBusinessStatus());
  const [profile, setProfile] = useState<BusinessProfile>(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    appState.setBusinessStatus(status);
  }, [status]);

  useEffect(() => {
    appState.setBusinessProfile(profile);
  }, [profile]);

  const mapSrc = useMemo(() => {
    if (profile.location) {
      const { lat, lng } = profile.location;
      return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`;
    }
    if (profile.googleMapsLink?.trim()) {
      // Best-effort: keep embed stable even without an API key
      return `https://www.google.com/maps?q=${encodeURIComponent(profile.googleMapsLink.trim())}&output=embed`;
    }
    if (profile.address.trim()) {
      return `https://www.google.com/maps?q=${encodeURIComponent(profile.address.trim())}&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent('Accra, Ghana')}&z=11&output=embed`;
  }, [profile.address, profile.googleMapsLink, profile.location]);

  const missingDocs = useMemo(() => {
    const d = profile.documents;
    const required: Array<[keyof BusinessProfile['documents'], string]> = [
      ['idCardFront', 'ID Card (Front)'],
      ['idCardBack', 'ID Card (Back)'],
      ['businessCertificate', 'Business Certificate'],
    ];
    return required.filter(([k]) => !d[k]).map(([, label]) => label);
  }, [profile.documents]);

  const setDoc = (key: keyof BusinessProfile['documents'], file?: File) => {
    setProfile((p) => ({
      ...p,
      documents: {
        ...p.documents,
        [key]: file ? `${file.name}` : undefined
      }
    }));
  };

  const useMyLocation = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((p) => ({
          ...p,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
      },
      () => setError('Location permission denied. Paste a Google Maps link or type your address instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitForReview = async () => {
    setError(null);
    if (!profile.businessName.trim() || !profile.ownerName.trim() || !profile.phone.trim()) {
      setError('Please fill in business name, owner name, and phone.');
      return;
    }
    if (!profile.address.trim() && !profile.location && !profile.googleMapsLink?.trim()) {
      setError('Please provide your business location (address, maps link, or GPS).');
      return;
    }
    if (missingDocs.length > 0) {
      setError(`Please upload: ${missingDocs.join(', ')}.`);
      return;
    }

    setIsSubmitting(true);
    setStatus('pending');
    setProfile((p) => ({ ...p, submittedAt: nowIso() }));

    // Demo flow: auto-verify after a short review delay
    window.setTimeout(() => {
      setStatus('verified');
      setIsSubmitting(false);
    }, 1800);
  };

  const statusBadge = (() => {
    if (status === 'verified') {
      return (
        <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 px-3 py-2 rounded-2xl">
          <ShieldCheck size={16} className="text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Verified Business</span>
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 px-3 py-2 rounded-2xl">
          <Loader2 size={16} className="text-yellow-500 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Review Pending</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl">
        <AlertTriangle size={16} className="text-gray-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Not Verified</span>
      </div>
    );
  })();

  return (
    <div className="fixed inset-0 z-[1600] bg-black flex flex-col animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl p-4 pt-12 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter">Business Verification</h2>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Anti-fraud seller onboarding</p>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge}
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-28 space-y-6">
        {error && (
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Business Location</h3>
                <p className="text-[10px] text-gray-500 font-bold">Use Google Maps link, address, or GPS</p>
              </div>
            </div>
            <button
              onClick={useMyLocation}
              className="px-4 py-2 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
            >
              Use My GPS
            </button>
          </div>
          <div className="px-5 pb-5 space-y-3">
            <input
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              placeholder="Business address"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              value={profile.googleMapsLink || ''}
              onChange={(e) => setProfile((p) => ({ ...p, googleMapsLink: e.target.value }))}
              placeholder="Google Maps link (optional)"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-black">
              <iframe title="map" src={mapSrc} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Business Details</h3>
          <input
            value={profile.businessName}
            onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))}
            placeholder="Business name"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            value={profile.ownerName}
            onChange={(e) => setProfile((p) => ({ ...p, ownerName: e.target.value }))}
            placeholder="Owner / representative name"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-3">
            <input
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={profile.businessType}
              onChange={(e) => setProfile((p) => ({ ...p, businessType: e.target.value }))}
              className="bg-black/40 border border-white/10 rounded-2xl px-4 text-sm focus:outline-none focus:border-blue-500"
            >
              {['Retail', 'Fashion', 'Electronics', 'Food', 'Services', 'Other'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <input
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email (optional)"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verification Documents</h3>

          {(
            [
              { key: 'idCardFront', label: 'ID Card (Front) *' },
              { key: 'idCardBack', label: 'ID Card (Back) *' },
              { key: 'businessCertificate', label: 'Business Certificate *' },
              { key: 'proofOfAddress', label: 'Proof of Address (optional)' }
            ] as const
          ).map((doc) => (
            <label key={doc.key} className="block">
              <span className="text-xs font-bold text-gray-400 ml-2 mb-1.5 block">{doc.label}</span>
              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-4">
                <Upload size={18} className="text-gray-500" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDoc(doc.key, e.target.files?.[0])}
                  className="flex-1 text-xs text-gray-400"
                />
                {profile.documents[doc.key] && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Uploaded
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <button
          onClick={submitForReview}
          disabled={isSubmitting || status === 'verified'}
          className="w-full bg-blue-600 disabled:opacity-40 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {status === 'verified' ? (
            <>
              <ShieldCheck size={18} /> VERIFIED
            </>
          ) : isSubmitting || status === 'pending' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> SUBMITTING
            </>
          ) : (
            <>
              <ShieldCheck size={18} /> SUBMIT FOR REVIEW
            </>
          )}
        </button>
      </div>
    </div>
  );
}

