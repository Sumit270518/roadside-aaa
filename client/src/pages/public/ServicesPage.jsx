import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Wrench, Truck, Zap, Disc, Fuel, CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/geo';

export const ServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch services:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const serviceDetails = [
    {
      slug: 'breakdown-repair',
      icon: Wrench,
      name: 'On-Site Breakdown Repair',
      timing: '20-30 Mins Arrival',
      pricing: 'From ₹599 Base',
      features: [
        'Multi-brand OBD-II engine and ECU fault scanning',
        'Alternator, belt, fuse, and starter diagnosis',
        'Clutch wire, accelerator cable, and hose replacement',
        'Coolant leak and radiator quick sealing',
      ],
      equipment: 'Heavy-duty field toolkits, digital multimeters, diagnostic scanners.',
    },
    {
      slug: 'towing-service',
      icon: Truck,
      name: 'Hydraulic Flatbed Towing',
      timing: '25-35 Mins Arrival',
      pricing: 'From ₹1,299 + ₹40/km',
      features: [
        'Zero-scrape hydraulic tilt flatbed transport',
        'Specialized wheel-lift towing for tight basement parking',
        'Secure wheel-strapping system ensuring zero suspension strain',
        'Towing to authorized dealer or your preferred garage',
      ],
      equipment: 'Commercial 5-Ton hydraulic flatbed recovery trucks and winches.',
    },
    {
      slug: 'battery-jump-start',
      icon: Zap,
      name: 'Battery Jump-Start & Boost',
      timing: '15-20 Mins Arrival',
      pricing: 'From ₹399 Base',
      features: [
        'Heavy-duty industrial 12V/24V booster jump pack',
        'Battery voltage and alternator load testing',
        'Corrosion cleaning and terminal tightening',
        'New battery replacement assistance on request',
      ],
      equipment: 'Microprocessor-controlled surge-protected jump starters.',
    },
    {
      slug: 'flat-tire-repair',
      icon: Disc,
      name: 'Flat Tire & Puncture Service',
      timing: '15-25 Mins Arrival',
      pricing: 'From ₹349 Base',
      features: [
        'Tubeless tire puncture sealing with vulcanized strips',
        'Stepney (spare wheel) replacement with hydraulic jack',
        'Tire pressure check and 12V inflator pump top-up',
        'Valve and rim leak diagnosis',
      ],
      equipment: 'High-pressure electric compressors, torque wrenches, puncture kits.',
    },
    {
      slug: 'emergency-fuel-delivery',
      icon: Fuel,
      name: 'Emergency Fuel Delivery',
      timing: '20-30 Mins Arrival',
      pricing: 'From ₹449 Base + Fuel Cost',
      features: [
        'Up to 5 Litres of sealed pure Petrol or Diesel delivered',
        'Air bleeding and priming for diesel engines',
        'Safe anti-static fuel transfer containers',
        'Assistance starting vehicle after running dry',
      ],
      equipment: 'Government-certified explosive-safe containers and funnels.',
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Our Capabilities
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Professional Roadside Assistance Services
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Standardized pricing guidance, vetted technicians, and transparent itemized billing.
          Select any service when requesting emergency support.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-8">
        {serviceDetails.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition grid grid-cols-1 lg:grid-cols-3"
            >
              <div className="p-8 lg:border-r border-slate-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{service.name}</h2>
                    <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.timing}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Standard Pricing Guidance</p>
                  <p className="text-xl font-black text-brand-700">{service.pricing}</p>
                </div>
              </div>

              <div className="p-8 lg:col-span-2 flex flex-col justify-between space-y-6 bg-slate-50/50">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Included Scope of Work</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Equipment: </span>
                    {service.equipment}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <Link
                    to={`/dashboard/request?service=${service.slug}`}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-sm shadow transition"
                  >
                    <span>Request {service.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
