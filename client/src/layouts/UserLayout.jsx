import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  AlertTriangle,
  Car,
  History,
  FileText,
  MessageSquareWarning,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
  PhoneCall,
} from 'lucide-react';

export const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeBooking, setActiveBooking] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const res = await api.get('/requests?limit=10');
        if (res.data.success && res.data.data.length > 0) {
          const active = res.data.data.find((b) =>
            ['requested', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)
          );
          setActiveBooking(active || null);
        }

        const notifRes = await api.get('/notifications');
        if (notifRes.data.success) {
          setUnreadNotifications(notifRes.data.unreadCount || 0);
        }
      } catch (e) {
        console.warn('Dashboard poll error:', e.message);
      }
    };

    fetchActiveBooking();
    const interval = setInterval(fetchActiveBooking, 15000); // 15 sec poll fallback
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Request Assistance', path: '/dashboard/request', icon: AlertTriangle, isUrgent: true },
    { name: 'My Vehicles', path: '/dashboard/vehicles', icon: Car },
    { name: 'Service History', path: '/dashboard/bookings', icon: History },
    { name: 'Support & Complaints', path: '/dashboard/complaints', icon: MessageSquareWarning },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell, badge: unreadNotifications },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                Roadside <span className="text-brand-600">AAA</span>
              </span>
            </Link>

            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400 pl-2 border-l border-slate-200">
              Driver Portal
            </span>
          </div>

          {/* Active Booking Banner Alert */}
          {activeBooking && (
            <Link
              to={`/dashboard/tracking/${activeBooking._id}`}
              className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emergency-50 border border-emergency-300 text-emergency-700 text-xs font-bold hover:bg-emergency-100 transition animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emergency-600"></span>
              <span>Active Assistance ({activeBooking.bookingReference}) - Track Live</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard/request"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-xs shadow-sm transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Get Help</span>
            </Link>

            <div className="border-l border-slate-200 pl-3 flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
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
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    item.isUrgent
                      ? 'bg-emergency-50 text-emergency-700 hover:bg-emergency-100 font-bold mb-2'
                      : isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${item.isUrgent ? 'text-emergency-600' : isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emergency-600 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick 24/7 Hotline Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Dispatch</span>
            </div>
            <p className="text-sm font-extrabold text-white">1800-AAA-HELP</p>
            <p className="text-[10px] text-slate-400">Available 24 hours nationwide</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer (Left Slide-in) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-slide-right">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link to="/" onClick={() => setMobileSidebarOpen(false)} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Shield className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-base">
                    Roadside <span className="text-brand-600">AAA</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold uppercase">
                  Verified Driver
                </span>
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
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        item.isUrgent
                          ? 'bg-emergency-50 text-emergency-700 font-bold'
                          : isActive
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${item.isUrgent ? 'text-emergency-600' : isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emergency-600 text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
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
                  setMobileSidebarOpen(false);
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

      {/* Mobile Bottom Navigation Bar (Sticky on Phone Screens) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5">
        <div className="flex items-center justify-around">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/dashboard' ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </Link>

          {/* Vehicles */}
          <Link
            to="/dashboard/vehicles"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/dashboard/vehicles' ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-5 h-5 mb-0.5" />
            <span>Vehicles</span>
          </Link>

          {/* Emergency Request (Center Highlight Pill) */}
          <Link
            to="/dashboard/request"
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-emergency-600 text-white flex items-center justify-center shadow-lg shadow-emergency-600/40 transform active:scale-95 transition">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-extrabold text-emergency-600 mt-0.5">SOS Help</span>
          </Link>

          {/* History */}
          <Link
            to="/dashboard/bookings"
            className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/dashboard/bookings' ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span>History</span>
          </Link>

          {/* Notifications */}
          <Link
            to="/dashboard/notifications"
            className={`relative flex flex-col items-center py-1 px-2.5 text-[10px] font-bold transition ${
              location.pathname === '/dashboard/notifications' ? 'text-brand-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {unreadNotifications > 0 && (
              <span className="absolute top-0.5 right-3 w-2 h-2 rounded-full bg-emergency-600"></span>
            )}
            <Bell className="w-5 h-5 mb-0.5" />
            <span>Alerts</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
