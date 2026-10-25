import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Radio, Search, Filter, Clock, MapPin, Eye, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [inspectBooking, setInspectBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const url = statusFilter ? `/admin/bookings?status=${statusFilter}` : '/admin/bookings';
      const res = await api.get(url);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load live bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleAdminCancel = async (bookingId) => {
    const reason = window.prompt('Enter reason for administrative cancellation:');
    if (!reason) return;

    try {
      const res = await api.post(`/requests/${bookingId}/cancel`, { reason });
      if (res.data.success) {
        toast.success('Booking cancelled by administrator');
        fetchBookings();
        setInspectBooking(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Live Dispatch & Bookings Monitor</h1>
          <p className="text-xs text-slate-500">Supervise active emergency requests, tracking coordinates, and state history</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Statuses</option>
            <option value="searching">Searching</option>
            <option value="accepted">Accepted</option>
            <option value="en_route">En Route</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No bookings found for the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Partner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Request Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {b.serviceCategorySnapshot?.name || 'Roadside Assistance'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {b.customer?.name} ({b.customer?.phone})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {b.assignedPartner?.businessName || (
                        <span className="text-amber-600 font-semibold italic">Unassigned (Searching)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setInspectBooking(b)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-800"
                      >
                        Inspect History
                      </button>
                      {['requested', 'searching', 'accepted', 'en_route'].includes(b.status) && (
                        <button
                          onClick={() => handleAdminCancel(b._id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Status History Modal */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Booking Audit: {inspectBooking.bookingReference}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectBooking.vehicleSnapshot?.make} {inspectBooking.vehicleSnapshot?.model} ({inspectBooking.vehicleSnapshot?.registrationNumber})
                </p>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p><span className="font-semibold text-slate-800">Confirmed Address:</span> {inspectBooking.address}</p>
              <p><span className="font-semibold text-slate-800">Problem Description:</span> "{inspectBooking.breakdownDescription}"</p>
              <p>
                <span className="font-semibold text-slate-800">Current GPS Coordinates: </span>
                {inspectBooking.location?.coordinates[1]}, {inspectBooking.location?.coordinates[0]}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Audit Status Progression</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {inspectBooking.statusHistory?.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-slate-800 text-[10px]">{h.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{h.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
