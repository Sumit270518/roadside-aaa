import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Shield, Printer, ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';
import toast from 'react-hot-toast';

export const InvoiceViewPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/requests/${id}/invoice`);
        if (res.data.success) {
          setInvoice(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-600">Invoice not found</p>
        <Link to="/dashboard/bookings" className="text-xs font-bold text-brand-600">
          ← Return to History
        </Link>
      </div>
    );
  }

  const { customer, vehicle, service, partner, pricing, bookingReference, serviceDate } = invoice;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/dashboard/bookings"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow hover:bg-slate-800 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md space-y-8"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-8 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Roadside <span className="text-brand-600">AAA</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Official Roadside Assistance Receipt & Invoice</p>
            <p className="text-[11px] text-slate-400">GST Registration: 07AAACR1234F1Z9</p>
          </div>

          <div className="sm:text-right space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice Number</p>
            <p className="text-lg font-mono font-black text-slate-900">{bookingReference}</p>
            <p className="text-xs text-slate-500">
              Date: {new Date(serviceDate).toLocaleDateString()} {new Date(serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Customer & Partner Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Billed To (Customer)</p>
            <p className="text-sm font-bold text-slate-900">{customer?.name}</p>
            <p>{customer?.phone}</p>
            <p>{customer?.email}</p>
            <p className="pt-1 text-slate-500">
              Vehicle: <span className="font-semibold text-slate-800">{vehicle?.make} {vehicle?.model} ({vehicle?.registrationNumber})</span>
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Service Partner Details</p>
            <p className="text-sm font-bold text-slate-900">{partner?.businessName || 'Authorized Partner'}</p>
            <p>{partner?.address}</p>
            <p>Phone: {partner?.phone || 'Central Dispatch'}</p>
            <p className="pt-1 text-slate-500">
              Location: <span className="font-semibold text-slate-800">{service?.address}</span>
            </p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-2">Service Description</th>
                <th className="py-3 px-2 text-center">Type</th>
                <th className="py-3 px-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-2 font-bold text-slate-900">{service?.name} (Base Fee)</td>
                <td className="py-3.5 px-2 text-center text-slate-500">Service Fee</td>
                <td className="py-3.5 px-2 text-right font-mono font-semibold">{formatCurrency(pricing?.base)}</td>
              </tr>

              {pricing?.distanceRate > 0 && (
                <tr>
                  <td className="py-3.5 px-2 text-slate-800">
                    Towing / Distance Charge ({pricing.estimatedDistanceKm || 5} km @ ₹{pricing.distanceRate}/km)
                  </td>
                  <td className="py-3.5 px-2 text-center text-slate-500">Distance</td>
                  <td className="py-3.5 px-2 text-right font-mono font-semibold">
                    {formatCurrency(pricing.distanceCharge || pricing.distanceRate * (pricing.estimatedDistanceKm || 5))}
                  </td>
                </tr>
              )}

              {pricing?.additionalCharges?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-2 text-slate-800">{item.description}</td>
                  <td className="py-3.5 px-2 text-center text-slate-500">Approved Parts/Supplies</td>
                  <td className="py-3.5 px-2 text-right font-mono font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}

              <tr>
                <td className="py-3.5 px-2 text-slate-600">Goods and Services Tax (GST 5%)</td>
                <td className="py-3.5 px-2 text-center text-slate-500">Taxes</td>
                <td className="py-3.5 px-2 text-right font-mono font-semibold">{formatCurrency(pricing?.taxes)}</td>
              </tr>
            </tbody>
            <tfoot className="border-t-2 border-slate-900 font-bold">
              <tr>
                <td colSpan="2" className="py-4 px-2 text-base text-slate-900">Total Invoice Amount</td>
                <td className="py-4 px-2 text-right text-lg text-emerald-700 font-black">
                  {formatCurrency(pricing?.total || pricing?.estimatedTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment & Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Payment Method: {pricing?.paymentMethod?.toUpperCase() || 'CASH / UPI'} (On-Site Settlement)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This invoice is generated electronically following certified on-site service completion.
            For invoice discrepancies or warranty inquiries, contact billing@roadside-aaa.com quoting {bookingReference}.
          </p>
        </div>
      </div>
    </div>
  );
};
