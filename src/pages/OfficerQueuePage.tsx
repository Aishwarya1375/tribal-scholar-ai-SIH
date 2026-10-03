import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { SampleBadge } from '../components/SampleBadge';

interface OfficerQueuePageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const OfficerQueuePage: React.FC<OfficerQueuePageProps> = ({ onNavigate }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schemeFilter, setSchemeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVerificationQueue();
      setQueue(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredQueue = queue.filter((item) => {
    if (schemeFilter !== 'all' && item.schemeCode !== schemeFilter) return false;
    if (priorityFilter !== 'all' && item.reviewPriority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.applicationId.toLowerCase().includes(q);
      const matchName = item.studentName.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: string, reasons: string[]) => {
    if (priority === 'priority') {
      return (
        <span
          title={reasons?.join('; ') || 'High priority scrutiny'}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300"
        >
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          Priority Scrutiny
        </span>
      );
    }
    if (priority === 'manual') {
      return (
        <span
          title={reasons?.join('; ') || 'Borderline criteria'}
          className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300"
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Manual Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" />
        Routine Intake
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Scrutiny & Verification Queue
            </h1>
            <SampleBadge tooltip="Workload-ordered scrutiny queue prioritizing files with active deficiencies or high readiness" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Human-in-the-loop verification desk. AI algorithms order workload; designated officers make final decisions.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by App ID or Scholar name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="all">All Schemes</option>
            <option value="NFST">NFST (National Fellowship)</option>
            <option value="NOS">NOS (Overseas)</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="priority">Priority First</option>
            <option value="manual">Manual Review</option>
            <option value="routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading scrutiny queue...</div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No applications in this queue filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Priority / Reason</th>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate & Community</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4">Docs & Readiness</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {getPriorityBadge(app.reviewPriority, app.priorityReasons)}
                        {app.priorityReasons && app.priorityReasons.length > 0 && (
                          <p className="text-[10px] text-slate-500 max-w-[180px] truncate">
                            {app.priorityReasons[0]}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {app.applicationId}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{app.studentName}</span>
                      <p className="text-[11px] text-slate-500">{app.studentEmail}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {app.schemeCode}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{app.uploadedDocumentsCount} docs</span>
                        <span className="text-[10px] text-slate-400">({app.readinessScore}% ready)</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-800">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('scrutiny', { applicationId: app.id })}
                        className="px-3 py-1.5 rounded-xl bg-[#0B2447] text-white hover:bg-[#163866] font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        Scrutinize <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
