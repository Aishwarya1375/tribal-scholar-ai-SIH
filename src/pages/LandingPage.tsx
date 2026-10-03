import React from 'react';
import {
  GraduationCap,
  Plane,
  ShieldCheck,
  Cpu,
  ArrowRight,
  FileCheck2,
  AlertCircle,
  Users,
  Eye,
  CheckCircle,
  FileText
} from 'lucide-react';
import { SampleBadge } from '../components/SampleBadge';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSwitchUser: (email: string) => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSwitchUser }) => {
  const demoAccounts = [
    {
      email: 'student@demo.in',
      name: 'Birsa Soren',
      role: 'Student (NFST)',
      desc: 'Applicant ready for scrutiny'
    },
    {
      email: 'student2@demo.in',
      name: 'Anjali Marandi',
      role: 'Student (NOS)',
      desc: 'Has open deficiency & duplicate test'
    },
    {
      email: 'verifier@demo.in',
      name: 'Sanjay Oraon',
      role: 'Scrutiny Verifier',
      desc: 'Desk document verification'
    },
    {
      email: 'officer@demo.in',
      name: 'Dr. Sunita Santhal',
      role: 'Scrutiny Officer',
      desc: 'Full approval & review authority'
    },
    {
      email: 'admin@demo.in',
      name: 'Rajesh Gond',
      role: 'System Administrator',
      desc: 'Rule policy & audit analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B2447] via-[#0D2E5C] to-[#081B35] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* National Identity Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-amber-400/40 text-xs text-amber-300 font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Smart India Hackathon • Ministry of Tribal Affairs (MoTA) Problem Statement
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              AI-Assisted Scrutiny, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-400">
                Human-Driven Decisions.
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Empowering Scheduled Tribe (ST) students with transparent, automated document extraction, deterministic eligibility validation, and rapid deficiency resolution for National Fellowship and Overseas Scholarship schemes.
            </p>

            {/* Quick Demo Switcher Cards */}
            <div className="mt-10 w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-xl text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-white/15 gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-300" />
                    Instant Demo Personas (1-Click Access)
                  </h3>
                  <p className="text-xs text-slate-300">
                    No typing needed — select any persona to test the full 5–7 minute evaluation journey.
                  </p>
                </div>
                <SampleBadge tooltip="Demo environment with pre-seeded test applicants and documents" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => onSwitchUser(acc.email)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {acc.role}
                      </span>
                      <p className="font-bold text-xs text-white mt-1.5 truncate">{acc.name}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{acc.desc}</p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-300 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Enter Portal <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle / Trust & Ethics Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 to-[#0B2447] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Constitutional & Administrative Trust Architecture
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                AI Never Makes the Final Decision.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rules (statutory and configurable by Ministry officials) stay strictly separate from AI extraction signals. Document OCR performs structural information extraction with confidence scoring, and is explicitly labeled as assistive analysis — never proof of authenticity.
              </p>
            </div>

            {/* Visual Formula Pipeline */}
            <div className="w-full md:w-auto bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-center space-y-2">
              <div className="text-xs font-mono text-amber-300">
                [Configured Rules] + [AI OCR Signals]
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="text-xs font-semibold text-slate-200">
                Recommendation + Explanation + Confidence
              </div>
              <div className="text-slate-400 text-xs">↓</div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-950/80 py-1.5 px-3 rounded-lg border border-emerald-500/40">
                HUMAN OFFICER SCRUTINY → FINAL DECISION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Two MoTA Schemes */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Configured MoTA Schemes
            </h2>
            <SampleBadge />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
            The system covers two specific flagship programmes for Scheduled Tribe students as specified by the Ministry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scheme 1: NFST */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-1.5 w-full bg-blue-600" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  SCHEME CODE: NFST
                </span>
                <span className="text-xs text-slate-500 font-medium">In-India Research</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                National Fellowship for Higher Education of ST Students
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Supports eligible Scheduled Tribe candidates pursuing regular and full-time M.Phil and Ph.D. degrees in Science, Humanities, Social Science, and Engineering in recognized Indian Universities.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mandatory ST Community Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Qualifying Master’s Degree (Sample rule: ≥ 55%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Confirmed admission in UGC/Govt recognized Institute</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Version 1.0 (Active)</span>
              <button
                onClick={() => onSwitchUser('student@demo.in')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Apply as Birsa Soren <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scheme 2: NOS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-1.5 w-full bg-emerald-600" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  SCHEME CODE: NOS
                </span>
                <span className="text-xs text-slate-500 font-medium">International Study</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                National Overseas Scholarship for ST Candidates
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Facilitates low-income Scheduled Tribe students in obtaining higher education abroad (Master’s and Ph.D. level courses) in top-ranked accredited international universities.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unconditional Offer Letter from Foreign University</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ST Category & Valid Indian Passport</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Family income ceiling (Sample baseline: ≤ ₹6,00,000)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Version 1.0 (Active)</span>
              <button
                onClick={() => onSwitchUser('student2@demo.in')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Inspect Anjali’s File <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Process Pipeline */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-slate-900 mb-8 font-['Plus_Jakarta_Sans',sans-serif]">
          End-to-End Scrutiny Lifecycle
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center mx-auto mb-2 text-sm">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900">Dynamic Registration</h4>
            <p className="text-[11px] text-slate-500 mt-1">Form fields adapt dynamically to scheme rule versions.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center mx-auto mb-2 text-sm">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900">AI Document Intake</h4>
            <p className="text-[11px] text-slate-500 mt-1">Extracts fields with confidence and cross-document match.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 font-extrabold flex items-center justify-center mx-auto mb-2 text-sm">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900">Deficiency Auto-Loop</h4>
            <p className="text-[11px] text-slate-500 mt-1">Clear what / why / action guide with instant revalidation.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center mx-auto mb-2 text-sm">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-900">Officer Scrutiny</h4>
            <p className="text-[11px] text-slate-500 mt-1">Split-screen document view, priority queue, human decision.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center mx-auto mb-2 text-sm">
              5
            </div>
            <h4 className="font-bold text-xs text-slate-900">Selection & Award</h4>
            <p className="text-[11px] text-slate-500 mt-1">Weighted merit ranking with audit-logged manual override.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ministry of Tribal Affairs (MoTA) Prototype • Smart India Hackathon</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Localhost Zero-Dependency Architecture</span>
            <span>•</span>
            <span>Grounded Groq Llama-3.3 Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
