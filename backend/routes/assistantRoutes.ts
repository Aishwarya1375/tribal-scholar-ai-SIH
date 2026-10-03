import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';
import { askGroundedAssistant } from '../services/groqAssistant.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mota-sih-scholarship-secret-key-2026-demo';

router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { query, applicationId } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Query text is required.' });
    }

    // Optional user extraction from token
    let userId: string | undefined;
    let userRole: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as any;
        userId = decoded.id;
        userRole = decoded.role;
      } catch {
        // Continue unauthenticated
      }
    }

    const result = await askGroundedAssistant(query, {
      userId,
      userRole,
      applicationId
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Assistant service temporarily degraded. Fallback active.',
      data: {
        answer:
          'This information is not available in the configured scheme data. Please refer to the official scheme guidelines or contact the designated authority.',
        source: 'MoTA Policy Guardrail (Fallback Mode)',
        groundedInScheme: false,
        modelUsed: 'Deterministic Guardrail'
      }
    });
  }
});

export default router;
