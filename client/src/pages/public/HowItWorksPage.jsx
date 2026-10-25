import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, MapPin, Wrench, CreditCard, ShieldCheck, Truck, Navigation, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState('driver'); // 'driver' or 'partner'

  const driverSteps = [
    {
      icon: MapPin,
      step: 'Step 1: Breakdown Pin',
      title: 'Share Location & Select Service',
      desc: 'Use one-click browser geolocation or click directly on the interactive map to drop your breakdown pin. Select whether you need a mechanic, towing, battery boost, puncture fix, or fuel delivery.',
    },
    {
      icon: Navigation,
      step: 'Step 2: Instant Matching',
      title: 'Review Nearby Available Partners',
      desc: 'View verified partners located within your service radius. Check their transparent base fees, distance, and ratings before confirming your dispatch request.',
    },
    {
      icon: Smartphone,
      step: 'Step 3: Real-Time Tracking',
      title: 'Track Live Mechanic En Route',
      desc: 'Watch the mechanic travel to you on Leaflet OpenStreetMap. Communicate via real-time booking chat or phone call for location landmarks or special vehicle requirements.',
    },
    {
      icon: CreditCard,
      step: 'Step 4: Certified Completion',
      title: 'Itemized Invoice & Review',
      desc: 'Once the problem is resolved, inspect the digital itemized summary. Pay safely via cash or UPI and rate your technician to maintain high network standards.',
    },
  ];

  const partnerSteps = [
    {
      icon: ShieldCheck,
      step: 'Step 1: Fast Verification',
      title: 'Submit Application & Trade Proof',
      desc: 'Mechanics and recovery fleet owners submit business details, workshops, service radius, and trade certifications for administrative review.',
    },
    {
      icon: Navigation,
      step: 'Step 2: Go Online Anytime',
      title: 'Toggle Live Availability',
      desc: 'Control your work hours. Switch your status to Online whenever you are ready to accept assistance calls within your designated kilometer radius.',
    },
    {
      icon: Wrench,
      step: 'Step 3: Atomic Request Acceptance',
      title: 'Receive Matched Jobs',
      desc: 'Incoming jobs display vehicle make, model, breakdown description, customer coordinates, and estimated payout. One tap accepts the job atomically.',
    },
    {
      icon: Truck,
      step: 'Step 4: Update Progress & Earn',
      title: 'Execute Service & Record Invoice',
      desc: 'Update your status to En Route, Arrived, and In Progress. Finalize the service with approved parts/charges and receive immediate customer payment.',
    },
  ];

  const currentSteps = activeTab === 'driver' ? driverSteps : partnerSteps;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          User Guide
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          How Roadside AAA Works
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Designed from the ground up for speed, transparency, and effortless coordination during high-stress breakdown situations.
        </p>

        {/* Tab switch */}
        <div className="inline-flex rounded-xl p-1 bg-slate-200/80 border border-slate-300">
          <button
            onClick={() => setActiveTab('driver')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              activeTab === 'driver' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For Vehicle Owners (Drivers)
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              activeTab === 'partner' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For Mechanics & Towing Partners
          </button>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {currentSteps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{item.step}</span>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer Banner */}
      <div className="text-center pt-8">
        {activeTab === 'driver' ? (
          <Link
            to="/dashboard/request"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-base shadow-lg transition"
          >
            <span>Request Assistance Now →</span>
          </Link>
        ) : (
          <Link
            to="/partner-register"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg transition"
          >
            <span>Register as a Service Partner →</span>
          </Link>
        )}
      </div>
    </div>
  );
};
