import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest, requireRole } from '../middleware/auth.ts';
import { generateSelectionRanking } from '../services/selectionService.ts';
import { logAuditEvent } from '../services/auditService.ts';
import { createNotification } from '../services/notificationService.ts';

const router = Router();
router.use(authMiddleware);

// Get ranked list for Selection Committee
router.get('/:schemeCode/ranking', requireRole(['officer', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { schemeCode } = req.params;
  if (!['NFST', 'NOS'].includes(schemeCode.toUpperCase())) {
    return res.status(400).json({ success: false, error: 'Valid schemeCode (NFST or NOS) required.' });
  }

  const rankings = generateSelectionRanking(schemeCode.toUpperCase() as any);
  return res.json({
    success: true,
    data: {
      schemeCode: schemeCode.toUpperCase(),
      rankings,
      notice: 'Recommendation — final selection strictly authorized by Ministry Selection Committee.'
    }
  });
});

// Committee decision on candidate
router.post('/:applicationId/decision', requireRole(['officer', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find(
    (a) => a.id === req.params.applicationId || a.applicationId === req.params.applicationId
  );

  if (!app) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const { decision, reason, overrideReason } = req.body;
  if (!decision || !['shortlist', 'select', 'reject', 'waitlist'].includes(decision)) {
    return res.status(400).json({ success: false, error: 'Valid decision required.' });
  }

  const prevStatus = app.status;
  if (decision === 'select') {
    app.status = 'selected';
    app.workflowStage = 'Award Sanction & Post-Selection Onboarding';
    app.postSelection = {
      acceptanceStatus: 'pending',
      joiningConfirmed: false,
      progressReportSubmitted: false,
      updatedAt: new Date().toISOString()
    };
  } else if (decision === 'shortlist') {
    app.status = 'shortlisted';
    app.workflowStage = 'Selection Committee Review';
  } else if (decision === 'reject') {
    app.status = 'rejected';
    app.workflowStage = 'Rejected';
  }

  app.committeeDecision = decision;
  app.overrideReason = overrideReason || '';
  app.updatedAt = new Date().toISOString();

  app.statusHistory.push({
    status: app.status,
    changedAt: new Date().toISOString(),
    changedBy: req.user!.name,
    role: 'officer',
    remarks: `Selection Committee Decision: ${decision.toUpperCase()}. Reason: ${reason || 'Approved by committee'}. ${overrideReason ? `Override Reason: ${overrideReason}` : ''}`
  });

  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: req.user!.role,
    action: `COMMITTEE_${decision.toUpperCase()}`,
    applicationId: app.applicationId,
    previousStatus: prevStatus,
    newStatus: app.status,
    reason: `${reason || 'Selection Committee review completed'} ${overrideReason ? `[Manual Override: ${overrideReason}]` : ''}`,
    ip: req.ip
  });

  createNotification({
    userId: app.studentId,
    type: 'selection',
    title: `Committee Decision: ${app.applicationId}`,
    message: `Your application has been updated to: ${app.status.replace('_', ' ').toUpperCase()}. ${decision === 'select' ? 'Congratulations on being selected for the Fellowship!' : ''}`,
    applicationId: app.applicationId
  });

  return res.json({ success: true, data: app });
});

export default router;
