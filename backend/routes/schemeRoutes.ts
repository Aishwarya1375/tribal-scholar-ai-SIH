import { Router, Response } from 'express';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest, requireRole } from '../middleware/auth.ts';
import { logAuditEvent } from '../services/auditService.ts';

const router = Router();

// Public / Authenticated read schemes
router.get('/', (_req, res: Response) => {
  res.json({ success: true, data: db.schemes });
});

// Admin update rule configuration -> creates new version
router.put('/:code/rules', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  const { rules, changeSummary } = req.body;

  const scheme = db.schemes.find((s) => s.code === code.toUpperCase());
  if (!scheme) {
    return res.status(404).json({ success: false, error: 'Scheme not found.' });
  }

  const currentVer = scheme.versions.find((v) => v.version === scheme.currentVersion) || scheme.versions[0];
  const newVersionNum = scheme.currentVersion + 1;

  const newVersion = {
    ...currentVer,
    version: newVersionNum,
    effectiveFrom: new Date().toISOString(),
    rules: rules || currentVer.rules,
    updatedBy: `${req.user!.name} (${req.user!.role.toUpperCase()})`,
    changeSummary: changeSummary || `Rules updated by Administrator. Version bumped to v${newVersionNum}.`
  };

  scheme.versions.unshift(newVersion);
  scheme.currentVersion = newVersionNum;

  db.commit();

  logAuditEvent({
    userId: req.user!.id,
    userName: req.user!.name,
    role: req.user!.role,
    action: 'SCHEME_VERSION_CREATED',
    reason: `Created version v${newVersionNum} for ${scheme.code}. ${changeSummary || 'Rules configuration modified.'}`,
    ip: req.ip
  });

  return res.json({
    success: true,
    data: {
      scheme,
      newVersion,
      message: `Scheme ${scheme.code} updated to version ${newVersionNum}. Existing submitted applications preserve their historical version.`
    }
  });
});

export default router;
