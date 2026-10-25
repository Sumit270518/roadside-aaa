import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Wrench, Truck, User, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);

      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedUser.role === 'mechanic' || loggedUser.role === 'towing_partner') {
        navigate('/partner', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Roadside AAA
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Access emergency assistance dispatch, partner dashboard, or administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          {/* 1-Click Demo Accounts Pill Bar */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
              1-Click Demo Testing Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('john.doe@example.com', 'Password@123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition text-left flex items-center space-x-2"
              >
                <User className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Vehicle Owner</p>
                  <p className="text-[10px] text-slate-500">John Doe</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('vikram.mechanic@example.com', 'Password@123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition text-left flex items-center space-x-2"
              >
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Mechanic Partner</p>
                  <p className="text-[10px] text-slate-500">Vikram Sharma</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('amit.towing@example.com', 'Password@123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition text-left flex items-center space-x-2"
              >
                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Towing Fleet</p>
                  <p className="text-[10px] text-slate-500">Amit Patel</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@roadside-aaa.com', 'Admin@Roadside123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition text-left flex items-center space-x-2"
              >
                <Shield className="w-4 h-4 text-emergency-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Administrator</p>
                  <p className="text-[10px] text-slate-500">Full System</p>
                </div>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="pt-2 text-center text-xs text-slate-600 space-y-1">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Register as Vehicle Owner
              </Link>
            </p>
            <p>
              Are you an auto workshop or tow truck owner?{' '}
              <Link to="/partner-register" className="font-bold text-amber-600 hover:text-amber-700">
                Apply as Partner
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
