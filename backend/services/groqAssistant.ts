import { db } from '../config/db.ts';

const STRICT_REFUSAL_MESSAGE =
  'This information is not available in the configured scheme data. Please refer to the official scheme guidelines or contact the designated authority.';

export interface AssistantQueryContext {
  userId?: string;
  userRole?: string;
  schemeCode?: 'NFST' | 'NOS';
  applicationId?: string;
}

export async function askGroundedAssistant(query: string, context?: AssistantQueryContext): Promise<{
  answer: string;
  source: string;
  groundedInScheme: boolean;
  modelUsed: string;
}> {
  const cleanQuery = query.trim().toLowerCase();

  // 1. Gather context from DB if student asking about personal status / deficiencies
  let personalContext = '';
  if (context?.userId) {
    const studentApp = db.applications.find((a) => a.studentId === context.userId);
    if (studentApp) {
      const openDeficiencies = db.deficiencies.filter((d) => d.applicationId === studentApp.id && d.status === 'open');
      personalContext = `
Applicant Name: ${studentApp.studentName}
Application ID: ${studentApp.applicationId}
Scheme: ${studentApp.schemeCode}
Current Status: ${studentApp.status}
Workflow Stage: ${studentApp.workflowStage}
Readiness Score: ${studentApp.readinessScore}%
Review Priority: ${studentApp.reviewPriority}
Priority Reasons: ${studentApp.priorityReasons.join('; ')}
Open Deficiencies: ${openDeficiencies.map((d) => `${d.title}: ${d.whatIsWrong}. Required Action: ${d.actionRequired}`).join(' | ') || 'None'}
AI Eligibility Score: ${studentApp.eligibilityResult?.overallScore || 'N/A'}%
AI Recommendation: ${studentApp.eligibilityResult?.recommendedAction || 'None'}
`;
    }
  }

  // 2. Build Scheme Knowledge Base
  const schemes = db.schemes;
  const kbSummary = schemes
    .map((s) => {
      const v = s.versions[0];
      return `
Scheme: ${s.name} (${s.code})
Description: ${s.description}
Programme Scope: ${s.programmeScope}
Rules:
${v.rules.map((r) => `- [${r.ruleCode}] ${r.title}: ${r.description} (Target: ${r.targetValue})`).join('\n')}
Required Documents:
${v.requiredDocuments.map((d) => `- ${d.title}: ${d.description} (Formats: ${d.acceptedFormats.join(', ')})`).join('\n')}
Selection Criteria:
- Academic Weight: ${v.selectionCriteria.academicWeight}%
- Income Weight: ${v.selectionCriteria.incomeWeight}%
- Notes: ${v.selectionCriteria.notes}
`;
    })
    .join('\n---\n');

  // Check if query is explicitly asking for unconfigured / fabricated info
  const unknownTopics = [
    'crypto',
    'bitcoin',
    'cricket',
    'weather in delhi',
    'how to cook',
    'aadhaar linking payment',
    'digilocker api',
    'general category fellowship',
    'sc post matric',
    'obc scholarship'
  ];

  if (unknownTopics.some((topic) => cleanQuery.includes(topic))) {
    return {
      answer: STRICT_REFUSAL_MESSAGE,
      source: 'Official MoTA Guidelines Compliance Guardrail',
      groundedInScheme: false,
      modelUsed: 'MoTA Deterministic Guardrail'
    };
  }

  // Check if Groq API key is present
  const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;

  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      const systemPrompt = `You are the official MoTA (Ministry of Tribal Affairs) Scholarship & Fellowship Assistant for the NFST (National Fellowship for Scheduled Tribe) and NOS (National Overseas Scholarship) schemes.
STRICT POLICY RULES:
1. You may ONLY answer questions using the provided Knowledge Base below and the Applicant's personal context if available.
2. If the user asks about an eligibility percentage, age limit, income limit, score, allowance amount, or deadline that is NOT in the knowledge base, you MUST reply with this EXACT sentence and nothing else:
"${STRICT_REFUSAL_MESSAGE}"
3. Do NOT invent dates, allowances, DigiLocker, Aadhaar or DBT workflows.
4. AI never makes the final decision; human officers always review and decide.
5. If the applicant asks "Why is my application flagged?" or "What is my deficiency?", explain the exact reason from their personal context politely and tell them the required action.
6. Always cite "Source: scheme configuration".

KNOWLEDGE BASE:
${kbSummary}

APPLICANT PERSONAL STATUS CONTEXT:
${personalContext || 'No personal application selected.'}
`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.1,
          max_tokens: 500
        }),
        signal: AbortSignal.timeout(7500)
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return {
            answer: content,
            source: 'Ministry of Tribal Affairs Scheme Configuration (NFST & NOS)',
            groundedInScheme: true,
            modelUsed: 'Groq Llama-3.3-70b'
          };
        }
      }
    } catch (err) {
      console.warn('[Assistant] Groq API timeout or error, falling back to local grounded engine:', err);
    }
  }

  // Local Deterministic Fallback Answer Engine
  if (cleanQuery.includes('flag') || cleanQuery.includes('deficiency') || cleanQuery.includes('why')) {
    if (personalContext && personalContext.includes('Open Deficiencies')) {
      const studentApp = db.applications.find((a) => a.studentId === context?.userId);
      const def = db.deficiencies.find((d) => d.applicationId === studentApp?.id && d.status === 'open');
      if (def) {
        return {
          answer: `Your application (${studentApp?.applicationId}) currently has an active deficiency: "${def.title}". What is wrong: ${def.whatIsWrong}. Required Action: ${def.actionRequired}. Once you upload the corrected document, the automated scrutiny engine will re-evaluate it immediately. (Source: scheme configuration)`,
          source: 'MoTA Application Database & Scheme Workflow',
          groundedInScheme: true,
          modelUsed: 'MoTA Local Knowledge Engine (Fallback Mode)'
        };
      }
    }
  }

  if (cleanQuery.includes('nfst') || cleanQuery.includes('national fellowship')) {
    return {
      answer: `NFST (National Fellowship for Higher Education of ST Students) supports Scheduled Tribe candidates pursuing regular full-time M.Phil and Ph.D. degrees in recognized Indian universities. Configured prototype requirements include ST category certificate, post-graduation marksheet (sample benchmark ≥ 55%), admission confirmation, and family annual income certificate (sample cap ≤ ₹6,00,000/year). (Source: scheme configuration)`,
      source: 'MoTA NFST Scheme Configuration v1.0',
      groundedInScheme: true,
      modelUsed: 'MoTA Local Knowledge Engine'
    };
  }

  if (cleanQuery.includes('nos') || cleanQuery.includes('overseas')) {
    return {
      answer: `NOS (National Overseas Scholarship for ST Candidates) facilitates low-income ST students in pursuing Master's or Ph.D. programmes in accredited foreign universities. Configured requirements include ST certificate, unconditional admission offer from a recognized overseas institution, income verification, and Indian passport. (Source: scheme configuration)`,
      source: 'MoTA NOS Scheme Configuration v1.0',
      groundedInScheme: true,
      modelUsed: 'MoTA Local Knowledge Engine'
    };
  }

  if (cleanQuery.includes('document') || cleanQuery.includes('upload')) {
    return {
      answer: `Mandatory documents for NFST include ST Caste Certificate, Annual Income Certificate, Master's Degree Marksheet, and Ph.D. Admission Letter. All uploads must be PDF or JPG/PNG format under 5 MB. Documents are analyzed by AI extraction for scrutiny verification, but do not replace official verification by designated officers. (Source: scheme configuration)`,
      source: 'MoTA Document Guidelines',
      groundedInScheme: true,
      modelUsed: 'MoTA Local Knowledge Engine'
    };
  }

  return {
    answer: STRICT_REFUSAL_MESSAGE,
    source: 'Official MoTA Policy Guardrail',
    groundedInScheme: false,
    modelUsed: 'MoTA Deterministic Guardrail'
  };
}
