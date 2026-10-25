import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import { Wrench, Truck, Shield, CheckCircle, AlertCircle, MapPin, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const PartnerRegisterPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    partnerType: 'mechanic',
    businessName: '',
    description: '',
    experienceYears: 5,
    address: 'Shop 12, Main Market Road',
    coordinates: [77.2090, 28.6139], // [lon, lat]
    serviceRadiusKm: 25,
    pricing: {
      baseFee: 500,
      perKmRate: 30,
      diagnosticFee: 250,
    },
    selectedCategories: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setCategories(res.data.data);
          // Auto select first 3
          setFormData((prev) => ({
            ...prev,
            selectedCategories: res.data.data.slice(0, 3).map((c) => c._id),
          }));
        }
      } catch (e) {
        console.warn('Fetch categories:', e.message);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (id) => {
    setFormData((prev) => {
      const exists = prev.selectedCategories.includes(id);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter((catId) => catId !== id)
          : [...prev.selectedCategories, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user && (!formData.password || formData.password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters for new partner account');
      return;
    }

    if (!formData.businessName) {
      setErrorMsg('Business / workshop name is required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        partnerType: formData.partnerType,
        businessName: formData.businessName,
        description: formData.description,
        experienceYears: Number(formData.experienceYears),
        address: formData.address,
        coordinates: formData.coordinates,
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        pricing: formData.pricing,
        serviceCategories: formData.selectedCategories,
      };

      const res = await api.post('/partners/register', payload);

      if (res.data.success) {
        toast.success('Partner application submitted! Verification pending administrative review.');
        await refreshUser();
        navigate('/partner');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit partner application.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Service Partner Onboarding
        </h1>
        <p className="text-sm text-slate-600">
          Join our verified network of mobile mechanics and flatbed towing operators.
          Receive emergency jobs, set your working hours, and grow your revenue.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Partner Role Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Partner Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, partnerType: 'mechanic' })}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                  formData.partnerType === 'mechanic'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Roadside Mechanic</h4>
                  <p className="text-xs text-slate-500 mt-0.5">On-spot repairs, electrical, jump-starts & tires</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, partnerType: 'towing_partner' })}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition ${
                  formData.partnerType === 'towing_partner'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Towing Fleet Operator</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Hydraulic flatbed or wheel-lift recovery trucks</p>
                </div>
              </button>
            </div>
          </div>

          {/* Account Details if not logged in */}
          {!user && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Account Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / Manager Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vikram Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@sharma-auto.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 33333"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Workshop & Business Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Garage Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Apex 24/7 Roadside Garage"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Field Experience</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Workshop Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Shop 14, Ring Road Commercial Complex, New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Services Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {categories.map((cat) => {
                  const isChecked = formData.selectedCategories.includes(cat._id);
                  return (
                    <label
                      key={cat._id}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2.5 cursor-pointer transition ${
                        isChecked ? 'bg-brand-50/50 border-brand-500 text-brand-900' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location and Service Radius */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Workshop Base Location</h3>
                <p className="text-xs text-slate-500">Click on the map to set your base depot or garage coordinates.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Service Radius: </span>
                <span className="text-xs font-bold text-brand-600">{formData.serviceRadiusKm} km</span>
              </div>
            </div>

            <LocationPickerMap
              coordinates={formData.coordinates}
              onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
              className="h-64 w-full"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Service Coverage Radius: {formData.serviceRadiusKm} km
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={formData.serviceRadiusKm}
                onChange={(e) => setFormData({ ...formData, serviceRadiusKm: e.target.value })}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          {/* Pricing Guidance */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Default Service Pricing (INR)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Assistance Fee (₹)</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={formData.pricing.baseFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, baseFee: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Per KM Towing Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.pricing.perKmRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, perKmRate: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">OBD Diagnostic Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.pricing.diagnosticFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, diagnosticFee: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Submit Partner Application for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};
