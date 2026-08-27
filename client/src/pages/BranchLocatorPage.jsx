import React, { useState, useEffect } from 'react';
import { MapPin, Search, Building2, User, Phone, Mail, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const BranchLocatorPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/branches', { params: { search: searchTerm, isActive: 'true' } });
      setBranches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/70 text-rose-800 font-bold text-xs uppercase tracking-wider">
            <MapPin size={16} /> Regional Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            FinSure Branch Locator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Search by city, state, or pincode to find your assigned FinSure regional branch and office address.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search branch by name, city (e.g. Lucknow, Delhi, Mumbai), or pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </Card>

        {/* Branches Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Searching active branches...</div>
        ) : branches.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            No active FinSure branch found for "{searchTerm}". Try searching by city name like Lucknow, Delhi, or Mumbai.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <Card key={branch._id} className="space-y-4 hover:shadow-xl transition-shadow border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{branch.branchName}</h3>
                      <span className="text-xs text-blue-600 font-bold tracking-wide">{branch.branchCode}</span>
                    </div>
                  </div>
                  <Badge status="APPROVED">Open & Servicing</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">{branch.city}, {branch.state || 'UP'}</span>
                      <p className="text-slate-500 mt-0.5">{branch.address}</p>
                    </div>
                  </div>
                </div>

                {/* Serviced Pincodes */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Serviced Pincodes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(branch.pincodeRanges) && branch.pincodeRanges.length > 0 ? (
                      branch.pincodeRanges.map((pin, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                          {pin}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">All regional pincodes</span>
                    )}
                  </div>
                </div>

                {/* Manager Contact */}
                {branch.managerId && (
                  <div className="pt-2 text-xs flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <User size={14} className="text-teal-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block">Manager: {branch.managerId.name || 'Assigned Manager'}</span>
                      <span className="text-slate-500">{branch.managerId.email}</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BranchLocatorPage;
