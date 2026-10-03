import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest, requireRole } from '../middleware/auth.ts';
import { Application, StatusHistoryItem } from '../models/types.ts';
import { evaluateApplicationEligibility } from '../services/ruleEngine.ts';
import { logAuditEvent } from '../services/auditService.ts';
import { createNotification } from '../services/notificationService.ts';

const router = Router();

router.use(authMiddleware);

// Get student profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  const profile = db.studentProfiles.find((p) => p.userId === req.user!.id);
  res.json({ success: true, data: profile || null });
});

// Update student profile
router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  let profile = db.studentProfiles.find((p) => p.userId === req.user!.id);
  if (!profile) {
    profile = {
      id: `prof_${req.user!.id}`,
      userId: req.user!.id,
      fullName: req.user!.name,
      dob: '',
      gender: '',
      stCommunity: '',
      stateOfDomicile: '',
      district: '',
      pincode: '',
      familyAnnualIncome: 0,
      highestQualification: '',
      academicScorePercentage: 0,
      institutionName: '',
      updatedAt: new Date().toISOString()
    };
    db.studentProfiles.push(profile);
  }

  Object.assign(profile, req.body, { updatedAt: new Date().toISOString() });
  db.commit();

  res.json({ success: true, data: profile });
});

// Get all available schemes
router.get('/schemes', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: db.schemes });
});

// Get student's applications
router.get('/applications', (req: AuthenticatedRequest, res: Response) => {
  const apps = db.applications.filter((a) => a.studentId === req.user!.id);
  res.json({ success: true, data: apps });
});

// Create new application
router.post('/applications', requireRole(['student']), (req: AuthenticatedRequest, res: Response) => {
  const { schemeCode } = req.body;
  if (!schemeCode || !['NFST', 'NOS'].includes(schemeCode)) {
    return res.status(400).json({ success: false, error: 'Valid schemeCode (NFST or NOS) required.' });
  }

  const scheme = db.schemes.find((s) => s.code === schemeCode);
  if (!scheme) {
    return res.status(404).json({ success: false, error: 'Scheme not found.' });
  }

  // Count existing applications
  const seq = db.applications.filter((a) => a.schemeCode === schemeCode).length + 1;
  const appIdNum = String(seq).padStart(4, '0');
  const generatedAppId = `${schemeCode}-2026-${appIdNum}`;

  const studentProfile = db.studentProfiles.find((p) => p.userId === req.user!.id);

  const initialHistory: StatusHistoryItem = {
    status: 'draft',
    changedAt: new Date().toISOString(),
    changedBy: req.user!.name,
    role: 'student',
    remarks: 'Application draft initialized.'
  };

  const newApp: Application = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    applicationId: generatedAppId,
    studentId: req.user!.id,
    studentName: req.user!.name,
    studentEmail: req.user!.email,
    schemeCode: schemeCode as any,
    schemeVersion: scheme.currentVersion,
    responses: {
      candidateName: req.user!.name,
      stCommunityValid: Boolean(studentProfile?.stCommunity),
      familyAnnualIncome: studentProfile?.familyAnnualIncome || 350000,
      academicScorePercentage: studentProfile?.academicScorePercentage || 70,
      postGradPercentage: studentProfile?.academicScorePercentage || 70,
      qualifyingPercentage: studentProfile?.academicScorePercentage || 70
    },
    status: 'draft',
    workflowStage: 'Registration & Draft',
    statusHistory: [initialHistory],
    readinessScore: 30,
    reviewPriority: 'routine',
    priorityReasons: ['New draft application'],
    anomalyFlags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.applications.push(newApp);
  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: 'student',
    action: 'APPLICATION_CREATED',
    applicationId: newApp.applicationId,
    previousStatus: '',
    newStatus: 'draft',
    reason: `Applicant started a new ${schemeCode} draft`,
    ip: req.ip
  });

  res.json({ success: true, data: newApp });
});

// Get single application
router.get('/applications/:id', (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find(
    (a) => a.id === req.params.id || a.applicationId === req.params.id
  );

  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  // Check ownership unless staff
  if (req.user!.role === 'student' && app.studentId !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'Access forbidden.' });
  }

  const appDocuments = db.documents.filter((d) => d.applicationId === app.id);
  const appDeficiencies = db.deficiencies.filter((d) => d.applicationId === app.id);
  const scheme = db.schemes.find((s) => s.code === app.schemeCode);

  res.json({
    success: true,
    data: {
      application: app,
      documents: appDocuments,
      deficiencies: appDeficiencies,
      scheme
    }
  });
});

