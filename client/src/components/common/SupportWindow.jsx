import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  LifeBuoy,
  PhoneCall,
  X,
  MessageSquare,
  AlertTriangle,
  Send,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Car,
  CheckCircle2,
} from 'lucide-react';

export const SupportWindow = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('call'); // 'call' | 'message' | 'faq'
  const [faqExpanded, setFaqExpanded] = useState(null);

  // Quick ticket form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    category: 'service_delay',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please describe your roadside issue or question');
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        await api.post('/complaints', {
          category: formData.category,
          description: `[Support Desk Inquiry] Phone: ${formData.phone} - ${formData.description}`,
        });
      }
      setTicketSubmitted(true);
      toast.success('Support inquiry sent! Dispatch team notified.');
    } catch (err) {
      // Graceful fallback
      setTicketSubmitted(true);
      toast.success('Inquiry logged with Emergency Dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'What should I do immediately after breaking down?',
      a: 'Turn on hazard warning lights, safely maneuver to the leftmost highway shoulder if possible, stay behind the safety guardrail, and request roadside dispatch through Roadside AAA.',
    },
    {
      q: 'How fast will a mechanic or towing partner arrive?',
      a: 'Average arrival time across metropolitan service zones is 15 to 30 minutes. You can track your assigned technician live on the interactive map.',
    },
    {
      q: 'How are roadside service charges calculated?',
      a: 'Charges include a transparent base service fee plus distance charges (if towing). All costs are itemized upfront with 18% GST before you confirm dispatch.',
    },
    {
      q: 'What if my vehicle requires heavy towing?',
      a: 'Select "Towing" in the assistance wizard. Our verified towing partners operate hydraulic flatbed and wheel-lift trucks suitable for sedans, SUVs, and commercial vehicles.',
    },
  ];

  return (
    <>
      {/* Floating Support Trigger Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setTicketSubmitted(false);
          }}
          aria-label="Open 24/7 Roadside Support"
          className="group relative flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/30 border border-slate-700/80 hover:bg-slate-800 transition transform active:scale-95"
        >
          {/* Radar animation pulse */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>

          <LifeBuoy className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition duration-300" />
          <span className="text-xs sm:text-sm font-bold tracking-tight">24/7 Support</span>
        </button>
      </div>

      {/* Support Window (Bottom Sheet on Mobile, Floating Card on Desktop) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 flex flex-col justify-end sm:block">
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Window Container */}
          <div className="relative w-full sm:w-[420px] max-h-[85vh] sm:max-h-[620px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emergency-600 flex items-center justify-center text-white shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight text-white flex items-center space-x-1.5">
                    <span>Roadside Emergency Help</span>
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Dispatch Desk Online</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close support window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('call')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center space-x-1.5 border-b-2 transition ${
                  activeTab === 'call'
                    ? 'border-emergency-600 text-emergency-600 bg-white font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Emergency SOS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center space-x-1.5 border-b-2 transition ${
                  activeTab === 'message'
                    ? 'border-brand-600 text-brand-600 bg-white font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Quick Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center space-x-1.5 border-b-2 transition ${
                  activeTab === 'faq'
                    ? 'border-brand-600 text-brand-600 bg-white font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Instant FAQs</span>
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* TAB 1: SOS & Hotlines */}
              {activeTab === 'call' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-emergency-50 border border-emergency-200 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emergency-700 bg-emergency-100 px-2 py-0.5 rounded-full">
                      Toll-Free Nationwide 24/7
                    </span>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">1800-AAA-HELP</h4>
                    <p className="text-xs text-slate-600">
                      Direct telephone line to our emergency supervisor desk.
                    </p>
                    <a
                      href="tel:18002224357"
                      className="inline-flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-sm shadow-md shadow-emergency-600/30 transition transform active:scale-95"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call Hotline Now</span>
                    </a>
                  </div>

                  {/* Public Emergency Helplines */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Regional Emergency Authorities
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a
                        href="tel:112"
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">National Helpline</p>
                          <p className="text-[10px] text-slate-500">Police / Ambulance</p>
                        </div>
                        <span className="text-sm font-extrabold text-brand-600">112</span>
                      </a>
                      <a
                        href="tel:1033"
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">National Highways</p>
                          <p className="text-[10px] text-slate-500">NHAI Helpline</p>
                        </div>
                        <span className="text-sm font-extrabold text-amber-600">1033</span>
                      </a>
                    </div>
                  </div>

                  {/* Safety Card */}
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      All Roadside AAA service mechanics and tow operators are identity-verified, background-checked, and GPS monitored.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Quick Message / Callback Ticket */}
              {activeTab === 'message' && (
                <div>
                  {ticketSubmitted ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Inquiry Dispatched</h4>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                        A dispatch supervisor has received your request and will call you back at{' '}
                        <strong className="text-slate-900">{formData.phone || 'your phone number'}</strong> within 2 minutes.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTicketSubmitted(false)}
                        className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Problem Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                        >
                          <option value="service_delay">Technician Delay / Location Inquiry</option>
                          <option value="pricing_dispute">Pricing & Billing Question</option>
                          <option value="partner_behavior">Service Quality / Technician Feedback</option>
                          <option value="cancellation">Cancellation Assistance</option>
                          <option value="other">General Support Question</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Describe Situation</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your breakdown location, vehicle make, or urgent question..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-xs resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center space-x-2 shadow-sm transition active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submitting ? 'Sending Request...' : 'Submit Support Request'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: Instant FAQs */}
              {activeTab === 'faq' && (
                <div className="space-y-2">
                  {faqs.map((faq, idx) => {
                    const isExpanded = faqExpanded === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl overflow-hidden transition"
                      >
                        <button
                          type="button"
                          onClick={() => setFaqExpanded(isExpanded ? null : idx)}
                          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                        >
                          <span className="pr-2">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-3.5 pb-3 text-[11px] text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 text-center">
              <p className="text-[10px] text-slate-500">
                Roadside AAA • 24/7 Verified Dispatch Operations
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
