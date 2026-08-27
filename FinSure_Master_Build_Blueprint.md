# Build FinSure Solutions — Digital Loan Origination & Management Platform

You are the **lead product architect, senior full-stack engineer, AI engineer, and UI/UX designer** for the FinSure Solutions Pvt Ltd project.

I have attached (or you already have, from earlier in this conversation) the **PRD.md** and **Phase-by-Phase Build Instructions** for FinSure Solutions.

Treat those documents as the **primary source of truth for the project requirements and MVP scope**.

Do NOT blindly implement every possible feature. Follow the explicit MVP boundary below and prioritize a **working end-to-end prototype over feature quantity**.

---

## 1. Understand the product first

We are building a centralized **Loan Origination & Management Platform** that digitizes and monitors the loan lifecycle:

**Application → Branch Assignment → Document Verification → Review → Approval/Rejection → Sanction → Disbursement → EMI / Repayment → Closure**

The core product principle is:

> **One platform should connect applicants, branches, loan products, documents, workflow, sanctioning, disbursement and repayment — while AI helps branch managers catch document/data inconsistencies before approval.**

This is a **financial workflow and monitoring platform**, NOT a generic website and NOT a chatbot.

---

## 2. Primary users

Implement role-based access for these users:

### User / Applicant
Needs:
- Browse loan products
- Apply for a loan
- Upload KYC documents
- Track application status
- View sanction letter
- View EMI schedule / repayment progress
- Notifications

### Branch Manager
Needs:
- Queue of applications assigned to their branch
- Applicant profile + document viewer
- Document-level verification (Verify / Reject / Request Re-upload)
- Application-level decision (Approve / Reject / Request More Info)
- Sanction letter generation
- Disbursement status update
- Branch performance view
- Deadlines / overdue reviews / alerts

### Admin (Super Admin)
Needs:
- Branch & Branch Manager management
- Loan product management
- Platform-wide application oversight (with reassignment override)
- National/platform-wide analytics dashboard
- Overdue/high-risk application monitoring
- Audit trail
- System configuration

The architecture should allow additional roles later (e.g., Regional Head, Support Staff, Field Verification Officer).

---

## 3. Core MVP

The MVP MUST have these working end-to-end:

1. Role-based login (User / Branch Manager / Admin)
2. Branch & branch manager management (Admin)
3. Loan product management (Admin)
4. Loan application submission (User) with document upload
5. Auto-assignment of application to the correct branch (pincode/region-based routing)
6. Branch Manager review queue
7. Document verification (per-document status + remarks)
8. AI document/data mismatch detection
9. Approval workflow (approve / reject / request more docs) with remarks and audit trail
10. Sanction letter generation
11. Disbursement status tracking
12. EMI schedule generation & repayment tracking
13. Notifications (email/SMS/in-app)
14. Admin dashboard with filters and drill-down
15. Deadline / overdue alerts
16. Audit trail
17. Mock bank/payment integration
18. One meaningful AI/risk feature (explainable risk flag)

Do NOT overbuild.

Do not spend time creating:
- Huge microservice architecture
- Generic AI chatbot as the core feature
- Blockchain
- Dozens of unfinished dashboards
- Fake live bank/payment integrations
- Complex ML models without useful data
- Nationwide real-time credit bureau integration

---

## 4. BRANCH ROUTING MODULE — IMPORTANT

