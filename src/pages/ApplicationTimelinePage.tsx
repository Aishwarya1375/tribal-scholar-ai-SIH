import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  UserCheck,
  Award,
  ArrowLeft,
  Shield,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { SampleBadge } from '../components/SampleBadge';

interface ApplicationTimelinePageProps {
  applicationId?: string;
  onNavigate: (view: string, data?: any) => void;
}

export const ApplicationTimelinePage: React.FC<ApplicationTimelinePageProps> = ({
  applicationId,
  onNavigate
}) => {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = async () => {
    if (!applicationId) return;
    try {
      const data = await api.getApplicationTimeline(applicationId);
      setTimelineData(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [applicationId]);

  const stages = [
    { key: 'draft', label: '1. Registration & Draft Initialized', icon: Clock },
    { key: 'submitted', label: '2. Application Submitted & Intake', icon: FileCheck },
    { key: 'under_scrutiny', label: '3. AI Document Intelligence Scrutiny', icon: Shield },
    { key: 'deficiency_raised', label: '4. Deficiency Resolution (If Required)', icon: AlertCircle },
    { key: 'verified', label: '5. Scrutiny Officer Verification Sign-off', icon: UserCheck },
    { key: 'shortlisted', label: '6. Selection Committee Shortlist', icon: Award },
    { key: 'selected', label: '7. Award Sanction & Post-Selection Onboarding', icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Application Tracking Timeline
            </h1>
            <SampleBadge tooltip="Live timeline driven by real application status history and append-only audit trail" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates with complete administrative audit traceability. Auto-refreshes every 10s.
          </p>
        </div>

        <button
          onClick={fetchTimeline}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
          title="Refresh Timeline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
      ) : (
        <div className="space-y-8">
          {/* Current Status Header Card */}
          <div className="bg-[#0B2447] text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                Application Reference: {timelineData?.applicationId}
              </span>
              <h2 className="text-lg font-bold mt-0.5">
                Current Workflow Stage: {timelineData?.workflowStage || 'Under Scrutiny'}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 self-start sm:self-auto">
              {timelineData?.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Status Progression History
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineData?.history?.map((hist: any, idx: number) => {
                const isLast = idx === timelineData.history.length - 1;

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-xs ${
                        isLast ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-emerald-600'
                      }`}
                    >
                      ✓
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                          {hist.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(hist.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{hist.remarks}</p>
                      <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Action by: <strong className="text-slate-700">{hist.changedBy}</strong></span>
                        <span>•</span>
                        <span className="capitalize">Role: {hist.role}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Events Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-600" />
                Immutable Audit Trail (Append-Only)
              </h3>
              <span className="text-[11px] text-slate-400">Zero updates/deletions</span>
            </div>

            <div className="space-y-2">
              {timelineData?.auditEvents?.map((event: any) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {event.action}
                      </span>
                      <span className="font-semibold text-slate-800">{event.userName} ({event.role})</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{event.reason}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
