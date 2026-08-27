import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Package, 
  FolderCheck, 
  Landmark, 
  Bell, 
  ShieldAlert, 
  UserCheck, 
  PieChart 
} from 'lucide-react';

const Sidebar = ({ role = 'USER' }) => {
  const location = useLocation();

  const userNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Loan Products', path: '/products', icon: Package },
    { label: 'Apply for Loan', path: '/apply', icon: FileText },
    { label: 'My Applications', path: '/my-applications', icon: FolderCheck },
    { label: 'Repayment & EMI', path: '/repayment', icon: Landmark },
  ];

  const managerNav = [
    { label: 'Branch Dashboard', path: '/manager', icon: LayoutDashboard },
    { label: 'Review Queue', path: '/applications', icon: FolderCheck },
    { label: 'Document Verification', path: '/documents', icon: FileText },
    { label: 'Overdue EMI Report', path: '/overdue-report', icon: ShieldAlert },
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Review Queue', path: '/applications', icon: FolderCheck },
    { label: 'Branches', path: '/branches', icon: Building2 },
    { label: 'Branch Managers', path: '/branch-managers', icon: UserCheck },
    { label: 'Loan Products', path: '/loan-products', icon: Package },
    { label: 'Overdue EMI Report', path: '/overdue-report', icon: ShieldAlert },
    { label: 'Platform Analytics', path: '/analytics', icon: PieChart },
    { label: 'Audit Trail', path: '/audit', icon: ShieldAlert },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return adminNav;
      case 'BRANCH_MANAGER':
        return managerNav;
      default:
        return userNav;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-800">
      {/* Official FinSure Brand Header */}
      <Link to="/" className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
        <div className="flex items-center justify-center p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-sm shrink-0">
          <img src="/logo.png" alt="FinSure Logo" className="h-7 w-7 object-contain rounded-lg" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-base text-white tracking-tight leading-tight">FinSure</span>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider -mt-0.5">Solutions Pvt Ltd</span>
        </div>
      </Link>

      {/* Role Navigation */}
      <div className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {role === 'ADMIN' ? 'Management' : role === 'BRANCH_MANAGER' ? 'Branch Workspace' : 'User Portal'}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        FinSure Platform v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
