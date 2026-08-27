import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, MapPin, User, CheckCircle, XCircle, Edit, Power } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [formData, setFormData] = useState({
    branchCode: '',
    branchName: '',
    city: '',
    state: 'Uttar Pradesh',
    address: '',
    pincodeRanges: '',
    managerId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/branches', { params: { search: searchTerm } });
      setBranches(data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      // Fetch users who can be assigned as branch managers
      const { data } = await api.get('/auth/profile').catch(() => null);
      // For populating manager options in modal
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchTerm]);

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        branchCode: branch.branchCode || '',
        branchName: branch.branchName || '',
        city: branch.city || '',
        state: branch.state || 'Uttar Pradesh',
        address: branch.address || '',
        pincodeRanges: Array.isArray(branch.pincodeRanges) ? branch.pincodeRanges.join(', ') : '',
        managerId: branch.managerId?._id || branch.managerId || '',
      });
    } else {
      setEditingBranch(null);
      setFormData({
        branchCode: '',
        branchName: '',
        city: '',
        state: 'Uttar Pradesh',
        address: '',
        pincodeRanges: '',
        managerId: '',
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch._id}`, formData);
      } else {
        await api.post('/branches', formData);
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/branches/${id}/toggle-status`);
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change branch status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Branch Network</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage regional branches, pincode routing mappings, and assigned branch managers.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} /> Add New Branch
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by branch name, code, city, or pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Branches Table */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading branch data...</div>
        ) : branches.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No branches found matching your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Branch Code / Name</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Pincodes Served</th>
                  <th className="px-6 py-3.5">Manager Assigned</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{branch.branchName}</div>
                          <div className="text-xs text-blue-600 font-bold tracking-wide">{branch.branchCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{branch.city}, {branch.state || 'UP'}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{branch.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {branch.pincodeRanges && branch.pincodeRanges.length > 0 ? (
                          branch.pincodeRanges.map((pin, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200">
                              {pin}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {branch.managerId ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-teal-600" />
                          <div>
                            <div className="text-slate-800 text-xs font-semibold">{branch.managerId.name || 'Assigned'}</div>
                            <div className="text-[10px] text-slate-500">{branch.managerId.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {branch.isActive ? (
                        <Badge status="APPROVED">Active</Badge>
                      ) : (
                        <Badge status="DRAFT">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(branch)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(branch._id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            branch.isActive
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={branch.isActive ? 'Deactivate Branch' : 'Activate Branch'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingBranch ? 'Edit Branch Details' : 'Create New Branch'}
            </h3>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-LKO-01"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Lucknow Gomti Nagar Branch"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Lucknow"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Full office address details..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pincodes Served (Comma-separated for auto-routing)
                </label>
                <input
                  type="text"
                  placeholder="226010, 226012, 226016"
                  value={formData.pincodeRanges}
                  onChange={(e) => setFormData({ ...formData, pincodeRanges: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
