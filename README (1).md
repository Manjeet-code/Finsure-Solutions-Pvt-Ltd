# FinSure Solutions — Digital Loan Origination & Management Platform

> Centralized platform that digitizes the complete loan lifecycle — application, branch-based document verification, approval workflow, sanctioning, disbursement, and EMI repayment tracking — with AI-assisted document mismatch detection to help branch managers catch inconsistencies before approval.

---

## 📖 Setup Instructions

For step-by-step instructions on setting up and running the project locally, please read **[SETUP.md](./SETUP.md)**.

### Quick Start:

1. **Database Setup** (Choose one):
   - **MongoDB Atlas (No Docker)**: Create a free cluster on [mongodb.com/atlas](https://www.mongodb.com/atlas), and add your connection string to `backend/.env` as `MONGODB_URI`.
   - **Docker (Local)**: Run `docker compose up -d` in project root to spin up a local MongoDB instance.
   - **Local MongoDB**: Install MongoDB Community Server and run it as `mongod`, then set `MONGODB_URI=mongodb://localhost:27017/finsure` in `backend/.env`.

2. **Start Servers**:
   ```bash
   # 1. Start Backend (Terminal 1)
   cd backend
   npm install
   npm run dev

   # 2. Start Frontend (Terminal 2)
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

---

## 🔑 Pre-Configured Demo Accounts (Password: `password123`)

- **Applicant / User**: `user@finsure.in`
- **Branch Manager — Lucknow Gomti Nagar**: `branchmanager.lucknow@finsure.in`
- **Branch Manager — Delhi Connaught Place**: `branchmanager.delhi@finsure.in`
- **System Administrator**: `admin@finsure.in`

---

## 🌟 Key Modules Implemented

- **Phase 1: Project Foundation** — Express backend, React+Vite frontend, MongoDB (Mongoose) schema, shared dashboard shell, design system.
- **Phase 2: Authentication & RBAC** — 3 system roles (`USER`, `BRANCH_MANAGER`, `ADMIN`), JWT authentication, protected routes, user profile management.
- **Phase 3: Branch & Branch Manager Management** — Branch CRUD, pincode/region mapping, Admin-created Branch Manager accounts, branch listing with search/filter.
- **Phase 4: Loan Product Management** — Loan product CRUD (Personal, Home, Vehicle, Business), interest rate & tenure configuration, per-product document checklist.
- **Phase 5: Loan Application Module** — Multi-step application form, document upload, draft-save, "My Applications" list with status tracking, application detail view.

---

For detailed setup instructions, refer to **[SETUP.md](./SETUP.md)**.
