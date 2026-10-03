import bcrypt from 'bcryptjs';
import { User, StudentProfile, Scheme, Application, AuditLog, Notification, Grievance } from './types.ts';

const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo@12345', 10);

export function getInitialSeedData() {
  const users: User[] = [
    {
      id: 'usr_student_1',
      email: 'student@demo.in',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'student',
      name: 'Birsa Soren',
      mobile: '+91 98765 43210',
      isActive: true,
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'usr_student_2',
      email: 'student2@demo.in',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'student',
      name: 'Anjali Marandi',
      mobile: '+91 98765 43211',
      isActive: true,
      createdAt: '2026-09-02T10:00:00.000Z'
    },
    {
      id: 'usr_verifier_1',
      email: 'verifier@demo.in',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'verifier',
      name: 'Sanjay Oraon',
      mobile: '+91 98765 43212',
      isActive: true,
      createdAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 'usr_officer_1',
      email: 'officer@demo.in',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'officer',
      name: 'Dr. Sunita Santhal',
      mobile: '+91 98765 43213',
      isActive: true,
      createdAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 'usr_admin_1',
      email: 'admin@demo.in',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'admin',
      name: 'Rajesh Gond',
      mobile: '+91 98765 43214',
      isActive: true,
      createdAt: '2026-08-01T09:00:00.000Z'
    }
  ];

  const studentProfiles: StudentProfile[] = [
    {
      id: 'prof_student_1',
      userId: 'usr_student_1',
      fullName: 'Birsa Soren',
      dob: '2000-07-15',
      gender: 'Male',
      stCommunity: 'Santhal',
      stateOfDomicile: 'Jharkhand',
      district: 'Ranchi',
      pincode: '834001',
      familyAnnualIncome: 350000,
      highestQualification: 'Post Graduation (M.Sc. Tribal Studies)',
      academicScorePercentage: 74.5,
      institutionName: 'Ranchi University, Jharkhand',
      bankAccountNumber: 'XXXXXX4892',
      ifscCode: 'SBIN0001234',
      updatedAt: '2026-09-10T12:00:00.000Z'
    },
    {
      id: 'prof_student_2',
      userId: 'usr_student_2',
      fullName: 'Anjali Marandi',
      dob: '1999-11-22',
      gender: 'Female',
      stCommunity: 'Munda',
      stateOfDomicile: 'Odisha',
      district: 'Mayurbhanj',
      pincode: '757001',
      familyAnnualIncome: 420000,
      highestQualification: 'Master of Technology (Computer Science)',
      academicScorePercentage: 81.2,
      institutionName: 'National Institute of Technology Rourkela',
      bankAccountNumber: 'XXXXXX7721',
      ifscCode: 'PUNB0005678',
      updatedAt: '2026-09-12T12:00:00.000Z'
    }
  ];

  const schemes: Scheme[] = [
    {
      id: 'scheme_nfst',
      code: 'NFST',
      name: 'National Fellowship for ST Students',
      fullName: 'National Fellowship for Higher Education of ST Students (NFST)',
      description: 'Provides fellowship support to Scheduled Tribe candidates pursuing regular and full-time M.Phil / Ph.D. degrees in Science, Humanities, Social Science, and Engineering within recognized Indian universities/institutes.',
      programmeScope: 'Eligible regular M.Phil and Ph.D. research programmes in recognized Indian Universities/Institutes.',
      isSampleData: true,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          updatedBy: 'MoTA Administrative Policy Desk',
          changeSummary: 'Initial prototype scheme baseline configuration with sample rules.',
          rules: [
            {
              id: 'nfst_r_caste',
              ruleCode: 'NFST-RULE-01',
              title: 'ST Category Verification',
              description: 'Candidate must belong to a Scheduled Tribe community notified by the Government of India.',
              category: 'caste',
              operator: 'eq',
              field: 'stCommunityValid',
              targetValue: true,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nfst_r_qual',
              ruleCode: 'NFST-RULE-02',
              title: 'Post-Graduation Academic Benchmark',
              description: 'Candidate must have cleared qualifying Master’s degree (Sample benchmark: ≥ 55% marks).',
              category: 'qualification',
              operator: 'gte',
              field: 'postGradPercentage',
              targetValue: 55,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nfst_r_admission',
              ruleCode: 'NFST-RULE-03',
              title: 'Research Programme Admission',
              description: 'Confirmed full-time registration in an approved M.Phil / Ph.D. programme at a UGC/Govt recognized institute.',
              category: 'admission',
              operator: 'eq',
              field: 'admissionConfirmed',
              targetValue: true,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nfst_r_income',
              ruleCode: 'NFST-RULE-04',
              title: 'Annual Family Income Cap (Prototype Rule)',
              description: 'Sample rule: Family income threshold verification (configurable, prototype baseline ≤ ₹6,00,000/year).',
              category: 'income',
              operator: 'lte',
              field: 'familyAnnualIncome',
              targetValue: 600000,
              isSampleData: true,
              severity: 'review'
            }
          ],
          requiredDocuments: [
            {
              key: 'st_caste_certificate',
              title: 'ST Caste Certificate',
              description: 'Valid Scheduled Tribe certificate issued by competent revenue authority (Tehsildar/SDM/Collector).',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_st_caste_certificate.pdf'
            },
            {
              key: 'income_certificate',
              title: 'Annual Income Certificate',
              description: 'Current financial year family income certificate from authorized executive magistrate.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_income_certificate.pdf'
            },
            {
              key: 'postgrad_marksheet',
              title: 'Master’s Degree Consolidated Marksheet / Degree',
              description: 'Mark statement showing minimum required percentage in relevant post-graduate discipline.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_pg_marksheet.pdf'
            },
            {
              key: 'admission_letter',
              title: 'Ph.D. / M.Phil Admission Offer & Joining Letter',
              description: 'Official letter from Registrar/Dean verifying full-time research registration.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_phd_admission_letter.pdf'
            }
          ],
          selectionCriteria: {
            academicWeight: 60,
            incomeWeight: 20,
            researchProposalWeight: 20,
            notes: 'Weighted composite score generated for committee review; final decision requires human committee authorization.'
          },
          workflowStages: [
            'Registration & Draft',
            'Submission & AI Document Scrutiny',
            'Deficiency Resolution',
            'Verification Officer Review',
            'Selection Committee Review',
            'Award Sanction & Post-Selection Onboarding'
          ]
        }
      ]
    },
    {
      id: 'scheme_nos',
      code: 'NOS',
      name: 'National Overseas Scholarship for ST Candidates',
      fullName: 'National Overseas Scholarship for ST Candidates (NOS)',
      description: 'Facilitates low-income Scheduled Tribe candidates in obtaining higher education abroad (Master level courses and Ph.D.) in top-ranked accredited foreign universities.',
      programmeScope: 'Eligible regular Master’s and Ph.D. degree courses in top accredited international institutions.',
      isSampleData: true,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          updatedBy: 'MoTA Overseas Division Policy Desk',
          changeSummary: 'Initial prototype scheme baseline configuration with sample rules.',
          rules: [
            {
              id: 'nos_r_caste',
              ruleCode: 'NOS-RULE-01',
              title: 'ST Category Verification',
              description: 'Candidate must belong to a Scheduled Tribe community notified by the Government of India.',
              category: 'caste',
              operator: 'eq',
              field: 'stCommunityValid',
              targetValue: true,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nos_r_qual',
              ruleCode: 'NOS-RULE-02',
              title: 'Qualifying Degree Percentage',
              description: 'Minimum 55% marks or equivalent grade in the relevant qualifying degree (Sample prototype rule).',
              category: 'qualification',
              operator: 'gte',
              field: 'qualifyingPercentage',
              targetValue: 55,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nos_r_income',
              ruleCode: 'NOS-RULE-03',
              title: 'Family Income Limitation (Sample Prototype Rule)',
              description: 'Total family income must not exceed configured threshold (Sample prototype value: ≤ ₹6,00,000/year).',
              category: 'income',
              operator: 'lte',
              field: 'familyAnnualIncome',
              targetValue: 600000,
              isSampleData: true,
              severity: 'blocking'
            },
            {
              id: 'nos_r_offer',
              ruleCode: 'NOS-RULE-04',
              title: 'Unconditional Admission Offer from Foreign University',
              description: 'Candidate must have secured unconditional admission to a recognized overseas university.',
              category: 'admission',
              operator: 'eq',
              field: 'overseasOfferUnconditional',
              targetValue: true,
              isSampleData: true,
              severity: 'blocking'
            }
          ],
          requiredDocuments: [
            {
              key: 'st_caste_certificate',
              title: 'ST Caste Certificate',
              description: 'Valid Scheduled Tribe certificate issued by competent authority.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_st_caste_certificate.pdf'
            },
            {
              key: 'income_certificate',
              title: 'Annual Income Certificate / ITR',
              description: 'Competent authority certificate / employer computation of family income.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_income_certificate.pdf'
            },
            {
              key: 'overseas_admission_letter',
              title: 'Unconditional Offer Letter from Foreign University',
              description: 'Formal admission offer stating tuition fees, programme dates, and course of study.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_foreign_offer_letter.pdf'
            },
            {
              key: 'passport_copy',
              title: 'Valid Indian Passport (Front & Back Pages)',
              description: 'Valid passport copy verifying Indian citizenship.',
              isRequired: true,
              acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
              maxSizeMB: 5,
              isSampleData: true,
              sampleFileName: 'sample_passport.pdf'
            }
          ],
          selectionCriteria: {
            academicWeight: 50,
            incomeWeight: 20,
            researchProposalWeight: 30,
            notes: 'Global QS/THE university ranking tier provides positive weighting in composite index.'
          },
          workflowStages: [
            'Registration & Draft',
            'Submission & AI Document Scrutiny',
            'Deficiency Resolution',
            'Verification Officer Review',
            'Selection Committee Review',
            'Provisional Award Letter Issuance'
          ]
        }
      ]
    }
  ];

  const applications: Application[] = [
    {
      id: 'app_seed_001',
      applicationId: 'NFST-2026-0001',
      studentId: 'usr_student_1',
      studentName: 'Birsa Soren',
      studentEmail: 'student@demo.in',
      schemeCode: 'NFST',
      schemeVersion: 1,
      responses: {
        researchTitle: 'Socio-economic Empowerment and Sustainable Livelihood Models among Santhal Tribes',
        researchDiscipline: 'Tribal Studies & Anthropology',
        admissionStatus: 'Confirmed',
        admissionConfirmed: true,
        universityName: 'Ranchi University, Jharkhand',
        postGradPercentage: 74.5,
        familyAnnualIncome: 350000,
        stCommunityValid: true,
        tenureYears: 5
      },
      status: 'under_scrutiny',
      workflowStage: 'Verification Officer Review',
      readinessScore: 100,
      reviewPriority: 'routine',
      priorityReasons: ['All 4 mandatory documents uploaded', 'AI consistency check passed (96% match)'],
      anomalyFlags: [],
      eligibilityResult: {
        status: 'Eligible',
        overallScore: 88,
        evaluations: [
          {
            ruleCode: 'NFST-RULE-01',
            title: 'ST Category Verification',
            passed: true,
            status: 'passed',
            message: 'ST Community Santhal verified against central notification list.',
            field: 'stCommunityValid',
            actualValue: true,
            expectedValue: true
          },
          {
            ruleCode: 'NFST-RULE-02',
            title: 'Post-Graduation Academic Benchmark',
            passed: true,
            status: 'passed',
            message: 'Marks (74.5%) satisfy the ≥ 55% academic threshold.',
            field: 'postGradPercentage',
            actualValue: 74.5,
            expectedValue: 55
          },
          {
            ruleCode: 'NFST-RULE-03',
            title: 'Research Programme Admission',
            passed: true,
            status: 'passed',
            message: 'Admission confirmed at Ranchi University (Recognized State University).',
            field: 'admissionConfirmed',
            actualValue: true,
            expectedValue: true
          },
          {
            ruleCode: 'NFST-RULE-04',
            title: 'Annual Family Income Cap (Prototype Rule)',
            passed: true,
            status: 'passed',
            message: 'Annual income ₹3,50,000 is within prototype cap of ₹6,00,000.',
            field: 'familyAnnualIncome',
            actualValue: 350000,
            expectedValue: 600000
          }
        ],
        explanation: [
          'Document OCR extraction verified consistency across Caste Certificate and Master’s Degree Marksheet.',
          'Cross-document name similarity score: 98.4% (Birsa Soren).',
          'All deterministic policy conditions satisfied.'
        ],
        issues: [],
        recommendedAction: 'Recommended for officer approval to Committee Shortlist.',
        source: 'ai',
        calculatedAt: '2026-09-15T11:30:00.000Z'
      },
      statusHistory: [
        {
          status: 'draft',
          changedAt: '2026-09-10T10:00:00.000Z',
          changedBy: 'Birsa Soren',
          role: 'student',
          remarks: 'Application draft created.'
        },
        {
          status: 'submitted',
          changedAt: '2026-09-15T11:20:00.000Z',
          changedBy: 'Birsa Soren',
          role: 'student',
          remarks: 'Application submitted with all 4 verified documents.'
        },
        {
          status: 'under_scrutiny',
          changedAt: '2026-09-15T11:30:00.000Z',
          changedBy: 'System AI Scrutiny Engine',
          role: 'system',
          remarks: 'Automated document extraction completed with 88% confidence.'
        }
      ],
      createdAt: '2026-09-10T10:00:00.000Z',
      updatedAt: '2026-09-15T11:30:00.000Z'
    },
    {
      id: 'app_seed_002',
      applicationId: 'NOS-2026-0002',
      studentId: 'usr_student_2',
      studentName: 'Anjali Marandi',
      studentEmail: 'student2@demo.in',
      schemeCode: 'NOS',
      schemeVersion: 1,
      responses: {
        courseTitle: 'M.Sc. in Advanced Artificial Intelligence & Data Systems',
        foreignUniversity: 'University of Edinburgh, United Kingdom',
        qsWorldRanking: 22,
        admissionConfirmed: true,
        overseasOfferUnconditional: true,
        qualifyingPercentage: 81.2,
        familyAnnualIncome: 420000,
        stCommunityValid: true,
        visaStatus: 'Pending Award Letter'
      },
      status: 'deficiency_raised',
      workflowStage: 'Deficiency Resolution',
      readinessScore: 75,
      reviewPriority: 'priority',
      priorityReasons: [
        'Deficiency raised: Document unreadable / stamp obscured on Income Certificate',
        'Top 50 QS Ranked institution candidate'
      ],
      anomalyFlags: ['Income certificate scan has faint stamp / blurred issuing authority signature.'],
      eligibilityResult: {
        status: 'Deficient',
        overallScore: 65,
        evaluations: [
          {
            ruleCode: 'NOS-RULE-01',
            title: 'ST Category Verification',
            passed: true,
            status: 'passed',
            message: 'ST Certificate verified.',
            field: 'stCommunityValid',
            actualValue: true,
            expectedValue: true
          },
          {
            ruleCode: 'NOS-RULE-02',
            title: 'Qualifying Degree Percentage',
            passed: true,
            status: 'passed',
            message: 'Percentage 81.2% exceeds required 55%.',
            field: 'qualifyingPercentage',
            actualValue: 81.2,
            expectedValue: 55
          },
          {
            ruleCode: 'NOS-RULE-03',
            title: 'Family Income Limitation (Sample Prototype Rule)',
            passed: false,
            status: 'warning',
            message: 'Income document authenticity requires re-upload with clear issuing seal.',
            field: 'familyAnnualIncome',
            actualValue: 420000,
            expectedValue: 600000
          },
          {
            ruleCode: 'NOS-RULE-04',
            title: 'Unconditional Admission Offer from Foreign University',
            passed: true,
            status: 'passed',
            message: 'Unconditional offer confirmed from University of Edinburgh.',
            field: 'overseasOfferUnconditional',
            actualValue: true,
            expectedValue: true
          }
        ],
        explanation: [
          'High academic profile (81.2%, NIT Rourkela) and confirmed top-tier international admission.',
          'Quality issue detected: Income certificate page 1 has low contrast and illegible tehsildar seal.'
        ],
        issues: ['Income certificate scan resolution below 150 DPI with unreadable authority seal.'],
        recommendedAction: 'Student must upload a clear, high-resolution copy of the Income Certificate.',
        source: 'ai',
        calculatedAt: '2026-09-18T14:15:00.000Z'
      },
      statusHistory: [
        {
          status: 'submitted',
          changedAt: '2026-09-18T12:00:00.000Z',
          changedBy: 'Anjali Marandi',
          role: 'student',
          remarks: 'Submitted for NOS scheme scrutiny.'
        },
        {
          status: 'deficiency_raised',
          changedAt: '2026-09-18T14:20:00.000Z',
          changedBy: 'Dr. Sunita Santhal',
          role: 'officer',
          remarks: 'Income Certificate scan is illegible. Please re-upload with clear seal.'
        }
      ],
      createdAt: '2026-09-18T11:00:00.000Z',
      updatedAt: '2026-09-18T14:20:00.000Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log_001',
      userId: 'usr_student_1',
      userName: 'Birsa Soren',
      role: 'student',
      action: 'APPLICATION_SUBMITTED',
      applicationId: 'NFST-2026-0001',
      previousStatus: 'draft',
      newStatus: 'submitted',
      reason: 'Applicant completed all fields and uploaded required ST & academic documents.',
      ip: '127.0.0.1',
      timestamp: '2026-09-15T11:20:00.000Z'
    },
    {
      id: 'log_002',
      userId: 'usr_officer_1',
      userName: 'Dr. Sunita Santhal',
      role: 'officer',
      action: 'DEFICIENCY_RAISED',
      applicationId: 'NOS-2026-0002',
      previousStatus: 'submitted',
      newStatus: 'deficiency_raised',
      reason: 'Income certificate document low resolution with obscured official seal.',
      ip: '127.0.0.1',
      timestamp: '2026-09-18T14:20:00.000Z'
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_001',
      userId: 'usr_student_1',
      type: 'status_change',
      title: 'Application Under Scrutiny',
      message: 'Your application NFST-2026-0001 has passed automated AI document intake and is queued for verification review.',
      applicationId: 'NFST-2026-0001',
      isRead: false,
      createdAt: '2026-09-15T11:30:00.000Z'
    },
    {
      id: 'notif_002',
      userId: 'usr_student_2',
      type: 'deficiency_raised',
      title: 'Action Required: Clarification on Income Certificate',
      message: 'Officer Dr. Sunita Santhal has raised a deficiency regarding low scan contrast on your income certificate. Please re-upload.',
      applicationId: 'NOS-2026-0002',
      isRead: false,
      createdAt: '2026-09-18T14:20:00.000Z'
    }
  ];

  const grievances: Grievance[] = [
    {
      id: 'grv_001',
      studentId: 'usr_student_2',
      studentName: 'Anjali Marandi',
      applicationId: 'NOS-2026-0002',
      subject: 'Clarification regarding income certificate re-upload timeline',
      message: 'Respected Officer, I have obtained a freshly stamped digital e-district income certificate. How soon will my status update once re-uploaded?',
      status: 'submitted',
      createdAt: '2026-09-18T15:00:00.000Z',
      replies: [
        {
          senderId: 'usr_officer_1',
          senderName: 'Dr. Sunita Santhal',
          senderRole: 'officer',
          message: 'The AI re-verification runs immediately upon upload, and your file will be prioritized on my scrutiny queue within 24 hours.',
          timestamp: '2026-09-18T16:10:00.000Z'
        }
      ]
    }
  ];

  return {
    users,
    studentProfiles,
    schemes,
    applications,
    auditLogs,
    notifications,
    grievances
  };
}
