import React from 'react';
import { Menu, ShieldAlert, LogOut } from 'lucide-react';
import type { SuperAdminTab, User } from '../../types';

interface SuperAdminHeaderProps {
  activeTab: SuperAdminTab;
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  onSignOut: () => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({
  activeTab,
  currentUser,
  onOpenMobileMenu,
  onSignOut,
}) => {
  const getTabTitle = (tab: SuperAdminTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Platform Dashboard';
      case 'organizations':
        return 'Organizations & Tenants';
      case 'users':
        return 'Platform Users';
      case 'analytics':
        return 'Platform Analytics';
      case 'subscriptions':
        return 'Subscriptions & Billing';
      case 'audit-logs':
        return 'Platform Audit Logs';
      case 'settings':
        return 'System Settings';
      default:
        return 'Super Admin';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer flex-shrink-0"
          aria-label="Open super admin navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="hidden xs:inline">Platform</span>
            <span className="hidden xs:inline">/</span>
            <span className="text-blue-600 truncate">{getTabTitle(activeTab)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Super Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Mobile Sign Out Icon Button */}
        <button
          onClick={onSignOut}
          className="sm:hidden p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Desktop / Tablet Sign Out Button */}
        <button
          onClick={onSignOut}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {/* Super Admin Profile Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shadow-indigo-500/30 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="leading-tight text-left hidden sm:block">
            <span className="block text-sm font-bold text-slate-900 truncate max-w-[150px]">
              {currentUser?.name || 'Super Admin'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
