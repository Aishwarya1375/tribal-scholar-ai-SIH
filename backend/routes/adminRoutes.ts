import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest, requireRole } from '../middleware/auth.ts';
import { logAuditEvent } from '../services/auditService.ts';
import { createNotification } from '../services/notificationService.ts';
import { ApplicationStatus } from '../models/types.ts';

const router = Router();
router.use(authMiddleware);

// Get Dashboard KPIs & Analytics
router.get('/dashboard', requireRole(['verifier', 'officer', 'admin']), (_req: AuthenticatedRequest, res: Response) => {
  const apps = db.applications;

  const totalApplications = apps.length;
  const nfstCount = apps.filter((a) => a.schemeCode === 'NFST').length;
  const nosCount = apps.filter((a) => a.schemeCode === 'NOS').length;

  const statusBreakdown: Record<string, number> = {
    draft: 0,
    submitted: 0,
    under_scrutiny: 0,
    deficiency_raised: 0,
    deficiency_resolved: 0,
    verified: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0
  };

  apps.forEach((a) => {
    if (statusBreakdown[a.status] !== undefined) {
      statusBreakdown[a.status]++;
    }
  });

  const priorityBreakdown = {
    priority: apps.filter((a) => a.reviewPriority === 'priority').length,
    manual: apps.filter((a) => a.reviewPriority === 'manual').length,
    routine: apps.filter((a) => a.reviewPriority === 'routine').length
  };

  const avgReadiness = apps.length > 0
    ? Math.round(apps.reduce((acc, a) => acc + (a.readinessScore || 0), 0) / apps.length)
    : 0;

  const openDeficienciesCount = db.deficiencies.filter((d) => d.status === 'open').length;

  return res.json({
    success: true,
    data: {
      totalApplications,
      nfstCount,
      nosCount,
      statusBreakdown,
      priorityBreakdown,
      avgReadiness,
      openDeficienciesCount,
      isSampleData: true,
      label: 'Sample / Prototype Data — Live Aggregation'
    }
  });
});

