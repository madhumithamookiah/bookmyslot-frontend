import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Check,
  X as XIcon,
} from 'lucide-react';
import type {
  OrganizationSubscription,
  SubscriptionSummary,
} from '../../types';
import { fetchPlatformSubscriptionsFromDB } from '../../services/apiService';
import { SuperAdminStatCard } from '../../components/super-admin/SuperAdminStatCard';
import { ManageSubscriptionModal } from '../../components/super-admin/ManageSubscriptionModal';

export const SuperAdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary>({
    totalOrganizations: 0,
    basicOrganizations: 0,
    proOrganizations: 0,
    missingSubscriptions: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manage Modal State
  const [selectedSub, setSelectedSub] = useState<OrganizationSubscription | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlatformSubscriptionsFromDB({
        search: debouncedSearch,
        plan: planFilter,
        status: statusFilter,
        page: currentPage,
        pageSize: 20,
      });

      if (res.success && res.subscriptions) {
        setSubscriptions(res.subscriptions);
        if (res.summary) setSummary(res.summary);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setError(res.error || 'Failed to load organization subscriptions.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [debouncedSearch, planFilter, statusFilter, currentPage]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No expiry';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Subscription Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage organization plans, tiered limits, and feature entitlements across the platform
          </p>
        </div>

        <button
          onClick={loadSubscriptions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          Refresh
        </button>
      </div>

      {/* 1. Subscription Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SuperAdminStatCard
          title="Total Organizations"
          value={summary.totalOrganizations}
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          subtitle="Platform Tenants"
        />

        <SuperAdminStatCard
          title="Basic Organizations"
          value={summary.basicOrganizations}
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-700"
          subtitle="Controlled Capacity"
        />

        <SuperAdminStatCard
          title="Pro Organizations"
          value={summary.proOrganizations}
          icon={<Zap className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          subtitle="Unlimited Tier"
        />

        <SuperAdminStatCard
          title="Unassigned Subscriptions"
          value={summary.missingSubscriptions}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor={summary.missingSubscriptions > 0 ? 'bg-amber-50' : 'bg-emerald-50'}
          iconTextColor={summary.missingSubscriptions > 0 ? 'text-amber-600' : 'text-emerald-600'}
          subtitle={summary.missingSubscriptions > 0 ? 'Needs Attention' : 'All Tenants Covered'}
        />
      </div>

      {/* 2. Plan Tier Cards (Basic vs Pro) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Platform Subscription Plans</h2>
          <p className="text-xs text-slate-500">Tier limits and functional feature entitlements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basic Plan Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Tier</span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">Basic Plan</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Free / Included
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">₹0</span>
                <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
                <p className="text-xs text-slate-500 mt-1">
                  Default starter tier for community sports clubs and small academies.
                </p>
              </div>

              {/* Limits */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Usage Limits
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Max Facilities</span>
                    <span className="font-bold text-slate-800">3 Facilities</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Max Sports</span>
                    <span className="font-bold text-slate-800">5 Sports</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Max Admins</span>
                    <span className="font-bold text-slate-800">2 Admins</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Max Members</span>
                    <span className="font-bold text-slate-800">1,000 Members</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Feature Entitlements
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Booking & slot management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Slot restrictions & announcements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Standard operational settings</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <XIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>Organization branding (logo, colors)</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <XIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>Advanced customizations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
              Premium Tier
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scale & Enterprise</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Pro Plan</h3>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">₹4,999</span>
                <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
                <p className="text-xs text-slate-500 mt-1">
                  Complete power tier for large sports complexes, stadiums, and university hubs.
                </p>
              </div>

              {/* Limits */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Usage Limits
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-blue-500 text-[10px] block">Facilities</span>
                    <span className="font-bold text-blue-900">Unlimited</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-blue-500 text-[10px] block">Sports</span>
                    <span className="font-bold text-blue-900">Unlimited</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-blue-500 text-[10px] block">Admins</span>
                    <span className="font-bold text-blue-900">Unlimited</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-blue-500 text-[10px] block">Members</span>
                    <span className="font-bold text-blue-900">Unlimited</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Feature Entitlements
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-blue-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Unlimited facilities, sports & member capacity</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-blue-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Custom organization branding (logos, palettes)</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-blue-700">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Advanced customization entitlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Priority platform support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Organizations Subscriptions Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Organization Subscriptions</h2>
            <p className="text-xs text-slate-500">
              Live subscription status, tier assignment, and renewal dates
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search organization..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={e => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Subscriptions Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/75 text-slate-500 font-semibold">
                <th className="py-3 px-6">Organization</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Started</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No organization subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {sub.organizationName?.slice(0, 2) || 'OR'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sub.organizationName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sub.organizationSlug} {sub.organizationEmail && `• ${sub.organizationEmail}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          sub.planSlug === 'pro'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sub.planName || 'Basic'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.status === 'expired'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                        {sub.status === 'expired' && <Clock className="w-3 h-3" />}
                        {sub.status === 'cancelled' && <AlertTriangle className="w-3 h-3" />}
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(sub.startsAt)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(sub.endsAt)}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setManageModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-3">
          {loading && subscriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
              Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No organization subscriptions found.
            </div>
          ) : (
            subscriptions.map(sub => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{sub.organizationName}</div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.planSlug === 'pro'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {sub.planName || 'Basic'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-700 capitalize">{sub.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Expires</span>
                    <span className="font-medium text-slate-600">{formatDate(sub.endsAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedSub(sub);
                    setManageModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Manage Subscription
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-700">{subscriptions.length}</span> of{' '}
            <span className="font-bold text-slate-700">{pagination.total}</span> organizations
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        subscription={selectedSub}
        isOpen={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedSub(null);
        }}
        onSubscriptionUpdated={loadSubscriptions}
      />
    </div>
  );
};
