import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.ts';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { User, StudentProfile } from '../models/types.ts';
import { logAuditEvent } from '../services/auditService.ts';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student', mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: role as any,
      name,
      mobile: mobile || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    if (newUser.role === 'student') {
      const profile: StudentProfile = {
        id: `prof_${newUser.id}`,
        userId: newUser.id,
        fullName: newUser.name,
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

    db.commit();

    logAuditEvent({
      userId: newUser.id,
      userName: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      reason: 'New account registered on MoTA Scholarship System',
      ip: req.ip
    });

    const token = generateToken(newUser);
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. Password incorrect.' });
    }

    user.lastLoginAt = new Date().toISOString();
    db.commit();

    const token = generateToken(user);
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const profile = db.studentProfiles.find((p) => p.userId === req.user!.id);
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        mobile: req.user.mobile
      },
      profile: profile || null
    }
  });
});

router.get('/demo-users', (_req: Request, res: Response) => {
  const demoUsers = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  return res.json({ success: true, data: demoUsers });
});

export default router;
