export type UserRole = 'student' | 'verifier' | 'officer' | 'admin';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  mobile?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  gender: string;
  stCommunity: string;
  stateOfDomicile: string;
  district: string;
  pincode: string;
  familyAnnualIncome: number;
  highestQualification: string;
  academicScorePercentage: number;
  institutionName: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  updatedAt: string;
}

export interface SchemeRule {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  category: 'caste' | 'income' | 'qualification' | 'age' | 'admission' | 'general';
  operator: 'gte' | 'lte' | 'eq' | 'in' | 'exists';
  field: string;
  targetValue: any;
  isSampleData: boolean;
  severity: 'blocking' | 'review' | 'info';
}

export interface RequiredDocumentConfig {
  key: string;
  title: string;
  description: string;
  isRequired: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
  isSampleData: boolean;
  sampleFileName?: string;
}

export interface SchemeVersion {
  version: number;
  effectiveFrom: string;
  rules: SchemeRule[];
  requiredDocuments: RequiredDocumentConfig[];
  selectionCriteria: {
    academicWeight: number;
    incomeWeight: number;
    researchProposalWeight?: number;
    notes: string;
  };
  workflowStages: string[];
  updatedBy: string;
  changeSummary: string;
}

export interface Scheme {
  id: string;
  code: 'NFST' | 'NOS';
  name: string;
  fullName: string;
  description: string;
  programmeScope: string;
  isSampleData: boolean;
  currentVersion: number;
  versions: SchemeVersion[];
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_scrutiny'
  | 'deficiency_raised'
  | 'deficiency_resolved'
  | 'verified'
  | 'shortlisted'
  | 'selected'
  | 'rejected';

export type ReviewQueuePriority = 'routine' | 'manual' | 'priority';

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  requirementKey: string;
  documentTitle: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  uploadedAt: string;
  status: 'pending' | 'analyzed' | 'flagged' | 'verified';
  extraction?: {
    detectedType: string;
    extractedFields: {
      key: string;
      label: string;
      value: string;
      confidence: number; // 0-100
    }[];
    qualityFlags: {
      isReadable: boolean;
      isBlank: boolean;
      isLowResolution: boolean;
      hasTamperingSignal: boolean;
    };
    method: 'text' | 'ocr' | 'demo';
    explanation: string;
  };
}

export interface RuleEvaluationResult {
  ruleCode: string;
  title: string;
  passed: boolean;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  field: string;
  actualValue: any;
  expectedValue: any;
}

export interface EligibilityResult {
  status: 'Eligible' | 'Ineligible' | 'Deficient' | 'Manual Review';
  overallScore: number;
  evaluations: RuleEvaluationResult[];
  explanation: string[];
  issues: string[];
  recommendedAction: string;
  source: 'ai' | 'fallback';
  calculatedAt: string;
}

export interface Deficiency {
  id: string;
  applicationId: string;
  type: 'missing_document' | 'incomplete_field' | 'unreadable_doc' | 'info_mismatch' | 'invalid_format' | 'verification_required';
  title: string;
  whatIsWrong: string;
  why: string;
  actionRequired: string;
  status: 'open' | 'resubmitted' | 'resolved';
  raisedBy: 'system' | 'officer';
  raisedByName: string;
  createdAt: string;
  resolvedAt?: string;
  studentResponse?: string;
}

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  changedBy: string;
  role: string;
  remarks: string;
}

export interface Application {
  id: string;
  applicationId: string; // e.g. NFST-2026-0001
  studentId: string;
  studentName: string;
  studentEmail: string;
  schemeCode: 'NFST' | 'NOS';
  schemeVersion: number;
  responses: Record<string, any>;
  status: ApplicationStatus;
  workflowStage: string;
  statusHistory: StatusHistoryItem[];
  eligibilityResult?: EligibilityResult;
  readinessScore: number; // 0-100
  reviewPriority: ReviewQueuePriority;
  priorityReasons: string[];
  anomalyFlags: string[];
  assignedOfficerId?: string;
  officerRemarks?: string;
  committeeScore?: number;
  committeeDecision?: 'shortlist' | 'select' | 'reject' | 'waitlist';
  overrideReason?: string;
  postSelection?: {
    acceptanceStatus: 'pending' | 'accepted' | 'declined';
    joiningConfirmed: boolean;
    progressReportSubmitted: boolean;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  applicationId?: string;
  previousStatus?: string;
  newStatus?: string;
  reason: string;
  ip: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'status_change' | 'deficiency_raised' | 'deficiency_resolved' | 'selection' | 'general';
  title: string;
  message: string;
  applicationId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  studentName: string;
  applicationId?: string;
  subject: string;
  message: string;
  status: 'submitted' | 'under_review' | 'resolved';
  createdAt: string;
  replies: {
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }[];
}
