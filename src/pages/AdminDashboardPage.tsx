import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileCheck,
  Users,
  AlertCircle,
  Clock,
  RefreshCw,
  Award,
  Layers,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { api } from '../api/client';
import { SampleBadge } from '../components/SampleBadge';

interface AdminDashboardPageProps {
  onNavigate: (view: string, data?: any) => void;
  onResetData: () => Promise<void>;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate, onResetData }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const total = dashboardData?.totalApplications || 1;
  const status = dashboardData?.statusBreakdown || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Ministry Scrutiny Analytics & Dashboard
            </h1>
            <SampleBadge tooltip="Real-time KPI metrics aggregated directly from backend database state" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pipeline metrics, scheme distribution, and verification outcomes for MoTA leadership.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      ) : (
        <>
          {/* KPI Statistic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {dashboardData?.totalApplications}
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Live Intake
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Scheduled Tribe research & study files</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Scheme Distribution
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-slate-800">
                  NFST: {dashboardData?.nfstCount} | NOS: {dashboardData?.nosCount}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  100% Configured
                </span>
              </div>
              <p className="text-[11px] text-slate-400">National Fellowship vs Overseas</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Verified by Scrutiny
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-700">
                  {status.verified || 0}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Human Signed
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Passed to Selection Committee</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Deficiencies
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-rose-700">
                  {dashboardData?.openDeficienciesCount || 0}
                </span>
                <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  Action Loop
                </span>
              </div>
              <p className="text-[11px] text-slate-400">In student re-submission loop</p>
            </div>
          </div>

          {/* Visual Distribution Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pipeline Stage Funnel */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Application Lifecycle Pipeline
                </h3>
                <span className="text-[11px] text-slate-400">Aggregation over database</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Draft Stage</span>
                    <span>{status.draft || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-400 h-full rounded-full"
                      style={{ width: `${((status.draft || 0) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Under Scrutiny (AI Document Extracted)</span>
                    <span>{status.under_scrutiny || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${((status.under_scrutiny || 0) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Deficiency Raised / Resolution Loop</span>
                    <span>{status.deficiency_raised || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${((status.deficiency_raised || 0) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Officer Verified (Sign-Off Completed)</span>
                    <span>{status.verified || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${((status.verified || 0) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-700 font-semibold">
                    <span>Selected / Fellowship Awarded</span>
                    <span>{status.selected || 0}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${((status.selected || 0) / total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Priority Distribution */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-600" />
                  Workload Queue Split
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-900">Priority Queue</span>
                    <p className="text-[10px] text-rose-700">Flagged issues or resubmissions</p>
                  </div>
                  <span className="text-base font-extrabold text-rose-900">
                    {dashboardData?.priorityBreakdown?.priority || 0}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900">Manual Review Queue</span>
                    <p className="text-[10px] text-amber-700">Borderline eligibility rules</p>
                  </div>
                  <span className="text-base font-extrabold text-amber-900">
                    {dashboardData?.priorityBreakdown?.manual || 0}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Routine Intake Queue</span>
                    <p className="text-[10px] text-slate-500">Standard document verification</p>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">
                    {dashboardData?.priorityBreakdown?.routine || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
