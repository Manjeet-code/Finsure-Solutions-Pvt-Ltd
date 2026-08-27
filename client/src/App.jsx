import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Branches from './pages/Branches';
import BranchManagers from './pages/BranchManagers';
import LoanProducts from './pages/LoanProducts';
import EmiCalculatorPage from './pages/EmiCalculatorPage';
import EligibilityCheckerPage from './pages/EligibilityCheckerPage';
import FinancialGuidesPage from './pages/FinancialGuidesPage';
import BranchLocatorPage from './pages/BranchLocatorPage';
import ApplyLoan from './pages/ApplyLoan';
import MyApplications from './pages/MyApplications';
import ApplicationDetails from './pages/ApplicationDetails';
import UserLoanProducts from './pages/UserLoanProducts';
import ReviewQueue from './pages/ReviewQueue';
import DocumentVerification from './pages/DocumentVerification';
import RepaymentEmiPage from './pages/RepaymentEmiPage';
import OverdueEmiReport from './pages/OverdueEmiReport';
import PlatformAnalyticsPage from './pages/PlatformAnalyticsPage';
import AuditLogPage from './pages/AuditLogPage';
import ManagerMobilePage from './pages/ManagerMobilePage';
import UpcomingFeaturePlaceholder from './components/common/UpcomingFeaturePlaceholder';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Resource Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="calculator" element={<EmiCalculatorPage />} />
            <Route path="eligibility" element={<EligibilityCheckerPage />} />
            <Route path="guides" element={<FinancialGuidesPage />} />
            <Route path="locator" element={<BranchLocatorPage />} />
            <Route path="branch-locator" element={<BranchLocatorPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Applicant Protected Routes (Phase 5) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="Applicant Dashboard">
                  <CitizenDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="Available Loan Schemes">
                  <UserLoanProducts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="Apply for Loan">
                  <ApplyLoan />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply/:productId"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="Apply for Loan">
                  <ApplyLoan />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="My Applications">
                  <MyApplications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/repayment"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout title="EMI Schedule & Repayment Tracker">
                  <RepaymentEmiPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['USER', 'BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Application Details & Status Tracker">
                  <ApplicationDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Branch Manager Protected Dashboard */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Branch Manager Operations">
                  <ManagerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Review Queue (Phase 6 Routing Engine & Queue for Branch Manager) */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Branch Application Review Queue">
                  <ReviewQueue />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Document Verification & Decision (Phase 7 Engine for Branch Manager) */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Document Verification Workspace">
                  <DocumentVerification />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Overdue EMI Report (Phase 9 Engine for Manager & Admin) */}
          <Route
            path="/overdue-report"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Overdue EMI Recovery & Risk Report">
                  <OverdueEmiReport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Branch Manager Mobile Field Inspection View (Phase 14) */}
          <Route
            path="/manager/mobile"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <ManagerMobilePage />
              </ProtectedRoute>
            }
          />

          {/* Overdue Reviews & Alerts (Phase 10 Roadmap Placeholder) */}
          <Route
            path="/alerts"
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
                <DashboardLayout title="Overdue Reviews & SLA Alerts">
                  <UpcomingFeaturePlaceholder
                    featureName="Overdue Reviews & Escalation Alerts"
                    targetPhase="Phase 10"
                    prerequisite="Phase 7 (Workflow Engine & Review SLA Tracking)"
                    description="Tracks applications exceeding the branch turnaround SLA deadline, missing document notifications, and overdue EMI alerts."
                  />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Platform Analytics (Phase 11 Engine for Admin) */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Platform Analytics & Decision Control">
                  <PlatformAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Audit Trail (Phase 12 Auditability & Security) */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'BRANCH_MANAGER']}>
                <DashboardLayout title="Platform Audit Trail & Security Logs">
                  <AuditLogPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Dashboard & Management */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Platform Super Admin Dashboard">
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Branch Network Management">
                  <Branches />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/branch-managers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Branch Manager Staff Onboarding">
                  <BranchManagers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan-products"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Loan Products Management">
                  <LoanProducts />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
