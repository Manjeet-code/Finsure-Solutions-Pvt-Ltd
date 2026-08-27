import React from 'react';

const Badge = ({ children, status = 'default', className = '' }) => {
  const statusStyles = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DISBURSED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    DOCS_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
    SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    HIGH_RISK: 'bg-red-100 text-red-800 border-red-300 font-semibold',
    MEDIUM_RISK: 'bg-amber-100 text-amber-800 border-amber-300',
    LOW_RISK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const key = String(status).toUpperCase();
  const style = statusStyles[key] || statusStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
