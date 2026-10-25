import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap';
import {
  AlertTriangle,
  Car,
  Wrench,
  Truck,
  Zap,
  Disc,
  Fuel,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  PlusCircle,
  Clock,
  Star,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/geo';

export const RequestAssistancePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSlug = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nearbyPartners, setNearbyPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [breakdownDescription, setBreakdownDescription] = useState('');
  const [coordinates, setCoordinates] = useState([77.2090, 28.6139]); // [lon, lat]
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);

  // New vehicle quick modal state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehData, setNewVehData] = useState({
    registrationNumber: '',
    vehicleType: 'car',
    make: '',
    model: '',
    year: 2022,
    fuelType: 'petrol',
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [vRes, cRes] = await Promise.all([api.get('/vehicles'), api.get('/services')]);

        if (vRes.data.success) {
          setVehicles(vRes.data.data);
          if (vRes.data.data.length > 0) setSelectedVehicle(vRes.data.data[0]);
        }

        if (cRes.data.success) {
          setCategories(cRes.data.data);
          if (preselectedSlug) {
            const found = cRes.data.data.find((c) => c.slug === preselectedSlug);
            if (found) setSelectedCategory(found);
          } else if (cRes.data.data.length > 0) {
            setSelectedCategory(cRes.data.data[0]);
          }
        }
      } catch (err) {
        console.warn('Init error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [preselectedSlug]);

  // When step 4 or location changes, fetch nearby partners
  useEffect(() => {
    if (step >= 4 && selectedCategory && coordinates) {
      const fetchNearby = async () => {
        try {
          const res = await api.get(
            `/partners/nearby?longitude=${coordinates[0]}&latitude=${coordinates[1]}&serviceCategoryId=${selectedCategory._id}`
          );
          if (res.data.success) {
            setNearbyPartners(res.data.data);
            if (res.data.data.length > 0 && !selectedPartnerId) {
              setSelectedPartnerId(res.data.data[0]._id);
            }
          }
        } catch (err) {
          console.warn('Nearby partners fetch error:', err.message);
        }
      };
      fetchNearby();
    }
  }, [step, selectedCategory, coordinates]);

  // Quick add vehicle handler
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/vehicles', newVehData);
      if (res.data.success) {
        toast.success('Vehicle registered!');
        setVehicles([res.data.data, ...vehicles]);
        setSelectedVehicle(res.data.data);
        setShowAddVehicle(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1 && !selectedVehicle) {
      setErrorMsg('Please select or add a vehicle');
      return;
    }
    if (step === 2 && !selectedCategory) {
      setErrorMsg('Please select a service category');
      return;
    }
    if (step === 3 && (!breakdownDescription || breakdownDescription.trim().length < 5)) {
      setErrorMsg('Please briefly describe the breakdown symptoms (at least 5 characters)');
      return;
    }
    if (step === 4 && (!address || address.trim().length < 3)) {
      setErrorMsg('Please confirm your street address or road name');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        vehicleId: selectedVehicle._id,
        serviceCategoryId: selectedCategory._id,
        breakdownDescription: breakdownDescription.trim(),
        coordinates,
        address: address.trim(),
        landmark: landmark.trim(),
        targetPartnerId: selectedPartnerId,
      };

      const res = await api.post('/requests', payload);

      if (res.data.success) {
        toast.success('Emergency assistance dispatched! Searching for closest mechanic.');
        navigate(`/dashboard/tracking/${res.data.data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit assistance request.';
      setErrorMsg(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Wizard Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emergency-100 text-emergency-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Request Roadside Assistance</h1>
              <p className="text-xs text-slate-500">Step {step} of 5</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {step === 1 && 'Vehicle Selection'}
            {step === 2 && 'Service Type'}
            {step === 3 && 'Problem Description'}
            {step === 4 && 'Breakdown Location'}
            {step === 5 && 'Review & Dispatch'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emergency-600 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Select Vehicle */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: Which vehicle needs assistance?</h2>
              <p className="text-xs text-slate-500">Select one of your saved vehicles or register a new one</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddVehicle ? 'Close' : 'Add Vehicle'}</span>
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Add Vehicle</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    placeholder="DL01-AB-1234"
                    value={newVehData.registrationNumber}
                    onChange={(e) => setNewVehData({ ...newVehData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Type</label>
                  <select
                    value={newVehData.vehicleType}
                    onChange={(e) => setNewVehData({ ...newVehData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="car">Car / Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="bike">Motorcycle / Scooter</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Make (Brand)</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyundai, Tata, Honda..."
                    value={newVehData.make}
                    onChange={(e) => setNewVehData({ ...newVehData, make: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="Creta, Nexon, City..."
                    value={newVehData.model}
                    onChange={(e) => setNewVehData({ ...newVehData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition"
              >
                Save & Select Vehicle
              </button>
            </form>
          )}

          {vehicles.length === 0 && !showAddVehicle ? (
            <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl space-y-3">
              <Car className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600">You don't have any vehicles registered yet.</p>
              <button
                type="button"
                onClick={() => setShowAddVehicle(true)}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white font-bold text-xs"
              >
                + Add Your Vehicle Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => {
                const isSelected = selectedVehicle?._id === v._id;
                return (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-900">
                        {v.registrationNumber}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-brand-600" />}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{v.make} {v.model}</h3>
                    <p className="text-[11px] text-slate-500">{v.year} • {v.fuelType.toUpperCase()}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedVehicle}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              <span>Continue to Service Type</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Service Type */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 2: What assistance do you need?</h2>
            <p className="text-xs text-slate-500">Pick the category that best matches your emergency</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory?._id === cat._id;
              return (
                <div
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                      <span className="text-xs font-black text-brand-700">₹{cat.basePrice}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition"
            >
              <span>Continue to Problem Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Describe Problem */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 3: What symptoms are you experiencing?</h2>
            <p className="text-xs text-slate-500">Provide details so the arriving mechanic brings the right tools or parts</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Breakdown Description</label>
            <textarea
              rows={4}
              required
              value={breakdownDescription}
              onChange={(e) => setBreakdownDescription(e.target.value)}
              placeholder="e.g. Engine made a loud knocking sound, white steam came from radiator, and car stalled on the shoulder. Headlights still turn on."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Quick tags:</span>
              <button
                type="button"
                onClick={() => setBreakdownDescription((prev) => prev ? `${prev}, Engine won't crank` : "Engine won't crank")}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
              >
                + Won't Crank
              </button>
              <button
                type="button"
                onClick={() => setBreakdownDescription((prev) => prev ? `${prev}, Heavy smoke` : "Heavy smoke")}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
              >
                + Smoke
              </button>
              <button
                type="button"
                onClick={() => setBreakdownDescription((prev) => prev ? `${prev}, Flat right front tire` : "Flat right front tire")}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
              >
                + Flat Tire
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition"
            >
              <span>Continue to Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Set Breakdown Location */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 4: Where is your vehicle stranded?</h2>
            <p className="text-xs text-slate-500">Click "Use My GPS" or click anywhere on the map to place your vehicle marker</p>
          </div>

          <LocationPickerMap
            coordinates={coordinates}
            onChange={(coords) => setCoordinates(coords)}
            className="h-72 w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Road / Street Address <span className="text-emergency-600">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Ring Road, Near Moolchand Flyover"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite HP Petrol Pump, Basement B2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition"
            >
              <span>Review Nearby Partners & Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Final Review & Nearby Partners */}
      {step === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 5: Review & Confirm Emergency Dispatch</h2>
            <p className="text-xs text-slate-500">Inspect nearby partners and transparent pricing estimate</p>
          </div>

          {/* Nearby Discovered Partners Card */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Nearby Verified Partners Available ({nearbyPartners.length})
            </h3>
            {nearbyPartners.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No active partners found within immediate 10km. Our central dispatch pool will broadcast to surrounding 30km radius automatically.
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyPartners.map((partner) => {
                  const isChosen = selectedPartnerId === partner._id;
                  return (
                    <div
                      key={partner._id}
                      onClick={() => setSelectedPartnerId(partner._id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChosen
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{partner.businessName}</h4>
                          <span className="flex items-center text-[10px] text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                            {partner.ratingSummary?.averageRating || 5.0}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {partner.distanceKm} km away • {partner.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-brand-700">
                          ~{formatCurrency(partner.estimatedPrice?.estimatedTotal)}
                        </p>
                        <p className="text-[10px] text-slate-400">Est. Total</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Request Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400">Vehicle:</span> {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.registrationNumber})
              </div>
              <div>
                <span className="text-slate-400">Service:</span> {selectedCategory?.name}
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Location:</span> {address} {landmark && `(${landmark})`}
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Problem:</span> "{breakdownDescription}"
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-800">Estimated Total Cost:</span>
              <span className="font-black text-emerald-700 text-base">
                {selectedCategory ? formatCurrency(selectedCategory.basePrice * 1.05) : '₹599'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              *Taxes included. Cash or UPI payable upon certified completion.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitBooking}
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-black text-sm shadow-lg shadow-emergency-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>{submitting ? 'Dispatching...' : 'Confirm & Dispatch Roadside Assistance'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
