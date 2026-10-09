import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  CreditCard,
  ScrollText,
  Settings,
  LogOut,
  X,
  Shield,
  Layers
} from 'lucide-react';
import { LogoIcon } from '../SportIcons';
import type { SuperAdminTab } from '../../types';

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTab;
  onSelectTab: (tab: SuperAdminTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
}

interface NavItem {
  id: SuperAdminTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isAvailable?: boolean;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  onSignOut,
}) => {
  const overviewNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      isAvailable: true,
    },
  ];

  const platformNav: NavItem[] = [
    {
      id: 'organizations',
      label: 'Organizations',
      icon: <Building2 className="w-5 h-5" />,
      isAvailable: true,
    },
    {
      id: 'users',
      label: 'Platform Users',
      icon: <Users className="w-5 h-5" />,
      isAvailable: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      isAvailable: true,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <CreditCard className="w-5 h-5" />,
      isAvailable: true,
    },
  ];

  const systemNav: NavItem[] = [
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: <ScrollText className="w-5 h-5" />,
      badge: 'Later',
      isAvailable: false,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: 'Later',
      isAvailable: false,
    },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <div className="px-3.5 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {title}
      </div>
      {items.map(item => {
        const isActive = activeTab === item.id;
        const isClickable = item.isAvailable;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (isClickable) {
                onSelectTab(item.id);
                onCloseMobile();
              }
            }}
            disabled={!isClickable}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
                : isClickable
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 cursor-pointer'
                : 'text-slate-400/80 bg-transparent cursor-not-allowed opacity-75'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={isActive ? 'text-white' : isClickable ? 'text-slate-500' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/80">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
        <button
          onClick={() => {
            onSelectTab('dashboard');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95 cursor-pointer"
        >
          <LogoIcon className="w-8 h-8 flex-shrink-0 drop-shadow-xs" />
          <div className="leading-tight">
            <span className="block font-black text-slate-900 text-base tracking-tight">
              Book<span className="text-blue-600">Myslot</span>
            </span>
            <span className="block font-medium text-slate-400 text-xs">
              SaaS Platform
            </span>
          </div>
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Close super admin navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Super Admin Tag Badge */}
      <div className="px-6 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          Super Admin Console
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
        {renderNavGroup('Overview', overviewNav)}
        {renderNavGroup('Platform Management', platformNav)}
        {renderNavGroup('System Controls', systemNav)}
      </div>

      {/* Bottom: Organization Switch / Info + Sign Out */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[11px] font-bold text-slate-800 truncate">
              Global Platform
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              Multi-Tenant Controller
            </span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-30 w-64">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 md:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>

      {/* Super Admin Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-2 py-2 flex items-center justify-around select-none">
        <button
          onClick={() => {
            onSelectTab('dashboard');
            onCloseMobile();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5.5 h-5.5" />
          </div>
          <span
            className={`text-[11px] tracking-tight mt-1 transition-colors ${
              activeTab === 'dashboard' ? 'font-bold text-blue-600' : 'font-semibold text-slate-500'
            }`}
          >
            Dashboard
          </span>
        </button>

        <button
          onClick={() => {
            onSelectTab('organizations');
            onCloseMobile();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'organizations'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <span
            className={`text-[11px] tracking-tight mt-1 transition-colors ${
              activeTab === 'organizations' ? 'font-bold text-blue-600' : 'font-semibold text-slate-500'
            }`}
          >
            Tenants
          </span>
        </button>

        <button
          onClick={() => {
            onSelectTab('subscriptions');
            onCloseMobile();
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 cursor-pointer group"
        >
          <div
            className={`px-3.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'subscriptions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-5.5 h-5.5" />
          </div>
          <span
            className={`text-[11px] tracking-tight mt-1 transition-colors ${
              activeTab === 'subscriptions' ? 'font-bold text-blue-600' : 'font-semibold text-slate-500'
            }`}
          >
            Plans
          </span>
        </button>

        <button
          onClick={onSignOut}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 cursor-pointer group text-slate-500 hover:text-rose-600"
        >
          <div className="px-3.5 py-1 rounded-full text-slate-500 group-hover:text-rose-600">
            <LogOut className="w-5.5 h-5.5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500 group-hover:text-rose-600 tracking-tight mt-1">
            Exit
          </span>
        </button>
      </nav>
    </>
  );
};
