import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { isAuthenticated, loading, admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      group: 'Catalog Master',
      items: [
        { label: 'Category Master', path: '/admin/categories', icon: FolderTree, badge: 'Master' },
        { label: 'Products & Inventory', path: '/admin/products', icon: Sparkles, badge: null },
      ],
    },
    {
      group: 'Sales & Logistics',
      items: [
        { label: 'Orders & Bookings', path: '/admin/orders', icon: ShoppingBag, badge: null },
      ],
    },
    {
      group: 'Administration',
      items: [
        { label: 'Store Settings', path: '/admin/settings', icon: Settings, badge: null },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top App Bar */}
      <div className="md:hidden glass-nav px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm">Sri Krishna Fireworks</div>
            <div className="text-[10px] text-amber-400 font-semibold">Admin Workspace</div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl' : 'hidden'
        } md:static md:block md:w-64 lg:w-72 bg-[#090e1b] border-r border-slate-800/80 flex-shrink-0 flex flex-col justify-between`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 lg:p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="font-black text-white text-sm lg:text-base tracking-tight">Admin Console</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-400 font-medium">Sivakasi Factory Outlet</span>
                </div>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <div className="p-3 lg:p-4 space-y-6">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400 transition-colors'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          active ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'opacity-100' : ''}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-3 lg:p-4 border-t border-slate-800/80 space-y-3 bg-[#070b16]/70">
          {/* Public Storefront Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 border border-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <span>Open Public Store</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User Session Bar */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate max-w-[110px]">
                  {admin?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  @{admin?.username || 'admin'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
