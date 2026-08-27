import React, { useState, useEffect } from 'react';
import { 
  Bell, User, LogOut, CheckCircle2, AlertTriangle, Info, AlertOctagon, X, CheckCheck, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/axios';

const Header = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const payload = res.data?.data || res.data;
      setNotifications(payload?.notifications || []);
      setUnreadCount(payload?.unreadCount || 0);
    } catch (err) {
      // Quiet fail if unauthenticated
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER ADMIN') {
      return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">System Admin</span>;
    }
    if (r === 'BRANCH MANAGER' || r === 'BRANCH_MANAGER') {
      return <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">Branch Manager</span>;
    }
    return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">Applicant</span>;
  };

  const getPortalTitle = () => {
    const r = (user?.role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER ADMIN') {
      return 'FinSure Admin Control Center';
    }
    if (r === 'BRANCH MANAGER' || r === 'BRANCH_MANAGER') {
      return 'FinSure Branch Operations Portal';
    }
    return 'FinSure Applicant Portal';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-amber-600 shrink-0" />;
      case 'DANGER': return <AlertOctagon size={16} className="text-rose-600 shrink-0" />;
      default: return <Info size={16} className="text-blue-600 shrink-0" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getPortalTitle()}</h1>
      </div>

      <div className="flex items-center gap-4 relative">
        
        {/* Notification Bell Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Notification Center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Center Dropdown Drawer */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden space-y-0">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-400" />
                <span className="font-extrabold text-sm">Notification Center</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={14} /> Mark All Read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No notifications yet.</div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item._id, item.link)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !item.read ? 'bg-blue-50/40 font-semibold' : ''
                    }`}
                  >
                    {getTypeIcon(item.type)}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-normal leading-relaxed">{item.message}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {item.category}
                        </span>
                        {!item.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{user?.fullName || user?.name || 'Applicant User'}</div>
            <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
          </div>
          <div className="w-9 h-9 bg-blue-900 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
