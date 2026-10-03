import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';
import { User, UserRole } from '../models/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'mota-sih-scholarship-secret-key-2026-demo';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check for Bearer token
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Support demo switch header in local testing
  const demoUserId = req.headers['x-demo-user-id'] as string;
  if (!token && demoUserId) {
    const matchedUser = db.users.find((u) => u.id === demoUserId || u.email === demoUserId);
    if (matchedUser) {
      req.user = matchedUser;
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid session or account deactivated.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
}
