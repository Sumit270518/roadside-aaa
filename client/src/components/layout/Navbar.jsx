import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Wrench, Menu, X, PhoneCall, AlertTriangle, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'mechanic' || user.role === 'towing_partner') return '/partner';
    return '/dashboard';
  };

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQs', path: '/faqs' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Emergency Strip */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>24/7 Roadside Fleet Active</span>
            <span className="hidden md:inline text-slate-400">| Delhi-NCR, Mumbai, Bangalore & 20+ Cities</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:18002224357" className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold transition">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Hotline: 1800-AAA-HELP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Shield className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Roadside <span className="text-brand-600">AAA</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-emergency-600 -mt-1">
                Emergency Breakdown Assistance
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition ${
                  location.pathname === link.path
                    ? 'text-brand-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA & User Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Urgent Assistance Button */}
            <Link
              to={user ? '/dashboard/request' : '/login?redirect=/dashboard/request'}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emergency-600 hover:bg-emergency-700 text-white font-semibold text-sm shadow-sm shadow-emergency-600/30 transition transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Get Roadside Help</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <Link
                  to="/partner-register"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 px-2 py-1.5"
                >
                  Become a Partner
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              to={user ? '/dashboard/request' : '/login'}
              className="px-3 py-1.5 rounded-lg bg-emergency-600 text-white text-xs font-semibold"
            >
              Emergency
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm"
                >
                  Go to {user.role === 'admin' ? 'Admin' : user.role === 'mechanic' ? 'Partner' : 'Driver'} Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium"
                >
                  Logout ({user.email})
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 shadow-sm transition"
                  >
                    Sign Up
                  </Link>
                </div>
                <Link
                  to="/partner-register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Become a Verified Mechanic / Towing Partner →
                </Link>
              </div>
            )}

            {/* Direct hotline shortcut in mobile menu */}
            <div className="pt-2">
              <a
                href="tel:18002224357"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300 text-xs font-bold transition hover:bg-amber-500/20"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>24/7 Helpline: 1800-AAA-HELP</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
