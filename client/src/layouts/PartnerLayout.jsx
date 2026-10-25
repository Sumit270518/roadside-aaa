import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Wrench,
  Truck,
  LayoutDashboard,
  Navigation,
  DollarSign,
  UserCheck,
  ShieldAlert,
  LogOut,
  Power,
  Clock,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PartnerLayout = () => {
  const { user, partnerProfile, refreshUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(partnerProfile?.isAvailable || false);
  const [activeJob, setActiveJob] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (partnerProfile) {
      setIsAvailable(partnerProfile.isAvailable);
    }
  }, [partnerProfile]);

  useEffect(() => {
    const fetchActiveJob = async () => {
      try {
        const res = await api.get('/partners/me/jobs');
        if (res.data.success) {
          const active = res.data.data.find((j) =>
            ['accepted', 'en_route', 'arrived', 'in_progress'].includes(j.status)
          );
          setActiveJob(active || null);
        }
      } catch (err) {
        console.warn('Partner active jobs poll error:', err.message);
      }
    };
    fetchActiveJob();
    const interval = setInterval(fetchActiveJob, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await api.patch('/partners/me/availability');
      if (res.data.success) {
        setIsAvailable(res.data.data.isAvailable);
        toast.success(`You are now ${res.data.data.isAvailable ? 'ONLINE (Receiving Requests)' : 'OFFLINE'}`);
        await refreshUser();
      }
    } catch (err) {
      toast.error('Failed to update availability status');
    } finally {
      setToggling(false);
    }
  };

  const navItems = [
    { name: 'Incoming Requests & Radar', path: '/partner', icon: LayoutDashboard },
    ...(activeJob
      ? [{ name: 'Current Active Job', path: `/partner/active/${activeJob._id}`, icon: Navigation, isLive: true }]
      : []),
    { name: 'Earnings & Completed Jobs', path: '/partner/earnings', icon: DollarSign },
    { name: 'Profile & Service Radius', path: '/partner/profile', icon: Wrench },
  ];

  const verificationStatus = partnerProfile?.verificationStatus || 'pending';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                {user?.role === 'towing_partner' ? <Truck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                Roadside <span className="text-amber-500">AAA Partner</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400 pl-2 border-l border-slate-200">
              {partnerProfile?.businessName || 'Service Partner Portal'}
            </span>
          </div>

          {/* Active Job Alert */}
          {activeJob && (
            <Link
              to={`/partner/active/${activeJob._id}`}
              className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-300 text-brand-800 text-xs font-bold hover:bg-brand-100 transition animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              <span>Active Job ({activeJob.bookingReference}) - Open Workspace →</span>
            </Link>
          )}

          {/* Availability Switch & User */}
          <div className="flex items-center space-x-4">
            {verificationStatus === 'verified' ? (
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={toggling}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xs transition ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Power className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <span>{isAvailable ? 'ONLINE' : 'OFFLINE'}</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase">
                {verificationStatus}
              </span>
            )}

            <div className="border-l border-slate-200 pl-3 flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user?.name}</span>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status Banner if pending or suspended */}
        {verificationStatus !== 'verified' && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
              verificationStatus === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-600 text-white'
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {verificationStatus === 'pending'
                  ? 'Your partner application is pending verification by our administrators. You will be notified once approved to accept customer bookings.'
                  : `Your partner account is currently ${verificationStatus.toUpperCase()}. Please contact partner support.`}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    item.isLive
                      ? 'bg-brand-600 text-white font-bold animate-pulse mb-2 shadow'
                      : isActive
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.isLive ? 'text-white' : isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl space-y-2 text-xs">
            <p className="font-bold text-white text-xs">Assistance Dispatch Rules</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jobs are assigned atomically. The first verified partner to accept receives the assignment immediately.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Left Slide-in) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                    {user?.role === 'towing_partner' ? <Truck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  </div>
                  <span className="font-extrabold text-slate-900 text-base">
                    Roadside <span className="text-amber-500">AAA Partner</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-900">{partnerProfile?.businessName || user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Availability:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {isAvailable ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        item.isLive
                          ? 'bg-brand-600 text-white font-bold animate-pulse'
                          : isActive
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.isLive ? 'text-white' : isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around">
          {/* Radar / Incoming */}
          <Link
            to="/partner"
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold transition ${
              location.pathname === '/partner' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Radar</span>
          </Link>

          {/* Active Job (if exists) */}
          {activeJob ? (
            <Link
              to={`/partner/active/${activeJob._id}`}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 animate-pulse transform active:scale-95 transition">
                <Navigation className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-extrabold text-brand-600 mt-0.5">Active Job</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center py-1 px-3 text-[10px] font-bold text-slate-300">
              <Navigation className="w-5 h-5 mb-0.5" />
              <span>No Job</span>
            </div>
          )}

          {/* Earnings */}
          <Link
            to="/partner/earnings"
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold transition ${
              location.pathname === '/partner/earnings' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span>Earnings</span>
          </Link>

          {/* Profile & Radius */}
          <Link
            to="/partner/profile"
            className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold transition ${
              location.pathname === '/partner/profile' ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