The branch-routing module is a core part of the product (this is FinSure's equivalent of a "location intelligence" layer).

Build:

- Pincode/region → branch mapping (configured by Admin)
- Auto-assignment of a submitted application to the correct branch
- Fallback logic if no exact branch match exists (queue for Admin manual assignment)
- Optional: a simple branch-locator map (branches plotted on a map, not mandatory for MVP)
- Branch Manager queue filtered strictly to their own branch's applications
- Admin override to manually reassign an application to a different branch

Example application record after routing:

```text
Application ID: LN-2026-0143
Applicant: Example Applicant
Loan Product: Personal Loan
Amount Requested: ₹5,00,000
Branch Assigned: Lucknow - Gomti Nagar Branch
Status: UNDER REVIEW
```

The routing logic should not be decorative — it must actually determine which Branch Manager's queue the application lands in.

---

## 5. AI FEATURE — DOCUMENT / DATA MISMATCH DETECTION

This should be one of the strongest features in the prototype.

Example:

Applicant-declared data (in application form):

```text
Name: Example Applicant
Monthly Income: ₹85,000
PAN: ABCDE1234F
```

Uploaded salary slip / bank statement (extracted):

```text
Name: Example Applicant
Monthly Income: ₹68,000
PAN: ABCDE1234F
```

The system should:

1. Accept PDF/image document (salary slip, bank statement, PAN, Aadhaar, etc.)
2. OCR/extract relevant fields
3. Convert extracted information into structured data
4. Compare extracted values with the applicant-declared data on the application form
5. Detect inconsistencies (income mismatch, name mismatch, ID number mismatch)
6. Display the exact mismatch
7. Explain why it was flagged
8. Create a verification flag on the application
9. Notify the assigned Branch Manager
10. Record the action in the audit trail

Display:

```text
⚠ INCOME MISMATCH

Declared Income:  ₹85,000/month
Document Shows:   ₹68,000/month
Difference:       ₹17,000/month (-20%)

Reason:
Income declared on the application form differs
from the income shown on the uploaded salary slip.

Action:
[Send for Manual Verification]
```

IMPORTANT:

AI must NOT declare:

- Fraud
- Loan rejection decisions
- Final creditworthiness verdicts

AI is **decision support only**.

It should surface inconsistencies and risk signals for authorized human (Branch Manager) review.

---

## 6. WORKFLOW ENGINE

The system must always know where an application currently stands.

Example:

```text
Application ID: LN-2026-0143

Current Stage:
DOCUMENT VERIFICATION

Assigned To:
Branch Manager - Lucknow Gomti Nagar

Due Date:
02-Sep-2026

Status:
PENDING
```

Actions:

- Approve / Forward
- Send Back (request more documents)
- Reject
- Complete (disbursed/closed)

The workflow should support:

- Required fields per stage
- Assignment
- Deadlines
- Status
- Remarks
- Escalation (if overdue beyond SLA)
- Audit history

The system must answer:

> Who is responsible for this application right now?
> What is the next action?
> When is it due?
> Why is it delayed?

---

## 7. DASHBOARD

Create a professional, trustworthy financial-platform dashboard (Admin-facing).

It should show KPIs such as:

- Total Applications
- Total Users
- Loan Amount Requested
- Loan Amount Approved
- Loan Amount Disbursed
- Approval Rate
- Average Turnaround Time
- Pending Applications
- Overdue Reviews
- Overdue EMIs
- High-Risk Applications

Important drill-down:

**Platform → Branch → Application → Document/Event**

Every major dashboard number should lead to useful detail, not be a dead-end statistic.

---

## 8. DOCUMENT MANAGEMENT

Documents should not simply be uploaded and forgotten.

Support:

- Upload
- Document type
- Application association
- Version (re-uploads tracked, not overwritten silently)
- Uploading user
- Timestamp
- Access permissions (role-restricted viewing)
- Audit history
- Search/filter within an application's document set

Example document types:

- PAN Card
- Aadhaar Card
- Salary Slip
- Bank Statement
- Income Tax Return
- Address Proof
- Photograph
- Sanction Letter (system-generated)

---

## 9. SANCTION & LOAN AMOUNT TRACKING

Keep these separate:

```text
Requested Amount
Approved Amount
Disbursed Amount
```

Do not use a single boolean like:

```text
loanApproved = true
```

because the platform needs to represent partial disbursement, differing approved-vs-requested amounts, and multi-tranche disbursement in the future.

---

## 10. DISBURSEMENT

Track:

- Not Disbursed
- Partial
- Fully Disbursed
- Disbursement date
- Reference number / supporting evidence

An application can be:

**Approved = Yes**

while:

**Disbursement = Pending**

Do not incorrectly combine these states.

---

## 11. EMI / REPAYMENT MODULE

Track repayment separately from the approval/disbursement lifecycle.

For each disbursed loan:

- Installment number
- Due date
- Amount
- Status (Paid / Pending / Overdue)
- Payment date (once paid)
- Responsible branch (for follow-up)

Dashboard should show:

```text
Active Loans: 214
EMIs Due This Month: 214
EMIs Overdue: 12
Overdue Amount: ₹4,32,000
```

---

## 12. ALERTS

Build useful alerts.

Examples:

### Deadline approaching
Reminder to the assigned Branch Manager for a pending review.

### Deadline missed
Mark application review as overdue.

### Repeated delay
Escalate to Admin.

### Missing document
Prevent workflow completion and notify the applicant.

### Data mismatch
Create a verification flag on the application.

### EMI overdue
Notify applicant and flag on Branch Manager / Admin dashboard.

### High-risk application
Show on the risk dashboard.

---

## 13. AI / RISK ANALYTICS

If implementing a second AI feature, prioritize a transparent, explainable risk score — not a black box.

Possible factors:

- Income-to-loan-amount ratio
- Number of document mismatches found
- Existing overdue EMIs (if applicant has prior loans on platform)
- Age/completeness of submitted documents
- Historical delay pattern at the assigned branch (if relevant)

Show WHY an application is high risk.

Example:

```text
HIGH RISK — 68%

Factors:
• Income-to-EMI ratio below recommended threshold
• 1 unresolved document mismatch
• Address proof missing
• Applicant has 1 overdue EMI on an existing loan
```

Do not create an unexplained black-box score.

---

## 14. DATA MODEL

Use a relational architecture.

Important entities:

```text
User
Branch
BranchManager
Admin
LoanProduct
LoanApplication
Document
WorkflowEvent
SanctionDetails
Disbursement
EMISchedule
Notification
RiskScore
AuditLog
```

An application should connect:

```text
User
   ↓
Loan Application
   ↓
Branch (auto-assigned)
   ↓
Documents
   ↓
Workflow Events
   ↓
Sanction Details
   ↓
Disbursement
   ↓
EMI Schedule
```

---

## 15. TECHNOLOGY

Use a practical, production-reasonable stack. (Confirm against whatever you used in your earlier build before locking this in.)

### Frontend
React / Next.js
TypeScript
Tailwind CSS

### Backend
Node.js + Express or NestJS

### Database
PostgreSQL (relational — well suited to structured financial/application data)

### AI
Python + FastAPI (OCR + extraction + comparison microservice, called from the main backend)

### OCR
Tesseract or a cloud OCR provider

### Storage
S3-compatible object storage (for KYC documents)

### Authentication
JWT-based authentication + RBAC

### API
REST + OpenAPI/Swagger

### Deployment
Docker

For the prototype, a **modular monolith is preferred over unnecessary microservices** — the AI/OCR piece is the one component that reasonably deserves to be a separate service.

---

## 16. UI/UX DIRECTION

Design it as a serious, trustworthy financial platform.

Do NOT make it look like:
- A generic admin template
- A social media app
- A flashy startup landing page
- A chatbot application

Use:

- Clean typography
- Professional financial-services aesthetic
- Strong information hierarchy
- Responsive layout
- Accessible contrast
- Clear status indicators (color-coded application/EMI states)
- Tables + charts + status cards
- Minimal unnecessary decoration

The Admin dashboard should feel like a **decision-support / operations-control system**.

The Branch Manager review screen should feel like a professional underwriting workspace, not a generic form.

---

## 17. DEMO STORY

The final prototype should support this coherent demo:

### 0:00
Login as User/Applicant.

### 0:20
Browse loan products, select Personal Loan, start application.

### 0:40
Fill application form, upload documents (salary slip, PAN, Aadhaar).

### 1:00
Submit — show auto-assignment to the correct branch.

### 1:10
Login as Branch Manager.

### 1:20
Open the application from the queue — show applicant profile + documents.

### 1:40
AI extracts data from the salary slip:

```text
Declared Income: ₹85,000
Document Income: ₹68,000
```

### 2:00
System flags the mismatch with an explanation.

### 2:10
Branch Manager sends the application for manual verification / requests clarification.

### 2:20
Show:
- Assigned Branch Manager
- Deadline
- Workflow status
- Audit event

### 2:30
Branch Manager approves with an adjusted (lower) approved amount, generates sanction letter.

### 2:45
Update disbursement status → EMI schedule auto-generated.

### 3:00
Login as Admin — open dashboard.

Show:
- Total applications / approval rate
- Disbursed amount
- Overdue EMIs
- High-risk applications

### 3:20
Drill down from dashboard → branch → application → audit trail.

The demo should tell **one coherent story** instead of showing disconnected features.

---

## 18. DEVELOPMENT APPROACH

Before writing large amounts of code:

### Phase 1 — Architecture
Define:
- Pages
- Components
- Database schema
- API structure
- Roles
- Workflow states
- Branch-routing data model

### Phase 2 — Core application
Implement:
- Authentication
- Dashboard shell
- Branches & loan products
- Applications
- Database

### Phase 3 — Workflow
Implement:
- Application creation
- Branch assignment
- Status transitions
- Deadlines
- Audit events

### Phase 4 — Documents + AI
Implement:
- Upload
- OCR
- Extraction
- Comparison
- Mismatch alert

### Phase 5 — Sanction + Disbursement + EMI
Implement:
- Sanction letter
- Disbursement states
- EMI schedule generation
- Repayment tracking

### Phase 6 — Dashboard + Alerts
Implement:
- KPIs
- Filters
- Drill-down
- Alerts
- Risk indicators

### Phase 7 — Polish
Improve:
- UI consistency
- Responsive behavior
- Loading/error states
- Empty states
- Accessibility
- Demo data
- Performance

*(This mirrors, at a summary level, the detailed 15-phase execution plan in the separate Build Instructions document — use that document for the actual step-by-step, stop-after-each-phase build process.)*

---

## 19. VERY IMPORTANT RULES

1. Do not invent requirements that contradict the PRD/build-instructions documents.
2. Do not claim access to real bank/payment/credit-bureau APIs.
3. Clearly label integrations as MOCK when real access is unavailable.
4. Use synthetic/sample data for the prototype.
5. Do not make final credit/approval decisions using AI — it is decision support only.
6. Do not build a generic chatbot as the main AI feature.
7. Do not overengineer the architecture.
8. Every important alert should have explainable evidence.
9. Every workflow action should create an audit event.
10. Keep documents, workflow, and application data connected — no orphaned records.
11. Make the prototype actually runnable.
12. Prioritize a complete working flow over dozens of incomplete features.

---

## 20. What I want from you

First, **analyze the PRD and Build Instructions completely**.

Then produce:

### A. Product architecture
Explain the complete system architecture and module relationships.

### B. Database design
Provide the schema/entities, relationships and important fields.

### C. Application structure
Define the frontend pages/routes and reusable components per dashboard.

### D. Backend API design
Define the important REST endpoints.

### E. Branch routing implementation
Explain how pincode/region mapping, auto-assignment, and manual override will work.

### F. AI implementation
Explain the document extraction + mismatch detection pipeline.

### G. Workflow implementation
Define stages, transitions, assignments, deadlines and audit events.

### H. MVP implementation plan
Break the project into concrete development tasks in priority order.

### I. Then BUILD
After the architecture is clear, start implementing the actual application — following the phase-by-phase Build Instructions document strictly (one phase at a time, STOP after each).

Do not stop at wireframes or pseudo-code once building begins.

The final result should be a **working prototype**, not merely a design document.

If a requirement is ambiguous, choose the simplest implementation that preserves the intent of the PRD and clearly state the assumption.

Most importantly:

> **Build one complete, convincing loan-application-to-disbursement workflow rather than ten disconnected features.**
