import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquareWarning, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: '',
    category: 'overcharging',
    description: '',
  });

  const fetchData = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/requests?limit=20'),
      ]);

      if (cRes.data.success) setComplaints(cRes.data.data);
      if (bRes.data.success) {
        setBookings(bRes.data.data);
        if (bRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, bookingId: bRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/complaints', formData);
      if (res.data.success) {
        toast.success('Complaint submitted! Our administrative desk will review it.');
        setModalOpen(false);
        setFormData({ bookingId: bookings[0]?._id || '', category: 'overcharging', description: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Support & Complaints Desk</h1>
          <p className="text-xs text-slate-500">Report service disputes, partner conduct, or invoice overcharging</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={bookings.length === 0}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>File Complaint</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Complaints Filed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no active disputes. If you ever face an issue with a roadside partner, report it here for immediate admin intervention.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    Ref: {c.bookingId?.bookingReference || 'Service Request'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {c.category.replace('_', ' ')}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                    c.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'under_review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                "{c.description}"
              </p>

              {c.resolutionDetails && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Administrator Resolution</span>
                  </p>
                  <p className="text-emerald-800">{c.resolutionDetails}</p>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Submitted on {new Date(c.createdAt).toLocaleDateString()} at{' '}
                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* File Complaint Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">File a Service Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Booking</label>
                <select
                  required
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.bookingReference} - {b.serviceCategorySnapshot?.name} ({new Date(b.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="overcharging">Overcharging / Unapproved Fees</option>
                  <option value="partner_delay">Excessive Partner Delay</option>
                  <option value="unprofessional_behavior">Unprofessional Behavior</option>
                  <option value="poor_service_quality">Poor Service Quality</option>
                  <option value="vehicle_damage">Vehicle Damage</option>
                  <option value="other">Other Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Evidence</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what occurred and how our administration can resolve it..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emergency-600 text-white font-bold text-xs hover:bg-emergency-700 shadow"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
