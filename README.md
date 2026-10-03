# MoTA AI-Enabled Scholarship & Fellowship Management System
### Smart India Hackathon (SIH) Prototype • Ministry of Tribal Affairs (MoTA)

A production-grade, demo-ready localhost prototype developed for the Ministry of Tribal Affairs (MoTA) problem statement under the Smart India Hackathon. The system addresses critical administrative pain points in fellowship scrutiny—manual paperwork, repetitive correspondence, prolonged verification delays, fragmented workflows, and lack of real-time visibility—for Scheduled Tribe (ST) students.

The platform provides end-to-end coverage for the two official flagship schemes specified by the Ministry:
1. **NFST** — National Fellowship for Higher Education of ST Students *(regular and full-time M.Phil and Ph.D. degrees in recognized Indian universities)*
2. **NOS** — National Overseas Scholarship for ST Candidates *(eligible Master’s and Ph.D. degree programmes abroad)*

---

## 🏛️ Core Constitutional & Administrative Principle

```
Configured rules + AI assistance → recommendation + explanation + confidence → HUMAN REVIEW → final administrative decision
```

1. **AI Never Makes the Final Decision**: Statutory rules stay strictly separate from machine learning signals. The AI extracts information and highlights potential inconsistencies; designated Ministry officers retain sole decision-making authority.
2. **Assistive Extraction**: Optical Character Recognition (OCR) and document intelligence extract text and structured fields for officer convenience. All extraction cards are explicitly badged:
   > *"Extracted information — not proof of authenticity"*
3. **Strict Data Safety Rule**: Where official guidelines do not prescribe specific figures, the system utilizes configurable parameters marked `isSampleData: true` with a visible **"Sample / Prototype Data"** indicator. No arbitrary percentages, allowances, or official government workflows are invented.

---

## ⚡ 3-Step Setup Guide

The application is engineered for zero-friction setup on localhost with zero external cloud or paid database dependencies.

### Step 1: Install Dependencies
```bash
npm run setup
```
*(Runs `npm install` to install all full-stack dependencies).*

### Step 2: Seed Prototype Database
```bash
npm run seed
```
*(Idempotently populates initial scheme baselines for NFST & NOS, 5 demo personas, sample applications across varied lifecycle stages, and audit logs).*

