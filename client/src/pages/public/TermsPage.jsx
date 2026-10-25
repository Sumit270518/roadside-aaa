import React from 'react';

export const TermsPage = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          User Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 2026</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Roadside AAA platform, whether as a vehicle owner or service partner,
            you agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Emergency Roadside Service Scope</h2>
          <p>
            Roadside AAA operates as an emergency dispatch and booking technology platform. While we strictly verify
            the credentials of participating mechanics and towing fleet partners, mechanical repairs and towing operations
            are performed by independent verified partners. In critical medical emergencies or life-threatening accidents,
            motorists must contact government emergency responders (112) immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Pricing & Billing Integrity</h2>
          <p>
            All price estimates displayed on the platform are based on standardized base rates and distance rates.
            Additional parts or lubricants (e.g. replacement battery, new tire tube) must be explicitly approved by
            the vehicle owner prior to installation and will be documented in the digital itemized invoice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Partner Conduct & Decertification</h2>
          <p>
            Service partners agree to maintain punctuality, safe roadside operating practices, and respectful conduct.
            Any partner engaging in overcharging, unverified price manipulation, or unsafe towing will be immediately suspended
            following investigation by our administration team.
          </p>
        </section>
      </div>
    </div>
  );
};
