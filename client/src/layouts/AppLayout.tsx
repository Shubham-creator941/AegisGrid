import React, { useEffect, useState } from 'react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Opens only by explicit user action
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const hasContextPanel = location.pathname.includes('/app/command-center');

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

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
    <div className="flex h-dvh w-full bg-aegis-base text-aegis-text overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT NAVIGATION */}
      <nav aria-label="Primary navigation" className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 md:w-[224px] xl:w-[232px] flex-shrink-0 bg-aegis-base border-r border-aegis-border flex flex-col z-40 shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out`}>
        {/* Brand Area */}
        <div className="h-15 flex items-center px-4 border-b border-aegis-border shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-900/40 text-aegis-blue rounded-md shadow-[0_0_10px_rgba(35,136,255,0.3)] flex items-center justify-center border border-aegis-blue/30">
              <ShieldAlert size={16} />
            </div>
            <span className="text-sm font-bold tracking-wider text-white">AEGISGRID</span>
          </div>
          <button 
            className="md:hidden text-aegis-text-muted hover:text-white rounded-[var(--radius-sm)] p-1 transition-colors active:bg-aegis-elevated"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <PanelRightClose size={18} className="rotate-180" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2.5 text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest">
            Operations
          </div>
          <ul className="space-y-1 px-2.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex h-10 items-center px-3 rounded-[var(--radius-md)] border text-sm font-medium transition-[background-color,border-color,color] duration-150 group ${
                      isActive
                        ? 'bg-blue-900/25 border-aegis-blue/30 text-white shadow-[inset_2px_0_0_#2388FF]'
                        : 'text-aegis-text-secondary hover:bg-aegis-panel hover:text-white border-transparent'
                    }`
                  }
                >
                  <item.icon size={16} className={`mr-2.5 shrink-0 transition-colors ${location.pathname === item.path ? 'text-aegis-blue' : 'text-aegis-text-muted group-hover:text-slate-300'}`} />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Area */}
        <div className="px-3.5 py-4 border-t border-aegis-border flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-aegis-panel rounded-md flex items-center justify-center text-aegis-text-muted border border-aegis-border shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{user?.email || 'admin@aegis.gov'}</div>
              <div className="text-[10px] text-aegis-text-muted font-mono tracking-wider">{user?.role || 'ADMIN'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex h-9 items-center justify-center w-full px-2 text-xs font-bold text-aegis-text-secondary hover:text-white bg-aegis-panel hover:bg-aegis-elevated active:bg-aegis-base border border-aegis-border hover:border-aegis-text-muted rounded-[var(--radius-sm)] transition-colors"
          >
            <LogOut size={14} className="mr-2" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-aegis-base relative z-10">
        {/* TOP BAR */}
        <header className="h-15 flex-shrink-0 flex items-center justify-between px-4 md:px-5 xl:px-6 border-b border-aegis-border/50 bg-aegis-base/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 text-sm">
            <button 
              className="md:hidden text-aegis-text-muted hover:text-white rounded-[var(--radius-sm)] p-1 transition-colors active:bg-aegis-elevated"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <PanelRightOpen size={18} className="rotate-180" />
            </button>
            
            <div className="hidden sm:flex items-center gap-2">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className={`text-sm ${idx === breadcrumbs.length - 1 ? 'text-white font-semibold' : 'text-aegis-text-secondary'}`}>
                    {crumb}
                  </span>
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight size={14} className="text-aegis-text-muted" />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Mobile simplified title */}
            <div className="sm:hidden text-sm text-white font-semibold">
              {breadcrumbs[breadcrumbs.length - 1]}
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-xs text-aegis-text-muted font-mono flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${USE_DEMO_DATA ? 'bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]' : 'bg-aegis-cyan'}`}></span>
                HEALTHY
                <span className="ml-3 opacity-60">{new Date().toISOString().split('T')[1].substring(0, 8)} UTC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${USE_DEMO_DATA ? 'bg-aegis-orange shadow-[0_0_5px_rgba(255,138,0,0.5)]' : 'bg-aegis-green'}`}></span>
                <span className="text-xs font-bold text-aegis-text-secondary tracking-widest uppercase">
                  {USE_DEMO_DATA ? 'DEMO MODE' : 'OPERATIONAL'}
                </span>
              </div>
            </div>
            
            {hasContextPanel && (
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="text-aegis-text-muted hover:text-white hover:bg-aegis-panel active:bg-aegis-elevated transition-colors rounded-[var(--radius-sm)] p-1.5"
                title={isDrawerOpen ? 'Close command context' : 'Open command context'}
                aria-label={isDrawerOpen ? 'Close command context' : 'Open command context'}
                aria-expanded={isDrawerOpen}
              >
                {isDrawerOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative p-4 md:p-5 xl:p-6">
          <Outlet />
        </main>
      </div>

      {/* RIGHT CONTEXTUAL DRAWER (Structural) */}
      {hasContextPanel && isDrawerOpen && (
        <aside aria-label="Context information" className="fixed top-15 bottom-0 right-0 w-[min(320px,calc(100vw-32px))] min-[1200px]:relative min-[1200px]:inset-auto min-[1200px]:w-[280px] min-[1440px]:w-[320px] flex-shrink-0 bg-aegis-panel border-l border-aegis-border flex flex-col z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.3)] transition-transform">
          <div className="h-15 border-b border-aegis-border flex items-center px-4 md:px-5 justify-between shrink-0">
            <h2 className="text-xs font-bold tracking-widest text-white uppercase">Context Info</h2>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="text-aegis-text-muted hover:text-white hover:bg-aegis-elevated active:bg-aegis-base rounded-[var(--radius-sm)] p-1 transition-colors"
              aria-label="Close context panel"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <ContextSidebar />
          </div>
        </aside>
      )}
    </div>
  );
}
