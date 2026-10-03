import React, { useState, useEffect } from 'react';
import {
  Layers,
  History,
  Plus,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { api } from '../api/client';
import { Scheme, SchemeRule, SchemeVersion } from '../types';
import { SampleBadge } from '../components/SampleBadge';

export const SchemeConfigPage: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeCode, setSelectedSchemeCode] = useState<'NFST' | 'NOS'>('NFST');
  const [activeVersion, setActiveVersion] = useState<SchemeVersion | null>(null);
  const [editableRules, setEditableRules] = useState<SchemeRule[]>([]);
  const [changeSummary, setChangeSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSchemes();
      setSchemes(data);
      const target = data.find((s) => s.code === selectedSchemeCode) || data[0];
      const ver = target?.versions[0] || null;
      setActiveVersion(ver);
      setEditableRules(ver?.rules ? JSON.parse(JSON.stringify(ver.rules)) : []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedSchemeCode]);

  const handleRuleChange = (index: number, field: string, value: any) => {
    setEditableRules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveVersion = async () => {
    if (!changeSummary.trim()) {
      alert('Please enter a change summary describing this policy revision.');
      return;
    }

    try {
      const res = await api.updateSchemeRules(selectedSchemeCode, editableRules, changeSummary);
      setNotification(res.message);
      setChangeSummary('');
      await fetchSchemes();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to create new scheme version.');
    }
  };

  const currentScheme = schemes.find((s) => s.code === selectedSchemeCode);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Scheme Policy Engine & Version Control
            </h1>
            <SampleBadge tooltip="Rules are prototype demonstration baselines. Any update creates an immutable version snapshot." />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure statutory eligibility thresholds. Existing submitted applications retain their historical version baseline.
          </p>
        </div>

        {/* Scheme Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedSchemeCode('NFST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSchemeCode === 'NFST' ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NFST (In-India)
          </button>
          <button
            onClick={() => setSelectedSchemeCode('NOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSchemeCode === 'NOS' ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NOS (Overseas)
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Scheme Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400">Scheme Overview</span>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Current Active Version: v{currentScheme?.currentVersion || 1}
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-900">{currentScheme?.fullName}</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{currentScheme?.description}</p>
      </div>

      {/* Rules Config Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Configured Verification Rules ({editableRules.length})
            </h3>
            <p className="text-xs text-slate-500">
              Modifying these values and saving creates a new version snapshot.
            </p>
          </div>
          <SampleBadge tooltip="Sample prototype rules" />
        </div>

        <div className="space-y-4">
          {editableRules.map((rule, idx) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-800">{rule.ruleCode}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    rule.severity === 'blocking'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rule.severity} Rule
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Rule Title & Requirement Description
                  </label>
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => handleRuleChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">{rule.description}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Threshold ({rule.operator})
                  </label>
                  <input
                    type="text"
                    value={rule.targetValue}
                    onChange={(e) => handleRuleChange(idx, 'targetValue', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                    Field: {rule.field}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Change Summary & Save Version */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Administrative Change Summary (Logged in Audit Trail) *
          </label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Revised qualifying percentage baseline to 55% per Ministry Gazette notification"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0B2447]"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Saving will bump version to v{(currentScheme?.currentVersion || 1) + 1}.
            </span>
            <button
              onClick={handleSaveVersion}
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save as New Scheme Version
            </button>
          </div>
        </div>
      </div>

      {/* Version History Archive */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          Version History Archive ({currentScheme?.versions.length})
        </h3>

        <div className="space-y-2 text-xs">
          {currentScheme?.versions.map((ver) => (
            <div
              key={ver.version}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-slate-900">Version v{ver.version}</span>
                <p className="text-[11px] text-slate-600 mt-0.5">{ver.changeSummary}</p>
                <span className="text-[10px] text-slate-400">By: {ver.updatedBy}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Effective: {new Date(ver.effectiveFrom).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
