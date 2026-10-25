import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquareWarning, CheckCircle, Clock, Search, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComplaint, setActiveComplaint] = useState(null);

  const [status, setStatus] = useState('under_review');
  const [internalNote, setInternalNote] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolutionModal = (c) => {
    setActiveComplaint(c);
    setStatus(c.status);
    setInternalNote('');
    setResolutionDetails(c.resolutionDetails || '');
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch(`/admin/complaints/${activeComplaint._id}`, {
        status,
        internalNote,
        resolutionDetails,
      });

      if (res.data.success) {
        toast.success('Complaint resolution updated');
        setActiveComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error('Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Complaints & Dispute Resolution Desk</h1>
          <p className="text-xs text-slate-500">Investigate customer disputes, record internal notes, and enforce resolution</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No complaints registered in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    Ref: {c.bookingId?.bookingReference || 'Service Request'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {c.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'under_review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Submitted By:</span> {c.submittedBy?.name} ({c.submittedBy?.email} • {c.submittedBy?.phone})
                </p>

                <p className="text-xs text-slate-800 font-medium">"{c.description}"</p>

                {c.resolutionDetails && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">Resolution: </span> {c.resolutionDetails}
                  </div>
                )}

                {c.internalNotes?.length > 0 && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold uppercase text-[10px] text-slate-400">Private Internal Admin Notes:</span>
                    {c.internalNotes.map((note, idx) => (
                      <p key={idx} className="italic text-slate-700">• {note.note}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => openResolutionModal(c)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
                >
                  Manage & Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Resolve Complaint</h3>
            <p className="text-xs text-slate-500">
              Customer: {activeComplaint.submittedBy?.name} • Booking: {activeComplaint.bookingId?.bookingReference}
            </p>

            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Private Internal Note (Visible to Admins Only)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Record confidential technician conversation or audit remarks..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Resolution Summary (Shared with Customer)
                </label>
                <textarea
                  rows={3}
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="e.g. Partner reprimanded, ₹150 refunded to customer, etc."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
