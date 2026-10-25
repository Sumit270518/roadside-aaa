import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import {
  Wrench,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Navigation,
  DollarSign,
  Star,
  MapPin,
  Radio,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/geo';

export const PartnerOverview = () => {
  const { user, partnerProfile } = useAuth();
  const navigate = useNavigate();

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [incRes, jobsRes, earnRes] = await Promise.all([
        api.get('/requests?status=incoming'),
        api.get('/partners/me/jobs'),
        api.get('/partners/me/earnings'),
      ]);

      if (incRes.data.success) setIncomingRequests(incRes.data.data);
      if (jobsRes.data.success) {
        const active = jobsRes.data.data.find((j) =>
          ['accepted', 'en_route', 'arrived', 'in_progress'].includes(j.status)
        );
        setActiveJob(active || null);
      }
      if (earnRes.data.success) setStats(earnRes.data.data);
    } catch (err) {
      console.warn('Partner data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Socket realtime listener for new incoming requests
    const socket = getSocket();
    if (socket) {
      socket.on('partner:new-request', (data) => {
        toast('New Roadside Assistance Request in your area!', { icon: '🚨' });
        fetchDashboardData();
      });

      socket.on('booking:assigned', () => {
        fetchDashboardData();
      });
    }

    const interval = setInterval(fetchDashboardData, 8000);
    return () => {
      clearInterval(interval);
      if (socket) socket.off('partner:new-request');
    };
  }, []);

  const handleAcceptRequest = async (requestId) => {
    setAcceptingId(requestId);
    try {
      const res = await api.post(`/requests/${requestId}/accept`);
      if (res.data.success) {
        toast.success('Request accepted! Proceed to update your en-route status.');
        navigate(`/partner/active/${requestId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept request. It may have been taken by another partner.');
      fetchDashboardData();
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isVerified = partnerProfile?.verificationStatus === 'verified';
  const isOnline = partnerProfile?.isAvailable;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Availability Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            {partnerProfile?.businessName || 'Service Partner Dashboard'}
          </h1>
          <p className="text-xs text-slate-500">
            Coverage Area: {partnerProfile?.serviceRadiusKm || 25} km Radius • {partnerProfile?.address}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Radar</span>
            <span
              className={`text-xs font-black inline-flex items-center space-x-1 ${
                isOnline && isVerified ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isOnline && isVerified ? 'animate-pulse text-emerald-600' : ''}`} />
              <span>{isOnline && isVerified ? 'Actively Listening' : 'Offline / Standby'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Job Alert Card */}
      {activeJob && (
        <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                You Have an Active Assigned Job
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-brand-600 text-[10px] font-bold uppercase self-start sm:self-auto">
              Status: {activeJob.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div>
              <p className="text-slate-400">Customer</p>
              <p className="text-sm font-bold text-white mt-0.5">{activeJob.customer?.name} ({activeJob.customer?.phone})</p>
            </div>
            <div>
              <p className="text-slate-400">Vehicle</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {activeJob.vehicleSnapshot?.make} {activeJob.vehicleSnapshot?.model} ({activeJob.vehicleSnapshot?.registrationNumber})
              </p>
            </div>
            <div>
              <p className="text-slate-400">Location</p>
              <p className="text-sm font-bold text-white mt-0.5">{activeJob.address}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to={`/partner/active/${activeJob._id}`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow transition"
            >
              <span>Manage Job & Update Location GPS →</span>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Completed Jobs</p>
          <p className="text-2xl font-black text-slate-900">{stats?.completedJobsCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Total Gross Service Value</p>
          <p className="text-2xl font-black text-brand-600">{formatCurrency(stats?.totalGrossValue)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Partner Net Earnings (90%)</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats?.partnerEarnings)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Technician Rating</p>
          <div className="flex items-center space-x-1 text-2xl font-black text-amber-500">
            <Star className="w-5 h-5 fill-amber-500" />
            <span>{partnerProfile?.ratingSummary?.averageRating || 5.0}</span>
          </div>
        </div>
      </div>

      {/* Incoming Requests Radar Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Incoming Roadside Assistance Requests</span>
              <span className="w-2 h-2 rounded-full bg-emergency-600 animate-ping"></span>
            </h3>
            <p className="text-xs text-slate-500">Live requests matching your service area awaiting partner assignment</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            {incomingRequests.length} Available
          </span>
        </div>

        {!isVerified ? (
          <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-bold text-amber-900">Account Pending Verification</p>
            <p className="text-xs text-amber-800 max-w-md mx-auto">
              Our administration is currently reviewing your documentation. Once verified, you will be able to accept customer dispatch calls.
            </p>
          </div>
        ) : !isOnline ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-800">You are currently OFFLINE</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Switch your status to ONLINE using the toggle at the top right to start receiving incoming assistance jobs.
            </p>
          </div>
        ) : incomingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Pending Requests in Radius</p>
            <p className="text-xs text-slate-400">
              Radar is actively scanning within {partnerProfile?.serviceRadiusKm || 25} km. New requests will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingRequests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {req.bookingReference}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emergency-600 bg-emergency-50 px-2 py-0.5 rounded">
                      Emergency Assistance
                    </span>
                    <span className="text-xs text-slate-400">
                      Requested {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {req.serviceCategorySnapshot?.name || 'Roadside Assistance'}
                  </h4>

                  <p className="text-xs text-slate-700">
                    <span className="font-semibold">Vehicle: </span>
                    {req.vehicleSnapshot?.make} {req.vehicleSnapshot?.model} ({req.vehicleSnapshot?.registrationNumber})
                  </p>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Location: </span>
                    {req.address} {req.landmark && `(Near ${req.landmark})`}
                  </p>

                  <p className="text-xs text-slate-600 italic">
                    "{req.breakdownDescription}"
                  </p>
                </div>

                <div className="flex flex-col md:items-end justify-between space-y-3 shrink-0">
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-700">
                      {formatCurrency(req.estimatedPrice?.estimatedTotal)}
                    </p>
                    <p className="text-[10px] text-slate-400">Est. Payout</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req._id)}
                    disabled={acceptingId === req._id}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{acceptingId === req._id ? 'Accepting...' : 'Accept Job'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
