import React, { useState, useEffect } from 'react';
import type { SuperAdminTab, User } from '../../types';
import { SuperAdminSidebar } from '../../components/super-admin/SuperAdminSidebar';
import { SuperAdminHeader } from '../../components/super-admin/SuperAdminHeader';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { SuperAdminOrganizations } from './SuperAdminOrganizations';
import { SuperAdminSubscriptions } from './SuperAdminSubscriptions';
import { SuperAdminPlatformUsers } from './SuperAdminPlatformUsers';
import { SuperAdminAnalytics } from './SuperAdminAnalytics';
import { ShieldAlert, AlertOctagon } from 'lucide-react';

interface SuperAdminPortalViewProps {
  currentUser: User | null;
  onExitSuperAdmin: () => void;
}

const SUPER_ADMIN_TAB_STORAGE_KEY = 'campus_sports_super_admin_active_tab_v1';
const VALID_SUPER_ADMIN_TABS: SuperAdminTab[] = [
  'dashboard',
  'organizations',
  'users',
  'analytics',
  'subscriptions',
  'audit-logs',
  'settings',
];

function resolveInitialSuperAdminTab(): SuperAdminTab {
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (raw.startsWith('super-admin/')) {
      const sub = raw.replace('super-admin/', '') as SuperAdminTab;
      if (VALID_SUPER_ADMIN_TABS.includes(sub)) return sub;
    } else if (raw === 'super-admin') {
      return 'dashboard';
    }
  }

  try {
    const saved = localStorage.getItem(SUPER_ADMIN_TAB_STORAGE_KEY) as SuperAdminTab;
    if (saved && VALID_SUPER_ADMIN_TABS.includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to restore super admin tab', e);
  }

  return 'dashboard';
}

export const SuperAdminPortalView: React.FC<SuperAdminPortalViewProps> = ({
  currentUser,
  onExitSuperAdmin,
}) => {
  const [activeTab, setActiveTabState] = useState<SuperAdminTab>(resolveInitialSuperAdminTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Security Verification Guard
  const isAuthorized = currentUser?.role === 'super_admin';

  const handleSelectOrganization = (orgId: string) => {
    setSelectedOrgId(orgId);
    setActiveTab('organizations');
  };

  const setActiveTab = (tab: SuperAdminTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(SUPER_ADMIN_TAB_STORAGE_KEY, tab);
      if (typeof window !== 'undefined') {
        window.location.hash = `super-admin/${tab}`;
      }
    } catch (e) {
      console.error('Failed to save super admin tab', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(SUPER_ADMIN_TAB_STORAGE_KEY, activeTab);
      if (typeof window !== 'undefined') {
        const expectedHash = activeTab === 'dashboard' ? 'super-admin' : `super-admin/${activeTab}`;
        if (window.location.hash.replace(/^#\/?/, '') !== expectedHash) {
          window.location.hash = expectedHash;
        }
      }
    } catch (e) {
      console.error('Failed to sync super admin tab', e);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '').trim();
      if (raw.startsWith('super-admin/')) {
        const sub = raw.replace('super-admin/', '') as SuperAdminTab;
        if (VALID_SUPER_ADMIN_TABS.includes(sub)) {
          setActiveTabState(sub);
        }
      } else if (raw === 'super-admin') {
        setActiveTabState('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Strict UI Fallback for Unauthorized Access
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Access Denied (403)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You do not have Super Administrator privileges. Platform-level console access is restricted to verified platform operators.
            </p>
          </div>
          <button
            onClick={onExitSuperAdmin}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Return to Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row">
      {/* Super Admin Persistent Left Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSignOut={onExitSuperAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 w-full">
        {/* Top Header */}
        <SuperAdminHeader
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onSignOut={onExitSuperAdmin}
        />

        {/* Super Admin Tab Content */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <SuperAdminDashboard
              currentUser={currentUser}
              onSelectOrganization={handleSelectOrganization}
            />
          )}

          {activeTab === 'organizations' && (
            <SuperAdminOrganizations initialSelectedOrgId={selectedOrgId} />
          )}

          {activeTab === 'subscriptions' && (
            <SuperAdminSubscriptions />
          )}

          {activeTab === 'users' && (
            <SuperAdminPlatformUsers currentUser={currentUser} />
          )}

          {activeTab === 'analytics' && (
            <SuperAdminAnalytics onSelectOrganization={handleSelectOrganization} />
          )}

          {activeTab !== 'dashboard' &&
            activeTab !== 'organizations' &&
            activeTab !== 'subscriptions' &&
            activeTab !== 'users' &&
            activeTab !== 'analytics' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Module Scheduled for Future Phase
              </h2>
              <p className="text-xs text-slate-500">
                The <span className="font-semibold text-slate-700 capitalize">{activeTab.replace('-', ' ')}</span> module is part of upcoming SaaS migration roadmap.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
