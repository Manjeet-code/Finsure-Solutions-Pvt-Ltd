import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, Phone, Briefcase, Home as HomeIcon, User, Car, GraduationCap, 
  ShieldCheck, HeartPulse, Stethoscope, ShieldPlus, LineChart, Landmark, 
  Calculator, CheckSquare, BookOpen, MapPin, ArrowRight, Menu, X 
} from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownMenus = {
    Loans: [
      { name: 'Personal Loan', desc: 'Instant funds up to ₹10 Lakhs', icon: User, color: 'text-blue-600 bg-blue-50', link: '/register' },
      { name: 'Home Loan', desc: 'Starting at 8.35%* interest rate', icon: HomeIcon, color: 'text-indigo-600 bg-indigo-50', link: '/register' },
      { name: 'Business Loan', desc: 'Working capital up to ₹2 Crore', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50', link: '/register' },
      { name: 'Auto Loan', desc: 'Easy 2W & 4W car financing', icon: Car, color: 'text-amber-600 bg-amber-50', link: '/register' },
      { name: 'Education Loan', desc: 'Higher studies funding worldwide', icon: GraduationCap, color: 'text-purple-600 bg-purple-50', link: '/register' },
      { name: 'Loan Against Property', desc: 'High-value liquidity solution', icon: Landmark, color: 'text-teal-600 bg-teal-50', link: '/register' },
    ],
    Insurance: [
      { name: 'Life Insurance', desc: 'Term plans starting at ₹490/mo', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50', link: '#products' },
      { name: 'Health Insurance', desc: 'Cashless treatment & family cover', icon: HeartPulse, color: 'text-rose-600 bg-rose-50', link: '#products' },
      { name: 'General Insurance', desc: 'Motor, shop & home protection', icon: ShieldPlus, color: 'text-blue-600 bg-blue-50', link: '#products' },
    ],
    Investments: [
      { name: 'Fixed Deposits', desc: 'High-yield guaranteed returns up to 8.5%', icon: Landmark, color: 'text-emerald-600 bg-emerald-50', link: '#products' },
      { name: 'Mutual Funds & SIP', desc: 'Wealth creation & tax saving plans', icon: LineChart, color: 'text-blue-600 bg-blue-50', link: '#products' },
      { name: 'Government Bonds', desc: '100% risk-free sovereign security', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50', link: '#products' },
    ],
    Resources: [
      { name: 'EMI Calculator', desc: 'Estimate your monthly installments', icon: Calculator, color: 'text-amber-600 bg-amber-50', link: '/calculator' },
      { name: 'Eligibility Checker', desc: 'Check pre-approved offer limits', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50', link: '/eligibility' },
      { name: 'Financial Blog & Guides', desc: 'Smart tips for borrowing & saving', icon: BookOpen, color: 'text-blue-600 bg-blue-50', link: '/guides' },
      { name: 'Branch Locator', desc: 'Find nearest FinSure branch', icon: MapPin, color: 'text-rose-600 bg-rose-50', link: '/locator' },
    ],
  };

  const navLinks = [
    { name: 'Home', href: '/', hasDropdown: false },
    { name: 'Loans', href: '#products', hasDropdown: true },
    { name: 'Insurance', href: '#products', hasDropdown: true },
    { name: 'Investments', href: '#products', hasDropdown: true },
    { name: 'Resources', href: '#features', hasDropdown: true },
    { name: 'About Us', href: '#about', hasDropdown: false },
    { name: 'Contact Us', href: '#contact', hasDropdown: false },
  ];

  const scrollToAnchor = (anchor) => {
    const targetId = anchor.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (link) => {
    setActiveTab(link.name);

    if (link.hasDropdown && dropdownMenus[link.name]) {
      setOpenDropdown(openDropdown === link.name ? null : link.name);
      return;
    }

    setOpenDropdown(null);

    if (link.href === '/') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (link.href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToAnchor(link.href), 150);
      } else {
        scrollToAnchor(link.href);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-xs" ref={dropdownRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center p-1 bg-slate-50 rounded-xl border border-slate-200/80 shadow-xs">
              <img src="/logo.png" alt="FinSure Logo" className="h-9 w-9 object-contain rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-blue-950 uppercase leading-none">
                FinSure
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                Solutions Pvt. Ltd.
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center space-x-6 relative">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <button
                  type="button"
                  onClick={() => handleNavClick(link)}
                  onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.name)}
                  className={`relative py-2 text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer outline-none ${
                    activeTab === link.name || openDropdown === link.name ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.hasDropdown && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === link.name ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                  )}
                  {activeTab === link.name && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                  )}
                </button>

                {/* Dropdown Menu Popup */}
                {openDropdown === link.name && dropdownMenus[link.name] && (
                  <div
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="absolute top-full left-0 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
                      {link.name} Options
                    </div>
                    <div className="space-y-1">
                      {dropdownMenus[link.name].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={idx}
                            to={item.link.startsWith('/') ? item.link : '#'}
                            onClick={() => {
                              setOpenDropdown(null);
                              if (item.link.startsWith('#')) {
                                if (location.pathname !== '/') {
                                  navigate('/');
                                  setTimeout(() => scrollToAnchor(item.link), 150);
                                } else {
                                  scrollToAnchor(item.link);
                                }
                              }
                            }}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                                {item.name}
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            {/* Toll Free Helpline */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                <Phone size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-slate-800 tracking-wide text-xs">1800 123 4567</span>
                <span className="text-[10px] text-slate-400 font-medium">Mon - Sat 9AM - 7PM</span>
              </div>
            </div>

            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" className="text-sm px-4 py-2 font-bold border-slate-300 text-slate-700 hover:bg-slate-50">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" className="text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                Get Started
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
          {navLinks.map((link) => (
            <div key={link.name} className="border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  handleNavClick(link);
                  if (!link.hasDropdown) setIsMobileMenuOpen(false);
                }}
                className="w-full flex justify-between items-center py-2 text-base font-bold text-slate-800"
              >
                <span>{link.name}</span>
                {link.hasDropdown && <ChevronDown size={18} className={openDropdown === link.name ? 'rotate-180 text-blue-600' : ''} />}
              </button>

              {link.hasDropdown && openDropdown === link.name && dropdownMenus[link.name] && (
                <div className="pl-3 pt-1 space-y-2">
                  {dropdownMenus[link.name].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        to={item.link.startsWith('/') ? item.link : '#'}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        <div className={`w-6 h-6 rounded-md ${item.color} flex items-center justify-center shrink-0`}>
                          <Icon size={14} />
                        </div>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 space-y-2">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
              <Button variant="outline" className="w-full py-2.5 text-center font-bold text-sm">
                Log In
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
              <Phone size={14} className="text-blue-600" /> Helpline: 1800 123 4567
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
