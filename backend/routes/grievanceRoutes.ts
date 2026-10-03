import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { Grievance } from '../models/types.ts';
import { logAuditEvent } from '../services/auditService.ts';
import { createNotification } from '../services/notificationService.ts';

const router = Router();
router.use(authMiddleware);

// Get grievances
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'student') {
    const userGrvs = db.grievances.filter((g) => g.studentId === req.user!.id);
    return res.json({ success: true, data: userGrvs });
  }
  return res.json({ success: true, data: db.grievances });
});

// Student submits grievance
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const { subject, message, applicationId } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, error: 'Subject and message are required.' });
  }

  const grv: Grievance = {
    id: `grv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentId: req.user!.id,
    studentName: req.user!.name,
    applicationId,
    subject,
    message,
    status: 'submitted',
    createdAt: new Date().toISOString(),
    replies: []
  };

  db.grievances.unshift(grv);
  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: req.user!.role,
    action: 'GRIEVANCE_SUBMITTED',
    applicationId,
    reason: `Applicant submitted grievance: ${subject}`,
    ip: req.ip
  });

  return res.json({ success: true, data: grv });
});

// Officer replies to grievance
router.post('/:id/reply', (req: AuthenticatedRequest, res: Response) => {
  const grv = db.grievances.find((g) => g.id === req.params.id);
  if (!grv) {
    return res.status(404).json({ success: false, error: 'Grievance not found.' });
  }

  const { replyText, resolve } = req.body;
  if (!replyText) {
    return res.status(400).json({ success: false, error: 'Reply text is required.' });
  }

  grv.replies.push({
    senderId: req.user!.id,
    senderName: req.user!.name,
    senderRole: req.user!.role,
    message: replyText,
    timestamp: new Date().toISOString()
  });

  if (resolve) {
    grv.status = 'resolved';
  } else {
    grv.status = 'under_review';
  }

  db.commit();

  createNotification({
    userId: grv.studentId,
    type: 'general',
    title: `Officer Response to Grievance: ${grv.subject}`,
    message: `${req.user!.name} (${req.user!.role.toUpperCase()}) replied to your query.`,
    applicationId: grv.applicationId
  });

  return res.json({ success: true, data: grv });
});

export default router;
