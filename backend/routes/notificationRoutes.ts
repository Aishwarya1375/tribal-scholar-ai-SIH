import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authMiddleware);

// Get user notifications
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.notifications.filter((n) => n.userId === req.user!.id);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    data: {
      notifications: notifs,
      unreadCount
    }
  });
});

// Mark single notification read
router.put('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user!.id);
  if (notif) {
    notif.isRead = true;
    db.commit();
  }
  res.json({ success: true, data: notif });
});

// Mark all read
router.put('/read-all', (req: AuthenticatedRequest, res: Response) => {
  db.notifications
    .filter((n) => n.userId === req.user!.id)
    .forEach((n) => {
      n.isRead = true;
    });
  db.commit();
  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
