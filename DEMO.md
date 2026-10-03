# MoTA AI Scholarship System — 5–7 Minute Live Demo Script
### Smart India Hackathon (SIH) Presentation Guide

Follow these exact steps during your jury demonstration to highlight all Tier A and Tier B capabilities seamlessly without technical friction.

---

## ⏱️ Demo Timeline Overview

| Timestamp | Screen / Persona | Core Feature Demonstrated |
| :--- | :--- | :--- |
| **0:00 – 0:40** | Landing Page | Problem statement, dual schemes (NFST & NOS), constitutional trust formula |
| **0:40 – 2:00** | Student Portal (`Birsa Soren`) | Dynamic form, live readiness meter, instant OCR extraction with confidence |
| **2:00 – 3:15** | Deficiency Action Center (`Anjali Marandi`) | Clear What/Why/Action deficiency, 1-click re-upload, automated revalidation |
| **3:15 – 4:30** | Officer Scrutiny (`Dr. Sunita Santhal`) | Priority queue, split-screen viewer, itemized rule breakdown, human approval |
| **4:30 – 5:30** | Admin Dashboard & Policy Engine | Real-time aggregated KPIs, scheme rule versioning (v1 → v2) |
| **5:30 – 6:30** | Grounded MoTA AI Assistant | Groq Llama-3.3 grounding, refusal guardrail, personal deficiency breakdown |
| **6:30 – 7:00** | Selection Committee & Wrap-up | Merit ranking, audited override justification, post-selection onboarding |

---

## 📋 Step-by-Step Execution Script

### 1. Landing Page (0:00 – 0:40)
1. Open `http://localhost:3000`.
2. Point out:
   - Official Ministry of Tribal Affairs (MoTA) tricolor branding.
   - The two configured schemes: **NFST** (research in India) and **NOS** (overseas study).
   - The **"AI Never Makes the Final Decision"** constitution:
     `Configured rules + AI assistance → recommendation + explanation + confidence → HUMAN REVIEW → final administrative decision`.
   - **Sample / Prototype Data** badges guaranteeing zero fabricated official government records.

---

### 2. Student Application & AI Document Intake (0:40 – 2:00)
1. In the header, click **"Demo Persona"** and select **`Birsa Soren (Student)`**.
2. Click **"Apply for NFST (India)"** (or click "View / Edit Application").
3. Notice:
   - **Readiness Meter** dynamically calculates completion percentage.
   - Navigate to **Step 2 (Document Upload & AI Extraction)**.
4. Click **"Load Valid ST Certificate"** under ST Caste Certificate:
   - The document is processed instantly by the AI Document Intelligence Engine.
   - Look at the right inspector: Extracted attributes appear with confidence chips (`Candidate Full Name: Birsa Soren [98%]`, `Tribe: Santhal [99%]`, `Issuing Officer [94%]`).
   - Highlight the mandatory label: *"Extracted information — not proof of authenticity"*.
5. Click **"Load Mismatched Name Scan"** to show Cross-Document Consistency:
   - Notice the warning: *Potential Name Inconsistency (Birsa Kumar Sahu vs Birsa Soren, 54% match)*.
6. Click **"Continue to Scrutiny Review"** and click **"Submit Application to MoTA"**.
   - Application transitions to `UNDER_SCRUTINY`, generates an audit log entry, and issues an in-app notification.

---

### 3. Automated Deficiency Engine & Self-Resolution (2:00 – 3:15)
1. In the header switcher, select **`Anjali Marandi (Student - Test 2)`**.
2. Notice the prominent red **Deficiency Notice** badge on her NOS application (`NOS-2026-0002`).
3. Click **"Deficiency Action Center"**:
   - Point out the three-part structured guidance:
     1. **What is wrong**: Low resolution, unreadable Tehsildar circular stamp.
     2. **Why it is required**: Official statutory scrutiny requires legible state emblem.
     3. **Exact action to take**: Upload clean 300+ DPI scan or e-District digital certificate.
4. Click **"Resolve Deficiency Now"** and click **"Submit & Run Automated AI Revalidation"**.
   - Deficiency resolves instantly.
   - Notice application `NOS-2026-0002` moves back to `under_scrutiny` with **Priority Scrutiny** tag in the officer queue!

---

### 4. Officer Scrutiny Console & Human Sign-Off (3:15 – 4:30)
1. Switch to **`Dr. Sunita Santhal (Scrutiny Officer)`**.
2. The system loads the **Verification Queue**:
   - Point out the **Priority Scrutiny** tag on Anjali’s resubmitted file.
3. Click **"Scrutinize"** on application `NFST-2026-0001` (Birsa Soren):
   - **Left Panel**: Interactive Document Viewer with OCR Extracted Fields & Confidence chips.
   - **Right Panel**:
     - Rule Engine tab: Itemized breakdown (✓ ST Category, ✓ PG Benchmark ≥ 55%, ✓ Ph.D. Admission, ✓ Income Cap).
     - Anomalies tab: Verifies zero cryptographic SHA-256 collisions.
     - Audit tab: Chronological immutable event log.
4. Under **Official Scrutiny Decision**:
   - Enter remarks: *"All documents scrutinized and cross-verified against revenue benchmarks. Approved for Selection Committee."*
   - Click **"Approve"**.
   - Application status updates to `VERIFIED`, student receives a notification, and audit log records the decision.

---

### 5. Admin Dashboard & Scheme Rule Versioning (4:30 – 5:30)
1. Switch to **`Rajesh Gond (Administrator)`**.
2. Go to **"Analytics & KPIs"**:
   - Show live aggregation: Total submissions, NFST vs NOS distribution, verification outcomes, and queue workloads.
3. Click **"Scheme Policy Rules"**:
   - Show active version `v1` of NFST.
   - Modify the PG benchmark or Income threshold, add summary *"Gazette update revision"*, and click **"Save as New Scheme Version"**.
   - Notice the version bumps to `v2` while all previously submitted applications remain anchored to `v1`.

---

### 6. Grounded MoTA AI Assistant (5:30 – 6:30)
1. Click the floating **MoTA AI Assistant** icon in the bottom right corner.
2. Click the quick prompt: **"What is the age limit for fellowship?"**
   - The assistant outputs the exact mandatory refusal guardrail:
     > *"This information is not available in the configured scheme data. Please refer to the official scheme guidelines or contact the designated authority."*
   - Proves the system never hallucinates or invents government rules!
3. Switch back to **`Anjali Marandi`** and ask the assistant: **"Why is my application flagged?"**
   - The assistant dynamically checks her database record and explains her specific deficiency and resolution status!

---

### 7. Selection Committee & Summary (6:30 – 7:00)
1. Switch to **`Dr. Sunita Santhal (Officer)`** and click **"Selection Committee"**.
2. View the ranked candidate list (Academic weight 60% + Income weight 40%).
3. Click **"Committee Sign-Off"** on Birsa Soren → **"Award Fellowship (Select)"**.
4. Conclude with the SIH Innovation & Impact summary.
