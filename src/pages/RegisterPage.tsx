import React, { useState } from 'react';
import { GraduationCap, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { api } from '../api/client';
import { User } from '../types';
import { SampleBadge } from '../components/SampleBadge';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('Demo@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name,
        email,
        mobile,
        password,
        role: 'student'
      });
      onRegisterSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#0B2447] text-amber-300 shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ST Scholar Registration
            </h2>
            <SampleBadge tooltip="New candidate registration" />
          </div>
          <p className="text-xs text-slate-500">
            Create your account to apply for National Fellowship (NFST) or Overseas Scholarship (NOS)
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Legal Name (as on ST Certificate) *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar Hansda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh.hansda@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="+91 98765 00000"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
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
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            {isLoading ? 'Creating Account...' : 'Register Profile & Proceed'}
          </button>

          <div className="pt-2 text-center text-slate-500 text-[11px]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Sign In Here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
