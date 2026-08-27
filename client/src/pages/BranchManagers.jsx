import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Plus, Building2, Mail, Phone, AlertOctagon, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const BranchManagers = () => {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Onboard Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    branchId: '',
  });

  // Fire Manager Modal State
  const [firingManager, setFiringManager] = useState(null);
  const [presetReason, setPresetReason] = useState('Violation of FinSure Compliance & Ethics Policy');
  const [customReason, setCustomReason] = useState('');
  const [fireLoading, setFireLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, managersRes] = await Promise.all([
        api.get('/branches'),
        api.get('/auth/managers').catch(() => ({ data: [] })),
      ]);

      const bList = branchesRes.data || [];
      setBranches(bList);

      let mList = managersRes.data || [];
      // Fallback: if managers API returns empty, extract managers populated in branches
      if (mList.length === 0) {
        mList = bList.map((b) => b.managerId).filter(Boolean);
      }
      setManagers(mList);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.post('/auth/create-manager', formData);
      setSuccessMsg(`Branch Manager ${formData.name} onboarded successfully!`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: 'password123', branchId: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create Branch Manager account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFireSubmit = async (e) => {
    e.preventDefault();
    if (!firingManager) return;

    const finalReason = presetReason === 'Custom' ? customReason : presetReason;
    if (!finalReason || !finalReason.trim()) {
      setError('Please provide a valid reason for termination.');
      return;
    }

    setFireLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.post(`/auth/fire-manager/${firingManager._id}`, {
        reason: finalReason,
      });

      setSuccessMsg(res.data?.message || `Branch Manager ${firingManager.name} has been terminated.`);
      setFiringManager(null);
      setCustomReason('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fire branch manager');
    } finally {
      setFireLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Branch Managers Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Onboard, inspect performance, or terminate Branch Manager accounts with official compliance logging.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">
          <Plus size={18} /> Onboard Branch Manager
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertOctagon size={18} className="text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* Managers Table Card */}
      <Card padding={false} className="overflow-hidden border-slate-200">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading branch manager accounts...</div>
        ) : managers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No branch manager accounts registered. Click + Onboard Branch Manager above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Manager Profile</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Assigned Branch</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {managers.map((manager) => {
                  const isFired = manager.status === 'FIRED' || manager.isActive === false;
                  const assignedBranch = manager.branchId;

                  return (
                    <tr key={manager._id} className={`hover:bg-slate-50/80 transition-colors ${isFired ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isFired ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-900'
                          }`}>
                            {isFired ? <UserX size={18} /> : <UserCheck size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{manager.name || manager.email}</div>
                            <div className="text-xs text-slate-400 font-mono">ID: {manager._id}</div>
                            {isFired && (
                              <div className="text-[10px] text-red-600 font-bold mt-0.5 italic">
                                Reason: {manager.firingReason || 'Compliance Violation'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{manager.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{manager.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {assignedBranch ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-slate-800 text-xs font-semibold">{assignedBranch.branchName}</div>
                              <div className="text-[10px] text-blue-600 font-bold">{assignedBranch.branchCode} ({assignedBranch.city})</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned / Terminated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isFired ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold border border-red-200">
                            FIRED / TERMINATED
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isFired ? (
                          <button
                            onClick={() => {
                              setFiringManager(manager);
                              setError(null);
                            }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <UserX size={14} /> Fire Manager
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold italic">Terminated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Fire / Terminate Branch Manager Modal */}
      {firingManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100 relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-red-600 flex items-center gap-2">
                  <AlertOctagon size={20} /> Terminate & Fire Branch Manager
                </h3>
                <p className="text-xs text-slate-500 font-medium">Revoke portal access and unassign from branch</p>
              </div>
              <button onClick={() => setFiringManager(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Target Manager Details Box */}
            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-red-950 text-sm">{firingManager.name}</div>
              <div className="text-red-800">{firingManager.email} ({firingManager.phone})</div>
              {firingManager.branchId && (
                <div className="text-[11px] font-bold text-blue-700 mt-1">
                  Currently Assigned: {firingManager.branchId.branchName}
                </div>
              )}
            </div>

            <form onSubmit={handleFireSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Termination Reason *
                </label>
                <select
                  value={presetReason}
                  onChange={(e) => setPresetReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500"
                >
                  <option value="Violation of FinSure Compliance & Ethics Policy">Violation of FinSure Compliance & Ethics Policy</option>
                  <option value="Underperformance & Failed Branch KPI Targets">Underperformance & Failed Branch KPI Targets</option>
                  <option value="Unjustified Loan Application Rejections/Approvals">Unjustified Loan Application Rejections/Approvals</option>
                  <option value="Fraudulent Document Processing / Misconduct">Fraudulent Document Processing / Misconduct</option>
                  <option value="Customer Abuse or Negligence">Customer Abuse or Negligence</option>
                  <option value="Custom">Other Custom Reason...</option>
                </select>
              </div>

              {presetReason === 'Custom' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specific Reason Details *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Enter detailed justification for terminating this manager..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                This action will deactivate login privileges and unassign the manager immediately.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setFiringManager(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={fireLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  {fireLoading ? 'Terminating...' : 'Confirm Termination & Fire Manager'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Onboard New Branch Manager</h3>

            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rohit Mathur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="branchmanager.lucknow@finsure.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a branch...</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode}) — {b.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  Create Manager Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BranchManagers;
