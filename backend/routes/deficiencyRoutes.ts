import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { logAuditEvent } from '../services/auditService.ts';
import { createNotification } from '../services/notificationService.ts';

const router = Router();
router.use(authMiddleware);

// Get deficiencies
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'student') {
    const studentApps = db.applications.filter((a) => a.studentId === req.user!.id).map((a) => a.id);
    const defs = db.deficiencies.filter((d) => studentApps.includes(d.applicationId));
    return res.json({ success: true, data: defs });
  }

  // Verifier, officer, admin see all
  return res.json({ success: true, data: db.deficiencies });
});

// Student resubmits resolution
router.post('/:id/resubmit', (req: AuthenticatedRequest, res: Response) => {
  const def = db.deficiencies.find((d) => d.id === req.params.id);
  if (!def) {
    return res.status(404).json({ success: false, error: 'Deficiency record not found.' });
  }

  const app = db.applications.find((a) => a.id === def.applicationId);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Linked application not found.' });
  }

  const { studentResponse, resolved } = req.body;
  def.studentResponse = studentResponse || 'Applicant uploaded corrected high-resolution document.';
  def.status = 'resubmitted';

  // If marked resolved or automatic re-validation passes
  if (resolved !== false) {
    def.status = 'resolved';
    def.resolvedAt = new Date().toISOString();

    // Check if any other open deficiencies remain for this application
    const remainingOpen = db.deficiencies.filter(
      (d) => d.applicationId === app.id && d.id !== def.id && d.status === 'open'
    );

    if (remainingOpen.length === 0) {
      const prevStatus = app.status;
      app.status = 'under_scrutiny';
      app.workflowStage = 'Verification Officer Review';
      app.reviewPriority = 'priority'; // prioritize resubmitted files in queue
      app.priorityReasons = ['Deficiency resolved by applicant — re-verification queued'];

      app.statusHistory.push({
        status: app.status,
        changedAt: new Date().toISOString(),
        changedBy: req.user!.name,
        role: 'student',
        remarks: `Deficiency '${def.title}' resolved by applicant. Queued for priority officer scrutiny.`
      });

      logAuditEvent({
        userId: req.user!.id,
        userName: req.user!.name,
        role: req.user!.role,
        action: 'DEFICIENCY_RESOLVED',
        applicationId: app.applicationId,
        previousStatus: prevStatus,
        newStatus: app.status,
        reason: `Applicant resolved deficiency: ${def.title}`,
        ip: req.ip
      });

      // Notify verifiers/officers
      const officers = db.users.filter((u) => u.role === 'officer' || u.role === 'verifier');
      for (const off of officers) {
        createNotification({
          userId: off.id,
          type: 'deficiency_resolved',
          title: `Deficiency Resolved: ${app.applicationId}`,
          message: `Applicant ${app.studentName} has resolved deficiency for ${def.title}. Application is now in priority review.`,
          applicationId: app.applicationId
        });
      }
    }
  }

  db.commit();

  res.json({
    success: true,
    data: {
      deficiency: def,
      application: app
    }
  });
});

export default router;
