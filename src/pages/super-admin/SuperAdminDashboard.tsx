import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  CalendarCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { PlatformDashboardData, User } from '../../types';
import { fetchPlatformDashboardFromDB } from '../../services/apiService';
import { SuperAdminStatCard } from '../../components/super-admin/SuperAdminStatCard';
import { RecentOrganizations } from '../../components/super-admin/RecentOrganizations';
import { RecentPlatformActivity } from '../../components/super-admin/RecentPlatformActivity';
import { PlatformHealth } from '../../components/super-admin/PlatformHealth';

interface SuperAdminDashboardProps {
  currentUser?: User | null;
  onSelectOrganization?: (orgId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onSelectOrganization }) => {
  const [data, setData] = useState<PlatformDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlatformDashboardFromDB();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Unable to load platform dashboard data.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6 sm:space-y-7 pb-16">
        <div>
          <div className="h-8 w-64 bg-slate-200/80 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-200/60 rounded-md mt-2 animate-pulse" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Unable to Load Platform Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            {error}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOrganizations: 0,
    activeOrganizations: 0,
    suspendedOrganizations: 0,
    pendingOrganizations: 0,
    totalUsers: 0,
    totalBookings: 0,
  };

  const statusDistribution = data?.statusDistribution || {
    active: 0,
    pending: 0,
    suspended: 0,
  };

  const totalOrgs = metrics.totalOrganizations || 1; // avoid division by zero
  const activePercent = Math.round((statusDistribution.active / totalOrgs) * 100);
  const pendingPercent = Math.round((statusDistribution.pending / totalOrgs) * 100);
  const suspendedPercent = Math.round((statusDistribution.suspended / totalOrgs) * 100);

  return (
    <div className="space-y-6 sm:space-y-7 pb-16">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time telemetry and management metrics across all BookMySlot sports organizations.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 self-start sm:self-auto text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 6 Platform Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {/* Card 1: Total Organizations */}
        <SuperAdminStatCard
          title="Total Organizations"
          value={metrics.totalOrganizations}
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          subtitle="Platform Tenants"
        />

        {/* Card 2: Active Organizations */}
        <SuperAdminStatCard
          title="Active Organizations"
          value={metrics.activeOrganizations}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          subtitle={<span className="text-emerald-600 font-bold">{metrics.activeOrganizations} operational</span>}
        />

        {/* Card 3: Suspended Organizations */}
        <SuperAdminStatCard
          title="Suspended"
          value={metrics.suspendedOrganizations}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          subtitle={<span className="text-rose-600 font-bold">{metrics.suspendedOrganizations} suspended</span>}
        />

        {/* Card 4: Pending Activation */}
        <SuperAdminStatCard
          title="Pending"
          value={metrics.pendingOrganizations}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          subtitle={<span className="text-amber-600 font-bold">{metrics.pendingOrganizations} pending</span>}
        />

        {/* Card 5: Total Users */}
        <SuperAdminStatCard
          title="Platform Users"
          value={metrics.totalUsers}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          subtitle="Across all tenants"
        />

        {/* Card 6: Total Bookings */}
        <SuperAdminStatCard
          title="Total Bookings"
          value={metrics.totalBookings}
          icon={<CalendarCheck className="w-5 h-5" />}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
          subtitle="System Reservations"
        />
      </div>

      {/* Organization Status Distribution Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Organization Status Distribution
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tenant state breakdown across the BookMySlot ecosystem
          </p>
        </div>

        {/* Status progress visualization bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${activePercent}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Active: ${statusDistribution.active}`}
          />
          <div
            style={{ width: `${pendingPercent}%` }}
            className="bg-amber-400 h-full transition-all duration-500"
            title={`Pending: ${statusDistribution.pending}`}
          />
          <div
            style={{ width: `${suspendedPercent}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Suspended: ${statusDistribution.suspended}`}
          />
        </div>

        {/* Detailed Breakdown Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Active</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900">{statusDistribution.active}</span>
              <span className="text-[10px] text-slate-400 block">{activePercent}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-slate-700">Pending</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900">{statusDistribution.pending}</span>
              <span className="text-[10px] text-slate-400 block">{pendingPercent}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-700">Suspended</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900">{statusDistribution.suspended}</span>
              <span className="text-[10px] text-slate-400 block">{suspendedPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Organizations & Recent Platform Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrganizations
          organizations={data?.recentOrganizations || []}
          onSelectOrganization={onSelectOrganization}
        />
        <RecentPlatformActivity activities={data?.recentActivity || []} />
      </div>

      {/* Platform Health Section */}
      {data?.platformHealth && <PlatformHealth health={data.platformHealth} />}
    </div>
  );
};