// Verification Queue
router.get('/verification-queue', requireRole(['verifier', 'officer', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { scheme, status, priority } = req.query;

  let queue = db.applications.filter((a) => a.status !== 'draft');

  if (scheme && typeof scheme === 'string') {
    queue = queue.filter((a) => a.schemeCode === scheme);
  }
  if (status && typeof status === 'string') {
    queue = queue.filter((a) => a.status === status);
  }
  if (priority && typeof priority === 'string') {
    queue = queue.filter((a) => a.reviewPriority === priority);
  }

  // Sort: Priority items first, then Manual, then Routine
  const priorityWeight = { priority: 3, manual: 2, routine: 1 };
  queue.sort((a, b) => {
    const weightDiff = (priorityWeight[b.reviewPriority] || 1) - (priorityWeight[a.reviewPriority] || 1);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const enrichedQueue = queue.map((app) => {
    const docs = db.documents.filter((d) => d.applicationId === app.id);
    const defs = db.deficiencies.filter((d) => d.applicationId === app.id && d.status === 'open');
    return {
      ...app,
      uploadedDocumentsCount: docs.length,
      openDeficienciesCount: defs.length
    };
  });

  return res.json({ success: true, data: enrichedQueue });
});

// Single Application Scrutiny Package
router.get('/applications/:id', requireRole(['verifier', 'officer', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const documents = db.documents.filter((d) => d.applicationId === app.id);
  const deficiencies = db.deficiencies.filter((d) => d.applicationId === app.id);
  const auditLogs = db.auditLogs.filter((l) => l.applicationId === app.applicationId || l.applicationId === app.id);
  const scheme = db.schemes.find((s) => s.code === app.schemeCode);

  return res.json({
    success: true,
    data: {
      application: app,
      documents,
      deficiencies,
      auditLogs,
      scheme,
      label: 'Extracted information — not proof of authenticity'
    }
  });
});

// Officer Human Review Decision
router.put('/applications/:id/review', requireRole(['verifier', 'officer', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find((a) => a.id === req.params.id || a.applicationId === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const { action, reason, deficiencyTitle, deficiencyRequirement } = req.body;
  if (!action || !reason) {
    return res.status(400).json({ success: false, error: 'Action and mandatory reason are required.' });
  }

  const prevStatus = app.status;
  let newStatus: ApplicationStatus = app.status;
  let workflowStage = app.workflowStage;

  if (action === 'approve') {
    newStatus = 'verified';
    workflowStage = 'Selection Committee Review';
    app.officerRemarks = reason;
  } else if (action === 'shortlist') {
    newStatus = 'shortlisted';
    workflowStage = 'Selection Committee Review';
    app.officerRemarks = reason;
  } else if (action === 'deficiency') {
    newStatus = 'deficiency_raised';
    workflowStage = 'Deficiency Resolution';
    app.reviewPriority = 'priority';

    // Create structured deficiency record
    const newDef = {
      id: `def_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      applicationId: app.id,
      type: 'verification_required' as const,
      title: deficiencyTitle || 'Clarification / Document Re-Upload Required',
      whatIsWrong: reason,
      why: 'Official scrutiny requires clear, unambiguous documentary verification.',
      actionRequired: deficiencyRequirement || 'Please review officer comments and submit revised documentation.',
      status: 'open' as const,
      raisedBy: 'officer' as const,
      raisedByName: `${req.user!.name} (${req.user!.role.toUpperCase()})`,
      createdAt: new Date().toISOString()
    };
    db.deficiencies.push(newDef);

    createNotification({
      userId: app.studentId,
      type: 'deficiency_raised',
      title: `Action Required: Deficiency on ${app.applicationId}`,
      message: `Scrutiny Officer has raised an issue: "${newDef.title}". Please upload corrective documentation.`,
      applicationId: app.applicationId
    });
  } else if (action === 'manual_review') {
    newStatus = 'under_scrutiny';
    app.reviewPriority = 'manual';
    workflowStage = 'Senior Officer Review';
    app.officerRemarks = reason;
  } else if (action === 'reject') {
    newStatus = 'rejected';
    workflowStage = 'Rejected';
    app.officerRemarks = reason;

    createNotification({
      userId: app.studentId,
      type: 'status_change',
      title: `Application Decision: ${app.applicationId}`,
      message: `Your application has not been approved following scrutiny. Reason: ${reason}`,
      applicationId: app.applicationId
    });
  }

  app.status = newStatus;
  app.workflowStage = workflowStage;
  app.updatedAt = new Date().toISOString();

  app.statusHistory.push({
    status: newStatus,
    changedAt: new Date().toISOString(),
    changedBy: req.user!.name,
    role: req.user!.role,
    remarks: `Officer Decision: ${action.toUpperCase()}. Reason: ${reason}`
  });

  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: req.user!.role,
    action: `OFFICER_${action.toUpperCase()}`,
    applicationId: app.applicationId,
    previousStatus: prevStatus,
    newStatus,
    reason,
    ip: req.ip
  });

  if (action === 'approve') {
    createNotification({
      userId: app.studentId,
      type: 'status_change',
      title: `Scrutiny Verified: ${app.applicationId}`,
      message: `Congratulations! Your documents have been scrutinized and verified by Officer ${req.user!.name}. Forwarded to Selection Committee.`,
      applicationId: app.applicationId
    });
  }

  return res.json({
    success: true,
    data: {
      application: app,
      message: `Application successfully updated to ${newStatus.replace('_', ' ')}.`
    }
  });
});

// Audit Logs
router.get('/audit-logs', requireRole(['verifier', 'officer', 'admin']), (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: db.auditLogs });
});

// Reset Demo Data
router.post('/demo/reset', requireRole(['admin', 'officer']), (req: AuthenticatedRequest, res: Response) => {
  db.resetToSeed();
  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: req.user!.role,
    action: 'DEMO_DATA_RESET',
    reason: 'Admin triggered clean seed reset for demonstration flow.',
    ip: req.ip
  });
  return res.json({ success: true, message: 'All database tables restored to initial seed state.' });
});

export default router;
