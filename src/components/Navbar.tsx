import React from 'react';
import { TricolorBar } from './TricolorBar';
import { DemoSwitcher } from './DemoSwitcher';
import { NotificationPopover } from './NotificationPopover';
import { User } from '../types';
import {
  Shield,
  GraduationCap,
  FileCheck,
  BarChart3,
  Award,
  HelpCircle,
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onSwitchUser: (email: string) => Promise<void>;
  onResetData: () => Promise<void>;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onSwitchUser,
  onResetData,
  onLogout
}) => {
  const isStudent = currentUser?.role === 'student';
  const isStaff = currentUser?.role === 'verifier' || currentUser?.role === 'officer' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-[#0B2447] text-white shadow-md border-b border-slate-800">
      <TricolorBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Government Identity */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Ashok Emblem Representation */}
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-amber-400/40 flex items-center justify-center p-1.5 shadow-inner group-hover:border-amber-400 transition-all">
              <span className="text-xl">🏛️</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  MoTA SCHOLARSHIP PORTAL
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> SIH Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Ministry of Tribal Affairs, Government of India • NFST & NOS Schemes
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'landing' ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>

            {isStudent && (
              <>
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'student-dashboard' || currentView === 'apply'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Portal
                </button>
                <button
                  onClick={() => onNavigate('deficiencies')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentView === 'deficiencies' ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Deficiency Action Center
                </button>
              </>
            )}

            {isStaff && (
              <>
                <button
                  onClick={() => onNavigate('officer-queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'officer-queue' || currentView === 'scrutiny'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Scrutiny Queue
                </button>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'admin-dashboard'
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics & KPIs
                </button>
                <button
                  onClick={() => onNavigate('selection-ranking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'selection-ranking'
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Selection Committee
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('scheme-config')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentView === 'scheme-config'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Scheme Policy Rules
              </button>
            )}

            <button
              onClick={() => onNavigate('grievance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'grievance'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Helpdesk
            </button>
          </nav>

          {/* Right Action Tools: Demo Switcher + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DemoSwitcher
              currentUser={currentUser}
              onSwitchUser={onSwitchUser}
              onResetData={onResetData}
            />

            {currentUser && <NotificationPopover />}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-amber-300 capitalize font-medium">{currentUser.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
