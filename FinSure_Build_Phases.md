# FinSure Solutions Pvt Ltd — Phase-by-Phase Build Instructions

# CRITICAL: BUILD PHASE BY PHASE

Do NOT attempt to build the entire application in one operation.

You must develop the project **strictly phase by phase**.

For every phase:

1. First inspect the existing codebase.
2. Identify what is already implemented.
3. Plan only the current phase.
4. Implement only the current phase.
5. Run/build/test the application.
6. Fix errors introduced by the current phase.
7. Verify that previously working functionality still works.
8. Summarize exactly what was implemented.
9. STOP and wait for my instruction before starting the next phase.

**Never automatically continue to the next phase.**

Do not make large unrelated changes to future modules.

---

## PHASE 0 — PROJECT ANALYSIS & ARCHITECTURE

Do NOT write application code yet.

Analyze the platform requirements and define:

* Product architecture
* User roles
* Frontend routes/pages (per dashboard)
* Backend modules
* Database entities and relationships
* Branch-assignment/routing data model
* Loan application workflow states
* API structure
* Document architecture (KYC uploads)
* Notification architecture
* Dashboard structure (User / Branch Manager / Admin)
* MVP boundaries
* Development dependencies

Also inspect the existing repository before making architectural decisions (if a previous build exists, identify what's reusable vs. what needs rebuilding).

At the end, provide:

* Proposed folder structure
* Database schema
* API structure
* Development roadmap
* Important assumptions

Then STOP.

---

## PHASE 1 — FOUNDATION

Implement ONLY the project foundation.

Build:

* Frontend setup
* Backend setup
* Database connection
* Environment configuration
* Base application layout (shared shell for 3 dashboards)
* Design system/components
* Basic routing (role-aware but not yet permission-enforced)
* Error handling
* Basic API structure

Do NOT implement loan workflow, document verification, EMI, or notifications yet.

Run the application and verify it works.

Then STOP.

---

## PHASE 2 — AUTHENTICATION & RBAC

Implement ONLY:

* Login
* Logout
* User model
* Roles
* Role-based permissions
* Protected routes
* Basic user profile

Roles:

* User / Applicant
* Branch Manager
* Admin (Super Admin)

Rules:

* Users self-register.
* Branch Managers are created only by Admin (no self-registration).
* Admin account(s) seeded/created separately.

Test each role — confirm each lands on its correct dashboard and cannot access another role's routes.

Do NOT build the other modules yet.

Then STOP.

---

## PHASE 3 — BRANCH & BRANCH MANAGER MANAGEMENT (Admin)

Implement:

* Branch model (name, address, city/region, pincode range)
* Branch CRUD (Create/Edit/Deactivate)
* Branch Manager account creation + assignment to a branch
* Branch listing with search/filter
* Pincode/region-to-branch mapping (used later for auto-routing)

Use realistic synthetic data (a handful of branches across different cities/pincodes).

Test create → view → update → deactivate.

Then STOP.

---

## PHASE 4 — LOAN PRODUCT MANAGEMENT (Admin)

Implement:

* LoanProduct model
* Loan product CRUD (Personal, Home, Vehicle, Business, etc.)
* Interest rate, min/max amount, tenure options, eligibility criteria per product
* Required document checklist per loan product

Create a small realistic dataset (2–3 loan products).

Do NOT implement application submission yet.

Then STOP.

---

## PHASE 5 — LOAN APPLICATION MODULE (User)

Implement:

* LoanApplication model
* Multi-step application form (personal info → loan details → document upload → review & submit)
* Document upload with type/size validation
* Draft-save support
* "My Applications" list with status field
* Application detail page

Create a small realistic dataset of sample applications.

Do NOT implement branch routing logic or the workflow engine yet — applications can sit in "Submitted" status only.

Test create → view → edit-draft → submit.

Then STOP.

---

## PHASE 6 — BRANCH ROUTING (Auto-Assignment)

Now implement the routing module.

Implement:

* Auto-assignment of a submitted application to a branch, based on the applicant's pincode/region and the mapping defined in Phase 3
* Fallback logic if no exact branch match exists (e.g., nearest region / admin manual assignment queue)
* Branch Manager's application queue (only shows applications assigned to their branch)
* Admin override — ability to manually reassign an application to a different branch
* Filters: by status, loan type, date, amount

Do NOT implement document verification or approval actions yet — this phase is routing/visibility only.

Test:

Application Submitted → Correct Branch Auto-Assigned → Visible in that Branch Manager's queue only.

Then STOP.

---

## PHASE 7 — DOCUMENT VERIFICATION & APPROVAL WORKFLOW

Implement the workflow engine.

Stages:

DRAFT
→ SUBMITTED
→ BRANCH ASSIGNED
→ UNDER REVIEW
→ DOCS REQUESTED (loop back to applicant if needed)
→ APPROVED / REJECTED
→ DISBURSED

Implement:

* Document-level verification actions (Verify / Reject / Request Re-upload) with remarks, performed by Branch Manager
* Application-level decision: Approve / Reject / Request More Info
* Approved amount & tenure (can differ from requested amount)
* Remarks/reason capture on every decision
* Status stepper/timeline visible on the User dashboard
* Audit events for every status change (who, what, when)

Test one complete case end-to-end: Submitted → Docs Verified → Approved.
Test one rejection case and one "docs requested → re-upload → re-review" case.

Then STOP.

---

## PHASE 8 — SANCTION LETTER & DISBURSEMENT

Implement:

* Sanction letter generation (PDF) on approval
* Disbursement status update by Branch Manager (Not Disbursed / Disbursed) with date and reference number
* Disbursement visibility on User dashboard

Keep application-approval and disbursement as separate, clearly distinguished states.

Test parcel-level... i.e. application-level tracking: Approved → Sanction Letter Generated → Disbursed.

Then STOP.

---

## PHASE 9 — EMI SCHEDULE & REPAYMENT TRACKING

Implement:

* Auto-generated EMI schedule based on approved amount, interest rate, and tenure
* EMISchedule model (installment no., due date, amount, status: Paid/Pending/Overdue)
* User dashboard: view EMI schedule and repayment progress
* Branch Manager / Admin: view overdue EMIs report

Test: Disbursed loan → EMI schedule correctly generated → status updates correctly reflect due/overdue installments.

Then STOP.

---

## PHASE 10 — NOTIFICATIONS & ALERTS

Implement:

* Email/SMS notifications: application submitted, docs requested, approved, rejected, disbursed, EMI due/overdue
* In-app notification center (bell icon) for all 3 dashboards
* Alert types: deadline approaching (on pending review), overdue case, missing document, EMI overdue

Connect alerts to the workflow system built in Phase 7.

Then STOP.

---

## PHASE 11 — ADMIN DASHBOARD & ANALYTICS

Now build the decision-maker dashboard.

Include:

* Total users, total applications, approval rate
* Total disbursed amount
* Branch-wise performance (applications received/approved/rejected, average turnaround time)
* Pending cases, overdue cases
* Overdue EMI report

Implement drill-down:

PLATFORM
→ BRANCH
→ APPLICATION
→ DOCUMENT/EVENT

Dashboard numbers must come from actual application data.

Do NOT hard-code KPI numbers except for clearly marked demo/synthetic data.

Then STOP.

---

## PHASE 12 — AUDIT LOGS & SECURITY HARDENING

Implement:

* Full audit log viewer for Admin (who approved/rejected/edited what, and when)
* Input validation & sanitization across all forms
* File upload security (type/size restrictions)
* Rate limiting & brute-force protection on auth endpoints
* Encryption at rest for sensitive fields (KYC identifiers, etc.)
* Role-permission testing — confirm no cross-role data leakage (a User cannot see another user's application; a Branch Manager cannot see another branch's queue)

Then STOP.

---

## PHASE 13 — MOCK PAYMENT / BANK INTEGRATION

Implement a clearly labelled MOCK integration.

Demonstrate:

Application (Approved)
→ Mock Bank/Payment API
→ Request
→ Response
→ Validation
→ Database synchronization (disbursement record updated)
→ Sync log

Do NOT claim this is a live bank/payment gateway integration.

Then STOP.

---

## PHASE 14 — BRANCH MANAGER MOBILE/FIELD EXPERIENCE (Optional)

If time permits, implement a responsive mobile-friendly interface for Branch Managers supporting:

* Assigned applications on the go
* Quick document verification checklist
* Approve/reject with remarks
* Photo/evidence upload (if physical document verification is needed)

Do not let this phase delay the core web application.

Then STOP.

---

## PHASE 15 — FINAL INTEGRATION & DEMO

Only after all previous phases are individually working:

Test the complete end-to-end demo:

REGISTER/LOGIN
→ APPLY FOR LOAN
→ AUTO-ROUTE TO BRANCH
→ DOCUMENT VERIFICATION
→ APPROVAL WORKFLOW
→ SANCTION LETTER
→ DISBURSEMENT
→ EMI SCHEDULE
→ NOTIFICATIONS
→ ADMIN DASHBOARD
→ AUDIT TRAIL

Fix integration problems.

Do not add new major features during this phase.

Then STOP.

---

# STRICT AGENT BEHAVIOR

You are working with a human developer.

Therefore:

* Do not silently skip phases.
* Do not implement future phases early.
* Do not rewrite working modules unnecessarily.
* Do not replace the architecture without explaining why.
* Do not introduce new technologies without justification.
* Do not create placeholder features and claim they are complete.
* Do not generate fake live bank/payment data.
* Do not create a generic chatbot unless explicitly requested.
* Do not over-engineer.

At the end of every phase, report:

### Completed

What was actually implemented.

### Files Changed

Which files were created/modified.

### Database Changes

Any schema/migration changes.

### APIs Added

Endpoints added or modified.

### Tests

What was tested.

### Known Issues

Anything remaining.

### Next Phase

State the next phase, but **DO NOT START IT**.

Then wait for my instruction.

**The highest priority is a stable, working end-to-end prototype — not maximum code generation.**
