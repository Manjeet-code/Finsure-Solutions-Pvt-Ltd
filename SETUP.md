# FinSure Solutions — Developer Setup Guide

This guide will help you set up and run the **FinSure Solutions Loan Origination & Management Platform** on your local development environment from scratch.

---

## 📋 Prerequisites

Before starting, ensure you have the following software installed on your computer:

1. **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
2. **Git** — [Download Git](https://git-scm.com/)
3. **Docker Desktop** *(Optional — required only if running MongoDB in a container)* — [Download Docker](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Quick Start Setup (5 Minutes)

### Step 1: Clone the Repository

Open your terminal or command prompt and run:

```bash
git clone https://github.com/Manjeet-code/Finsure-Solutions-Pvt-Ltd.git
cd Finsure-Solutions-Pvt-Ltd
```

---

### Step 2: Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the environment file `.env` in the `backend` directory:
   ```env
   PORT=5000
   JWT_SECRET=finsure-dev-jwt-secret-key-dev
   JWT_EXPIRES_IN=24h
   MONGODB_URI=mongodb://localhost:27017/finsure
   UPLOAD_DIR=./uploads
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   *(Note: The collections and synthetic demo data for Users, Branches, Loan Products & Applications will auto-seed automatically on your first boot!)*

   You should see:
   ```text
   [DB] Connected to MongoDB
   [SEED] Successfully seeded demo users, branches, loan products, and applications.
   Server running on http://localhost:5000
   ```

---

### Step 3: Frontend Setup

Open a **new terminal window** in the project root directory (`finsure-solutions`):

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🔑 Demo Login Accounts

You can log in with any of the following pre-configured role accounts. Password for all demo accounts is **`password123`**.

| Role | Email | Name | Key Capabilities |
|------|-------|------|------------------|
| **Applicant / User** | `user@finsure.in` | Ananya Gupta | Apply for loans, upload KYC documents, track status, view EMI schedule |
| **Branch Manager — Lucknow** | `branchmanager.lucknow@finsure.in` | Rohit Mathur | Review branch queue, verify documents, approve/reject applications |
| **Branch Manager — Delhi** | `branchmanager.delhi@finsure.in` | Priya Nair | Review branch queue, verify documents, approve/reject applications |
| **System Administrator** | `admin@finsure.in` | System Admin | Branch & loan product management, platform-wide analytics, audit trail |

*Quick Tip: On the login page, you can click any of the "Demo Accounts" quick-fill buttons to auto-populate credentials instantly!*

---

## 🏗️ Project Architecture & Tech Stack

```text
finsure-solutions/
├── frontend/                # React (Vite) + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Reusable Layout, Forms & Status-Stepper components
│   │   ├── pages/            # Auth, Dashboard, Applications, Branches, Loan Products
│   │   ├── services/         # Axios API client
│   │   └── contexts/         # Auth & User state context
│   └── vite.config.js        # Proxy configured to http://127.0.0.1:5000
│
├── backend/                  # Node.js + Express + MongoDB (Mongoose)
│   ├── src/
│   │   ├── config/           # DB connection & Constants
│   │   ├── middleware/       # JWT Auth & RBAC
│   │   ├── modules/          # Auth, Users, Branches, LoanProducts, Applications, EMI routes
│   │   └── seeds/            # Auto-seeding scripts for synthetic demo data
│   └── app.js                # Express app entry point
```

---

## 🗄️ MongoDB Setup Options

You can set up MongoDB using **any of the 3 options below**. Option 1 (MongoDB Atlas) is recommended if Docker is too complicated or heavy to run locally.

---

### ⚡ Option 1: MongoDB Atlas (Free Cloud MongoDB — Recommended, No Docker Needed)

[MongoDB Atlas](https://www.mongodb.com/atlas) provides a free cloud MongoDB cluster. **Zero local software installation required.**

#### Step 1: Create a Free Account & Cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free account.
2. Click **Build a Database** → Choose the **Free (M0)** tier → Set cluster name to `finsure` → Click **Create**.

#### Step 2: Create a Database User & Allow Network Access
1. In the Atlas sidebar, go to **Database Access** → **Add New Database User** → set a username/password.
2. Go to **Network Access** → **Add IP Address** → select **Allow Access from Anywhere** (`0.0.0.0/0`) for local development.

#### Step 3: Connect Backend to Atlas
1. On the cluster page, click **Connect** → **Drivers** → copy the connection string (e.g. `mongodb+srv://alex:xyz123@finsure.abcde.mongodb.net/?retryWrites=true&w=majority`).
2. Open `backend/.env` on your computer and set `MONGODB_URI`, including the database name:
   ```env
   MONGODB_URI=mongodb+srv://alex:xyz123@finsure.abcde.mongodb.net/finsure?retryWrites=true&w=majority
   ```
3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
   *(The backend will connect to Atlas, create all collections, and seed synthetic demo data automatically!)*

---

### 🐳 Option 2: Local Docker Container (MongoDB 7)

If you prefer running a database locally using Docker Desktop:

1. Ensure Docker Desktop is running on your computer.
2. In the project root directory (`finsure-solutions`), run:
   ```bash
   docker compose up -d
   ```
3. In `backend/.env`, set:
   ```env
   MONGODB_URI=mongodb://finsure_user:finsure_dev_password@localhost:27017/finsure?authSource=admin
   ```
4. Start backend: `cd backend && npm run dev`

---

### 💻 Option 3: Native Installer (MongoDB Community Server — No Docker)

If you want local MongoDB without Docker:

1. Download **MongoDB Community Server** from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and complete setup (install as a Windows/macOS/Linux service, defaults are fine).
3. Optionally install **MongoDB Compass** (GUI) during the same installer flow.
4. Once the `mongod` service is running, in `backend/.env`, set:
   ```env
   MONGODB_URI=mongodb://localhost:27017/finsure
   ```
5. Start backend: `cd backend && npm run dev`

---

### 🛠️ Accessing Database Directly (GUI / CLI)

- **Atlas Console**: Use the built-in **Collections** tab and **Data Explorer** on `mongodb.com/atlas`.
- **Desktop GUI**: Connect with **MongoDB Compass** or the VS Code MongoDB extension using your `MONGODB_URI`.
- **Command Line (`mongosh`)**:
  ```bash
  mongosh "YOUR_MONGODB_URI_HERE"
  ```

---

## 🛠️ Troubleshooting

### Issue: Proxy `ECONNREFUSED` error on login
- **Solution**: Make sure the backend server (`cd backend && npm run dev`) is running on port `5000` before opening the frontend.

### Issue: Backend fails to start with `MongoServerSelectionError`
- **Solution**: Confirm `MONGODB_URI` in `backend/.env` is correct, your MongoDB service (local/Docker) is running, and — if using Atlas — that your current IP is allowed under **Network Access**.

### Issue: Port 5000 or 5173 is already in use
- **Windows Solution**:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```
- **macOS/Linux Solution**:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

---

## 🎯 Verification Checklist

After running both servers, verify the following features:
- [x] Login page loads with FinSure branding & demo account buttons.
- [x] Login as User (`user@finsure.in` / `password123`) redirects to `/dashboard`.
- [x] Navigate to **Loan Products** (`/loan-products`) — View 2–3 synthetic loan products with interest rates & tenure options.
- [x] Apply for a loan (`/apply`) — Submit an application with document uploads, and confirm it lands in the correct branch's queue.
- [x] Login as a Branch Manager (`branchmanager.lucknow@finsure.in` / `password123`) — View the assigned application in the review queue (`/applications`), verify documents, and approve/reject with remarks.
- [x] Login as Admin (`admin@finsure.in` / `password123`) — View the dashboard (`/dashboard`) with KPIs, branch performance, and audit trail.

Enjoy building & exploring **FinSure Solutions**! 🚀
