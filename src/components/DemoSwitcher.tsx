import React, { useState } from 'react';
import { UserCheck, Shield, GraduationCap, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface DemoSwitcherProps {
  currentUser: User | null;
  onSwitchUser: (email: string) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  currentUser,
  onSwitchUser,
  onResetData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const demoAccounts = [
    {
      email: 'student@demo.in',
      name: 'Birsa Soren',
      role: 'Student',
      desc: 'Applicant (NFST Eligible Candidate)',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      email: 'student2@demo.in',
      name: 'Anjali Marandi',
      role: 'Student (Test 2)',
      desc: 'Applicant (NOS Deficiency & Duplicate Test)',
      icon: GraduationCap,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      email: 'verifier@demo.in',
      name: 'Sanjay Oraon',
      role: 'Verifier',
      desc: 'Desk Document Intake & Scrutiny Assistant',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      email: 'officer@demo.in',
      name: 'Dr. Sunita Santhal',
      role: 'Scrutiny Officer',
      desc: 'Approving Officer & Selection Committee',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      email: 'admin@demo.in',
      name: 'Rajesh Gond',
      role: 'Administrator',
      desc: 'System Config, Scheme Policy & Audit Logs',
      icon: Shield,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  const handleSelect = async (email: string) => {
    setIsOpen(false);
    await onSwitchUser(email);
  };

  const handleReset = async () => {
    if (confirm('Reset entire system to clean demonstration seed data?')) {
      setIsResetting(true);
      await onResetData();
      setIsResetting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-2xs"
        title="Quickly switch between Demo Roles (Student, Verifier, Officer, Admin)"
      >
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="hidden sm:inline">Demo Persona:</span>
        <span className="font-bold underline decoration-amber-400">
          {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Select Demo User'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 p-3 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">1-Click Demo Accounts</p>
                <p className="text-[11px] text-slate-400">Password for all: Demo@12345</p>
              </div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-all"
                title="Reset all database records to fresh prototype seed"
              >
                <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                Reset Data
              </button>
            </div>

            <div className="mt-2 space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {demoAccounts.map((acc) => {
                const isCurrent = currentUser?.email.toLowerCase() === acc.email.toLowerCase();
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSelect(acc.email)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                        : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isCurrent ? 'bg-slate-800 text-amber-400' : acc.color
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs truncate">{acc.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {acc.role}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                        {acc.desc}
                      </p>
                      <p className={`text-[10px] font-mono mt-0.5 ${isCurrent ? 'text-amber-300/80' : 'text-slate-400'}`}>
                        {acc.email}
                      </p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0 self-center" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
