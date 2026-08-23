import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { USE_DEMO_DATA } from '../config/demo.config';
import { useAuth } from '../contexts/AuthContext';
import { ContextSidebar } from '../features/network/components/ContextSidebar';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Open by default

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
    <div className="flex h-screen w-full bg-aegis-base text-aegis-text overflow-hidden font-sans">
      {/* LEFT NAVIGATION */}
      <nav className="w-56 flex-shrink-0 bg-aegis-base border-r border-aegis-border flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {/* Brand Area */}
        <div className="h-16 flex items-center px-5 border-b border-aegis-border">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-900/40 text-aegis-blue rounded shadow-[0_0_10px_rgba(35,136,255,0.3)] flex items-center justify-center border border-aegis-blue/30">
              <ShieldAlert size={16} />
            </div>
            <span className="text-sm font-bold tracking-wider text-white">AEGISGRID</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-5">
          <div className="px-5 mb-3 text-[10px] font-semibold text-aegis-text-muted uppercase tracking-widest">
            Operations
          </div>
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-900/30 text-aegis-blue border border-aegis-blue/40 shadow-[inset_2px_0_0_#2388FF]'
                        : 'text-aegis-text-secondary hover:bg-aegis-panel hover:text-white border border-transparent'
                    }`
                  }
                >
                  <item.icon size={16} className={`mr-3 ${location.pathname === item.path ? 'text-aegis-blue' : 'text-aegis-text-muted'}`} />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Area */}
        <div className="p-4 border-t border-aegis-border flex flex-col gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-aegis-panel rounded flex items-center justify-center text-aegis-text-muted border border-aegis-border">
              <UserIcon size={16} />
            </div>
            <div className="ml-3 overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{user?.email || 'admin@aegis.gov'}</div>
              <div className="text-[10px] text-aegis-text-muted font-mono tracking-wider">{user?.role || 'ADMIN'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-start px-2 py-1.5 text-xs font-medium text-aegis-text-secondary hover:text-white transition-colors"
          >
            <LogOut size={14} className="mr-2" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-aegis-base relative z-10">
        {/* TOP BAR */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-aegis-border/50">
          <div className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className={idx === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-aegis-text-secondary'}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight size={14} className="text-aegis-text-muted" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-xs text-aegis-text-muted font-mono flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${USE_DEMO_DATA ? 'bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]' : 'bg-aegis-cyan'}`}></span>
              HEALTHY
              <span className="ml-4 opacity-60">{new Date().toISOString().split('T')[1].substring(0, 8)} UTC</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${USE_DEMO_DATA ? 'bg-aegis-orange shadow-[0_0_5px_rgba(255,138,0,0.5)]' : 'bg-aegis-green'}`}></span>
              <span className="text-[10px] font-semibold text-aegis-text-secondary tracking-widest uppercase">
                {USE_DEMO_DATA ? 'DEMO MODE' : 'OPERATIONAL'}
              </span>
            </div>
            
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="text-aegis-text-muted hover:text-white transition-colors"
              title="Toggle Context Drawer"
            >
              {isDrawerOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* RIGHT CONTEXTUAL DRAWER (Structural) */}
      {isDrawerOpen && (
        <aside className="w-80 flex-shrink-0 bg-aegis-panel border-l border-aegis-border flex flex-col z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.3)]">
          <div className="h-14 border-b border-aegis-border flex items-center px-5 justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-white uppercase">Context Info</h2>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="text-aegis-text-muted hover:text-white"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {location.pathname.includes('/app/command-center') ? (
              <ContextSidebar />
            ) : (
              <div className="border border-aegis-border border-dashed rounded-lg p-6 text-center">
                <p className="text-xs text-aegis-text-muted">Contextual details will appear here.</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
