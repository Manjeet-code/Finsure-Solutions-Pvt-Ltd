import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children, title = 'Dashboard', role = null }) => {
  const { roleNormalized } = useAuth();
  const activeRole = role || roleNormalized;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar role={activeRole} />

      {/* Main Content Container */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header title={title} />
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
