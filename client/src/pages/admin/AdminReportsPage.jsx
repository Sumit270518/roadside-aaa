import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Star, Award, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  completed: '#10b981',
  cancelled: '#f43f5e',
  en_route: '#3b82f6',
  searching: '#f59e0b',
  accepted: '#8b5cf6',
  in_progress: '#06b6d4',
  requested: '#64748b',
};

export const AdminReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        if (res.data.success) {
          setReportData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load operational reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { timelineData, categoryStats, statusStats, topPartners } = reportData || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Operational Analytics & Reports</h1>
          <p className="text-xs text-slate-500">Live aggregated metrics and dispatch trends across service categories</p>
        </div>
      </div>

      {/* Chart 1: Daily Requests Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assistance Requests Timeline</h3>
            <p className="text-xs text-slate-500">Total volume vs completed services by date</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {timelineData && timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="compColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total" name="Total Dispatches" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#totalColor)" />
                <Area type="monotone" dataKey="completed" name="Completed Services" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#compColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Not enough chronological dispatches recorded yet to display trendline.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Bar Chart for Categories + Pie Chart for Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Dispatches by Service Category</h3>
            <p className="text-xs text-slate-500">Distribution of breakdown requests across service types</p>
          </div>

          <div className="h-64 w-full pt-4">
            {categoryStats && categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Dispatches" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category metrics recorded.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking Status Distribution</h3>
            <p className="text-xs text-slate-500">Overall ratio of completed, active, and cancelled bookings</p>
          </div>

          <div className="h-64 w-full pt-4">
            {statusStats && statusStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    fontSize={11}
                  >
                    {statusStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No status stats available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Partners Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Top Rated Verified Partners</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer Rating</th>
                <th className="py-3 px-4">Total Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topPartners && topPartners.map((p) => (
                <tr key={p._id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.businessName}</td>
                  <td className="py-3.5 px-4 uppercase text-slate-500 font-semibold">{p.partnerType}</td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      {p.ratingSummary?.averageRating || 5.0} / 5.0
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.ratingSummary?.totalReviews || 0} verified reviews</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
