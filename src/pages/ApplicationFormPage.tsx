import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Eye,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Application, Scheme, RequiredDocumentConfig, ApplicationDocument } from '../types';
import { ReadinessMeter } from '../components/ReadinessMeter';
import { SampleBadge } from '../components/SampleBadge';

interface ApplicationFormPageProps {
  initialSchemeCode?: 'NFST' | 'NOS';
  initialApplicationId?: string;
  onNavigate: (view: string, data?: any) => void;
}

export const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({
  initialSchemeCode = 'NFST',
  initialApplicationId,
  onNavigate
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [schemeCode, setSchemeCode] = useState<'NFST' | 'NOS'>(initialSchemeCode);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [sampleFiles, setSampleFiles] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<ApplicationDocument | null>(null);

  // Initialize or load application
  const initApplication = async () => {
    try {
      const [schemesData, sampleData] = await Promise.all([
        api.getSchemes(),
        api.getSampleFiles()
      ]);
      setSampleFiles(sampleData);

      const targetScheme = schemesData.find((s) => s.code === schemeCode) || schemesData[0];
      setScheme(targetScheme);

      if (initialApplicationId) {
        const details = await api.getApplicationDetails(initialApplicationId);
        setApplication(details.application);
        setDocuments(details.documents || []);
        setResponses(details.application.responses || {});
        if (details.documents && details.documents.length > 0) {
          setSelectedDocPreview(details.documents[0]);
        }
      } else {
        // Create a new draft
        const newApp = await api.createApplication(schemeCode);
        setApplication(newApp);
        setResponses(newApp.responses || {});
      }
    } catch (err) {
      console.error('Failed to initialize application form:', err);
    }
  };

  useEffect(() => {
    initApplication();
  }, [schemeCode, initialApplicationId]);

  const handleFieldChange = (key: string, value: any) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    if (!application) return;
    try {
      const updated = await api.saveApplicationDraft(application.id, responses);
      setApplication(updated);
      setNotificationMsg('Draft responses saved successfully.');
      setTimeout(() => setNotificationMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save draft.');
    }
  };

  const handleUploadSample = async (requirementKey: string, sampleFileKey: string) => {
    if (!application) return;
    setIsUploading(true);
    try {
      const res = await api.uploadDocument({
        applicationId: application.id,
        requirementKey,
        documentTitle: requirementKey,
        sampleFileKey
      });

      // Refresh documents
      const details = await api.getApplicationDetails(application.id);
      setDocuments(details.documents);
      setApplication(details.application);
      setSelectedDocPreview(res.document);

      setNotificationMsg(`Uploaded ${sampleFileKey} with AI Document Extraction.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;
    if (!confirm('Are you ready to submit this application for AI Scrutiny and Verification Review?')) return;

    setIsSubmitting(true);
    try {
      // First save latest responses
      await api.saveApplicationDraft(application.id, responses);
      const submittedApp = await api.submitApplication(application.id);
      setApplication(submittedApp);
      setStep(3); // Go to submission summary / outcome
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredDocs = scheme?.versions[0]?.requiredDocuments || [];
  const uploadedKeys = documents.map((d) => d.requirementKey);
  const missingKeys = requiredDocs.filter((r) => !uploadedKeys.includes(r.key)).map((r) => r.title);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              {application?.applicationId || 'New Application'}
            </span>
            <SampleBadge tooltip="Scheme configuration and required documents are sample prototype data" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
            {scheme?.fullName || 'Scholarship Application'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {scheme?.programmeScope}
          </p>
        </div>

        {/* Readiness Meter Top Widget */}
        <div className="w-full sm:w-72">
          <ReadinessMeter score={application?.readinessScore || 30} missingItems={missingKeys} />
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-2 text-xs font-semibold">
        <button
          onClick={() => setStep(1)}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            step === 1 ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
            1
          </span>
          <span>Academic & Personal Details</span>
        </button>

        <div className="w-6 text-center text-slate-300">→</div>

        <button
          onClick={() => setStep(2)}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            step === 2 ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
            2
          </span>
          <span>Document Upload & AI Extraction</span>
        </button>

        <div className="w-6 text-center text-slate-300">→</div>

        <button
          onClick={() => setStep(3)}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            step === 3 ? 'bg-[#0B2447] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
            3
          </span>
          <span>Scrutiny Review & Submit</span>
        </button>
      </div>

      {/* STEP 1: Academic & Personal Form */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Step 1: Programme Details & Eligibility Fields
              </h2>
              <p className="text-xs text-slate-500">
                All fields are dynamically linked to configured scheme verification rules.
              </p>
            </div>
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Candidate Full Name (As per ST Certificate) *
              </label>
              <input
                type="text"
                value={responses.candidateName || ''}
                onChange={(e) => handleFieldChange('candidateName', e.target.value)}
                placeholder="e.g. Birsa Soren"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ST Community / Tribe Name *
              </label>
              <input
                type="text"
                value={responses.stCommunity || 'Santhal'}
                onChange={(e) => handleFieldChange('stCommunity', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Family Income (₹ / Year) * (Sample cap: ≤ ₹6,00,000)
              </label>
              <input
                type="number"
                value={responses.familyAnnualIncome || 350000}
                onChange={(e) => handleFieldChange('familyAnnualIncome', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qualifying Degree Aggregate Percentage (%) * (Sample rule: ≥ 55%)
              </label>
              <input
                type="number"
                step="0.1"
                value={responses.postGradPercentage || responses.qualifyingPercentage || 74.5}
                onChange={(e) => {
                  handleFieldChange('postGradPercentage', Number(e.target.value));
                  handleFieldChange('qualifyingPercentage', Number(e.target.value));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
              />
            </div>

            {schemeCode === 'NFST' ? (
              <>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Research Title / Proposed Topic
                  </label>
                  <input
                    type="text"
                    value={responses.researchTitle || 'Socio-economic Empowerment and Sustainable Livelihood Models among Santhal Tribes'}
                    onChange={(e) => handleFieldChange('researchTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enrolled Research Institute / University
                  </label>
                  <input
                    type="text"
                    value={responses.universityName || 'Ranchi University, Jharkhand'}
                    onChange={(e) => handleFieldChange('universityName', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full-Time Admission Confirmed?
                  </label>
                  <select
                    value={responses.admissionConfirmed ? 'yes' : 'no'}
                    onChange={(e) => handleFieldChange('admissionConfirmed', e.target.value === 'yes')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none bg-white"
                  >
                    <option value="yes">Yes - Confirmed Full-Time Research Scholar</option>
                    <option value="no">No - Provisional / Awaiting Admission</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Overseas University & Country
                  </label>
                  <input
                    type="text"
                    value={responses.foreignUniversity || 'University of Edinburgh, United Kingdom'}
                    onChange={(e) => handleFieldChange('foreignUniversity', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course of Study Abroad
                  </label>
                  <input
                    type="text"
                    value={responses.courseTitle || 'M.Sc. in Advanced Artificial Intelligence'}
                    onChange={(e) => handleFieldChange('courseTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admission Offer Type
                  </label>
                  <select
                    value={responses.overseasOfferUnconditional ? 'unconditional' : 'conditional'}
                    onChange={(e) => handleFieldChange('overseasOfferUnconditional', e.target.value === 'unconditional')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0B2447] focus:outline-none bg-white"
                  >
                    <option value="unconditional">Unconditional Offer (Eligible for Sanction)</option>
                    <option value="conditional">Conditional Offer</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                handleSaveDraft();
                setStep(2);
              }}
              className="px-5 py-2.5 bg-[#0B2447] text-white rounded-xl text-xs font-bold hover:bg-[#163866] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Continue to Document Upload <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Document Upload & AI Extraction */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-2xl border border-amber-300 p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AI Document Scrutiny Notice:</span> Uploaded files are immediately processed by our document intelligence engine to extract key fields, assess scanning resolution, and calculate verification confidence. Extracted data assists verification officers and is not considered official proof of authenticity.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Required Documents Checklist & Upload Triggers */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Mandatory Scheme Documents</span>
                <span className="text-xs text-slate-500 font-normal">
                  {documents.length} of {requiredDocs.length} uploaded
                </span>
              </h2>

              {requiredDocs.map((docConfig) => {
                const uploadedDoc = documents.find((d) => d.requirementKey === docConfig.key);

                return (
                  <div
                    key={docConfig.key}
                    className={`bg-white rounded-2xl border p-4 transition-all shadow-2xs ${
                      uploadedDoc ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{docConfig.title}</span>
                          {uploadedDoc ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{docConfig.description}</p>
                      </div>
                    </div>

                    {uploadedDoc && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedDocPreview(uploadedDoc)}
                          className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View AI Extraction Fields
                        </button>
                        <span className="text-[11px] text-slate-400 font-mono">
                          SHA: {uploadedDoc.sha256.substring(0, 8)}...
                        </span>
                      </div>
                    )}

                    {/* Quick Demo Upload Buttons */}
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-200 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">Quick Test:</span>
                      {docConfig.key === 'st_caste_certificate' && (
                        <>
                          <button
                            onClick={() => handleUploadSample(docConfig.key, 'sample_st_caste_certificate.txt')}
                            disabled={isUploading}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          >
                            Load Valid ST Certificate
                          </button>
                          <button
                            onClick={() => handleUploadSample(docConfig.key, 'sample_mismatched_caste_certificate.txt')}
                            disabled={isUploading}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            title="Tests RapidFuzz cross-document name mismatch"
                          >
                            Load Mismatched Name Scan
                          </button>
                        </>
                      )}

                      {docConfig.key === 'income_certificate' && (
                        <>
                          <button
                            onClick={() => handleUploadSample(docConfig.key, 'sample_valid_income_certificate.txt')}
                            disabled={isUploading}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                          >
                            Load Valid Income (₹3.5L)
                          </button>
                          <button
                            onClick={() => handleUploadSample(docConfig.key, 'sample_unreadable_income_certificate.txt')}
                            disabled={isUploading}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                            title="Tests deficiency engine on low-res scan"
                          >
                            Load Unreadable Scan (Deficiency Test)
                          </button>
                        </>
                      )}

                      {docConfig.key === 'postgrad_marksheet' && (
                        <button
                          onClick={() => handleUploadSample(docConfig.key, 'sample_pg_marksheet.txt')}
                          disabled={isUploading}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Load PG Marksheet (74.5%)
                        </button>
                      )}

                      {docConfig.key === 'admission_letter' && (
                        <button
                          onClick={() => handleUploadSample(docConfig.key, 'sample_phd_admission_letter.txt')}
                          disabled={isUploading}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Load PhD Admission Letter
                        </button>
                      )}

                      {docConfig.key === 'overseas_admission_letter' && (
                        <button
                          onClick={() => handleUploadSample(docConfig.key, 'sample_foreign_offer_letter.txt')}
                          disabled={isUploading}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Load Edinburgh Unconditional Offer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Side-by-Side OCR Field Extraction Preview */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>AI Scrutiny & Extraction Inspector</span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Assistive Analysis
                </span>
              </h2>

              {selectedDocPreview && selectedDocPreview.extraction ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Detected Document Type
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {selectedDocPreview.extraction.detectedType}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        File: {selectedDocPreview.originalName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Extraction Mode</span>
                      <p className="text-xs font-bold text-blue-700 capitalize">
                        {selectedDocPreview.extraction.method} Parsing
                      </p>
                    </div>
                  </div>

                  {/* Extracted Structured Fields Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700">Extracted Structured Fields</span>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                      {selectedDocPreview.extraction.extractedFields.map((field) => (
                        <div key={field.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none">
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

                  {/* Quality & Tampering Flags */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-500 text-[11px]">Legibility:</span>
                      <p className="font-bold mt-0.5 text-slate-800">
                        {selectedDocPreview.extraction.qualityFlags.isReadable ? '✓ High Contrast' : '⚠ Low Resolution / Blurry'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-500 text-[11px]">Consistency:</span>
                      <p className="font-bold mt-0.5 text-slate-800">
                        {selectedDocPreview.extraction.qualityFlags.hasTamperingSignal
                          ? '⚠ Discrepancy Flagged'
                          : '✓ Consistent Attributes'}
                      </p>
                    </div>
                  </div>

                  {/* System Explanation & Trust Disclaimer */}
                  <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="text-[11px] leading-relaxed">{selectedDocPreview.extraction.explanation}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide pt-1">
                      Label: Extracted information — not proof of authenticity
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Select or upload a document to view real-time OCR extraction results and confidence.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 1
            </button>

            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-[#0B2447] text-white rounded-xl text-xs font-bold hover:bg-[#163866] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Continue to Scrutiny Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Final Submission */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Step 3: Verification Review & Candidate Declaration
              </h2>
              <p className="text-xs text-slate-500">
                Review automated rule outcomes before final submission to the Ministry Scrutiny Officer.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                application?.status === 'submitted' || application?.status === 'under_scrutiny'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : application?.status === 'deficiency_raised'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              Status: {application?.status.replace('_', ' ')}
            </span>
          </div>

          {/* If already submitted, display eligibility result */}
          {application?.eligibilityResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Rule Engine Evaluation Result
                  </span>
                  <span
                    className={`font-extrabold text-xs px-2.5 py-1 rounded-lg ${
                      application.eligibilityResult.status === 'Eligible'
                        ? 'bg-emerald-100 text-emerald-800'
                        : application.eligibilityResult.status === 'Deficient'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Outcome: {application.eligibilityResult.status} ({application.eligibilityResult.overallScore}% score)
                  </span>
                </div>

                <div className="space-y-2">
                  {application.eligibilityResult.evaluations.map((evalItem) => (
                    <div
                      key={evalItem.ruleCode}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">{evalItem.title}</span>
                        <p className="text-[11px] text-slate-500">{evalItem.message}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          evalItem.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {evalItem.passed ? '✓ Satisfied' : '✗ Flagged'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {application.status === 'deficiency_raised' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Deficiency Raised by Scrutiny Engine
                  </div>
                  <p>
                    One or more required documents or rules require corrective action before your file can proceed to Verification Officer sign-off.
                  </p>
                  <button
                    onClick={() => onNavigate('deficiencies')}
                    className="px-4 py-2 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800 transition-all cursor-pointer"
                  >
                    Resolve Deficiency Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Documents
            </button>

            {application?.status === 'draft' && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting Application...' : 'Submit Application to MoTA'}
              </button>
            )}

            {application?.status !== 'draft' && (
              <button
                onClick={() => onNavigate('timeline', { applicationId: application?.id })}
                className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Track Live Application Timeline →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
