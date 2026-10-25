import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, CheckCircle, XCircle, ShieldAlert, AlertCircle, FileText, Search, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminPartnerVerificationPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, partnerId: null, action: null });
  const [reason, setReason] = useState('');

  const fetchPartners = async () => {
    try {
      const url = statusFilter ? `/admin/partners?status=${statusFilter}` : '/admin/partners';
      const res = await api.get(url);
      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load partner applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleVerifyAction = async () => {
    try {
      const res = await api.patch(`/admin/partners/${actionModal.partnerId}/verify`, {
        status: actionModal.action,
        reason,
      });

      if (res.data.success) {
        toast.success(`Partner status updated to ${actionModal.action.toUpperCase()}`);
        setActionModal({ open: false, partnerId: null, action: null });
        setReason('');
        fetchPartners();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Partner Verification Desk</h1>
          <p className="text-xs text-slate-500">Review mechanic & towing fleet applications and manage access credentials</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Verification Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="verified">Verified & Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No partner applications found for the selected status.
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">{partner.businessName}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      partner.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : partner.verificationStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : partner.verificationStatus === 'suspended'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {partner.verificationStatus}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {partner.partnerType}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Owner:</span> {partner.user?.name} ({partner.user?.email} • {partner.user?.phone})
                </p>

                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Workshop:</span> {partner.address} • {partner.serviceRadiusKm} km Service Radius
                </p>

                <p className="text-xs text-slate-600 italic">
                  "{partner.description || 'No description provided.'}"
                </p>

                {partner.documents?.length > 0 && (
                  <div className="flex items-center space-x-2 pt-1 text-xs text-brand-700">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Documents submitted: {partner.documents.map((d) => d.docType).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {partner.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => setActionModal({ open: true, partnerId: partner._id, action: 'verified' })}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setActionModal({ open: true, partnerId: partner._id, action: 'rejected' })}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {partner.verificationStatus === 'verified' && (
                  <button
                    onClick={() => setActionModal({ open: true, partnerId: partner._id, action: 'suspended' })}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition"
                  >
                    <span>Suspend Partner</span>
                  </button>
                )}

                {partner.verificationStatus === 'suspended' && (
                  <button
                    onClick={() => setActionModal({ open: true, partnerId: partner._id, action: 'verified' })}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Re-Activate Partner</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Reason Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 capitalize">
              Confirm Partner {actionModal.action}
            </h3>
            <p className="text-xs text-slate-600">
              Record the administrative rationale for this decision. This is saved to the partner's verification history and audit log.
            </p>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Certified master mechanic license verified, or invalid trade certificate..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            ></textarea>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActionModal({ open: false, partnerId: null, action: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAction}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
