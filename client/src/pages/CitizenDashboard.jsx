import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Calendar, Activity, Bell, X, Loader, Landmark } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../lib/axios';

const CitizenDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    loanProductId: '',
    branchId: '',
    amount: '',
    tenureMonths: '',
    purpose: ''
  });
  const [docFiles, setDocFiles] = useState({
    panCard: null,
    aadhaarCard: null,
    salarySlip: null,
    bankStatement: null
  });
  const [selectedLoanDocs, setSelectedLoanDocs] = useState([]);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // Profile Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const handleOpenProfile = () => {
    setProfileForm({ name: userInfo.name || '', phone: userInfo.phone || '', password: '' });
    setProfileMsg(null);
    setProfileErr(null);
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    setProfileErr(null);
    try {
      const payload = { name: profileForm.name, phone: profileForm.phone };
      if (profileForm.password) payload.password = profileForm.password;
      const { data } = await api.put('/auth/profile', payload);
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => {
        setShowProfileModal(false);
        setProfileMsg(null);
      }, 1200);
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, productsRes, branchesRes, paymentsRes] = await Promise.all([
        api.get('/loans/my'),
        api.get('/loan-products'),
        api.get('/branches'),
        api.get('/payments/myhistory')
      ]);
      const loansList = Array.isArray(loansRes.data?.data) ? loansRes.data.data : Array.isArray(loansRes.data) ? loansRes.data : [];
      setLoans(loansList);
      setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data : Array.isArray(productsRes.data) ? productsRes.data : []);
      setBranches(Array.isArray(branchesRes.data?.data) ? branchesRes.data.data : Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setPayments(Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data : Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoans([]);
      setProducts([]);
      setBranches([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      // 1. Create Loan Application
      const res = await api.post('/loans', formData);
      const loanId = res.data._id;

      // 2. Upload attached documents if any selected
      const uploadPromises = [];
      
      const docTypes = [
        { key: 'panCard', name: 'PAN Card' },
        { key: 'aadhaarCard', name: 'Aadhaar Card' },
        { key: 'salarySlip', name: 'Salary Slip / Income Proof' },
        { key: 'bankStatement', name: 'Bank Statement' }
      ];

      for (const doc of docTypes) {
        if (docFiles[doc.key]) {
          const docData = new FormData();
          docData.append('document', docFiles[doc.key]);
          docData.append('type', doc.name);
          uploadPromises.push(api.post(`/loans/${loanId}/documents`, docData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }));
        }
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      setShowModal(false);
      setFormData({ loanProductId: '', branchId: '', amount: '', tenureMonths: '', purpose: '' });
      setDocFiles({ panCard: null, aadhaarCard: null, salarySlip: null, bankStatement: null });
      fetchData(); // Refresh list
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to apply for loan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDocuments = async (loan) => {
    try {
      setDocsLoading(true);
      setShowDocsModal(true);
      const appDocs = loan?.uploadedDocuments || [];
      if (appDocs.length > 0) {
        setSelectedLoanDocs(appDocs);
      } else {
        const targetId = typeof loan === 'object' ? loan._id : loan;
        const res = await api.get(`/loans/${targetId}`);
        const appObj = res.data?.data || res.data;
        setSelectedLoanDocs(appObj?.uploadedDocuments || []);
      }
    } catch (error) {
      console.error('Failed to load documents', error);
      setSelectedLoanDocs(loan?.uploadedDocuments || []);
    } finally {
      setDocsLoading(false);
    }
  };

  const handlePayment = async (loanId, amount) => {
    try {
      setPaymentLoading(true);
      await api.post('/payments', {
        loanId,
        amount,
        paymentMethod: 'UPI' // Default mock method
      });
      setShowPaymentModal(false);
      alert('Payment Successful!');
      fetchData();
    } catch (error) {
      console.error('Error processing payment', error);
      alert(error.response?.data?.message || 'Payment Failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Calculations
  const activeLoan = loans.find(l => l.status === 'Approved' || l.status === 'Active');
  const emiAmount = activeLoan ? Math.ceil((activeLoan.amount + (activeLoan.amount * 0.1)) / activeLoan.tenureMonths) : 0; // Mock calculation (10% flat interest)
  
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoansCount = loans.filter(l => l.status === 'Approved' || l.status === 'Pending').length;
  
  // Total paid for the active loan
  const totalPaidActiveLoan = payments
    .filter(p => p.loanId?._id === activeLoan?._id && p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userInfo.name || 'Citizen'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenProfile} className="text-sm font-semibold">
            Edit Profile
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <Bell size={18} /> Notifications
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>Apply for New Loan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Loans" value={loans.length} icon={<Wallet className="text-blue-500" />} />
        <KPICard title="Total Amount Applied" value={`₹${totalLoanAmount.toLocaleString()}`} icon={<Landmark className="text-indigo-500" />} />
        <KPICard title="Active Loans" value={activeLoansCount} icon={<Activity className="text-emerald-500" />} />
        <KPICard title="Next EMI Due" value={`₹${emiAmount.toLocaleString()}`} subValue={activeLoan ? "Due soon" : "No active payments"} icon={<Calendar className="text-orange-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">My Loan Applications</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b-2 border-gray-100 bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium text-gray-500">Loan Type</th>
                  <th scope="col" className="px-6 py-4 font-medium text-gray-500">Amount</th>
                  <th scope="col" className="px-6 py-4 font-medium text-gray-500">Tenure</th>
                  <th scope="col" className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-gray-500 text-right">Documents</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{loan.loanProductId ? loan.loanProductId.name : 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">₹{loan.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">{loan.tenureMonths} Mos</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        loan.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        loan.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDocuments(loan)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View Documents
                      </button>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">You haven't applied for any loans yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment / Upcoming EMI Section */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-blue-800 text-white border-none">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold opacity-90">Upcoming EMI</h2>
                <p className="text-3xl font-extrabold mt-2">₹{emiAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <CreditCard size={24} />
              </div>
            </div>
            
            {activeLoan ? (
              <>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm opacity-90">
                    <span>Loan Amount</span>
                    <span className="font-semibold">₹{activeLoan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-90">
                    <span>Total Paid</span>
                    <span className="font-semibold">₹{totalPaidActiveLoan.toLocaleString()}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-white text-primary hover:bg-gray-50 focus:ring-white"
                >
                  Pay Now
                </Button>
              </>
            ) : (
              <div className="py-6 text-center opacity-80">
                <p>You don't have any active approved loans that require payment.</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-4">Payment History</h2>
            <div className="space-y-3 opacity-90">
              {payments.slice(0, 4).map(payment => (
                <div key={payment._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">EMI Payment - {payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold text-sm ${payment.status === 'Success' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    ₹{payment.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {payments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No past payments</p>}
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Loan Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Apply for a New Loan</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Product</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                      value={formData.loanProductId}
                      onChange={(e) => setFormData({...formData, loanProductId: e.target.value})}
                    >
                      <option value="">Select a loan type</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} (Max: ₹{p.maxAmount})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                      value={formData.branchId}
                      onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                    >
                      <option value="">Select nearest branch</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.branchName}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Loan Amount (₹)" type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  <Input label="Tenure (Months)" type="number" required value={formData.tenureMonths} onChange={(e) => setFormData({...formData, tenureMonths: e.target.value})} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Loan</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      rows="2" required value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Required Document Uploads */}
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Required KYC & Income Documents</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">PAN Card</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setDocFiles({...docFiles, panCard: e.target.files[0]})}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Aadhaar Card</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setDocFiles({...docFiles, aadhaarCard: e.target.files[0]})}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Salary Slip / Income Proof</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setDocFiles({...docFiles, salarySlip: e.target.files[0]})}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bank Statement</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setDocFiles({...docFiles, bankStatement: e.target.files[0]})}
                          className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-4" disabled={formLoading}>
                    {formLoading ? 'Submitting Application & Uploading Docs...' : 'Submit Application'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && activeLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !paymentLoading && setShowPaymentModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-blue-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
              <p className="text-gray-600 mb-6">
                You are about to pay your EMI of <strong className="text-gray-900">₹{emiAmount.toLocaleString()}</strong> via UPI.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handlePayment(activeLoan._id, emiAmount)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Processing...' : 'Confirm Pay'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Attached Documents Modal */}
      <AnimatePresence>
        {showDocsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDocsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Attached Documents</h3>
                <button onClick={() => setShowDocsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {docsLoading ? (
                <div className="py-8 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={32} /></div>
              ) : selectedLoanDocs.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedLoanDocs.map((doc, idx) => {
                    const docType = (doc.documentType || doc.type || 'KYC Document').replace('_', ' ');
                    const isVerified = doc.status === 'VERIFIED' || doc.isVerified;
                    const rawUrl = doc.fileUrl || doc.url || '';
                    const fileUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000${rawUrl}`;

                    return (
                      <div key={doc._id || idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{docType}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        {rawUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-blue-600 hover:underline px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm"
                          >
                            View File
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No documents uploaded for this application.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !profileLoading && setShowProfileModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {profileErr && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                  {profileErr}
                </div>
              )}

              {profileMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={userInfo.email || ''}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" disabled={profileLoading}>
                  {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const KPICard = ({ title, value, subValue, icon }) => (
  <Card hoverable className="flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-xs font-medium text-gray-400 mt-0.5">{subValue}</p>}
    </div>
  </Card>
);

export default CitizenDashboard;
