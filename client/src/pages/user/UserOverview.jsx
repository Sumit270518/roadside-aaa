import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  PlusCircle,
  Navigation,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '../../utils/geo';

export const UserOverview = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, bRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/requests?limit=10'),
        ]);

        if (vRes.data.success) setVehicles(vRes.data.data);
        if (bRes.data.success) setBookings(bRes.data.data);
      } catch (err) {
        console.warn('User overview fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeBooking = bookings.find((b) =>
    ['requested', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)
  );

  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Request CTA */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>24/7 Roadside Assistance Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Need Emergency Assistance?</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Mechanics, tow trucks, and battery jump units are standing by within your city perimeter.
          </p>
        </div>
        <Link
          to="/dashboard/request"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-extrabold text-sm shadow-lg shadow-emergency-600/30 transition transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Request Help Now</span>
        </Link>
      </div>

      {/* Active Booking Hero Alert Card */}
      {activeBooking && (
        <div className="bg-white rounded-2xl border-2 border-emergency-500 p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emergency-600 animate-ping"></span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emergency-600">
                  Active Roadside Job in Progress
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {activeBooking.serviceCategorySnapshot?.name || 'Roadside Assistance'} ({activeBooking.bookingReference})
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 self-start sm:self-auto">
              Status: {activeBooking.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-400">Location</p>
              <p className="font-bold text-slate-800 mt-0.5">{activeBooking.address}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-400">Assigned Vehicle</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {activeBooking.vehicleSnapshot?.make} {activeBooking.vehicleSnapshot?.model} ({activeBooking.vehicleSnapshot?.registrationNumber})
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-400">Estimated Total</p>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">
                {formatCurrency(activeBooking.estimatedPrice?.estimatedTotal)}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to={`/dashboard/tracking/${activeBooking._id}`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Live Map Tracking & Chat →</span>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Total Requests</p>
          <p className="text-2xl font-black text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Completed Services</p>
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Active Bookings</p>
          <p className="text-2xl font-black text-emergency-600">{activeBooking ? 1 : 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Registered Vehicles</p>
          <p className="text-2xl font-black text-brand-600">{vehicles.length}</p>
        </div>
      </div>

      {/* Vehicles Quick Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Vehicles</h3>
            <p className="text-xs text-slate-500">Manage cars and bikes for fast emergency dispatch</p>
          </div>
          <Link
            to="/dashboard/vehicles"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Vehicles</span>
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl space-y-3">
            <Car className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No vehicles added yet. Add your vehicle to request assistance faster.</p>
            <Link
              to="/dashboard/vehicles"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold"
            >
              + Add Vehicle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {vehicles.slice(0, 3).map((v) => (
              <div key={v._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
                    {v.registrationNumber}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{v.fuelType}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{v.make} {v.model}</h4>
                <p className="text-[11px] text-slate-500">{v.year} • {v.vehicleType.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Assistance Bookings</h3>
          <Link to="/dashboard/bookings" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All History →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No service requests placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{b.bookingReference}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {b.serviceCategorySnapshot?.name || 'Assistance Service'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {b.vehicleSnapshot?.make} {b.vehicleSnapshot?.model}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'completed' ? (
                        <Link
                          to={`/dashboard/invoice/${b._id}`}
                          className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/dashboard/tracking/${b._id}`}
                          className="inline-flex items-center space-x-1 text-emergency-600 hover:text-emergency-700 font-bold"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
