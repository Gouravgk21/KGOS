'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Zap, Compass, Brain, Heart, CheckCircle, 
  GraduationCap, Users, Building2, UserPlus, Package, 
  Truck, TrendingUp, FolderKanban, Settings, 
  ChevronLeft, ChevronRight, Microscope, BookOpen, Briefcase, Network,
  Cpu, FileText, Radar, ShieldAlert
} from 'lucide-react';
import { NAV_ITEMS } from '@/utils/constants';
import { useAppStore } from '@/store/useAppStore';

const ICONS: Record<string, React.ComponentType<any>> = {
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
  Settings,
  Microscope,
  BookOpen,
  Briefcase,
  Network,
  Cpu,
  FileText,
  Radar,
  ShieldAlert
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const pathname = usePathname();

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} flex flex-col h-full bg-zinc-950 border-r border-zinc-800`}>
      <div className="sidebar-header flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="sidebar-logo w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0">
            KG
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <h2 className="text-sm font-bold text-zinc-100">KGOS 2031</h2>
              <span className="text-[10px] text-zinc-500 block">Founder Edition</span>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-nav flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {NAV_ITEMS.map((group) => (
          <div className="sidebar-group flex flex-col gap-1" key={group.group}>
            {!sidebarCollapsed && (
              <div className="sidebar-group-label text-[10px] uppercase font-bold text-zinc-600 tracking-wider px-2 py-1">
                {group.group}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] || LayoutDashboard;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-zinc-850 ${
                      isActive 
                        ? 'bg-zinc-800/80 text-white font-medium shadow-sm border border-zinc-700/50' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="sidebar-toggle w-full p-3 border-t border-zinc-850 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-350 transition-colors flex items-center justify-center" 
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}
