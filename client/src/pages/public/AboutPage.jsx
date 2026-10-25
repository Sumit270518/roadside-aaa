import React from 'react';
import { Shield, Award, Users, Wrench, CheckCircle, HeartHandshake } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Our Story & Mission
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Reliable Roadside Security for Every Indian Motorist
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded to eliminate roadside anxiety, predatory towing rates, and unreliable mechanics.
          We bring high-speed dispatch technology and verified automotive technicians together.
        </p>
      </div>

      {/* Grid Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Safety & Verification First</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every technician on our network is manually authenticated by our verification team.
            We verify business licenses, workshop infrastructure, and mechanical competence.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Transparent Fixed Invoicing</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            No surprise price hikes during roadside distress. Standard base fees and per-kilometer towing rates ensure honesty and predictable billing for every job.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Empowering Local Technicians</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We partner with independent master mechanics and local flatbed towing owners, giving them modern digital tools to expand their businesses ethically.
          </p>
        </div>
      </div>

      {/* Standards Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 space-y-8">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Our Zero-Compromise Standards</h2>
          <p className="text-sm text-slate-300">
            We operate in accordance with certified motor vehicle safety codes and strict consumer data privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Strict Geo-fenced dispatch: Partners only receive calls within their certified working radius.</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>No continuous location tracking: User GPS is only accessed during active emergency bookings.</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Audited Administrative Oversight: Every complaint and partner decision has an immutable audit trail.</span>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Multi-Vehicle Coverage: Support for Petrol, Diesel, CNG, Hybrid, and full Electric (EV) vehicles.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
