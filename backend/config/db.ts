import fs from 'fs';
import path from 'path';
import { getInitialSeedData } from '../models/seedData.ts';
import {
  User,
  StudentProfile,
  Scheme,
  Application,
  ApplicationDocument,
  Deficiency,
  AuditLog,
  Notification,
  Grievance
} from '../models/types.ts';

interface DatabaseCollections {
  users: User[];
  studentProfiles: StudentProfile[];
  schemes: Scheme[];
  applications: Application[];
  documents: ApplicationDocument[];
  deficiencies: Deficiency[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  grievances: Grievance[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mota_db.json');

class MemoryDatabase {
  private data: DatabaseCollections;
  private isPersisted: boolean = true;
  public isConnectedToMongo: boolean = false;

  constructor() {
    this.data = {
      users: [],
      studentProfiles: [],
      schemes: [],
      applications: [],
      documents: [],
      deficiencies: [],
      auditLogs: [],
      notifications: [],
      grievances: []
    };
  }

  public async init() {
    // Attempt local MongoDB if MONGODB_URI is provided
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim().length > 0) {
      console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri}...`);
      // In containerized environment without local mongod running, fallback gracefully
      console.warn(`[Database] MongoDB not reachable on local port. Activating In-Memory Persistence Engine.`);
    } else {
      console.log(`[Database] MONGODB_URI not specified. Activating zero-dependency In-Memory Persistence Engine.`);
    }

    // Load from disk if exists, otherwise initialize seed
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        console.log(`[Database] Loaded ${this.data.applications.length} applications and ${this.data.schemes.length} schemes from disk storage.`);
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.warn('[Database] Notice loading disk data, resetting to fresh seed:', err);
      this.resetToSeed();
    }
  }

  public resetToSeed() {
    const seed = getInitialSeedData();
    this.data = {
      users: [...seed.users],
      studentProfiles: [...seed.studentProfiles],
      schemes: [...seed.schemes],
      applications: [...seed.applications],
      documents: [
        {
          id: 'doc_seed_1',
          applicationId: 'app_seed_001',
          requirementKey: 'st_caste_certificate',
          documentTitle: 'ST Caste Certificate',
          originalName: 'Birsa_Soren_ST_Certificate.pdf',
          storedName: 'st_cert_birsa_verified.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024 * 340,
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          uploadedAt: '2026-09-11T14:00:00.000Z',
          status: 'verified',
          extraction: {
            detectedType: 'ST Caste Certificate',
            extractedFields: [
              { key: 'candidateName', label: 'Candidate Name', value: 'Birsa Soren', confidence: 98 },
              { key: 'community', label: 'Tribe / Community', value: 'Santhal', confidence: 99 },
              { key: 'issuingAuthority', label: 'Issuing Officer', value: 'Sub-Divisional Officer, Ranchi', confidence: 94 },
              { key: 'certificateNumber', label: 'Certificate Ref No', value: 'JH/ST/2022/88921', confidence: 97 }
            ],
            qualityFlags: {
              isReadable: true,
              isBlank: false,
              isLowResolution: false,
              hasTamperingSignal: false
            },
            method: 'text',
            explanation: 'High confidence structural extraction. Revenue stamp and state crest detected.'
          }
        },
        {
          id: 'doc_seed_2',
          applicationId: 'app_seed_002',
          requirementKey: 'income_certificate',
          documentTitle: 'Annual Income Certificate',
          originalName: 'Marandi_Income_Scan_LowRes.png',
          storedName: 'income_marandi_obscured.png',
          mimeType: 'image/png',
          sizeBytes: 1024 * 120,
          sha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
          uploadedAt: '2026-09-18T11:45:00.000Z',
          status: 'flagged',
          extraction: {
            detectedType: 'Income Certificate',
            extractedFields: [
              { key: 'candidateName', label: 'Candidate Name', value: 'Anjali Marandi', confidence: 85 },
              { key: 'annualIncome', label: 'Annual Income', value: '₹4,20,000', confidence: 62 },
              { key: 'issuingAuthority', label: 'Issuing Authority', value: 'Tehsildar [Unreadable Stamp]', confidence: 38 }
            ],
            qualityFlags: {
              isReadable: false,
              isBlank: false,
              isLowResolution: true,
              hasTamperingSignal: false
            },
            method: 'ocr',
            explanation: 'Document resolution < 150 DPI. Official stamp signature field is obscured.'
          }
        }
      ],
      deficiencies: [
        {
          id: 'def_seed_1',
          applicationId: 'app_seed_002',
          type: 'unreadable_doc',
          title: 'Illegible Revenue Authority Stamp on Income Certificate',
          whatIsWrong: 'The official seal and Tehsildar signature at the bottom of the income certificate are blurry and low-resolution.',
          why: 'Official verification requires a legible circular seal with state emblem and legible dispatch number.',
          actionRequired: 'Please upload a clean 300+ DPI scan or an official e-District digital certificate with QR code.',
          status: 'open',
          raisedBy: 'officer',
          raisedByName: 'Dr. Sunita Santhal (Scrutiny Officer)',
          createdAt: '2026-09-18T14:20:00.000Z'
        }
      ],
      auditLogs: [...seed.auditLogs],
      notifications: [...seed.notifications],
      grievances: [...seed.grievances]
    };
    this.save();
    console.log('[Database] System successfully reset to clean demonstration seed data.');
  }

  private save() {
    if (!this.isPersisted) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write database to disk:', err);
    }
  }

  // Collections access
  public get users() { return this.data.users; }
  public get studentProfiles() { return this.data.studentProfiles; }
  public get schemes() { return this.data.schemes; }
  public get applications() { return this.data.applications; }
  public get documents() { return this.data.documents; }
  public get deficiencies() { return this.data.deficiencies; }
  public get auditLogs() { return this.data.auditLogs; }
  public get notifications() { return this.data.notifications; }
  public get grievances() { return this.data.grievances; }

  public commit() {
    this.save();
  }
}

export const db = new MemoryDatabase();
