# Product Requirements Document (PRD)
## FinSure Solutions Pvt Ltd — Loan Providing Platform

| | |
|---|---|
| **Document Owner** | FinSure Solutions Pvt Ltd |
| **Version** | 1.0 |
| **Status** | Draft |
| **Last Updated** | 26 Aug 2026 |

---

## 1. Executive Summary

FinSure Solutions is a digital loan origination and management platform that connects **loan applicants**, **branch managers**, and **platform administrators** in a single workflow. Users apply for loans online, the nearest branch manager verifies documents and approves/rejects the application, and the admin oversees the entire platform — branches, users, loan products, and overall operations.

The platform will be built and shipped in **incremental phases**, each phase delivering a working, testable slice of the product rather than one large release.

---

## 2. Goals & Objectives

- Digitize the end-to-end loan application, verification, and approval process.
- Reduce loan approval turnaround time by routing applications to the nearest branch automatically.
- Give admins full visibility and control over branches, staff, loan products, and platform health.
- Provide a transparent, trackable status pipeline for applicants (Applied → Under Review → Approved/Rejected → Disbursed).
- Build a scalable, secure, audit-friendly system suitable for financial data (KYC documents, PII, loan amounts).

## 3. Non-Goals (Out of Scope for v1)

- Fully automated credit-scoring/AI underwriting (manual branch manager approval only in v1).
- Third-party bank integration for auto-disbursement (v1 will track disbursement status manually; real payment gateway integration comes later).
- Mobile native apps (v1 is a responsive web platform only).
- Multi-country/multi-currency support.

---

## 4. Stakeholders & User Roles

| Role | Description |
|---|---|
| **User / Applicant** | Registers, applies for loans, uploads KYC documents, tracks application status, views EMI schedule. |
| **Branch Manager** | Assigned to a specific branch/region. Reviews applications routed to their branch, verifies documents, approves/rejects/requests re-submission, manages disbursement status. |
| **Admin (Super Admin)** | Manages branches, branch managers, loan products, interest rates, platform-wide reports, user management, and system configuration. |

> **Note:** We can also define a secondary role like **Admin-Staff/Support** later if needed — flagging as a possible Phase 8+ addition.

---

## 5. High-Level System Architecture (Assumption)

Since exact tech preferences weren't specified, this PRD assumes a modern, commonly-used stack. Adjust as per your actual stack before development.

- **Frontend:** React.js (with role-based routing for 3 dashboards) + Tailwind CSS
- **Backend:** Node.js (Express) or equivalent REST/GraphQL API layer
- **Database:** PostgreSQL / MySQL (relational, given structured financial data and relationships)
- **File Storage:** Cloud storage (S3 or equivalent) for KYC documents
- **Auth:** JWT-based auth with role-based access control (RBAC)
- **Notifications:** Email/SMS via third-party provider (e.g., Twilio, SendGrid)
- **Hosting:** Cloud provider (AWS/GCP/Azure) with staging + production environments

