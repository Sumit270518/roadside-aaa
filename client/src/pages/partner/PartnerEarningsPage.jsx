import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, CheckCircle, Clock, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

export const PartnerEarningsPage = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earnRes, jobsRes] = await Promise.all([
          api.get('/partners/me/earnings'),
          api.get('/partners/me/jobs?status=completed'),
        ]);

        if (earnRes.data.success) setEarningsData(earnRes.data.data);
        if (jobsRes.data.success) setJobs(jobsRes.data.data);
      } catch (err) {
        toast.error('Failed to load earnings history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Partner Earnings & Completed Jobs</h1>
          <p className="text-xs text-slate-500">
            Database-derived service records • Platform Commission: {earningsData?.commissionRatePercent || 10}%
          </p>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Completed Jobs</p>
          <p className="text-3xl font-black text-slate-900">{earningsData?.completedJobsCount || 0}</p>
          <p className="text-[11px] text-slate-400">Successfully closed roadside dispatches</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Gross Service Value</p>
          <p className="text-3xl font-black text-brand-600">{formatCurrency(earningsData?.totalGrossValue)}</p>
          <p className="text-[11px] text-slate-400">Combined billing before platform fees</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Net Partner Payout (90%)</p>
          <p className="text-3xl font-black text-emerald-600">{formatCurrency(earningsData?.partnerEarnings)}</p>
          <p className="text-[11px] text-slate-400">Retained after 10% platform facilitation fee</p>
        </div>
      </div>

      {/* Completed Jobs History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Completed Service Dispatches</h3>

        {jobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No completed jobs on record yet. Complete active jobs to see settled earnings logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-right">Your Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => {
                  const gross = j.finalPrice?.total || 0;
                  const net = Math.round(gross * 0.9);
                  return (
                    <tr key={j._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{j.bookingReference}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {j.serviceCategorySnapshot?.name || 'Roadside Assistance'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {j.customer?.name} ({j.customer?.phone})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {j.vehicleSnapshot?.make} {j.vehicleSnapshot?.model}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(j.completedAt || j.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        {formatCurrency(gross)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
