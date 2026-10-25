import React from 'react';
import { ShieldCheck, Lock, MapPin, EyeOff } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Legal & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Roadside AAA Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 2026 | Last Updated: October 2026</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>1. Geolocation Data Collection Policy</span>
          </h2>
          <p>
            Roadside AAA collects breakdown and vehicle coordinate data strictly with your explicit browser permission.
            Location data is utilized solely for dispatching eligible nearby mechanics or towing partners during an active breakdown.
            We do NOT collect continuous background GPS location when you are not actively using emergency dispatch services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>2. Account & Vehicle Data Security</span>
          </h2>
          <p>
            Your account credentials, hashed passwords (bcrypt), and vehicle registration details are protected with
            industry-standard cryptographic protocols. Vehicle registration numbers are private and only displayed to the
            assigned service partner handling your specific active booking.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <EyeOff className="w-5 h-5 text-amber-600" />
            <span>3. Partner Verification Documents</span>
          </h2>
          <p>
            Mechanic and towing partner identity proofs, GST certificates, and licenses uploaded during onboarding
            are stored in secure storage accessible exclusively by authorized administrative personnel for verification decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal data to advertisers or third-party marketers.
            Information is only shared with assigned service partners strictly necessary to complete roadside repair.
          </p>
        </section>
      </div>
    </div>
  );
};
