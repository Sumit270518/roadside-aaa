import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  UserCheck,
  Radio,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  MessageSquareWarning,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emergency-400">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Performance & Operations</h1>
          <p className="text-xs text-slate-400">All data aggregated directly from MongoDB records</p>
        </div>

        {stats?.pendingVerifications > 0 && (
          <Link
            to="/admin/partners"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>{stats.pendingVerifications} Partner Verifications Pending →</span>
          </Link>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Active Roadside Requests</p>
          <p className="text-3xl font-black text-emergency-600">{stats?.activeRequests || 0}</p>
          <p className="text-[10px] text-slate-400">Currently in dispatch lifecycle</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Verified Partners</p>
          <p className="text-3xl font-black text-emerald-600">
            {stats?.verifiedPartners || 0} <span className="text-xs text-slate-400">/ {stats?.totalPartners}</span>
          </p>
          <p className="text-[10px] text-slate-400">{stats?.pendingVerifications} awaiting review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Gross Service Value</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(stats?.grossServiceValue)}</p>
          <p className="text-[10px] text-slate-400">Total volume of completed jobs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Est. Platform Revenue (10%)</p>
          <p className="text-2xl font-black text-brand-600">{formatCurrency(stats?.estimatedPlatformRevenue)}</p>
          <p className="text-[10px] text-slate-400">Platform facilitation commission</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] text-slate-500">Registered Motorists</p>
          <p className="text-xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] text-slate-500">Completed Bookings</p>
          <p className="text-xl font-bold text-emerald-700">{stats?.completedBookings || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] text-slate-500">Customer Satisfaction</p>
          <div className="flex items-center space-x-1 text-xl font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{stats?.customerSatisfaction || 5.0}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] text-slate-500">Pending Complaints</p>
          <p className="text-xl font-bold text-rose-600">{stats?.pendingComplaints || 0}</p>
        </div>
      </div>

      {/* Operational Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Partner Verification Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect applicant trade licenses, workshop photos, and insurance. Approve or reject with reasons.
            </p>
          </div>
          <Link
            to="/admin/partners"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 pt-2"
          >
            <span>Review Partner Applications →</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Booking Dispatch Monitor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track ongoing roadside emergencies across cities, audit status history, and supervise assignments.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 pt-2"
          >
            <span>Monitor Live Bookings →</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Analytics & Reports Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect service category distributions, timeline trends, partner acceptance rates, and revenue.
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1 pt-2"
          >
            <span>View Recharts Analytics →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
