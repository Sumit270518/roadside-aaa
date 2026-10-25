import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import {
  Navigation,
  PhoneCall,
  MessageSquare,
  CheckCircle,
  Truck,
  Wrench,
  Clock,
  Send,
  Plus,
  Trash2,
  DollarSign,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/geo';

export const PartnerActiveJobPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [partnerCoords, setPartnerCoords] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Complete Job Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const chatScrollRef = useRef(null);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data.success) {
        setBooking(res.data.data);
        if (res.data.data.tracking?.currentLocation?.coordinates) {
          setPartnerCoords(res.data.data.tracking.currentLocation.coordinates);
        }
      }

      const msgRes = await api.get(`/requests/${id}/messages`);
      if (msgRes.data.success) {
        setMessages(msgRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load active job');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();

    const socket = getSocket();
    if (socket) {
      socket.emit('booking:join', id);

      socket.on('booking:updated', (data) => {
        if (data.bookingId === id) {
          setBooking((prev) => (prev ? { ...prev, status: data.status, ...data } : prev));
        }
      });

      socket.on('chat:new-message', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('booking:leave', id);
        socket.off('booking:updated');
        socket.off('chat:new-message');
      }
    };
  }, [id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // State Transition Handlers
  const handleUpdateStatus = async (newStatus, note = '') => {
    setUpdating(true);
    try {
      const res = await api.post(`/requests/${id}/status`, { status: newStatus, note });
      if (res.data.success) {
        toast.success(`Job updated to: ${newStatus.replace('_', ' ').toUpperCase()}`);
        setBooking(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status transition failed');
    } finally {
      setUpdating(false);
    }
  };

  // Live GPS movement simulator
  const handleSimulateGPSMove = async () => {
    if (!booking?.location?.coordinates || !partnerCoords) return;

    const targetLon = booking.location.coordinates[0];
    const targetLat = booking.location.coordinates[1];

    // Move 20% closer to the target breakdown location
    const stepLon = partnerCoords[0] + (targetLon - partnerCoords[0]) * 0.25;
    const stepLat = partnerCoords[1] + (targetLat - partnerCoords[1]) * 0.25;
    const newCoords = [stepLon, stepLat];

    setPartnerCoords(newCoords);

    try {
      await api.post(`/requests/${id}/location`, { coordinates: newCoords, heading: 45 });
      toast.success('Live GPS coordinates updated and broadcast to customer!');
    } catch (err) {
      console.warn('Location post error:', err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const res = await api.post(`/requests/${id}/messages`, { message: chatInput });
      if (res.data.success) {
        setChatInput('');
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleAddChargeLine = () => {
    setAdditionalCharges([...additionalCharges, { description: '', amount: 0 }]);
  };

  const handleRemoveChargeLine = (idx) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== idx));
  };

  const handleChargeChange = (idx, field, value) => {
    const updated = [...additionalCharges];
    updated[idx][field] = value;
    setAdditionalCharges(updated);
  };

  const handleCompleteService = async () => {
    setUpdating(true);
    try {
      const res = await api.post(`/requests/${id}/complete`, {
        additionalCharges,
        paymentMethod,
      });

      if (res.data.success) {
        toast.success('Service completed successfully! Invoice finalized.');
        setCompleteModalOpen(false);
        navigate('/partner/earnings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete job');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-slate-600">Active job not found</p>
        <Link to="/partner" className="text-xs font-bold text-amber-600">
          ← Return to Partner Dashboard
        </Link>
      </div>
    );
  }

  const { status } = booking;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
              {booking.bookingReference}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
              Current Status: {status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900">
            {booking.serviceCategorySnapshot?.name || 'Assistance Service'}
          </h1>
          <p className="text-xs text-slate-500">
            Customer: <span className="font-semibold text-slate-800">{booking.customer?.name}</span> ({booking.customer?.phone})
          </p>
        </div>

        {/* State Machine Transition Buttons */}
        <div className="flex items-center space-x-2">
          {status === 'accepted' && (
            <button
              onClick={() => handleUpdateStatus('en_route', 'Technician is en route')}
              disabled={updating}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>Mark En Route (Start Trip)</span>
            </button>
          )}

          {status === 'en_route' && (
            <button
              onClick={() => handleUpdateStatus('arrived', 'Technician has arrived on spot')}
              disabled={updating}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Have Arrived at Vehicle</span>
            </button>
          )}

          {status === 'arrived' && (
            <button
              onClick={() => handleUpdateStatus('in_progress', 'Diagnostic and repair work commenced')}
              disabled={updating}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>Start Diagnostic / Repair Work</span>
            </button>
          )}

          {status === 'in_progress' && (
            <button
              onClick={() => setCompleteModalOpen(true)}
              disabled={updating}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Service & Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Tracking Map + Job Details & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map & GPS Simulator */}
        <div className="lg:col-span-2 space-y-4">
          <LiveTrackingMap
            userCoords={booking.location?.coordinates}
            partnerCoords={partnerCoords}
            partnerName="You (Partner)"
            className="h-[420px] w-full"
          />

          {/* GPS Simulation Tool for Testing */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Real-Time GPS Location Simulator</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Click to simulate advancing your location towards customer breakdown coordinates for live testing.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateGPSMove}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm whitespace-nowrap transition"
            >
              Simulate Movement (25% Closer)
            </button>
          </div>

          {/* Breakdown Context Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Breakdown Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="text-slate-400">Vehicle:</span> {booking.vehicleSnapshot?.make} {booking.vehicleSnapshot?.model} ({booking.vehicleSnapshot?.registrationNumber})
              </div>
              <div>
                <span className="text-slate-400">Fuel:</span> {booking.vehicleSnapshot?.fuelType?.toUpperCase()}
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Confirmed Location:</span> {booking.address} {booking.landmark && `(${booking.landmark})`}
              </div>
              <div className="col-span-2 p-2.5 rounded-lg bg-amber-50 text-amber-900 font-medium">
                Customer Problem Description: "{booking.breakdownDescription}"
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Chat & Quick Contact */}
        <div className="space-y-6">
          {/* Customer Call Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Contact</h3>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{booking.customer?.name}</p>
              <p className="text-xs text-slate-500">Phone: {booking.customer?.phone}</p>
            </div>
            {booking.customer?.phone && (
              <a
                href={`tel:${booking.customer.phone}`}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                <span>Call Customer</span>
              </a>
            )}
          </div>

          {/* Booking Chat Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-80">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-900">Customer Chat</span>
              </div>
              <span className="text-[10px] text-slate-400">Live</span>
            </div>

            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No messages yet. Send an update about your estimated arrival.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                  return (
                    <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-[10px] font-bold opacity-75 mb-0.5">{m.senderName || m.sender?.name}</p>
                        <p className="text-xs leading-relaxed">{m.message}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type update to driver..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button type="submit" className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Complete Service Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Complete Job & Finalize Billing</h3>
            <p className="text-xs text-slate-600">
              Record any customer-approved parts or emergency fluids provided during the roadside service.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Approved Parts / Extra Charges</label>
                <button
                  type="button"
                  onClick={handleAddChargeLine}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {additionalCharges.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No extra parts added (base service fee only).</p>
              ) : (
                <div className="space-y-2">
                  {additionalCharges.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. Battery spray, tire patch)"
                        value={item.description}
                        onChange={(e) => handleChargeChange(idx, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={item.amount || ''}
                        onChange={(e) => handleChargeChange(idx, 'amount', Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChargeLine(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="cash">Cash Collected on Spot</option>
                <option value="upi">Direct UPI Scan</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteService}
                disabled={updating}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow disabled:opacity-50"
              >
                {updating ? 'Closing Job...' : 'Confirm Job Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
