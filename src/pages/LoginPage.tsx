import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, Check, Users } from 'lucide-react';
import { api } from '../api/client';
import { User } from '../types';
import { SampleBadge } from '../components/SampleBadge';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('student@demo.in');
  const [password, setPassword] = useState('Demo@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@12345');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#0B2447] text-amber-300 shadow-md">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            MoTA Official Portal Sign In
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to your Scheduled Tribe Student, Verifier, or Officer Account
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-4 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              Demo Credentials (Password: Demo@12345)
            </span>
            <SampleBadge tooltip="Click any button below to autofill demonstration account" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => fillDemo('student@demo.in')}
              className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px] font-semibold hover:bg-amber-100/60 transition-all cursor-pointer text-left"
            >
              Birsa (Student)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student2@demo.in')}
              className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px] font-semibold hover:bg-amber-100/60 transition-all cursor-pointer text-left"
            >
              Anjali (Test 2)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('verifier@demo.in')}
              className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px] font-semibold hover:bg-amber-100/60 transition-all cursor-pointer text-left"
            >
              Sanjay (Verifier)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('officer@demo.in')}
              className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px] font-semibold hover:bg-amber-100/60 transition-all cursor-pointer text-left"
            >
              Dr. Sunita (Officer)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@demo.in')}
              className="px-2 py-1.5 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px] font-semibold hover:bg-amber-100/60 transition-all cursor-pointer text-left"
            >
              Rajesh (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#0B2447] text-white rounded-xl font-bold text-xs hover:bg-[#163866] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {isLoading ? 'Signing In...' : 'Sign In to Portal'}
          </button>

          <div className="pt-2 text-center text-slate-500 text-[11px]">
            New ST Applicant?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Register Candidate Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
