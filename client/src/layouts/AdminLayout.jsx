import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  UserCheck,
  Users,
  Radio,
  FolderTree,
  MessageSquareWarning,
  BarChart3,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'System Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Partner Verifications', path: '/admin/partners', icon: UserCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Live Dispatch & Bookings', path: '/admin/bookings', icon: Radio },
    { name: 'Service Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Complaints Desk', path: '/admin/complaints', icon: MessageSquareWarning },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emergency-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                Roadside <span className="text-emergency-500">AAA Admin</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-2 border-l border-slate-800">
              Operations Console
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-emerald-400">Master Administrator</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
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
                    isActive
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emergency-500' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold">Security Notice</p>
            <p className="text-[11px] text-amber-800">
              All administrative operations are permanently recorded in the system audit log.
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
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 text-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emergency-600 flex items-center justify-center text-white font-bold">
                    <Shield className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold text-white text-base">
                    Roadside <span className="text-emergency-500">AAA Admin</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin profile snippet */}
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Master Administrator
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 overflow-y-auto max-h-[55vh] pr-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emergency-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-900/60 text-rose-400 bg-rose-950/40 text-xs font-bold hover:bg-rose-900/60 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar for Admin Console */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-lg px-2 py-1.5 text-white">
        <div className="flex items-center justify-around">
          {/* Overview */}
          <Link
            to="/admin"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/admin' ? 'text-emergency-500 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Console</span>
          </Link>

          {/* Verifications */}
          <Link
            to="/admin/partners"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/admin/partners' ? 'text-emergency-500 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span>Partners</span>
          </Link>

          {/* Live Dispatch */}
          <Link
            to="/admin/bookings"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/admin/bookings' ? 'text-emergency-500 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span>Live Map</span>
          </Link>

          {/* Complaints */}
          <Link
            to="/admin/complaints"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/admin/complaints' ? 'text-emergency-500 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareWarning className="w-5 h-5 mb-0.5" />
            <span>Disputes</span>
          </Link>

          {/* Reports */}
          <Link
            to="/admin/reports"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/admin/reports' ? 'text-emergency-500 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Reports</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