### Step 3: Launch Full-Stack Server
```bash
npm run dev
```
*(Starts Express and the interactive Vite application together on **http://localhost:3000**).*

- **Backend Health Check**: `http://localhost:3000/api/health`
- **AI Intelligence Service Health Check**: `http://localhost:3000/ai/health`

---

## 🛡️ Reliability & Resilience Architecture

The system strictly adheres to the hackathon reliability requirements to guarantee that live presentations never crash or throw stack traces:

| Reliability Requirement | Implementation Strategy | Failover Behavior |
| :--- | :--- | :--- |
| **Zero Database Dependency** | Checks `process.env.MONGODB_URI` for an active MongoDB instance. | If MongoDB is unavailable or uninstalled, automatically activates the built-in **In-Memory & File-Persisted Storage Engine** (`data/mota_db.json`). Zero terminal crashes. |
| **AI Service Graceful Degradation** | Integrates Groq Llama-3.3-70b (`gsk_...`) for grounded reasoning alongside local structural parsers. | If network drops or requests exceed $8\text{s}$, seamlessly degrades to the built-in **Deterministic Local Knowledge Analyzer**. The UI displays *"Analysed in fallback mode"*. |
| **OCR Graceful Degradation** | Parses embedded structural text $\to$ regex heuristic extractor $\to$ simulated OCR parser. | Never crashes if native Tesseract binaries are missing. Fallback extracts all fields with confidence scores from provided sample documents. |
| **Offline Capability** | All CSS (Tailwind), icons (Lucide), fonts, and JavaScript assets are bundled locally in the repository. | Functions 100% offline without internet access. |
| **Idempotent Data Reset** | Standalone script (`npm run seed`) resets all collections to an immaculate state in $<2$ seconds. | Includes a 1-click **"Reset Data"** button in the UI for administrators to reset state between demo runs. |

---

## 🏗️ Architectural Choices Across Build Phases (Phases 0–12)

### Phase 0: Skeleton & Dual Health Endpoints
- **Express + Vite Full-Stack Entrypoint** (`server.ts`): Express manages all `/api/*` REST endpoints and mounts Vite dev server middlewares (`vite.middlewares`) directly on port 3000.
- **Health Endpoints**: `/api/health` reports database persistence mode; `/ai/health` reports document intelligence engine readiness.

### Phase 1: Auth & Role-Based Access Control
- **Roles Implemented**: Strictly the 4 authorized roles: `student`, `verifier`, `officer`, `admin`.
- **Security**: Password hashing via `bcryptjs`, stateless session validation via `jsonwebtoken` (JWT), and route-level authorization middleware (`requireRole`).

### Phase 2: Scheme Engine & Versioned Policy Rules
- **Schemes Collection**: Versioned schema configuration for NFST and NOS containing `rules[]`, `requiredDocuments[]`, `selectionCriteria`, and `workflowStages[]`.
- **Immutable Policy Versioning**: When an administrator updates a rule (e.g., minimum percentage benchmark or income ceiling), the engine creates version `v2`. Existing submitted applications stay anchored to the historical version (`v1`) under which they were submitted.

### Phase 3: Dynamic Application Form & Readiness Meter
- **Dynamic Form Generation**: Form steps, fields, and document requirements adapt automatically to the active version of the selected scheme.
- **Application Readiness Meter**: Real-time progress bar ($0\text{--}100\%$) tracking completed fields and mandatory documents, providing applicants with a clear checklist of missing items before submission.

### Phase 4: Document Intelligence & Cross-Document Consistency
- **Intake Pipeline**: Multi-part upload with MIME type, extension, and SHA-256 cryptographic hashing.
- **Extraction Inspector**: Detects document type (`ST Caste Certificate`, `Annual Income Certificate`, `Master's Marksheet`, `Admission Letter`, `Foreign Offer Letter`), extracting fields with per-field confidence percentages ($0\text{--}100\%$).
- **Cross-Document Consistency**: Uses Levenshtein distance string similarity to cross-reference candidate names across caste certificates and academic marksheets, flagging discrepancies.

### Phase 5: Deterministic Eligibility & 3-Part Deficiency Loop
- **Deterministic Rule Engine**: Pure rule-based evaluation (no black-box ML for statutory checks) outputting `Eligible | Ineligible | Deficient | Manual Review`.
- **Structured Deficiency Engine**: Generates deficiency records with three essential components:
  1. *What is wrong* (e.g., blurred authority stamp)
  2. *Why it is required* (e.g., statutory circular seal needed for revenue verification)
  3. *Exact action to take* (e.g., upload 300+ DPI scan or digital e-District certificate)
- **Auto-Revalidation**: Student upload triggers instant re-scrutiny; resolving the deficiency automatically advances the file back to the officer queue with priority status.

### Phase 6: Human-in-the-Loop Scrutiny & Append-Only Audit Trail
- **Workload Prioritization**: Queue orders files into `Priority Scrutiny` (resubmissions/issues), `Manual Review` (borderline criteria), and `Routine Intake`. It only orders workload—never makes decisions.
- **Split-Screen Scrutiny Console**:
  - *Left Panel*: Interactive document viewer, extracted attributes, quality flags, and confidence indicators.
  - *Right Panel*: Itemized rule pass/fail breakdown ($\checkmark$ / $\triangle$ / $\times$), anomaly alerts, and decision drawer.
- **Administrative Actions**: *Approve*, *Raise Deficiency*, *Request Senior Review*, *Reject-with-reason*.
- **Append-Only Audit Log**: Every state change records `userId`, `role`, `action`, `applicationId`, `previousStatus`, `newStatus`, `reason`, `ip`, and `timestamp`. Updates and deletes are prohibited.

### Phase 7: Real-Time Tracking & Polling Notifications
- **Vertical Visual Timeline**: Stages displayed chronologically with distinct indicators for Completed ($\checkmark$), In-Progress, and Deficiency ($\triangle$).
- **In-App Notification Center**: Auto-polls every $10\text{s}$ (lightweight, zero WebSocket overhead) alerting users immediately on status changes, deficiency notices, and officer decisions.

### Phase 8: Real-Time Admin Analytics & KPI Aggregation
- **Live Aggregation**: KPI cards and pipeline lifecycle funnels calculated via direct aggregation queries over database collections. Numbers update dynamically when applications are submitted or approved.
- **Workload Analytics**: Displays scheme distribution, verification outcome percentages, and priority queue splits.

### Phase 9: Cryptographic Duplicate & Anomaly Detection
- **SHA-256 Collision Check**: Detects identical document reuse across different applicant accounts.
- **Neutral Language Mandate**: Issues are reported neutrally (e.g., *"Potential inconsistency detected — manual review required"*). Accusatory terms like "fraud" or "fake" are strictly forbidden.

### Phase 10: Grounded MoTA AI Scheme Assistant
- **Strict Grounding**: Integrates Groq Llama-3.3-70b with a local Retrieval-Augmented Generation (RAG) knowledge base built exclusively from scheme policy guidelines and FAQs.
- **Mandatory Policy Refusal Guardrail**: If asked about an unconfigured rule, allowance, or unknown topic, the assistant responds verbatim:
  > *"This information is not available in the configured scheme data. Please refer to the official scheme guidelines or contact the designated authority."*
- **Personalized Context Awareness**: Dynamically explains the logged-in student's specific deficiencies and status directly from their database records.

### Phase 11: Selection Support & Post-Selection Onboarding
- **Selection Committee Console**: Generates a weighted composite index based on configurable scheme parameters (Academic Benchmark: $60\%$, Income Social Support: $40\%$).
- **Audited Manual Override**: Committee members can adjust rank order, but must provide an administrative override justification that is permanently written to the audit log.
- **Post-Selection Checklist**: Tracks provisional award status, fellowship acceptance, university joining verification, and periodic research progress reports.

### Phase 12: Polish, Mobile Accessibility & Design System
- **Government Design System**: Deep Navy (`#0B2447`), Saffron accents (`#F59E0B`), India Green (`#138808`), and Ashoka Chakra blue highlights.
- **Mobile-First Responsive Layout**: Verified at $375\text{ px}$ width with bottom navigation for complete student mobile workflows.

---

## 👥 Seeded Demo Accounts (Password: `Demo@12345`)

Use the 1-Click **"Demo Persona"** switcher in the top navigation bar to switch between any role instantly:

| Persona | Role | Email | Demonstration Scenario |
| :--- | :--- | :--- | :--- |
| **Birsa Soren** | Student | `student@demo.in` | Eligible candidate applying for NFST; tests dynamic form, readiness meter, and document OCR. |
| **Anjali Marandi** | Student (Test 2) | `student2@demo.in` | NOS applicant with active deficiency; tests the Deficiency Action Center and duplicate detection. |
| **Sanjay Oraon** | Verifier | `verifier@demo.in` | Front-desk scrutiny assistant checking document quality. |
| **Dr. Sunita Santhal** | Scrutiny Officer | `officer@demo.in` | Scrutinizes files in split-screen console, approves applications, and raises official deficiencies. |
| **Rajesh Gond** | Administrator | `admin@demo.in` | Inspects live KPI analytics, creates scheme rule versions ($v1 \to v2$), and audits system logs. |

---

## 📂 Sample Demonstration Documents (`/sample-documents/`)

| Filename | Purpose in Demo | Expected System Result |
| :--- | :--- | :--- |
| `sample_st_caste_certificate.txt` | Standard ST Certificate | Verified ST Status, Name: Birsa Soren, Tribe: Santhal (Confidence: $98\%$). |
| `sample_mismatched_caste_certificate.txt` | Cross-Document Consistency Test | Triggers warning: *Potential Name Inconsistency (Birsa Kumar Sahu vs Birsa Soren, 54% similarity)*. |
| `sample_unreadable_income_certificate.txt` | Deficiency Engine Test | Triggers quality issue: *Low resolution / illegible circular seal*, raising a structured deficiency. |
| `sample_valid_income_certificate.txt` | Valid Income Certificate | Family income ₹3,50,000, passes annual threshold check ($\le \text{₹}6,00,000$). |
| `sample_pg_marksheet.txt` | Academic Verification | Aggregated marks: $74.5\%$, satisfies qualifying benchmark ($\ge 55\%$). |
| `sample_phd_admission_letter.txt` | Research Admission Check | Confirms full-time Ph.D. registration at Ranchi University. |
| `sample_foreign_offer_letter.txt` | NOS Admission Check | Confirms unconditional offer from University of Edinburgh. |

---

## 🚫 Limitations & Future Scope

To maintain absolute ethical alignment with government data guidelines, the following items are intentionally excluded from this prototype:
- Direct production integrations with **Aadhaar, DigiLocker, or DBT Public Financial Management System (PFMS)** (designated for subsequent deployment phases within certified Government of India secure sandboxes).
- Real SMS or Email gateways (simulated via in-app notification polling).
- Official legal verification sources (simulated through algorithmic OCR feature extraction and human officer verification).
- Machine learning models trained on proprietary, non-public departmental historical records.

---

## 💡 Innovation & Impact (For SIH Presentation)

> *"This system bridges the critical governance divide between administrative scrutiny and tribal student access. By pairing deterministic rule validation with transparent, assistive AI document intelligence, the portal eliminates repetitive physical correspondence and reduces manual scrutiny cycles from months to hours. Crucially, it safeguards constitutional ethics by upholding a strict human-in-the-loop mandate—where AI extracts and highlights signals, but accredited Ministry officers retain sole decision authority. With instant deficiency remediation, zero-dependency offline resilience, and grounded LLM assistance that refuses to hallucinate statutory policy, the solution delivers an incorruptible, dignified, and production-ready fellowship delivery architecture for the Ministry of Tribal Affairs."*
