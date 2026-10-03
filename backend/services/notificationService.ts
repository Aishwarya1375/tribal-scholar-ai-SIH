import { db } from '../config/db.ts';
import { Notification } from '../models/types.ts';

export function createNotification(params: {
  userId: string;
  type: 'status_change' | 'deficiency_raised' | 'deficiency_resolved' | 'selection' | 'general';
  title: string;
  message: string;
  applicationId?: string;
}): Notification {
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    applicationId: params.applicationId,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.notifications.unshift(notif);
  db.commit();
  return notif;
}
