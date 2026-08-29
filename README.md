# FinSure Solutions Pvt Ltd — Digital Loan Origination & Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%2FLocal-green.svg)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-teal.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)

> **FinSure Solutions Pvt Ltd** is a full-stack, enterprise-grade digital loan origination and lifecycle management platform. It streamlines the entire lending process — from customer application and AI credit scoring to branch-based document verification, manager approval/rejection, sanctioning, disbursement, and EMI repayment tracking.

---

## 🌟 Key Features & Functional Modules

### 👤 1. Multi-Role Authentication & Access Control (RBAC)
- **Role-Based Workflows**: Tailored portals and distinct permissions for **Applicants/Users**, **Branch Managers**, and **Platform Administrators**.
- **Secure Authentication**: JWT-based session management, bcrypt password hashing, and route protection.

### 🏢 2. Smart Branch Routing & Territory Management
- **Automated Routing**: Connects applicants with the nearest branch based on Pincode and Region lookup.
- **Branch Management**: Admins can manage branch details, assign branch managers, and track localized performance metrics.

### 💳 3. Flexible Loan Product Management
- **Catalog Management**: Admin-configurable loan products (Personal, Home, Vehicle, Business loans).
- **Dynamic Terms**: Configurable interest rates, min/max loan amounts, tenure ranges, and custom required document checklists.

### 📝 4. Digital Loan Application & Document Verification
- **Multi-Step Application**: Interactive form with real-time field validation and draft saving.
- **Document Management**: KYC upload (Aadhaar, PAN, Bank Statements, Salary Slips).
- **Branch Review Queue**: Managers can inspect documents, flag mismatches, add review comments, and approve/reject applications.

### 🤖 5. AI Risk & Credit Eligibility Service
- **FastAPI Microservice**: Dedicated Python AI service for credit risk scoring and applicant eligibility evaluation.
- **Instant Decisioning**: Calculates risk confidence scores based on income, age, existing liabilities, and loan amount.

### 📊 6. Platform Analytics & EMI Management
- **Admin Dashboard**: System-wide loan metrics, total disbursements, branch performance comparisons, and full audit logs.
- **EMI Repayment Calculator**: Dynamic EMI calculation, payment schedule generation, and mock payment gateway integration.

---

## 🏗️ Tech Stack & System Architecture

```text
Finsure-Solutions-Pvt-Ltd/
├── client/                  # React 19 + Vite + Tailwind CSS Frontend (Port 5173)
│   ├── src/
│   │   ├── components/      # Reusable UI, Forms, Modals & Stepper UI
│   │   ├── pages/           # Portals: Auth, Dashboard, Applications, Branches, Products
│   │   ├── services/        # Axios API Client & Endpoints
│   │   └── context/         # Auth State Management Context
│   └── vite.config.js       # Vite configuration with Backend API Proxy
│
├── server/                  # Node.js + Express REST API Backend (Port 5000)
│   ├── src/
│   │   ├── config/          # DB connection & Constants
│   │   ├── middleware/      # JWT Middleware & Role Authorization
│   │   ├── routes/          # Express Routes for Auth, Branch, Application, Loan Product
│   │   └── models/          # Mongoose Schemas (User, Branch, LoanProduct, Application)
│   ├── index.js             # Server Entrypoint & API Middleware setup
│   └── seed.js              # Automatic Demo Data Seeding Script
│
└── ai-service/              # Python FastAPI Microservice (Port 8000)
    ├── main.py              # Credit Scoring & Eligibility Prediction API
    └── requirements.txt     # Python Dependencies
```

---

## 🔑 Demo Accounts & Pre-Configured Roles

All demo accounts come pre-configured with the default password: **`password123`**. Quick-fill buttons are available directly on the login screen.

| Role | Email | Representative | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Applicant / User** | `user@finsure.in` | Ananya Gupta | Apply for loans, upload KYC, track status, view EMI schedule |
| **Branch Manager — Lucknow** | `branchmanager.lucknow@finsure.in` | Rohit Mathur | Review branch queue, verify documents, approve/reject |
| **Branch Manager — Delhi** | `branchmanager.delhi@finsure.in` | Priya Nair | Review branch queue, verify documents, approve/reject |
| **System Administrator** | `admin@finsure.in` | System Admin | Branch & product catalog management, platform analytics |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (Local, Docker, or [MongoDB Atlas Free Cluster](https://www.mongodb.com/atlas))
- [Python 3.9+](https://www.python.org/) *(Optional, for AI service)*

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Manjeet-code/Finsure-Solutions-Pvt-Ltd.git
cd Finsure-Solutions-Pvt-Ltd
```

---

### Step 2: Backend Setup (`server`)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file (.env)
# Set PORT=5000 and your MONGODB_URI (e.g. mongodb://localhost:27017/finsure)

# Start backend server (Auto-seeds demo data on boot)
npm run dev
```

---

### Step 3: Frontend Setup (`client`)
Open a new terminal window in the root directory:
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Step 4: AI Service Setup (`ai-service`) *(Optional)*
Open a new terminal window:
```bash
cd ai-service

# Create and activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies & start server
pip install -r requirements.txt
python main.py
```
FastAPI server runs on **`http://localhost:8000`**.

---

## 📚 Detailed Documentation

- **[SETUP.md](./SETUP.md)** — Step-by-step developer setup & troubleshooting guide.
- **[PRD.md](./PRD.md)** — Complete Product Requirement Document.
- **[FinSure_Phase0_Architecture.md](./FinSure_Phase0_Architecture.md)** — Architectural design & domain specifications.
- **[FinSure_Master_Build_Blueprint.md](./FinSure_Master_Build_Blueprint.md)** — Master build blueprint & guidelines.

---

## 📄 License

This project is developed for **FinSure Solutions Pvt Ltd**. All rights reserved.
