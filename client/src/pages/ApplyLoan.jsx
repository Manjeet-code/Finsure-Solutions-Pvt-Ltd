import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle2, FileText, Upload, ArrowRight, ArrowLeft, Save, ShieldCheck, 
  AlertCircle, DollarSign, Calendar, Landmark, User, FileCheck, Check
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

const ApplyLoan = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [applicationId, setApplicationId] = useState(null);

  // Form State
  const [amount, setAmount] = useState(200000);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [purpose, setPurpose] = useState('Personal / Household Requirement');

  const [applicantDetails, setApplicantDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: 'Gomti Nagar, Vibhuti Khand',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226010',
    monthlyIncome: 65000,
    employmentType: 'Salaried',
    panNumber: '',
    aadhaarNumber: '',
  });

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/loan-products');
      const activeProducts = (data || []).filter((p) => p.isActive);
      setProducts(activeProducts);

      if (productId) {
        const found = activeProducts.find((p) => p._id === productId || p.productCode === productId);
        if (found) {
          setSelectedProduct(found);
          setAmount(found.minAmount || 100000);
          setTenureMonths(found.tenureOptionsMonths?.[0] || 36);
        } else if (activeProducts.length > 0) {
          setSelectedProduct(activeProducts[0]);
        }
      } else if (activeProducts.length > 0) {
        setSelectedProduct(activeProducts[0]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleProductSelect = (p) => {
    setSelectedProduct(p);
    setAmount(p.minAmount || 50000);
    if (p.tenureOptionsMonths && p.tenureOptionsMonths.length > 0) {
      setTenureMonths(p.tenureOptionsMonths[0]);
    }
  };

  const handleNextFromStep2 = () => {
    setError(null);
    if (!applicantDetails.fullName?.trim()) {
      setError('Please fill in your Full Name.');
      return;
    }
    if (!applicantDetails.phone?.trim()) {
      setError('Please fill in your Phone Number.');
      return;
    }
    if (!applicantDetails.address?.trim()) {
      setError('Please fill in your Residential Address.');
      return;
    }
    if (!applicantDetails.city?.trim() || !applicantDetails.pincode?.trim()) {
      setError('Please fill in your City and Pincode.');
      return;
    }
    if (!applicantDetails.panNumber?.trim() || !applicantDetails.aadhaarNumber?.trim()) {
      setError('Please enter your PAN Card and Aadhaar Number.');
      return;
    }
    setStep(3);
  };

  const requiredDocs = selectedProduct?.requiredDocuments || ['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT'];

  const handleNextFromStep3 = () => {
    setError(null);
    const missingDocs = requiredDocs.filter((docType) => !uploadedDocs[docType]);

    if (missingDocs.length > 0) {
      setError(
        `Cannot proceed to Step 4! Please upload all required KYC documents (${missingDocs
          .map((d) => d.replace('_', ' '))
          .join(', ')}) before advancing to Review & Submit.`
      );
      return;
    }
    setStep(4);
  };

  const handleStepClick = (targetStep) => {
    setError(null);
    if (targetStep === step) return;

    if (targetStep > step) {
      if (step === 1 && !selectedProduct) {
        setError('Please select a loan scheme first.');
        return;
      }
      if (step === 2 && (!applicantDetails.fullName?.trim() || !applicantDetails.address?.trim() || !applicantDetails.panNumber?.trim())) {
        setError('Please complete all required Applicant Details in Step 2.');
        return;
      }
      if (step === 3 && targetStep > 3) {
        const missingDocs = requiredDocs.filter((docType) => !uploadedDocs[docType]);
        if (missingDocs.length > 0) {
          setError(
            `Cannot proceed! Please upload all required KYC documents (${missingDocs
              .map((d) => d.replace('_', ' '))
              .join(', ')}) first.`
          );
          return;
        }
      }
    }
    setStep(targetStep);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        loanProductId: selectedProduct._id,
        amount,
        tenureMonths,
        purpose,
        applicantDetails: {
          ...applicantDetails,
          address: applicantDetails.address?.trim() || 'Gomti Nagar, Lucknow',
          city: applicantDetails.city?.trim() || 'Lucknow',
          state: applicantDetails.state?.trim() || 'Uttar Pradesh',
          pincode: applicantDetails.pincode?.trim() || '226010',
        },
        status: 'DRAFT',
      };

      let res;
      if (applicationId) {
        res = await api.put(`/loans/${applicationId}`, payload);
      } else {
        res = await api.post('/loans', payload);
        const newId = res.data?.data?._id || res.data?._id;
        if (newId) {
          setApplicationId(newId);
        }
      }
      alert('Draft application saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft application');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;
    setUploadingDoc(documentType);
    setError(null);

    try {
      let currentAppId = applicationId;
      if (!currentAppId) {
        const payload = {
          loanProductId: selectedProduct._id,
          amount,
          tenureMonths,
          purpose,
          applicantDetails: {
            fullName: applicantDetails.fullName || user?.name || 'Applicant',
            phone: applicantDetails.phone || '9876543210',
            email: applicantDetails.email || user?.email || '',
            address: applicantDetails.address?.trim() || 'Gomti Nagar, Lucknow',
            city: applicantDetails.city?.trim() || 'Lucknow',
            state: applicantDetails.state?.trim() || 'Uttar Pradesh',
            pincode: applicantDetails.pincode?.trim() || '226010',
            monthlyIncome: applicantDetails.monthlyIncome || 50000,
            employmentType: applicantDetails.employmentType || 'Salaried',
            panNumber: applicantDetails.panNumber || 'ABCDE1234F',
            aadhaarNumber: applicantDetails.aadhaarNumber || '123456789012',
          },
          status: 'DRAFT',
        };
        const draftRes = await api.post('/loans', payload);
        currentAppId = draftRes.data?.data?._id || draftRes.data?._id;
        setApplicationId(currentAppId);
      }

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('document', file);

      await api.post(`/loans/${currentAppId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedDocs((prev) => ({
        ...prev,
        [documentType]: {
          fileName: file.name,
          status: 'Uploaded',
          uploadedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || `Failed to upload ${documentType}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmitApplication = async () => {
    setError(null);
    
    // Final document verification check
    const missingDocs = requiredDocs.filter((docType) => !uploadedDocs[docType]);
    if (missingDocs.length > 0) {
      setError(`Cannot submit! Missing required KYC documents: ${missingDocs.map((d) => d.replace('_', ' ')).join(', ')}.`);
      return;
    }

    setLoading(true);
    try {
      let currentAppId = applicationId;
      if (!currentAppId) {
        const payload = {
          loanProductId: selectedProduct._id,
          amount,
          tenureMonths,
          purpose,
          applicantDetails: {
            ...applicantDetails,
            address: applicantDetails.address?.trim() || 'Gomti Nagar, Lucknow',
            city: applicantDetails.city?.trim() || 'Lucknow',
            state: applicantDetails.state?.trim() || 'Uttar Pradesh',
            pincode: applicantDetails.pincode?.trim() || '226010',
          },
          status: 'Submitted',
        };
        const res = await api.post('/loans', payload);
        currentAppId = res.data?.data?._id || res.data?._id;
      } else {
        await api.post(`/loans/${currentAppId}/submit`);
      }

      navigate(`/applications/${currentAppId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Wizard Progress Stepper Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Apply for Loan</h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Complete the 4-step digital application to receive instant branch routing & approval.
            </p>
          </div>
          <Button onClick={handleSaveDraft} variant="outline" className="text-xs font-bold flex items-center gap-1.5" disabled={loading}>
            <Save size={14} /> Save Draft
          </Button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {[
            { num: 1, label: 'Loan Scheme' },
            { num: 2, label: 'Applicant Profile' },
            { num: 3, label: 'Document Upload' },
            { num: 4, label: 'Review & Submit' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => handleStepClick(s.num)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : step > s.num
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-white text-blue-600'
                    : step > s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <Check size={12} /> : s.num}
              </div>
              <span className="text-xs font-bold truncate hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" /> {error}
        </div>
      )}

      {/* STEP 1: Select Product & Loan Parameters */}
      {step === 1 && (
        <Card className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 1: Choose Loan Product Scheme</h3>
            <p className="text-slate-500 text-xs">Select your loan category and set your desired borrowing amount.</p>
          </div>

          {/* Loan Scheme Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <div
                key={p._id}
                onClick={() => handleProductSelect(p)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedProduct?._id === p._id
                    ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {p.productCode}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                <div className="text-xs text-slate-600 font-semibold">{p.interestRate}% p.a.</div>
                <div className="text-[11px] text-slate-400">
                  ₹{(p.minAmount / 100000).toFixed(1)}L - ₹{(p.maxAmount / 100000).toFixed(1)}L
                </div>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* Amount Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Required Amount (₹)</span>
                  <span className="text-base font-black text-blue-700">₹{Number(amount).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={selectedProduct.minAmount || 50000}
                  max={selectedProduct.maxAmount || 5000000}
                  step="25000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>₹{Number(selectedProduct.minAmount || 50000).toLocaleString('en-IN')}</span>
                  <span>₹{Number(selectedProduct.maxAmount || 5000000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Tenure Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tenure (Months)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.tenureOptionsMonths || [12, 24, 36, 48, 60]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        tenureMonths === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m} Months ({m / 12} Yrs)
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Loan Purpose
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Home Renovation, Medical Expense, Business Expansion"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2">
              Next: Applicant Details <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Applicant & Financial Info */}
      {step === 2 && (
        <Card className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 2: Applicant Profile & Financial Info</h3>
            <p className="text-slate-500 text-xs">Enter your KYC identification and monthly income details for auto-routing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={applicantDetails.fullName}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, fullName: e.target.value })}
              required
            />
            <Input
              label="Phone Number *"
              value={applicantDetails.phone}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, phone: e.target.value })}
              required
            />
            <Input
              label="Monthly Income (₹) *"
              type="number"
              value={applicantDetails.monthlyIncome}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, monthlyIncome: Number(e.target.value) })}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type *
              </label>
              <select
                value={applicantDetails.employmentType}
                onChange={(e) => setApplicantDetails({ ...applicantDetails, employmentType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Salaried">Salaried Employee</option>
                <option value="Self-Employed">Self-Employed Professional</option>
                <option value="Business">Business Owner</option>
              </select>
            </div>
            <Input
              label="PAN Card Number *"
              placeholder="ABCDE1234F"
              value={applicantDetails.panNumber}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, panNumber: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Aadhaar Number *"
              placeholder="1234 5678 9012"
              value={applicantDetails.aadhaarNumber}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, aadhaarNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="City *"
              value={applicantDetails.city}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, city: e.target.value })}
              required
            />
            <Input
              label="State *"
              value={applicantDetails.state}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, state: e.target.value })}
              required
            />
            <Input
              label="Pincode (Auto Routing) *"
              value={applicantDetails.pincode}
              onChange={(e) => setApplicantDetails({ ...applicantDetails, pincode: e.target.value })}
              placeholder="e.g. 226010"
              required
            />
          </div>

          <Input
            label="Full Residential Address *"
            value={applicantDetails.address}
            onChange={(e) => setApplicantDetails({ ...applicantDetails, address: e.target.value })}
            placeholder="House/Flat No., Building Name, Street, Landmark"
            required
          />

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button onClick={() => setStep(1)} variant="outline" className="flex items-center gap-1.5">
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={handleNextFromStep2} className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2">
              Next: Upload Documents <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Document Upload Checklist */}
      {step === 3 && (
        <Card className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 3: Document Upload Checklist</h3>
            <p className="text-slate-500 text-xs">
              Upload all mandatory documents for <strong className="text-blue-900">{selectedProduct?.name}</strong> to unlock Step 4 (Accepted: PDF, PNG, JPG under 5MB).
            </p>
          </div>

          <div className="space-y-4">
            {requiredDocs.map((docType) => {
              const uploaded = uploadedDocs[docType];
              const isUploading = uploadingDoc === docType;

              return (
                <div
                  key={docType}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    uploaded ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${uploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {uploaded ? <FileCheck size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {docType.replace('_', ' ')}
                        {!uploaded && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Required</span>}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {uploaded ? `Uploaded: ${uploaded.fileName}` : `Mandatory file for ${selectedProduct?.name}`}
                      </p>
                    </div>
                  </div>

                  <div>
                    {uploaded ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs">
                        <Upload size={14} />
                        {isUploading ? 'Uploading...' : 'Choose File'}
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFileUpload(docType, e.target.files[0])}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button onClick={() => setStep(2)} variant="outline" className="flex items-center gap-1.5">
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={handleNextFromStep3} className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2">
              Next: Review & Submit <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Final Submit */}
      {step === 4 && (
        <Card className="space-y-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Step 4: Final Review & Submission</h3>
            <p className="text-slate-500 text-xs">Verify your application summary before sending to branch manager queue.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-400 block font-medium">Selected Scheme</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedProduct?.name} ({selectedProduct?.productCode})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Loan Amount</span>
                <span className="font-extrabold text-blue-700 text-base">₹{Number(amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div>
                <span className="text-slate-400 block">Applicant Name:</span>
                <span className="font-bold text-slate-800">{applicantDetails.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">City / Pincode:</span>
                <span className="font-bold text-slate-800">{applicantDetails.city} ({applicantDetails.pincode})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Monthly Income:</span>
                <span className="font-bold text-slate-800">₹{Number(applicantDetails.monthlyIncome).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tenure:</span>
                <span className="font-bold text-slate-800">{tenureMonths} Months</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} /> Declaration & Privacy Consent
            </div>
            <p>By submitting this application, I confirm that all financial details & KYC documents uploaded are accurate and consent to FinSure verification.</p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button onClick={() => setStep(3)} variant="outline" className="flex items-center gap-1.5">
              <ArrowLeft size={16} /> Back
            </Button>
            <div className="flex gap-3">
              <Button onClick={handleSaveDraft} variant="outline" disabled={loading}>
                Save as Draft
              </Button>
              <Button onClick={handleSubmitApplication} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'} <CheckCircle2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};

export default ApplyLoan;
