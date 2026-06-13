import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Zap, Compass, Brain, Heart, CheckCircle, 
  GraduationCap, Users, Building2, UserPlus, Package, 
  Truck, TrendingUp, FolderKanban, Settings, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { useAppStore } from '../../store/useAppStore';

const ICONS = {
  LayoutDashboard,
  Zap,
  Compass,
  Brain,
  Heart,
  CheckCircle,
  GraduationCap,
  Users,
  Building2,
  UserPlus,
  Package,
  Truck,
  TrendingUp,
  FolderKanban,
  Settings
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="sidebar-logo">KG</div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <h2>KGOS 2031</h2>
              <span>Founder Edition</span>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map((group) => (
          <div className="sidebar-group" key={group.group}>
            {!sidebarCollapsed && <div className="sidebar-group-label">{group.group}</div>}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `sidebar-link flex items-center ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon className="sidebar-icon" />
                    {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button className="sidebar-toggle w-full" onClick={toggleSidebar}>
        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </div>
  );
}
