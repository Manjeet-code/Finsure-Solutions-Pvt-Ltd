import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Percent, Clock, FileText, CheckCircle, Edit, Power, DollarSign } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const LoanProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    interestRate: '8.5',
    minAmount: '50000',
    maxAmount: '1000000',
    tenureOptionsMonths: '12, 24, 36, 48, 60',
    eligibilityCriteria: 'Minimum age 21, regular monthly income proof, CIBIL > 700.',
    requiredDocuments: 'PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT',
    description: 'Flexible loan option with low interest rate and rapid digital approval.',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/loan-products', { params: { search: searchTerm } });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching loan products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productCode: product.productCode || '',
        name: product.name || '',
        interestRate: String(product.interestRate || '8.5'),
        minAmount: String(product.minAmount || '50000'),
        maxAmount: String(product.maxAmount || '1000000'),
        tenureOptionsMonths: Array.isArray(product.tenureOptionsMonths) ? product.tenureOptionsMonths.join(', ') : '12, 24, 36, 48, 60',
        eligibilityCriteria: product.eligibilityCriteria || '',
        requiredDocuments: Array.isArray(product.requiredDocuments) ? product.requiredDocuments.join(', ') : 'PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT',
        description: product.description || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        productCode: '',
        name: '',
        interestRate: '8.5',
        minAmount: '50000',
        maxAmount: '1000000',
        tenureOptionsMonths: '12, 24, 36, 48, 60',
        eligibilityCriteria: 'Minimum age 21, regular monthly income proof.',
        requiredDocuments: 'PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT',
        description: 'Flexible loan product for verified applicants.',
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
      if (editingProduct) {
        await api.put(`/loan-products/${editingProduct._id}`, formData);
      } else {
        await api.post('/loan-products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save loan product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/loan-products/${id}/toggle-status`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change product status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Loan Products</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure available loan schemes, interest rates, tenure options, and mandatory document checklists.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} /> Add Loan Product
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by loan product name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading loan product schemes...</div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          No loan products configured yet. Click "Add Loan Product" to create one.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-800 rounded-xl flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{product.name}</h3>
                      <span className="text-xs text-indigo-600 font-bold tracking-wide">{product.productCode}</span>
                    </div>
                  </div>
                  {product.isActive ? (
                    <Badge status="APPROVED">Active</Badge>
                  ) : (
                    <Badge status="DRAFT">Inactive</Badge>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block font-medium">Interest Rate</span>
                    <span className="font-bold text-slate-800 text-sm">{product.interestRate}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Amount Range</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{Number(product.minAmount).toLocaleString('en-IN')} – ₹{Number(product.maxAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Tenure options */}
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Tenure Options (Months)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(product.tenureOptionsMonths) &&
                      product.tenureOptionsMonths.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-medium text-xs rounded border border-blue-200">
                          {m}m
                        </span>
                      ))}
                  </div>
                </div>

                {/* Document Checklist */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Required KYC Documents
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(product.requiredDocuments) &&
                      product.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[11px] rounded border border-slate-200">
                          {doc}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)} className="flex items-center gap-1">
                    <Edit size={14} /> Edit
                  </Button>
                  <Button
                    variant={product.isActive ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleStatus(product._id)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Power size={14} /> {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800">
              {editingProduct ? 'Edit Loan Product' : 'Configure New Loan Scheme'}
            </h3>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    placeholder="PL-101"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Personal Loan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="8.5"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000000"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenure Options in Months (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="12, 24, 36, 48, 60"
                  value={formData.tenureOptionsMonths}
                  onChange={(e) => setFormData({ ...formData, tenureOptionsMonths: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required KYC Documents (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT"
                  value={formData.requiredDocuments}
                  onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Minimum age 21, regular monthly income..."
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product description for applicants..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanProducts;