*(If your original build used a different stack, this PRD's phases still apply — only the "Tech Setup" tasks in Phase 1 need adjusting.)*

---

## 6. Core Entities / Data Model (Overview)

- **User** (applicant): id, name, email, phone, address, KYC docs, password hash, role, branch_assigned, status
- **BranchManager**: id, name, email, branch_id, phone, status
- **Branch**: id, branch_name, city/region, pincode range, address, manager_id
- **Admin**: id, name, email, permissions
- **LoanProduct**: id, name (Personal/Home/Vehicle/Business), interest_rate, tenure_options, min/max amount, eligibility criteria
- **LoanApplication**: id, user_id, branch_id (auto-assigned), loan_product_id, amount_requested, tenure, purpose, status (Draft/Submitted/Under Review/Docs Requested/Approved/Rejected/Disbursed), created_at, reviewed_by, remarks
- **Document**: id, application_id, doc_type (PAN/Aadhaar/Salary Slip/Bank Statement etc.), file_url, verification_status, verified_by
- **EMISchedule**: id, application_id, installment_no, due_date, amount, status (Paid/Pending/Overdue)
- **AuditLog**: id, actor_id, actor_role, action, entity, timestamp
- **Notification**: id, user_id, type, message, read_status

---

## 7. Dashboard-Wise Feature Breakdown

### 7.1 User Dashboard
- Sign up / Login / Forgot Password / OTP verification
- Profile management (personal details, KYC info)
- Browse available loan products (interest rate, tenure, eligibility)
- Apply for a loan (multi-step form: personal info → loan details → document upload → review & submit)
- Upload required documents (PAN, Aadhaar, income proof, bank statements, etc.)
- Track application status with a visual stepper (Applied → Branch Assigned → Under Review → Approved/Rejected → Disbursed)
- View/download sanction letter (post-approval)
- View EMI schedule & repayment tracker (post-disbursement)
- Notifications (status updates, document re-upload requests)
- Raise a query/support ticket to assigned branch manager

### 7.2 Branch Manager Dashboard
- Login (role-restricted)
- View all loan applications auto-routed to their branch (based on user's pincode/region)
- Filter/sort applications by status, loan type, amount, date
- View applicant profile & uploaded documents
- Verify documents (mark each doc as Verified / Rejected / Needs Re-upload) with remarks
- Approve / Reject loan application with remarks and approved amount/tenure (can differ from requested)
- Request additional documents from applicant
- Generate/view sanction letter for approved loans
- Update disbursement status
- View branch-level performance (applications received, approved, rejected, pending, avg turnaround time)
- Communicate with applicant (status remarks / notifications)

### 7.3 Admin Dashboard
- Login (highest privilege role)
- **Branch Management:** Create/edit/deactivate branches, assign pincode/region mapping
- **Branch Manager Management:** Create/edit/deactivate branch manager accounts, assign to branch
- **User Management:** View/search all users, activate/deactivate accounts, view application history
- **Loan Product Management:** Create/edit loan products, interest rates, tenure options, eligibility rules
- **Application Oversight:** View all applications platform-wide, override/reassign to a different branch if needed
- **Reports & Analytics:** Total applications, approval rate, disbursement amount, branch-wise performance, overdue EMIs
- **Audit Logs:** Track all critical actions (who approved/rejected/edited what and when)
- **System Configuration:** Manage document requirement templates, notification templates, platform settings
- **Role & Permission Management**

---

## 8. Core Workflow: Loan Application Lifecycle

```
User Registers/Logs in
        │
        ▼
Fills Loan Application + Uploads Documents
        │
        ▼
System auto-assigns nearest/relevant Branch (based on pincode/region)
        │
        ▼
Branch Manager reviews application & verifies documents
        │
   ┌────┴─────┐
   ▼          ▼
Docs OK    Docs Missing/Invalid → Request re-upload → User re-submits
   │
   ▼
Branch Manager Approves / Rejects
   │
   ├── Rejected → User notified with reason (can re-apply)
   │
   └── Approved → Sanction Letter generated → Disbursement status updated
                          │
                          ▼
                 EMI Schedule generated → User can track repayments
```

---

## 9. Phase-Wise Development Plan

> Each phase is designed to be independently demoable/testable. Estimated durations assume a small team (2–4 developers); adjust to your actual team size.

### **Phase 0 — Discovery, Planning & Design (1–2 weeks)**
**Goal:** Finalize scope, tech stack, and design before writing code.
- Finalize tech stack (frontend, backend, DB, hosting)
- Define detailed data model / ER diagram
- Define API contract (REST endpoints or GraphQL schema) for all 3 dashboards
- UI/UX wireframes for User, Branch Manager, Admin dashboards
- Define document requirement checklist per loan type
- Define branch-assignment logic (pincode/region mapping rules)
- Set up project management board (tasks per phase)

**Deliverables:** Wireframes, ER diagram, API contract doc, finalized tech stack.

---

### **Phase 1 — Project Setup & Core Infrastructure (1 week)**
**Goal:** Set up the skeleton so all future phases can build on it.
- Initialize frontend repo (React) with routing scaffold for 3 dashboards
- Initialize backend repo with folder structure (controllers/routes/models/middleware)
- Set up database schema (based on Phase 0 ER diagram) + migrations
- Set up cloud file storage bucket for documents
- Set up environment configs (dev/staging/prod)
- Set up CI/CD pipeline basics (build + lint on push)
- Set up base UI component library / design system (buttons, forms, tables, modals)

**Deliverables:** Running skeleton app (empty dashboards reachable by role), connected DB.

---

### **Phase 2 — Authentication, Authorization & Role Management (1–1.5 weeks)**
**Goal:** Secure, role-based access for Users, Branch Managers, and Admins.
- User registration (email/phone + OTP verification)
- Login/logout for all 3 roles
- Forgot password / reset password flow
- JWT-based session handling
- Role-Based Access Control (RBAC) middleware — restrict routes/APIs by role
- Admin-created accounts for Branch Managers (branch managers likely shouldn't self-register)
- Basic profile management (edit personal details)

**Deliverables:** Fully working auth system; each role lands on their correct dashboard after login.

---

### **Phase 3 — Admin: Branch & Branch Manager Management (1 week)**
**Goal:** Give admin control over the branch network before applications can be routed.
- Admin UI: Create/Edit/Deactivate branches (name, address, region/pincode range)
- Admin UI: Create/Edit/Deactivate branch manager accounts + assign to a branch
- Branch listing with search/filter
- Pincode-to-branch mapping logic (used later for auto-routing)

**Deliverables:** Admin can fully set up the branch network and onboard branch managers.

---

### **Phase 4 — Admin: Loan Product Management (0.5–1 week)**
**Goal:** Define what loan products are available on the platform.
- Admin UI: Create/edit/deactivate loan products (Personal, Home, Vehicle, Business, etc.)
- Configure interest rate, min/max amount, tenure options, eligibility criteria per product
- Configure required document checklist per loan product

**Deliverables:** At least 2–3 configurable loan products live on the platform.

---

### **Phase 5 — User Dashboard: Loan Application Flow (1.5–2 weeks)**
**Goal:** Core value proposition for the applicant.
- Browse loan products with details
- Multi-step loan application form (personal info → loan details → document upload → review & submit)
- Document upload with file type/size validation
- Auto-assignment of application to nearest/correct branch (using pincode mapping from Phase 3)
- Application submitted confirmation + status visible on dashboard
- "My Applications" list with status stepper UI

**Deliverables:** A user can fully apply for a loan end-to-end and see it land in the correct branch's queue.

---

### **Phase 6 — Branch Manager Dashboard: Review, Verification & Approval (1.5–2 weeks)**
**Goal:** Enable branch managers to process applications routed to them.
- Queue of applications assigned to their branch (filter/sort by status, date, loan type)
- Application detail view with applicant profile + uploaded documents (preview/download)
- Document-level verification actions (Verify / Reject / Request Re-upload) with remarks
- Application-level decision: Approve / Reject / Request More Info, with remarks and final approved amount & tenure
- Auto-notify applicant on every status change
- Sanction letter generation (PDF) on approval

**Deliverables:** Branch manager can fully process an application from "Submitted" to "Approved/Rejected."

---

### **Phase 7 — Notifications & Status Tracking (0.5–1 week)**
**Goal:** Keep all 3 roles informed in real time.
- Email/SMS notifications: application submitted, docs requested, approved, rejected, disbursed
- In-app notification center (bell icon) for all dashboards
- Status stepper/timeline UI refinement on User dashboard

**Deliverables:** Automated notifications working across the full application lifecycle.

---

### **Phase 8 — Disbursement & EMI Tracking (1–1.5 weeks)**
**Goal:** Post-approval lifecycle management.
- Branch manager marks loan as "Disbursed" (manual status + date + reference number in v1)
- Auto-generate EMI schedule based on approved amount, interest rate, tenure
- User dashboard: view EMI schedule, due dates, paid/pending/overdue status
- Branch manager/Admin: view overdue EMIs report

**Deliverables:** Full loan lifecycle from application to repayment tracking.

---

### **Phase 9 — Admin Analytics, Reports & Audit Logs (1 week)**
**Goal:** Give admin full oversight of platform health.
- Dashboard widgets: total users, total applications, approval rate, total disbursed amount
- Branch-wise performance report (applications received/approved/rejected, avg turnaround time)
- Audit log viewer (who did what, when — approvals, rejections, edits)
- Exportable reports (CSV/PDF)

**Deliverables:** Admin has a data-driven view of the entire platform.

---

### **Phase 10 — Security Hardening, Testing & QA (1–1.5 weeks)**
**Goal:** Make the platform production-ready and safe for financial/PII data.
- Input validation & sanitization across all forms
- File upload security (type/size restrictions, malware scan if possible)
- Rate limiting & brute-force protection on auth endpoints
- Data encryption at rest for sensitive fields (KYC numbers, etc.)
- Role-permission penetration testing (ensure no cross-role data leakage)
- Unit tests + integration tests for core flows
- UAT (User Acceptance Testing) with sample real-world scenarios

**Deliverables:** Security checklist signed off; test coverage report.

---

### **Phase 11 — Deployment & Launch (0.5–1 week)**
**Goal:** Ship to production.
- Production environment setup
- Domain, SSL, hosting finalization
- Data backup & disaster recovery plan
- Monitoring/alerting setup (uptime, error tracking)
- Soft launch with a limited set of branches/users
- Full launch

**Deliverables:** FinSure Solutions live in production.

---

### **Phase 12 — Post-Launch Enhancements (Ongoing / Future Roadmap)**
Optional/future scope, not required for v1 launch:
- Automated credit scoring / risk engine
- Payment gateway integration for EMI auto-collection
- Real bank/NBFC API integration for disbursement
- Mobile apps (iOS/Android)
- Chat-based support between user and branch manager
- Multi-level approval workflow (e.g., branch manager → regional head → admin for high-value loans)
- Co-applicant / guarantor support
- Loan foreclosure / prepayment handling
- AI-based document fraud detection

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | Role-based access control, encrypted storage of KYC/PII data, HTTPS everywhere |
| **Performance** | Dashboard pages load under 2s; document uploads support files up to configurable size limit |
| **Scalability** | Should support multiple branches and concurrent applications without degradation |
| **Auditability** | Every approval/rejection/edit action must be logged with actor, timestamp, and reason |
| **Availability** | Target 99.5% uptime post-launch |
| **Compliance** | Follow applicable data protection norms for storing financial/KYC data (e.g., RBI guidelines if operating in India, data localization if applicable) |

---

## 11. Success Metrics (KPIs)

- Average loan application turnaround time (submission → decision)
- Application approval rate per branch
- Document rejection/re-upload rate (indicates form/UX clarity)
- User drop-off rate during application form (funnel analysis)
- Number of active branches & branch managers onboarded
- Platform uptime & error rate post-launch

---

## 12. Assumptions & Open Questions

Since this PRD is being generated for planning purposes, please validate/clarify the following before development starts:

1. Is branch assignment purely pincode/region-based, or should users be able to manually select a branch too?
2. Should users be able to apply for multiple loans simultaneously?
3. Is disbursement handled fully manually in v1, or is there a target bank integration?
4. What loan products should launch first (Personal/Home/Vehicle/Business)?
5. Any regulatory/compliance body this platform must adhere to (RBI/NBFC guidelines, etc.)?
6. Preferred tech stack — confirm or override the assumptions in Section 5.
7. Team size and expected timeline, to calibrate phase durations realistically.

---

*End of Document*
