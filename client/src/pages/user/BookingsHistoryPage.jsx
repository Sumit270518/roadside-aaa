import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { History, Search, Filter, FileText, Navigation, Star, AlertCircle, MessageSquareWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/geo';

export const BookingsHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchBookings = async () => {
    try {
      const url = statusFilter ? `/requests?status=${statusFilter}` : '/requests';
      const res = await api.get(url);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSubmitReview = async () => {
    try {
      const res = await api.post(`/requests/${reviewBookingId}/review`, { rating, comment });
      if (res.data.success) {
        toast.success('Thank you! Review submitted.');
        setReviewBookingId(null);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const ref = b.bookingReference?.toLowerCase() || '';
    const svc = b.serviceCategorySnapshot?.name?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return ref.includes(q) || svc.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Service Booking History</h1>
            <p className="text-xs text-slate-500">Track current jobs, past invoices, and submitted feedback</p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="en_route">En Route</option>
              <option value="in_progress">In Progress</option>
              <option value="searching">Searching</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by booking reference (e.g. AAA-202610-...) or service..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching service requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isCompleted = b.status === 'completed';
            const isActive = ['requested', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status);

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.bookingReference}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString()} at{' '}
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {b.serviceCategorySnapshot?.name || 'Roadside Assistance'}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Vehicle: <span className="font-semibold text-slate-800">{b.vehicleSnapshot?.make} {b.vehicleSnapshot?.model}</span> ({b.vehicleSnapshot?.registrationNumber})
                    • Location: {b.address}
                  </p>

                  {b.assignedPartner && (
                    <p className="text-[11px] text-brand-700 font-medium">
                      Assigned Partner: {b.assignedPartner.businessName}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:items-end justify-between space-y-2 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {formatCurrency(isCompleted ? b.finalPrice?.total : b.estimatedPrice?.estimatedTotal)}
                    </p>
                    <p className="text-[10px] text-slate-400">{isCompleted ? 'Final Total' : 'Estimated Cost'}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isActive ? (
                      <Link
                        to={`/dashboard/tracking/${b._id}`}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-emergency-600 hover:bg-emergency-700 text-white text-xs font-bold shadow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Live Track</span>
                      </Link>
                    ) : isCompleted ? (
                      <>
                        {!b.hasReview && (
                          <button
                            onClick={() => {
                              setReviewBookingId(b._id);
                              setRating(5);
                              setComment('');
                            }}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Rate</span>
                          </button>
                        )}
                        <Link
                          to={`/dashboard/invoice/${b._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-600" />
                          <span>Invoice</span>
                        </Link>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Review Roadside Technician</h3>
            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-7 h-7 ${s <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the response speed, professionalism, and workmanship?"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewBookingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
