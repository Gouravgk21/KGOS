'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Compass, Briefcase, Target, FlaskConical, 
  Microscope, Factory, BookOpen, Network, Brain, Calendar, 
  FileText, Heart, DollarSign, Users, ChevronLeft, ChevronRight, UserCircle,
  FolderOpen, Bot, Zap, Sparkles
} from 'lucide-react';
import { Linkedin } from '@/components/icons/Linkedin';
import { useAppStore } from '@/store/useAppStore';

const NAV_GROUPS = [
  {
    name: 'COMMAND',
    items: [
      { name: 'Dashboard', href: '/', icon: Compass },
      { name: 'Executive', href: '/executive', icon: Target },
    ]
  },
  {
    name: 'BUSINESS',
    items: [
      { name: 'CRM Leads', href: '/business/crm/leads', icon: Users },
      { name: 'Sales Forecast', href: '/business/sales/forecast', icon: DollarSign },
      { name: 'Quotations', href: '/business/crm/quotations', icon: FileText },
    ]
  },
  {
    name: 'SCIENCE',
    items: [
      { name: 'KAFS Hub', href: '/kafs', icon: Microscope },
      { name: 'Formulation Lab', href: '/formulation-lab', icon: FlaskConical },
      { name: 'Hydrocolloids', href: '/kafs/hydrocolloids', icon: Network },
    ]
  },
  {
    name: 'RESEARCH',
    items: [
      { name: 'Research OS', href: '/research', icon: BookOpen },
      { name: 'Knowledge Graph', href: '/knowledge', icon: Network },
    ]
  },
  {
    name: 'LEARNING',
    items: [
      { name: 'Exam OS', href: '/exams', icon: Brain },
      { name: 'Study Planner', href: '/exams/study-planner', icon: Calendar },
    ]
  },
  {
    name: 'BRAND',
    items: [
      { name: 'LinkedIn Hub', href: '/brand/linkedin', icon: Linkedin },
      { name: 'Content Calendar', href: '/brand/content-calendar', icon: Calendar },
    ]
  },
  {
    name: 'LIFE',
    items: [
      { name: 'Health OS', href: '/self-mastery/health', icon: Heart },
      { name: 'Finance OS', href: '/wealth', icon: DollarSign },
      { name: 'Relationships', href: '/relationships', icon: Users },
      { name: 'Knowledge OS', href: '/knowledge-os/notes', icon: FileText },
    ]
  },
  {
    name: 'SYSTEM',
    items: [
      { name: 'Documents', href: '/document-intel', icon: FolderOpen },
      { name: 'Automation', href: '/settings', icon: Zap },
      { name: 'AI Agents', href: '/ai-board', icon: Bot },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div className={`sidebar flex flex-col ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(0,180,216,0.1)]">
        {!sidebarCollapsed && (
          <div className="font-display font-bold text-lg tracking-widest text-[#D4A017] truncate uppercase">
            KGOS<span className="text-[#00B4D8] ml-1">X</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-full flex justify-center text-[#D4A017] font-display font-bold text-xl">K</div>
        )}
        <button 
          onClick={toggleSidebar}
          className="text-zinc-500 hover:text-white transition-colors p-1"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex flex-col gap-6 px-3">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              {!sidebarCollapsed && (
                <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase px-3 mb-1">
                  {group.name}
                </div>
              )}
              {sidebarCollapsed && (
                <div className="h-px bg-zinc-800 mx-2 my-2" />
              )}
              
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[rgba(0,180,216,0.1)]">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img 
            src="/avatar_kumar.png" 
            alt="Kumar Gourav" 
            className="w-8 h-8 rounded-full border border-[#D4A017]/50 object-cover flex-shrink-0"
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white uppercase tracking-wider truncate">Kumar Gourav</span>
              <span className="text-[10px] text-[#00B4D8] font-mono truncate">SYSTEM ARCHITECT</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
