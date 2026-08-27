import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, ArrowRight, CheckCircle2, Percent, Calendar, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const UserLoanProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/loan-products');
      setProducts((data || []).filter((p) => p.isActive !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Loan Products</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Explore active loan schemes with competitive interest rates and flexible tenure options.
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-slate-500">Loading loan product schemes...</Card>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">No active loan products available at the moment.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="p-6 space-y-4 hover:shadow-lg transition-shadow border-slate-200 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{p.name}</h3>
                      <span className="text-xs text-blue-600 font-bold tracking-wide">{p.productCode}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    {p.interestRate}% p.a.
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {p.description || 'Flexible retail loan scheme with quick approval and paperless document verification.'}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Loan Limit:</span>
                    <span className="font-bold text-slate-900">
                      ₹{(p.minAmount / 100000).toFixed(1)}L - ₹{(p.maxAmount / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tenure Options:</span>
                    <span className="font-bold text-slate-900">
                      {Array.isArray(p.tenureOptionsMonths) ? `${p.tenureOptionsMonths.join(', ')} Months` : 'Up to 60 Months'}
                    </span>
                  </div>
                </div>

                {/* Required Documents */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Required KYC Documents
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(p.requiredDocuments) && p.requiredDocuments.length > 0 ? (
                      p.requiredDocuments.map((doc, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-100">
                          {doc.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Standard KYC documents required</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <Link to={`/apply/${p._id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2">
                    Apply Now for {p.name} <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default UserLoanProducts;
