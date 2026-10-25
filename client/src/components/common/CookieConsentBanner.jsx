import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X, ChevronRight, Check } from 'lucide-react';

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('roadside_aaa_cookie_consent');
    if (!consent) {
      // Small delay so page loads cleanly before banner slides up
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      status: 'all_accepted',
      timestamp: new Date().toISOString(),
      categories: { necessary: true, functional: true, analytics: true },
    };
    localStorage.setItem('roadside_aaa_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const consentData = {
      status: 'necessary_only',
      timestamp: new Date().toISOString(),
      categories: { necessary: true, functional: false, analytics: false },
    };
    localStorage.setItem('roadside_aaa_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consentData = {
      status: 'customized',
      timestamp: new Date().toISOString(),
      categories: preferences,
    };
    localStorage.setItem('roadside_aaa_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 md:p-6 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/60 p-4 sm:p-6 pointer-events-auto transition-all transform duration-300 animate-slide-up">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Cookie & Location Preferences
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Privacy First
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Roadside AAA uses essential cookies to secure your session, remember emergency vehicle preferences,
                  and ensure prompt mechanic dispatch. We do not sell your personal or location data.
                  Learn more in our{' '}
                  <Link to="/privacy" className="text-amber-400 hover:text-amber-300 underline font-medium">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition active:scale-95"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-400/20 transition active:scale-95 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Customize Privacy Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Essential */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Essential Cookies</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Always Active</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Required for authentication, security tokens, and emergency dispatch state.
                </p>
              </div>

              {/* Functional */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Functional & Maps</span>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Remembers your last selected vehicle, active map coordinates, and UI preferences.
                </p>
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Performance</span>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500 bg-slate-900 border-slate-700 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Helps us monitor server latency, WebSocket reliability, and arrival times.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
