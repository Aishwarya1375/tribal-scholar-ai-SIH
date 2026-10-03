import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { Deficiency } from '../types';
import { SampleBadge } from '../components/SampleBadge';

interface DeficienciesPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const DeficienciesPage: React.FC<DeficienciesPageProps> = ({ onNavigate }) => {
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDeficiencies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDeficiencies();
      setDeficiencies(data);
    } catch (err) {
      console.error('Failed to load deficiencies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeficiencies();
  }, []);

  const handleResolve = async (defId: string) => {
    try {
      const res = await api.resubmitDeficiency(
        defId,
        resolutionNote || 'Candidate uploaded certified 300+ DPI official replacement scan with clear seal.'
      );
      setNotification(`Deficiency resolved! Automated AI Scrutiny re-validated your document and updated application ${res.application.applicationId} to Under Scrutiny.`);
      setResolvingId(null);
      setResolutionNote('');
      await fetchDeficiencies();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit deficiency resolution.');
    }
  };

  const openList = deficiencies.filter((d) => d.status === 'open');
  const resolvedList = deficiencies.filter((d) => d.status === 'resolved' || d.status === 'resubmitted');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Deficiency Action Center
            </h1>
            <SampleBadge tooltip="Deficiency rules generated for prototype verification tests" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resolve issues flagged by automated AI document checks or Scrutiny Officers without bureaucratic delays.
          </p>
        </div>

        <button
          onClick={fetchDeficiencies}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Open Deficiencies */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Open Deficiencies Requiring Action ({openList.length})
        </h2>

        {isLoading ? (
          <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
        ) : openList.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No Active Deficiencies</p>
            <p className="text-slate-400">All submitted documents and rules are currently in compliance.</p>
          </div>
        ) : (
          openList.map((def) => (
            <div
              key={def.id}
              className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-rose-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      ACTION REQUIRED
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {def.id}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">{def.title}</h3>
                </div>

                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  <p className="font-semibold text-slate-700">Raised By: {def.raisedByName}</p>
                  <p>{new Date(def.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Three-part structure: What / Why / Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    1. What is wrong
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{def.whatIsWrong}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    2. Why it is required
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{def.why}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    3. Exact action to take
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{def.actionRequired}</p>
                </div>
              </div>

              {/* Resolution Form */}
              {resolvingId === def.id ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Applicant Clarification & Replacement Scan Confirmation:
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="e.g. Uploaded certified 300 DPI high-contrast scan of income certificate with legible circular Tehsildar seal."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolve(def.id)}
                      className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Submit & Run Automated AI Revalidation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Re-upload triggers instant automated verification and notifies the verification officer.
                  </span>
                  <button
                    onClick={() => {
                      setResolvingId(def.id);
                      setResolutionNote('Applicant uploaded corrected high-resolution document with legible circular authority seal.');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Resolve Deficiency Now
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolved Deficiencies History */}
      {resolvedList.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Resolved Deficiency History ({resolvedList.length})
          </h2>

          <div className="space-y-2">
            {resolvedList.map((def) => (
              <div
                key={def.id}
                className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{def.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Resolution note: {def.studentResponse || 'Document corrected by student.'}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Resolved & Validated
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
