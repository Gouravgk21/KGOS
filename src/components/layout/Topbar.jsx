import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function Topbar() {
  const { toggleSidebar, setSearchOpen } = useAppStore();
  const location = useLocation();

  // Derive page name from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Command Center';
    if (path === '/execution') return 'Execution Center';
    if (path === '/life-plan') return 'Life Plan';
    if (path === '/self-mastery') return 'Self Mastery';
    if (path.startsWith('/self-mastery/health')) return 'Health & Vitality';
    if (path.startsWith('/self-mastery/habits')) return 'Habits Checklist';
    if (path.startsWith('/self-mastery/development')) return 'Development & Skills';
    if (path.startsWith('/self-mastery/relationships')) return 'Personal CRM';
    if (path === '/business') return 'KAFS ERP Dashboard';
    if (path.startsWith('/business/crm')) return 'B2B CRM Pipeline';
    if (path.startsWith('/business/products')) return 'Product Catalogue';
    if (path.startsWith('/business/suppliers')) return 'Supplier Network';
    if (path.startsWith('/business/sales')) return 'Sales KPI Dashboard';
    if (path.startsWith('/projects')) return 'Project Workspace';
    if (path === '/settings') return 'System Configuration';
    return 'KGOS 2031';
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return <span>Dashboard</span>;
    const segments = path.split('/').filter(Boolean);
    return (
      <span className="flex items-center gap-1">
        <span className="capitalize">KGOS</span>
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <span className="mx-1 text-muted">/</span>
            <span className="capitalize font-semibold text-primary">{seg.replace(/-/g, ' ')}</span>
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          {getBreadcrumbs()}
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="topbar-date hidden md:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        
        <button className="topbar-search-trigger flex items-center" onClick={() => setSearchOpen(true)}>
          <Search className="w-4 h-4 mr-2" />
          <span>Search...</span>
          <kbd>⌘K</kbd>
        </button>

        <button className="topbar-btn relative">
          <Bell className="w-5 h-5" />
          <span className="notification-dot" />
        </button>
      </div>
    </div>
  );
}
