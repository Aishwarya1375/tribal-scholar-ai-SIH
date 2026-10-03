import React, { useState, useEffect } from 'react';
import {
  Award,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { SampleBadge } from '../components/SampleBadge';

interface SelectionRankingPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const SelectionRankingPage: React.FC<SelectionRankingPageProps> = ({ onNavigate }) => {
  const [schemeCode, setSchemeCode] = useState<'NFST' | 'NOS'>('NFST');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overrideModalApp, setOverrideModalApp] = useState<any | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<'shortlist' | 'select' | 'reject' | 'waitlist'>('select');
  const [overrideReason, setOverrideReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSelectionRanking(schemeCode);
      setRankingData(data.rankings || []);
    } catch (err) {
      console.error('Failed to load selection ranking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [schemeCode]);

  const handleDecisionSubmit = async () => {
    if (!overrideModalApp) return;

    try {
      const res = await api.decideSelection(overrideModalApp.application.id, {
        decision: selectedDecision,
        reason: decisionNotes || 'Selection Committee review completed.',
        overrideReason: overrideReason.trim() ? overrideReason : undefined
      });

      setNotification(`Committee decision recorded: ${selectedDecision.toUpperCase()} for ${res.applicationId}.`);
      setOverrideModalApp(null);
      setOverrideReason('');
      setDecisionNotes('');
      await fetchRankings();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to record decision.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Selection Committee Decision Console
            </h1>
            <SampleBadge tooltip="Selection ranking model uses configured academic and income weights" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmically assisted composite scoring and merit ranking. Final selection requires Ministry Committee sign-off.
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSchemeCode('NFST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              schemeCode === 'NFST' ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NFST Fellowship
          </button>
          <button
            onClick={() => setSchemeCode('NOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              schemeCode === 'NOS' ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NOS Overseas
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Trust Notice */}
      <div className="bg-amber-50 rounded-2xl border border-amber-300 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Constitutional Statutory Principle:</span> Recommendation scores are generated based on configured scheme criteria (Academic Score: 60%, Income Support Factor: 40%). Final award authorization is made strictly by the Ministry Selection Committee. Any override of rank ordering requires a logged administrative justification.
        </div>
      </div>

      {/* Ranked Candidate List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Computing candidate merit index...</div>
        ) : rankingData.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No scrutinized candidates currently in committee queue</p>
            <p className="text-slate-500">Only verified applications appear in the Selection Committee workbench.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Merit Rank</th>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Candidate & Institute</th>
                  <th className="py-3 px-4">Score Breakdown</th>
                  <th className="py-3 px-4">Status & Recommendation</th>
                  <th className="py-3 px-4 text-right">Committee Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankingData.map((item) => (
                  <tr key={item.application.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-xs">
                          #{item.rank}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{item.calculatedScore} pts</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.application.applicationId}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{item.application.studentName}</span>
                      <p className="text-[11px] text-slate-500">
                        {item.application.responses.universityName || item.application.responses.foreignUniversity || 'Recognized Institute'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <span>Academic: <strong>{item.breakdown.academicPoints}</strong>/60</span> •{' '}
                        <span>Income: <strong>{item.breakdown.incomePoints}</strong>/40</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.application.status === 'selected'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.application.status === 'shortlisted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.application.status.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">{item.recommendation}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setOverrideModalApp(item);
                          setSelectedDecision('select');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0B2447] text-white hover:bg-[#163866] font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        Committee Sign-Off <Award className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {overrideModalApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Official Decision Workbench
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                {overrideModalApp.application.studentName} ({overrideModalApp.application.applicationId})
              </h3>
              <p className="text-xs text-slate-500">
                Calculated Score: {overrideModalApp.calculatedScore} points • Rank #{overrideModalApp.rank}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Select Committee Decision:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDecision('select')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDecision === 'select'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ✓ Award Fellowship (Select)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('shortlist')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDecision === 'shortlist'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Shortlist for Interview
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('waitlist')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDecision === 'waitlist'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Waitlist Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('reject')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    selectedDecision === 'reject'
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Reject Application
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Manual Override Reason (Mandatory if deviating from rank order):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Higher priority for rare tribal dialect linguistics research"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Committee Sanction Remarks:
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter minutes of committee authorization..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOverrideModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B2447] text-white hover:bg-[#163866] cursor-pointer shadow-sm"
              >
                Authorize Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
