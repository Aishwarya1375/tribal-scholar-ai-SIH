import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  Eye,
  Check,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { api } from '../api/client';
import { Application, ApplicationDocument, Deficiency, AuditLog, Scheme } from '../types';
import { SampleBadge } from '../components/SampleBadge';

interface OfficerScrutinyPageProps {
  applicationId: string;
  onNavigate: (view: string, data?: any) => void;
}

export const OfficerScrutinyPage: React.FC<OfficerScrutinyPageProps> = ({
  applicationId,
  onNavigate
}) => {
  const [dataPackage, setDataPackage] = useState<{
    application: Application;
    documents: ApplicationDocument[];
    deficiencies: Deficiency[];
    auditLogs: AuditLog[];
    scheme: Scheme;
  } | null>(null);

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'rules' | 'audit' | 'anomalies'>('rules');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [deficiencyTitle, setDeficiencyTitle] = useState('');
  const [deficiencyRequirement, setDeficiencyRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPackage = async () => {
    try {
      const data = await api.getStaffApplicationPackage(applicationId);
      setDataPackage(data);
    } catch (err) {
      console.error('Failed to load scrutiny package:', err);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [applicationId]);

  if (!dataPackage) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Loading scrutiny package...
      </div>
    );
  }

  const { application, documents, deficiencies, auditLogs, scheme } = dataPackage;
  const currentDoc = documents[selectedDocIndex] || documents[0];

  const handleDecision = async (action: 'approve' | 'deficiency' | 'manual_review' | 'reject') => {
    if (!officerRemarks.trim()) {
      alert('Mandatory official remarks are required for administrative transparency.');
      return;
    }

    if (action === 'deficiency' && !deficiencyTitle.trim()) {
      alert('Please enter a clear Deficiency Title explaining what the applicant must correct.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.reviewApplication(application.id, {
        action,
        reason: officerRemarks,
        deficiencyTitle,
        deficiencyRequirement
      });

      setNotification(`Decision successfully recorded: ${action.toUpperCase()}. Audit log updated.`);
      setOfficerRemarks('');
      setDeficiencyTitle('');
      setDeficiencyRequirement('');
      await fetchPackage();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('officer-queue')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Scrutiny Queue
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Scrutiny Console: {application.applicationId}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
              {application.schemeCode} v{application.schemeVersion}
            </span>
            <SampleBadge tooltip="Applicant documents and rule evaluation under prototype test" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Scholar: <strong className="text-slate-800">{application.studentName}</strong> • Current Status:{' '}
            <span className="font-bold uppercase text-blue-700">{application.status.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Priority Chip */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
              application.reviewPriority === 'priority'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : application.reviewPriority === 'manual'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Queue Priority: {application.reviewPriority}
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Split-Screen Scrutiny Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): Document Viewer & OCR Findings */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Submitted Documents ({documents.length})
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Select to scrutinize</span>
            </div>

            {/* Document Selector Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDocIndex === idx
                      ? 'bg-[#0B2447] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {doc.documentTitle}
                </button>
              ))}
            </div>

            {currentDoc ? (
              <div className="space-y-4 pt-2">
                {/* Document Metadata Bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{currentDoc.originalName}</span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SHA-256: {currentDoc.sha256}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {currentDoc.extraction?.method || 'text'} mode
                  </span>
                </div>

                {/* AI Extracted Structured Attributes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      OCR Extracted Attributes ({currentDoc.extraction?.detectedType || 'Document'})
                    </span>
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Assistive Extraction
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                    {currentDoc.extraction?.extractedFields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center justify-between py-1 border-b border-slate-200/70 last:border-none"
                      >
                        <span className="text-slate-500 font-medium">{field.label}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{field.value}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              field.confidence >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : field.confidence >= 70
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {field.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legibility Flags */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">Scan Legibility:</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {currentDoc.extraction?.qualityFlags.isReadable ? '✓ High Contrast' : '⚠ Low Resolution / Blurry'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">Cross-Doc Consistency:</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {currentDoc.extraction?.qualityFlags.hasTamperingSignal ? '⚠ Discrepancy Alert' : '✓ Consistent Profile'}
                    </p>
                  </div>
                </div>

                {/* Statutory Disclaimer */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="text-[11px] leading-relaxed">
                    {currentDoc.extraction?.explanation ||
                      'Automated OCR parser verified fields. Extracted values are provided for official convenience.'}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 pt-1">
                    Label: Extracted information — not proof of authenticity
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded.</p>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Rule Engine, Anomalies & Human Decision */}
        <div className="lg:col-span-6 space-y-4">
          {/* Tabs: Rules / Anomaly Check / Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'rules' ? 'bg-[#0B2447] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rule Engine ({application.eligibilityResult?.evaluations.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('anomalies')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'anomalies' ? 'bg-[#0B2447] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Anomalies / Duplicates</span>
                {application.anomalyFlags.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'audit' ? 'bg-[#0B2447] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Audit Trail ({auditLogs.length})
              </button>
            </div>

            {/* TAB 1: Rule Engine */}
            {activeTab === 'rules' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Deterministic Policy Evaluation:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full ${
                      application.eligibilityResult?.status === 'Eligible'
                        ? 'bg-emerald-100 text-emerald-800'
                        : application.eligibilityResult?.status === 'Deficient'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {application.eligibilityResult?.status || 'Pending'} ({application.eligibilityResult?.overallScore || 0}%)
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {application.eligibilityResult?.evaluations.map((ev) => (
                    <div
                      key={ev.ruleCode}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{ev.title}</span>
                        <p className="text-[11px] text-slate-500">{ev.message}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          ev.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ev.passed ? '✓ Met' : '✗ Unmet'}
                      </span>
                    </div>
                  ))}
                </div>

                {application.eligibilityResult?.recommendedAction && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold">AI System Recommendation:</span>{' '}
                    {application.eligibilityResult.recommendedAction}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Anomalies & Duplicate Check */}
            {activeTab === 'anomalies' && (
              <div className="space-y-3 text-xs">
                {application.anomalyFlags.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-700">No Cryptographic Duplicates or Outliers Flagged</p>
                    <p className="text-[11px] text-slate-400">
                      SHA-256 fingerprint check & RapidFuzz name consistency passed within tolerance.
                    </p>
                  </div>
                ) : (
                  application.anomalyFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                        Potential inconsistency detected — manual review required.
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">{flag}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Audit Trail */}
            {activeTab === 'audit' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{log.reason}</p>
                    <span className="text-[10px] text-slate-400">By: {log.userName} ({log.role})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Human Decision Panel (Administrative Authorization) */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Official Scrutiny Decision (Human-in-the-Loop)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Decision mandatory</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Official Remarks & Scrutiny Justification *
              </label>
              <textarea
                rows={2}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Enter formal justification for decision (will be appended to immutable audit log)..."
                className="w-full p-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Optional Deficiency Inputs if raising deficiency */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="If raising deficiency: Title (e.g. Unclear seal on caste certificate)"
                value={deficiencyTitle}
                onChange={(e) => setDeficiencyTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <input
                type="text"
                placeholder="Exact action required from student (e.g. Upload e-District digital copy)"
                value={deficiencyRequirement}
                onChange={(e) => setDeficiencyRequirement(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleDecision('approve')}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>

              <button
                onClick={() => handleDecision('deficiency')}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Raise Deficiency
              </button>

              <button
                onClick={() => handleDecision('manual_review')}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" /> Manual Review
              </button>

              <button
                onClick={() => handleDecision('reject')}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
