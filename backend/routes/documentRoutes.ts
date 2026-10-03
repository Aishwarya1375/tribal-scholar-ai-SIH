import { Router, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../config/db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';
import { ApplicationDocument } from '../models/types.ts';
import {
  analyzeDocumentContent,
  detectDuplicateDocument
} from '../services/aiDocumentIntelligence.ts';
import { logAuditEvent } from '../services/auditService.ts';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authMiddleware);

// Get list of provided sample documents for quick demo selection
router.get('/sample-files', (_req: AuthenticatedRequest, res: Response) => {
  const sampleDocsDir = path.resolve(process.cwd(), 'sample-documents');
  const samples = [
    {
      key: 'sample_st_caste_certificate.txt',
      name: 'Valid Santhal ST Certificate (Birsa Soren)',
      category: 'st_caste_certificate',
      description: 'Standard valid Scheduled Tribe document, passes 100% checks.'
    },
    {
      key: 'sample_mismatched_caste_certificate.txt',
      name: 'Mismatched Caste Certificate (Birsa Kumar Sahu)',
      category: 'st_caste_certificate',
      description: 'Intentional mismatch test — triggers RapidFuzz name inconsistency alert.'
    },
    {
      key: 'sample_valid_income_certificate.txt',
      name: 'Valid Income Certificate (₹3,50,000)',
      category: 'income_certificate',
      description: 'Valid circular sealed certificate meeting income criteria.'
    },
    {
      key: 'sample_unreadable_income_certificate.txt',
      name: 'Unreadable / Low-Resolution Income Scan',
      category: 'income_certificate',
      description: 'Intentional deficiency test — triggers low resolution & blurry seal issue.'
    },
    {
      key: 'sample_pg_marksheet.txt',
      name: 'Post-Graduation Marksheet (74.5%)',
      category: 'postgrad_marksheet',
      description: 'Consolidated PG marksheet fulfilling academic percentage benchmark.'
    },
    {
      key: 'sample_phd_admission_letter.txt',
      name: 'Ph.D. Research Admission Letter (Ranchi Univ)',
      category: 'admission_letter',
      description: 'Confirmed full-time Ph.D. registration letter.'
    },
    {
      key: 'sample_foreign_offer_letter.txt',
      name: 'Unconditional Offer (Univ of Edinburgh)',
      category: 'overseas_admission_letter',
      description: 'Unconditional admission letter for NOS scheme.'
    }
  ];

  res.json({ success: true, data: samples });
});

// Upload via regular file upload or sample selection
router.post('/upload', upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId, requirementKey, documentTitle, sampleFileKey } = req.body;

    if (!applicationId || !requirementKey) {
      return res.status(400).json({ success: false, error: 'applicationId and requirementKey are required.' });
    }

    const app = db.applications.find((a) => a.id === applicationId || a.applicationId === applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    let fileBuffer: Buffer;
    let originalName: string;
    let mimeType = 'text/plain';

    if (sampleFileKey) {
      const samplePath = path.resolve(process.cwd(), 'sample-documents', sampleFileKey);
      if (fs.existsSync(samplePath)) {
        fileBuffer = fs.readFileSync(samplePath);
        originalName = sampleFileKey;
      } else {
        fileBuffer = Buffer.from(`Sample document content for ${sampleFileKey}`, 'utf-8');
        originalName = sampleFileKey;
      }
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      originalName = req.file.originalname;
      mimeType = req.file.mimetype;
    } else {
      return res.status(400).json({ success: false, error: 'No file or sampleFileKey provided.' });
    }

    // Run AI Document Intelligence
    const analysis = analyzeDocumentContent(
      originalName,
      fileBuffer,
      requirementKey,
      app.studentName
    );

    // Duplicate Detection Check
    const duplicateCheck = detectDuplicateDocument(analysis.sha256, app.id);
    if (duplicateCheck.isDuplicate) {
      analysis.issues.push(`Duplicate Document Alert: ${duplicateCheck.reason}`);
      analysis.qualityFlags.hasTamperingSignal = true;
      analysis.recommendedAction = 'Flagged for Officer Review: Duplicate document reused across applicants.';
      app.anomalyFlags.push(duplicateCheck.reason!);
    }

    // Remove old upload for this requirement if re-uploading
    const existingDocIndex = db.documents.findIndex(
      (d) => d.applicationId === app.id && d.requirementKey === requirementKey
    );

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: ApplicationDocument = {
      id: docId,
      applicationId: app.id,
      requirementKey,
      documentTitle: documentTitle || requirementKey,
      originalName,
      storedName: `${docId}_${originalName}`,
      mimeType,
      sizeBytes: fileBuffer.length,
      sha256: analysis.sha256,
      uploadedAt: new Date().toISOString(),
      status: analysis.issues.length > 0 ? 'flagged' : 'analyzed',
      extraction: {
        detectedType: analysis.detectedType,
        extractedFields: analysis.extractedFields,
        qualityFlags: analysis.qualityFlags,
        method: analysis.method,
        explanation: analysis.explanation
      }
    };

    if (existingDocIndex >= 0) {
      db.documents[existingDocIndex] = newDoc;
    } else {
      db.documents.push(newDoc);
    }

    // Recalculate readiness
    const scheme = db.schemes.find((s) => s.code === app.schemeCode);
    const requiredDocs = scheme?.versions[0]?.requiredDocuments || [];
    const uploadedDocs = db.documents.filter((d) => d.applicationId === app.id).length;
    const docsRatio = requiredDocs.length > 0 ? uploadedDocs / requiredDocs.length : 0;
    app.readinessScore = Math.round(50 + docsRatio * 50);
    app.updatedAt = new Date().toISOString();

    db.commit();

    logAuditEvent({
      userId: req.user!.id,
      userName: req.user!.name,
      role: req.user!.role,
      action: 'DOCUMENT_UPLOADED',
      applicationId: app.applicationId,
      reason: `Uploaded ${requirementKey} (${originalName}). AI confidence: ${analysis.confidence}%. ${analysis.issues.length} issue(s) detected.`,
      ip: req.ip
    });

    return res.json({
      success: true,
      data: {
        document: newDoc,
        analysis,
        duplicateWarning: duplicateCheck.isDuplicate ? duplicateCheck.reason : null,
        label: 'Extracted information — not proof of authenticity'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Document processing error.' });
  }
});

// Get document details
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const doc = db.documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, error: 'Document not found.' });
  }

  res.json({
    success: true,
    data: {
      ...doc,
      label: 'Extracted information — not proof of authenticity'
    }
  });
});

export default router;
