import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Compass, Brain, Heart, CheckCircle, GraduationCap, Users, Building2, UserPlus, Package, Truck, TrendingUp, FolderKanban, Settings } from 'lucide-react';

export default function MobileNav() {
  const tabs = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/business/crm', label: 'CRM', icon: UserPlus },
    { path: '/self-mastery/health', label: 'Health', icon: Heart },
    { path: '/execution', label: 'Execution', icon: Zap }
  ];

  return (
    <div className="mobile-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass)', display: 'flex', zIndex: 999 }}>
      <div className="mobile-nav-items flex justify-between w-full h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => 
                `mobile-nav-item flex flex-col items-center justify-center flex-1 py-1 text-center ${
                  isActive ? 'text-accent active' : 'text-secondary'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)'
              })}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xxs font-medium mt-1" style={{ fontSize: 9 }}>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
