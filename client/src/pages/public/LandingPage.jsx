import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Wrench,
  Truck,
  Zap,
  Disc,
  Fuel,
  Clock,
  MapPin,
  CheckCircle,
  PhoneCall,
  Star,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const services = [
    {
      title: 'Breakdown Repair',
      desc: 'On-site engine, electrical, alternator, or starter diagnostics and instant roadside repairs.',
      price: '₹599',
      icon: Wrench,
      badge: 'Popular',
    },
    {
      title: 'Hydraulic Towing',
      desc: 'Safe flatbed recovery trucks for sedans, SUVs, and luxury cars to your preferred garage.',
      price: '₹1,299',
      icon: Truck,
      badge: '24/7 Heavy Duty',
    },
    {
      title: 'Battery Jump-Start',
      desc: 'Quick battery boost, terminal diagnosis, and alternator check right where your car is parked.',
      price: '₹399',
      icon: Zap,
      badge: 'Fast 15-Min',
    },
    {
      title: 'Flat Tire Repair',
      desc: 'On-spot puncture sealing, stepney replacement, or air compressor refill.',
      price: '₹349',
      icon: Disc,
      badge: 'All Vehicles',
    },
    {
      title: 'Emergency Fuel Delivery',
      desc: 'Up to 5 Litres of quality Petrol or Diesel brought directly to your stranded vehicle.',
      price: '₹449',
      icon: Fuel,
      badge: 'Direct Drop',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Share Location & Vehicle',
      desc: 'Pick your registered vehicle or enter make/model and confirm your breakdown location with one click.',
    },
    {
      num: '02',
      title: 'Instant Nearby Dispatch',
      desc: 'Our platform matches you with the closest verified mechanic or flatbed towing truck within 5-15 km.',
    },
    {
      num: '03',
      title: 'Live GPS Tracking',
      desc: 'Watch the mechanic travel to you in real-time on an interactive map. Chat or call directly for updates.',
    },
    {
      num: '04',
      title: 'Fixed Transparent Billing',
      desc: 'Receive an itemized digital invoice upon job completion. Pay via Cash or UPI with complete peace of mind.',
    },
  ];

  const faqs = [
    {
      q: 'How fast will a mechanic or towing partner arrive?',
      a: 'Average response time across metro areas is 18 to 28 minutes. Once a partner accepts, you can track their exact GPS position live on our map.',
    },
    {
      q: 'How is roadside assistance pricing calculated?',
      a: 'We use transparent, standardized base pricing for each service type plus clear distance rates for towing. You will always see the estimated cost before confirming your request.',
    },
    {
      q: 'Are the roadside mechanics verified?',
      a: 'Yes. Every mechanic and towing partner on Roadside AAA undergoes strict administrative document checks including business licenses, ID proofs, and certifications.',
    },
    {
      q: 'Do I need a paid annual membership to request help?',
      a: 'No! Roadside AAA operates on-demand with zero mandatory subscriptions. You only pay for the service you use when you need it.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Urgent Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emergency-600/20 border border-emergency-500/40 text-emergency-300 text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emergency-500 animate-pulse"></span>
            <span>24/7 On-Demand Roadside Assistance & Breakdown Dispatch</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Stranded on the road? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              Help arrives in minutes.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Connect directly with verified mechanics and hydraulic towing trucks nearby.
            Live GPS tracking, standardized pricing, and zero annual subscription fees.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? '/dashboard/request' : '/login?redirect=/dashboard/request'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-base sm:text-lg shadow-xl shadow-emergency-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <AlertTriangle className="w-5 h-5 text-white" />
              <span>Get Roadside Assistance Now</span>
            </Link>

            <Link
              to="/partner-register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 transition"
            >
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Become a Service Partner</span>
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">20-25m</p>
              <p className="text-xs sm:text-sm text-slate-400">Avg. Arrival Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs sm:text-sm text-slate-400">Verified Mechanics</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4.9 / 5.0</p>
              <p className="text-xs sm:text-sm text-slate-400">Customer Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">24/7</p>
              <p className="text-xs sm:text-sm text-slate-400">Live GPS Dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Complete Emergency Breakdown Services
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            From dead batteries and flat tires to engine diagnostics and towing, our mobile technicians handle it on the spot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand-500 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white transition flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{s.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Starting from</span>
                  <span className="text-lg font-black text-brand-700">{s.price}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link
            to="/services"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Explore detailed service rates & equipment</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Roadside AAA Works
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
              Engineered for high stress emergency situations. Fast, clear, and reassuring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <span className="text-3xl font-black text-brand-600/30">{st.num}</span>
                <h3 className="text-base font-bold text-slate-900">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Verification Pledge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 rounded-3xl text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Strict Partner Vetting Standards</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Safety & Vehicle Are in Certified Hands
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                We know how vulnerable you feel standing beside a broken-down car on a dark highway.
                That's why our administrators personally inspect every mechanic application, trade certificate, and police background check before approving dispatch permissions.
              </p>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Verified identity with photo identification on arrival</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Calibrated diagnostic scanners & hydraulic recovery trucks</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Transparent itemized invoicing with no unapproved charges</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 space-y-6">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-white text-base">AAA Gold Seal Guarantee</h4>
                    <p className="text-xs text-slate-300">Certified roadside security</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500 text-white text-xs font-bold">Verified</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic">
                "Our promise: If a verified partner cannot fix your car safely roadside, our dispatch team coordinates flatbed recovery to the authorized brand workshop immediately."
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wider"
                >
                  <span>Learn more about our safety protocol →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Verified Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Thousands of Motorists
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "My Creta had a sudden alternator failure at 11:30 PM on the flyover. Vikram Sharma accepted the request in 45 seconds and arrived with a booster pack in 18 minutes. Absolutely superb!"
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">John Doe</span>
              <span className="text-slate-400">Verified Service • Battery Jump</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "Apex Towing’s flatbed arrived within 25 minutes after my suspension hit a crater. The driver treated my EV with great care and the GPS map was pinpoint accurate."
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Sarah Jenkins</span>
              <span className="text-slate-400">Verified Service • Towing</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "No scammy surge charges like roadside repair sharks usually demand. The app showed ₹349 base fee upfront and that's exactly what I paid via cash on completion."
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Rahul M.</span>
              <span className="text-slate-400">Verified Service • Flat Tire</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">Everything you need to know about requesting roadside support</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 hover:text-brand-600 transition"
              >
                <span>{f.q}</span>
                <span className="text-slate-400 text-lg">{activeFaq === i ? '−' : '+'}</span>
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Emergency Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emergency-600 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emergency-600/20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">Need Urgent Assistance Right Now?</h3>
            <p className="text-sm text-emergency-100 max-w-xl">
              Don't wait in the dark. Dispatch our nearest certified roadside partner immediately.
            </p>
          </div>
          <Link
            to={user ? '/dashboard/request' : '/login?redirect=/dashboard/request'}
            className="px-6 py-3.5 rounded-xl bg-white text-emergency-700 font-extrabold text-sm sm:text-base hover:bg-emergency-50 shadow transition whitespace-nowrap"
          >
            Request Assistance Instantly →
          </Link>
        </div>
      </section>
    </div>
  );
};
