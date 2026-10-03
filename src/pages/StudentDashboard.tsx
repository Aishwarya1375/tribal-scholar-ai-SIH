import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  PlusCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { Application, StudentProfile } from '../types';
import { ReadinessMeter } from '../components/ReadinessMeter';
import { SampleBadge } from '../components/SampleBadge';

interface StudentDashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profData, appsData] = await Promise.all([
        api.getProfile(),
        api.getStudentApplications()
      ]);
      setProfile(profData);
      setApplications(appsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_scrutiny':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deficiency_raised':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'selected':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B2447] via-[#11386B] to-[#0A2242] rounded-2xl p-6 text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Scheduled Tribe Candidate Portal
              </span>
              <SampleBadge tooltip="Applicant record loaded from prototype seed" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
              Welcome, {profile?.fullName || 'Scholar'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Community: <span className="font-semibold text-white">{profile?.stCommunity || 'Scheduled Tribe'}</span> • Domicile: <span className="font-semibold text-white">{profile?.stateOfDomicile || 'India'}</span> • Institution: <span className="font-semibold text-white">{profile?.institutionName || 'Recognized University'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('apply', { schemeCode: 'NFST' })}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Apply for NFST (India)
            </button>
            <button
              onClick={() => onNavigate('apply', { schemeCode: 'NOS' })}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Apply for NOS (Overseas)
            </button>
          </div>
        </div>
      </div>

      {/* Active Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            My Active Applications ({applications.length})
          </h2>
          <button
            onClick={() => onNavigate('deficiencies')}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Check Active Deficiencies
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Applications</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't initiated an application for NFST or NOS yet. Click below to begin your scholarship submission.
            </p>
            <button
              onClick={() => onNavigate('apply', { schemeCode: 'NFST' })}
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all cursor-pointer"
            >
              Start NFST Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {app.applicationId}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                        {app.schemeCode === 'NFST'
                          ? 'National Fellowship for ST Students (NFST)'
                          : 'National Overseas Scholarship (NOS)'}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Readiness Meter */}
                  <div className="mt-4">
                    <ReadinessMeter score={app.readinessScore || 30} compact />
                  </div>

                  {/* Stage & Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Workflow Stage:</span>
                      <span className="font-semibold text-slate-800">{app.workflowStage}</span>
                    </div>

                    {app.responses?.researchDiscipline && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Discipline:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {app.responses.researchDiscipline}
                        </span>
                      </div>
                    )}

                    {app.responses?.foreignUniversity && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Overseas Univ:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {app.responses.foreignUniversity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Alert if deficiency raised */}
                  {app.status === 'deficiency_raised' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Deficiency Notice:</span> An issue was flagged on your documentation. Please submit corrected files to resume scrutiny.
                      </div>
                    </div>
                  )}

                  {/* Note if verified */}
                  {app.status === 'verified' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Document Scrutiny Verified. Forwarded to Selection Committee.</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('timeline', { applicationId: app.id })}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Timeline & History
                  </button>

                  <button
                    onClick={() => onNavigate('apply', { applicationId: app.id, schemeCode: app.schemeCode })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    View / Edit Application <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Grid for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <button
          onClick={() => onNavigate('deficiencies')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100">
              <AlertCircle className="w-4 h-4" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 mt-2.5">Deficiency Action Center</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Resolve unreadable scans, missing documents, or remarks raised by the officer.
          </p>
        </button>

        <button
          onClick={() => onNavigate('grievance')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100">
              <FileText className="w-4 h-4" />
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="font-bold text-xs text-slate-900 mt-2.5">Grievance & Queries</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Direct communication channel with Ministry verification desks.
          </p>
        </button>

        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            AI Document Verification Notice
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            All uploaded documents are analyzed for completeness and field consistency. Extracted information is assistive and subject to human officer verification.
          </p>
        </div>
      </div>
    </div>
  );
};
