import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Grievance, User } from '../types';
import { SampleBadge } from '../components/SampleBadge';

interface GrievancePageProps {
  currentUser: User | null;
}

export const GrievancePage: React.FC<GrievancePageProps> = ({ currentUser }) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchGrievances = async () => {
    try {
      const data = await api.getGrievances();
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitGrievance(subject, message, applicationId || undefined);
      setSubject('');
      setMessage('');
      setApplicationId('');
      setNotification('Grievance logged successfully. Scrutiny desk has been notified.');
      await fetchGrievances();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;

    try {
      await api.replyGrievance(id, replyText, true);
      setReplyText('');
      setSelectedGrievanceId(null);
      setNotification('Official reply dispatched and student notified.');
      await fetchGrievances();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reply.');
    }
  };

  const isStaff = currentUser?.role === 'officer' || currentUser?.role === 'verifier' || currentUser?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Grievance Redressal & Helpdesk
            </h1>
            <SampleBadge tooltip="Direct transparent communication between applicant and MoTA verification desk" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit clarifications, report technical issues, or request status review directly with designated officials.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submit New Query / Grievance (Student Mode) */}
        {!isStaff && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Log a New Query / Grievance
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Query Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clarification on income certificate re-upload timeline"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Linked Application ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. NFST-2026-0001"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your query or provide additional context regarding your application..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0B2447] text-white rounded-xl font-bold text-xs hover:bg-[#163866] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Submit Grievance
              </button>
            </form>
          </div>
        )}

        {/* Right: Grievance Thread List */}
        <div className={`${!isStaff ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            Grievance & Query History ({grievances.length})
          </h3>

          <div className="space-y-3">
            {grievances.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                No grievances recorded.
              </div>
            ) : (
              grievances.map((grv) => (
                <div
                  key={grv.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{grv.subject}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Applicant: <strong className="text-slate-700">{grv.studentName}</strong> • {new Date(grv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        grv.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {grv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {grv.message}
                  </p>

                  {/* Replies Thread */}
                  {grv.replies && grv.replies.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Official Responses
                      </span>
                      {grv.replies.map((reply, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-blue-950 font-bold">
                            <span>{reply.senderName} ({reply.senderRole.toUpperCase()})</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-800 text-xs leading-relaxed">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Officer Reply Form */}
                  {isStaff && (
                    <div className="pt-2 border-t border-slate-100">
                      {selectedGrievanceId === grv.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            placeholder="Type official response to applicant..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedGrievanceId(null)}
                              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(grv.id)}
                              className="px-4 py-1.5 text-xs font-bold bg-[#0B2447] text-white rounded-xl cursor-pointer hover:bg-[#163866]"
                            >
                              Send Response & Mark Resolved
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedGrievanceId(grv.id)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" /> Reply as Officer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