// Update draft responses
router.put('/applications/:id', (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }
  if (req.user!.role === 'student' && app.studentId !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'Forbidden.' });
  }

  const { responses } = req.body;
  if (responses) {
    app.responses = { ...app.responses, ...responses };
  }

  // Recalculate readiness
  const scheme = db.schemes.find((s) => s.code === app.schemeCode);
  const requiredDocs = scheme?.versions[0]?.requiredDocuments || [];
  const uploadedDocs = db.documents.filter((d) => d.applicationId === app.id).length;
  const docsRatio = requiredDocs.length > 0 ? uploadedDocs / requiredDocs.length : 0;

  const responsesCount = Object.keys(app.responses).filter((k) => app.responses[k] !== undefined && app.responses[k] !== '').length;
  const fieldsRatio = Math.min(1, responsesCount / 6);

  app.readinessScore = Math.round(fieldsRatio * 50 + docsRatio * 50);
  app.updatedAt = new Date().toISOString();
  db.commit();

  res.json({ success: true, data: app });
});

// Submit application
router.post('/applications/:id/submit', (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }
  if (req.user!.role === 'student' && app.studentId !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'Forbidden.' });
  }

  const scheme = db.schemes.find((s) => s.code === app.schemeCode);
  if (!scheme) {
    return res.status(404).json({ success: false, error: 'Scheme definition not found.' });
  }

  const uploadedDocs = db.documents.filter((d) => d.applicationId === app.id);
  const requiredDocs = scheme.versions[0]?.requiredDocuments || [];

  // Run Rule Engine
  const eligibility = evaluateApplicationEligibility(
    scheme,
    app.schemeVersion,
    app.responses,
    uploadedDocs.length,
    requiredDocs.length
  );

  app.eligibilityResult = eligibility;
  const prevStatus = app.status;

  if (eligibility.status === 'Deficient') {
    app.status = 'deficiency_raised';
    app.workflowStage = 'Deficiency Resolution';
    app.reviewPriority = 'priority';
    app.priorityReasons = ['Automated Scrutiny: Missing or incomplete documentation'];

    // Automatically create a deficiency if missing documents
    if (uploadedDocs.length < requiredDocs.length) {
      const missingKeys = requiredDocs
        .filter((rd) => !uploadedDocs.some((ud) => ud.requirementKey === rd.key))
        .map((rd) => rd.title);

      const def = {
        id: `def_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        applicationId: app.id,
        type: 'missing_document' as const,
        title: 'Missing Required Verification Document(s)',
        whatIsWrong: `Application submitted without: ${missingKeys.join(', ')}.`,
        why: 'MoTA guidelines mandate all listed certificates for statutory scrutiny.',
        actionRequired: 'Please upload the missing document(s) in the application portal.',
        status: 'open' as const,
        raisedBy: 'system' as const,
        raisedByName: 'MoTA Automated Intake Engine',
        createdAt: new Date().toISOString()
      };
      db.deficiencies.push(def);
    }
  } else {
    app.status = 'under_scrutiny';
    app.workflowStage = 'Verification Officer Review';
    app.reviewPriority = eligibility.overallScore > 85 ? 'routine' : 'manual';
    app.priorityReasons = [
      `AI Scrutiny: Readiness ${eligibility.overallScore}%, ${eligibility.issues.length} flagged checks`
    ];
  }

  const historyItem: StatusHistoryItem = {
    status: app.status,
    changedAt: new Date().toISOString(),
    changedBy: req.user!.name,
    role: 'student',
    remarks: `Application submitted by candidate. Automated eligibility: ${eligibility.status} (${eligibility.overallScore}% score).`
  };
  app.statusHistory.push(historyItem);
  app.updatedAt = new Date().toISOString();

  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: 'student',
    action: 'APPLICATION_SUBMITTED',
    applicationId: app.applicationId,
    previousStatus: prevStatus,
    newStatus: app.status,
    reason: `Candidate submitted application for scrutiny. Rule engine output: ${eligibility.status}`,
    ip: req.ip
  });

  createNotification({
    userId: req.user!.id,
    type: 'status_change',
    title: `Application ${app.applicationId} Submitted`,
    message: `Your application has been received and transitioned to: ${app.status.replace('_', ' ').toUpperCase()}.`,
    applicationId: app.applicationId
  });

  res.json({ success: true, data: app });
});

// Application Timeline
router.get('/applications/:id/timeline', (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const logs = db.auditLogs.filter((l) => l.applicationId === app.applicationId || l.applicationId === app.id);
  res.json({
    success: true,
    data: {
      applicationId: app.applicationId,
      status: app.status,
      workflowStage: app.workflowStage,
      history: app.statusHistory,
      auditEvents: logs
    }
  });
});

export default router;
