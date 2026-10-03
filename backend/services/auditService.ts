import { db } from '../config/db.ts';
import { AuditLog, UserRole } from '../models/types.ts';

export function logAuditEvent(params: {
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  applicationId?: string;
  previousStatus?: string;
  newStatus?: string;
  reason: string;
  ip?: string;
}): AuditLog {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    userName: params.userName,
    role: params.role,
    action: params.action,
    applicationId: params.applicationId,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    reason: params.reason,
    ip: params.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  };

  db.auditLogs.unshift(log);
  db.commit();
  return log;
}
