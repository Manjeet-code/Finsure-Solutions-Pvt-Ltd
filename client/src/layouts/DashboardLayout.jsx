import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children, title = 'Dashboard', role = null }) => {
  const { roleNormalized } = useAuth();
  const activeRole = role || roleNormalized;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        role={activeRole} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Container */}
      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          title={title} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <main className="p-3 sm:p-6 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
