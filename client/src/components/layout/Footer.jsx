import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Mail, MapPin, Wrench, Clock, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Roadside <span className="text-brand-500">AAA</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's premier 24/7 roadside vehicle assistance and verified mechanic booking platform.
              Fast on-demand dispatch for breakdowns, flat tires, dead batteries, and hydraulic towing.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2.5">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">24/7 Toll-Free: 1800-AAA-HELP (1800-222-4357)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@roadside-aaa.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Central Dispatch Hub: New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Roadside Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="hover:text-white transition">Breakdown Repair</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">Hydraulic Flatbed Towing</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">Battery Jump-Start</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">Flat Tire & Puncture</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">Emergency Fuel Delivery</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">How It Works</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Us & Safety</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact & Help Center</Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-white transition">Driver & Partner FAQs</Link>
              </li>
              <li>
                <Link to="/partner-register" className="text-amber-400 hover:text-amber-300 font-medium transition">
                  Become a Verified Partner →
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Safety Pledge</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Background-checked & certified auto mechanics</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Average 20-30 min arrival with live GPS tracking</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Standardized pricing guidance with itemized invoices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Roadside AAA Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition">Terms & Conditions</Link>
            <span>Emergency Dispatch Services</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
