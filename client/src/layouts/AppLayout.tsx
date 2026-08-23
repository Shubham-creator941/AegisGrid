import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { USE_DEMO_DATA } from '../config/demo.config';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Network, 
  Activity, 
  GitPullRequest,
  BarChart3,
  CheckCircle,
  FileCheck,
  LogOut,
  ChevronRight,
  User as UserIcon,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Command Center', path: '/app/command-center', icon: LayoutDashboard },
    { name: 'Network', path: '/app/network', icon: Network },
    { name: 'Events', path: '/app/events', icon: Activity },
    { name: 'Scenarios', path: '/app/scenarios', icon: GitPullRequest },
    { name: 'Evaluations', path: '/app/evaluations', icon: BarChart3 },
    { name: 'Recommendations', path: '/app/recommendations', icon: CheckCircle },
    { name: 'Decisions', path: '/app/decisions', icon: FileCheck },
    { name: 'Audit', path: '/app/audit', icon: ShieldAlert },
  ];

  // Helper to format breadcrumbs
  const pathParts = location.pathname.split('/').filter(p => p !== '');
  const breadcrumbs = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '));

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 overflow-hidden font-sans">
      {/* LEFT NAVIGATION */}
      <nav className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
        {/* Brand Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-950 text-blue-500 rounded flex items-center justify-center border border-blue-900">
              <ShieldAlert size={18} />
            </div>
            <span className="text-base font-semibold tracking-wide text-slate-100">AEGISGRID</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Operations
          </div>
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <item.icon size={16} className="mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-slate-400 border border-slate-700">
              <UserIcon size={16} />
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="text-xs font-medium text-slate-200 truncate">{user?.email}</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-wider">{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded border border-transparent transition-colors"
          >
            <LogOut size={14} className="mr-2" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        {/* TOP BAR */}
        <header className="h-16 flex-shrink-0 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight size={14} className="text-slate-600" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${USE_DEMO_DATA ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${USE_DEMO_DATA ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                {USE_DEMO_DATA ? 'DEMO MODE' : 'OPERATIONAL'}
              </span>
            </div>
            
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              title="Toggle Context Drawer"
            >
              {isDrawerOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* RIGHT CONTEXTUAL DRAWER (Structural) */}
      {isDrawerOpen && (
        <aside className="w-80 flex-shrink-0 bg-slate-950 border-l border-slate-800 flex flex-col z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.5)]">
          <div className="h-16 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-950">
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Context Info</h2>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <PanelRightClose size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="border border-slate-800 bg-slate-900 rounded p-4 text-center">
              <p className="text-xs text-slate-500">Contextual details will appear here.</p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
