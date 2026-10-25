import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { LiveTrackingMap } from '../../components/maps/LiveTrackingMap';
import {
  Navigation,
  PhoneCall,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  XCircle,
  FileText,
  User,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/geo';

export const LiveTrackingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [partnerCoords, setPartnerCoords] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const chatScrollRef = useRef(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
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
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();

    // Socket.IO Room Setup
    const socket = getSocket();
    if (socket) {
      socket.emit('booking:join', id);

      socket.on('booking:updated', (data) => {
        if (data.bookingId === id) {
          setBooking((prev) => (prev ? { ...prev, status: data.status, ...data } : prev));
          toast('Booking status updated: ' + data.status.replace('_', ' ').toUpperCase(), { icon: 'ℹ️' });
        }
      });

      socket.on('booking:assigned', (data) => {
        if (data.bookingId === id) {
          fetchBookingDetails();
          toast.success('Mechanic assigned to your breakdown!');
        }
      });

      socket.on('booking:cancelled', (data) => {
        if (data.bookingId === id) {
          setBooking((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
          toast.error('Booking has been cancelled.');
        }
      });

      socket.on('partner:location:updated', (data) => {
        if (data.bookingId === id && data.coordinates) {
          setPartnerCoords(data.coordinates);
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
        socket.off('booking:assigned');
        socket.off('booking:cancelled');
        socket.off('partner:location:updated');
        socket.off('chat:new-message');
      }
    };
  }, [id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleCancelBooking = async () => {
    try {
      const res = await api.post(`/requests/${id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        toast.success('Booking cancelled.');
        setBooking(res.data.data);
        setCancelModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleSubmitReview = async () => {
    try {
      const res = await api.post(`/requests/${id}/review`, {
        rating,
        comment: reviewComment,
      });
      if (res.data.success) {
        toast.success('Review submitted! Thank you.');
        setReviewModalOpen(false);
        setBooking((prev) => ({ ...prev, hasReview: true }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Booking not found</h2>
        <Link to="/dashboard" className="text-xs font-bold text-brand-600">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const stepsList = ['requested', 'searching', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
  const currentStepIdx = stepsList.indexOf(booking.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
              {booking.bookingReference}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                booking.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : booking.status === 'cancelled'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800 animate-pulse'
              }`}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900">
            {booking.serviceCategorySnapshot?.name || 'Roadside Assistance'}
          </h1>
          <p className="text-xs text-slate-500">
            {booking.vehicleSnapshot?.make} {booking.vehicleSnapshot?.model} • {booking.vehicleSnapshot?.registrationNumber}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {booking.status === 'completed' ? (
            <Link
              to={`/dashboard/invoice/${booking._id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Invoice</span>
            </Link>
          ) : booking.status !== 'cancelled' ? (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Request</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress Stepper */}
      {booking.status !== 'cancelled' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {['Searching', 'Accepted', 'En Route', 'Arrived', 'In Progress', 'Completed'].map((lbl, idx) => {
              const mappedState = ['searching', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'][idx];
              const isPastOrCurrent = currentStepIdx >= stepsList.indexOf(mappedState);
              const isCurrent = booking.status === mappedState;

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border transition ${
                    isCurrent
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-500/20'
                      : isPastOrCurrent
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 text-slate-400 bg-slate-50/50'
                  }`}
                >
                  <p className="text-[10px] uppercase">{idx + 1}</p>
                  <p className="truncate">{lbl}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Partner Details & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Tracking Map */}
        <div className="lg:col-span-2 space-y-4">
          <LiveTrackingMap
            userCoords={booking.location?.coordinates}
            partnerCoords={partnerCoords}
            partnerName={booking.assignedPartner?.businessName || 'Assigned Partner'}
            className="h-[420px] w-full"
          />

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900">Breakdown Location: </span>
              <span>{booking.address} {booking.landmark && `(${booking.landmark})`}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {booking.location?.coordinates[1].toFixed(4)}, {booking.location?.coordinates[0].toFixed(4)}
            </span>
          </div>

          {/* If completed, prompt for review */}
          {booking.status === 'completed' && !booking.hasReview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-emerald-900">Service completed! How was your experience?</p>
                <p className="text-[11px] text-emerald-700">Help other motorists by reviewing your technician.</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
              >
                Rate & Review
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Partner Info & Realtime Chat */}
        <div className="space-y-6">
          {/* Assigned Partner Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Partner</h3>
            {booking.assignedPartner ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-base">
                    {booking.assignedPartner.businessName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{booking.assignedPartner.businessName}</h4>
                    <p className="text-xs text-slate-500">{booking.assignedPartner.address}</p>
                    <div className="flex items-center space-x-1 text-amber-500 text-xs mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold">{booking.assignedPartner.ratingSummary?.averageRating || 5.0}</span>
                      <span className="text-slate-400">({booking.assignedPartner.ratingSummary?.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {booking.assignedPartner.user?.phone && (
                  <a
                    href={`tel:${booking.assignedPartner.user.phone}`}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                    <span>Call Technician ({booking.assignedPartner.user.phone})</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-slate-700">Searching nearby verified mechanics...</p>
                <p className="text-[11px] text-slate-400">We notify you the instant a partner accepts.</p>
              </div>
            )}
          </div>

          {/* Booking Chat Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-80">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-900">Direct Booking Chat</span>
              </div>
              <span className="text-[10px] text-slate-400">Private & Secured</span>
            </div>

            {/* Messages Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No messages yet. Send a message to coordinate breakdown landmarks.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                  return (
                    <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-none'
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

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message to partner..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Roadside Assistance?</h3>
            <p className="text-xs text-slate-600">
              Please share the cancellation reason to help improve our dispatch dispatch algorithm.
            </p>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Car started, friend helped, etc."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Keep Request
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Rate Your Service</h3>
            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Optional written feedback for technician..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Skip
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
