import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { Wrench, Shield, CheckCircle, MapPin, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const PartnerProfilePage = () => {
  const { partnerProfile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    experienceYears: 1,
    address: '',
    serviceRadiusKm: 25,
    pricing: { baseFee: 500, perKmRate: 30, diagnosticFee: 250 },
    coordinates: [77.2090, 28.6139],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partnerProfile) {
      setFormData({
        businessName: partnerProfile.businessName || '',
        description: partnerProfile.description || '',
        experienceYears: partnerProfile.experienceYears || 1,
        address: partnerProfile.address || '',
        serviceRadiusKm: partnerProfile.serviceRadiusKm || 25,
        pricing: {
          baseFee: partnerProfile.pricing?.baseFee || 500,
          perKmRate: partnerProfile.pricing?.perKmRate || 30,
          diagnosticFee: partnerProfile.pricing?.diagnosticFee || 250,
        },
        coordinates: partnerProfile.location?.coordinates || [77.2090, 28.6139],
      });
    }
  }, [partnerProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/partners/me', formData);
      if (res.data.success) {
        toast.success('Partner profile and service parameters updated!');
        await refreshUser();
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Partner Profile & Service Radius</h1>
          <p className="text-xs text-slate-500">Configure your workshop base, dispatch radius, and service fees</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            partnerProfile?.verificationStatus === 'verified'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {partnerProfile?.verificationStatus}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Years in Automotive Service</label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Workshop Description / Bio</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your mechanical specialty or towing fleet equipment..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Base Workshop Street Address</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
          />
        </div>

        {/* Map & Service Radius */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Depot Base GPS Location</h3>
            <span className="text-xs font-bold text-brand-600">{formData.serviceRadiusKm} km Coverage Radius</span>
          </div>

          <LocationPickerMap
            coordinates={formData.coordinates}
            onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
            className="h-64 w-full"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Service Radius: {formData.serviceRadiusKm} Kilometers
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={formData.serviceRadiusKm}
              onChange={(e) => setFormData({ ...formData, serviceRadiusKm: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        {/* Pricing Guidance */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Pricing Guidance (INR)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Service Fee (₹)</label>
              <input
                type="number"
                min="100"
                value={formData.pricing.baseFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, baseFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Per KM Towing Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.pricing.perKmRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, perKmRate: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Diagnostic Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.pricing.diagnosticFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, diagnosticFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
