import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been sent to dispatch support!');
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          24/7 Roadside Assistance & Customer Support
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Need immediate roadside assistance? Use our emergency hotline. For inquiries or business partnerships, drop us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emergency-600 to-rose-700 text-white p-7 rounded-2xl shadow-lg space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Immediate Breakdown</span>
            <div className="flex items-center space-x-3">
              <PhoneCall className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-black">1800-AAA-HELP</h3>
                <p className="text-xs text-rose-100">Toll-Free Nationwide (1800-222-4357)</p>
              </div>
            </div>
            <p className="text-xs text-rose-100 pt-2 border-t border-rose-500/40">
              Immediate live operator connection for drivers stranded in dangerous highway locations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-700">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <Mail className="w-5 h-5 text-brand-600" />
              <span>Email Support</span>
            </div>
            <p className="text-xs text-slate-500">General inquiries, corporate fleet accounts, and billing verification:</p>
            <p className="font-semibold text-brand-700">support@roadside-aaa.com</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm text-slate-700">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Headquarters</span>
            </div>
            <p className="text-xs text-slate-500">Roadside AAA Technologies Ltd.</p>
            <p className="text-xs text-slate-700">Barakhamba Road, Connaught Place, New Delhi - 110001, India</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for contacting Roadside AAA. A customer success representative will respond to your registered email shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Invoice inquiry or Fleet onboarding"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="How can our support team assist you?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow transition"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
