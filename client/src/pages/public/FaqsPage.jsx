import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIdx, setActiveIdx] = useState(null);

  const faqItems = [
    {
      category: 'Driver Services',
      q: 'How do I request roadside breakdown assistance?',
      a: 'Log into your account, add or pick your vehicle, choose the required service (breakdown repair, towing, battery jump, puncture, or fuel delivery), and select your location on the map. Our system will immediately find the closest available mechanic.',
    },
    {
      category: 'Driver Services',
      q: 'Can I request assistance if my car is parked in a basement?',
      a: 'Yes. Note the basement level and landmark in the booking form. For towing from low-clearance basements, our towing partners bring specialized wheel-lift recovery trucks.',
    },
    {
      category: 'Pricing & Invoices',
      q: 'How does pricing work?',
      a: 'We show an upfront price estimate before you submit your request. For standard services like jumpstarts and puncture repair, fixed base fees apply. For towing, a base fee plus per-kilometer transport rate applies. You receive an itemized digital invoice on completion.',
    },
    {
      category: 'Pricing & Invoices',
      q: 'What payment methods are supported in Phase 1?',
      a: 'In Phase 1, you can pay directly to the technician on completion via Cash or direct UPI scan. The digital invoice is generated and verified on the server.',
    },
    {
      category: 'Partner Verification',
      q: 'How does Roadside AAA vet mechanics and towing fleets?',
      a: 'All partners must submit business documentation, identity proofs, and workshop addresses. Our administrators manually review each profile before enabling dispatch access.',
    },
    {
      category: 'Partner Verification',
      q: 'How do service partners get paid?',
      a: 'Partners collect service fees directly from customers upon job completion. The platform maintains detailed earnings logs, commissions, and performance analytics inside the partner dashboard.',
    },
  ];

  const filtered = faqItems.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Knowledge Base
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          Find answers about roadside response times, transparent pricing, partner onboarding, and live tracking.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions (e.g. towing rate, battery, cash)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No matching questions found for "{searchTerm}".
          </div>
        ) : (
          filtered.map((faq, index) => {
            const isOpen = activeIdx === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setActiveIdx(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between text-slate-900 hover:text-brand-600 transition"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
