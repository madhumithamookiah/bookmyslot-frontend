import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  Users,
  CalendarCheck,
  Clock,
  Layers,
  Trophy,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Filter,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import type {
  PlatformAnalytics,
  AnalyticsDateRangePreset,
} from '../../types';
import { fetchPlatformAnalyticsFromDB } from '../../services/apiService';
import { SuperAdminStatCard } from '../../components/super-admin/SuperAdminStatCard';

interface SuperAdminAnalyticsProps {
  onSelectOrganization?: (orgId: string) => void;
}

export const SuperAdminAnalytics: React.FC<SuperAdminAnalyticsProps> = ({
  onSelectOrganization,
}) => {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const [selectedPreset, setSelectedPreset] = useState<AnalyticsDateRangePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Sorting state for Organization Usage Table
  const [usageSortBy, setUsageSortBy] = useState<'bookings' | 'users' | 'facilities' | 'sports' | 'name'>('bookings');
  const [usageSortOrder, setUsageSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadAnalytics = async (presetOverride?: AnalyticsDateRangePreset) => {
    setLoading(true);
    setError(null);
    try {
      const activePreset = presetOverride || selectedPreset;
      const res = await fetchPlatformAnalyticsFromDB({
        dateRange: activePreset,
        startDate: activePreset === 'custom' ? customStart : undefined,
        endDate: activePreset === 'custom' ? customEnd : undefined,
      });

      if (res.success && res.analytics) {
        setData(res.analytics);
      } else {
        setError(res.error || 'Failed to load platform analytics.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedPreset]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (!customStart || !customEnd) {
      setCustomError('Both start and end dates are required.');
      return;
    }
    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setCustomError('Invalid date format.');
      return;
    }
    if (start.getTime() > end.getTime()) {
      setCustomError('Start date cannot be after end date.');
      return;
    }

    setSelectedPreset('custom');
    loadAnalytics('custom');
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Sort organization usage
  const sortedOrgUsage = [...(data?.organizationUsage || [])].sort((a, b) => {
    let diff = 0;
    if (usageSortBy === 'bookings') diff = a.bookingsCount - b.bookingsCount;
    else if (usageSortBy === 'users') diff = a.usersCount - b.usersCount;
    else if (usageSortBy === 'facilities') diff = a.facilitiesCount - b.facilitiesCount;
    else if (usageSortBy === 'sports') diff = a.sportsCount - b.sportsCount;
    else diff = a.name.localeCompare(b.name);
    return usageSortOrder === 'asc' ? diff : -diff;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor platform growth, usage, organizations and booking activity.
          </p>
        </div>

        {/* Date Range Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap items-center gap-1 border border-slate-200">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: 'this_year', label: 'This Year' },
                { id: 'all_time', label: 'All Time' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setShowCustomRange(false);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedPreset === preset.id
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                selectedPreset === 'custom' || showCustomRange
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Custom
            </button>
          </div>

          <button
            onClick={() => loadAnalytics()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Custom Date Range Expansion Form */}
      {showCustomRange && (
        <form
          onSubmit={handleApplyCustomRange}
          className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Custom Date Interval:
          </span>

          <div className="flex items-center gap-2">
            <label className="text-slate-500">From:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500">To:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
          >
            Apply Range
          </button>

          {customError && (
            <span className="text-rose-600 font-medium">{customError}</span>
          )}
        </form>
      )}

      {/* Loading Skeleton State */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200/60 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200/60 rounded-2xl"></div>
            <div className="h-64 bg-slate-200/60 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Failed to load Platform Analytics</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            Retry Analytics
          </button>
        </div>
      )}

      {/* Analytics Content */}
      {data && (
        <>
          {/* Active Period Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing aggregated platform statistics for{' '}
              <strong className="text-slate-800">
                {formatDate(data.startDate)}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {formatDate(data.endDate)}
              </strong>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Range: {data.dateRange}
            </span>
          </div>

          {/* 1. TOP 8 PLATFORM METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <SuperAdminStatCard
              title="Total Organizations"
              value={data.overview.totalOrganizations}
              icon={<Building2 className="w-5 h-5" />}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
              subtitle="All registered tenants"
            />

            <SuperAdminStatCard
              title="Active Organizations"
              value={data.overview.activeOrganizations}
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
              subtitle="Currently operational"
            />

            <SuperAdminStatCard
              title="Total Users"
              value={data.overview.totalUsers}
              icon={<Users className="w-5 h-5" />}
              iconBgColor="bg-indigo-50"
              iconTextColor="text-indigo-600"
              subtitle="Across all tenants"
            />

            <SuperAdminStatCard
              title="Total Bookings"
              value={data.overview.totalBookings}
              icon={<CalendarCheck className="w-5 h-5" />}
              iconBgColor="bg-violet-50"
              iconTextColor="text-violet-600"
              subtitle="Lifetime slot bookings"
            />

            <SuperAdminStatCard
              title="Period Bookings"
              value={data.overview.periodBookings}
              icon={<Clock className="w-5 h-5" />}
              iconBgColor="bg-sky-50"
              iconTextColor="text-sky-600"
              subtitle={`In selected ${data.dateRange}`}
            />

            <SuperAdminStatCard
              title="Active Facilities"
              value={data.overview.activeFacilities}
              icon={<Layers className="w-5 h-5" />}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
              subtitle="Courts, grounds & turfs"
            />

            <SuperAdminStatCard
              title="Active Sports"
              value={data.overview.activeSports}
              icon={<Trophy className="w-5 h-5" />}
              iconBgColor="bg-teal-50"
              iconTextColor="text-teal-600"
              subtitle="Configured disciplines"
            />

            <SuperAdminStatCard
              title="Pro Organizations"
              value={data.overview.proOrganizations}
              icon={<Zap className="w-5 h-5" />}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
              subtitle="On unlimited Pro tier"
            />
          </div>

          {/* 2. GROWTH CHARTS: ORGANIZATION GROWTH & USER GROWTH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Growth Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Organization Growth
                  </h3>
                  <p className="text-xs text-slate-500">
                    New tenant organizations created in this period
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {data.organizationGrowth.reduce((acc, p) => acc + p.newOrganizations, 0)} new
                </span>
              </div>

              {data.organizationGrowth.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No organization creation activity recorded in this period.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="h-44 flex items-end gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
                    {data.organizationGrowth.map((point, idx) => {
                      const maxNew = Math.max(
                        ...data.organizationGrowth.map((p) => p.newOrganizations),
                        1
                      );
                      const heightPercent = Math.max(12, Math.round((point.newOrganizations / maxNew) * 100));

                      return (
                        <div
                          key={idx}
                          className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                            {point.date}: +{point.newOrganizations} orgs (Cumulative: {point.cumulativeOrganizations})
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[28px] bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all flex items-center justify-center text-[10px] text-white font-bold"
                          >
                            {point.newOrganizations > 0 ? point.newOrganizations : ''}
                          </div>
                          <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate max-w-[35px]">
                            {point.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>X-Axis: Time periods</span>
                    <span>Y-Axis: New Organizations Added</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    User Growth & Role Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    New platform accounts created over time
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  {data.userGrowth.reduce((acc, p) => acc + p.newUsers, 0)} users
                </span>
              </div>

              {data.userGrowth.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No new user registrations recorded in this period.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="h-44 flex items-end gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
                    {data.userGrowth.map((point, idx) => {
                      const maxUsers = Math.max(
                        ...data.userGrowth.map((p) => p.newUsers),
                        1
                      );
                      const heightPercent = Math.max(12, Math.round((point.newUsers / maxUsers) * 100));

                      return (
                        <div
                          key={idx}
                          className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group relative"
                        >
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                            {point.date}: +{point.newUsers} (Members: {point.members}, Admins: {point.orgAdmins})
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[28px] bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all flex items-center justify-center text-[10px] text-white font-bold"
                          >
                            {point.newUsers > 0 ? point.newUsers : ''}
                          </div>
                          <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate max-w-[35px]">
                            {point.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>X-Axis: Time periods</span>
                    <span>Y-Axis: New User Registrations</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. BOOKING ANALYTICS & BOOKING TREND */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Booking Analytics & Volume Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmed vs cancelled slot bookings across all sports facilities
                </p>
              </div>

              {/* 4 Summary Stats Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Confirmed: {data.bookingAnalytics.confirmedBookings}
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  Cancelled: {data.bookingAnalytics.cancelledBookings}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Avg/Day: {data.bookingAnalytics.averageBookingsPerDay}
                </span>
                {data.bookingAnalytics.busiestDate && (
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Busiest Day: {data.bookingAnalytics.busiestDate}
                  </span>
                )}
                {data.bookingAnalytics.busiestTimeSlot && (
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Peak Slot: {data.bookingAnalytics.busiestTimeSlot}
                  </span>
                )}
              </div>
            </div>

            {/* Booking Trend Chart */}
            {data.bookingTrend.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No booking records found for the selected time range.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="h-52 flex items-end gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
                  {data.bookingTrend.map((point, idx) => {
                    const maxBookings = Math.max(
                      ...data.bookingTrend.map((p) => p.bookings),
                      1
                    );
                    const totalHeight = Math.max(10, Math.round((point.bookings / maxBookings) * 100));

                    return (
                      <div
                        key={idx}
                        className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group relative"
                      >
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                          {point.date}: {point.bookings} total ({point.confirmed} confirmed, {point.cancelled} cancelled)
                        </div>
                        <div
                          style={{ height: `${totalHeight}%` }}
                          className="w-full max-w-[28px] flex flex-col-reverse rounded-t-md overflow-hidden"
                        >
                          {/* Confirmed portion */}
                          <div
                            style={{
                              height: point.bookings > 0 ? `${(point.confirmed / point.bookings) * 100}%` : '100%',
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
                          ></div>
                          {/* Cancelled portion */}
                          {point.cancelled > 0 && (
                            <div
                              style={{
                                height: `${(point.cancelled / point.bookings) * 100}%`,
                              }}
                              className="w-full bg-rose-400 hover:bg-rose-500 transition-colors"
                            ></div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate max-w-[35px]">
                          {point.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span> Confirmed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block"></span> Cancelled
                    </span>
                  </div>
                  <span>X-Axis: Booking Dates</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. TOP 10 ORGANIZATIONS & SUBSCRIPTION DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 10 Organizations */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top Organizations by Bookings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by total booking activity in the selected period
                  </p>
                </div>
              </div>

              {data.topOrganizations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No organizations with bookings found in this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5">Rank</th>
                        <th className="px-3 py-2.5">Organization</th>
                        <th className="px-3 py-2.5 text-right">Bookings</th>
                        <th className="px-3 py-2.5 text-right">Users</th>
                        <th className="px-3 py-2.5 text-right">Facilities</th>
                        <th className="px-3 py-2.5 text-right">Sports</th>
                        <th className="px-3 py-2.5">Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.topOrganizations.map((org) => (
                        <tr
                          key={org.id}
                          onClick={() => onSelectOrganization && onSelectOrganization(org.id)}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            onSelectOrganization ? 'cursor-pointer' : ''
                          }`}
                        >
                          <td className="px-3 py-3">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                                org.rank === 1
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : org.rank === 2
                                  ? 'bg-slate-200 text-slate-800'
                                  : org.rank === 3
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'text-slate-500'
                              }`}
                            >
                              {org.rank}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-bold text-slate-900">{org.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{org.slug}</div>
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-800">
                            {org.bookingsCount.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">
                            {org.usersCount}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">
                            {org.facilitiesCount}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">
                            {org.sportsCount}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                org.planSlug === 'pro'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {org.planSlug}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subscription Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Subscription Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Plan tier breakdown across all registered organizations
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {data.subscriptionDistribution.map((sub, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 capitalize">
                        {sub.planName}
                      </span>
                      <span className="text-slate-500">
                        <strong className="text-slate-900">{sub.count}</strong> orgs ({sub.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(0, sub.percentage))}%` }}
                        className={`h-full rounded-full transition-all ${
                          sub.planSlug === 'pro'
                            ? 'bg-indigo-600'
                            : sub.planSlug === 'basic'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 mt-4">
                <div className="font-semibold text-slate-800">Plan Insights:</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Basic provides 3 facilities and 5 sports. Upgrades to Pro unlock unlimited sports, facilities, and dedicated tenant branding.
                </p>
              </div>
            </div>
          </div>

          {/* 5. SPORTS USAGE & FACILITY USAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Sports */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  Most Popular Sports
                </h3>
                <p className="text-xs text-slate-500">
                  Disciplines ranked by booking count in selected date range
                </p>
              </div>

              {data.sportsUsage.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No sports booking activity recorded for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.sportsUsage.map((sp, idx) => {
                    const maxCount = Math.max(...data.sportsUsage.map((s) => s.bookingsCount), 1);
                    const pct = Math.round((sp.bookingsCount / maxCount) * 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                            {sp.sportName}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            <strong className="text-slate-800">{sp.bookingsCount}</strong> bookings ({sp.organizationsCount} orgs)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-teal-500 rounded-full"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Facilities */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  Top Facilities by Bookings
                </h3>
                <p className="text-xs text-slate-500">
                  Individual courts and grounds with the highest booking volume
                </p>
              </div>

              {data.facilityUsage.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No facility bookings recorded for this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5">Facility / Venue</th>
                        <th className="px-3 py-2.5">Organization</th>
                        <th className="px-3 py-2.5 text-right">Bookings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.facilityUsage.map((fac, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                            {fac.facilityName}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 truncate max-w-[150px]">
                            {fac.organizationName}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                            {fac.bookingsCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-[10px] text-slate-400 pt-2 px-1">
                    *Note: Facility utilization percentage requires slot-capacity telemetry not captured in slot reservations.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. ORGANIZATION USAGE TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Organization Usage Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-tenant summary of users, sports, facilities and booking activity
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Sort by:</span>
                <select
                  value={usageSortBy}
                  onChange={(e) => setUsageSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
                >
                  <option value="bookings">Bookings</option>
                  <option value="users">Users</option>
                  <option value="facilities">Facilities</option>
                  <option value="sports">Sports</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setUsageSortOrder(usageSortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold uppercase cursor-pointer"
                >
                  {usageSortOrder}
                </button>
              </div>
            </div>

            {sortedOrgUsage.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No organization usage data found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Organization</th>
                      <th className="px-4 py-3.5 text-right">Users</th>
                      <th className="px-4 py-3.5 text-right">Sports</th>
                      <th className="px-4 py-3.5 text-right">Facilities</th>
                      <th className="px-4 py-3.5 text-right">Period Bookings</th>
                      <th className="px-4 py-3.5">Plan</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedOrgUsage.map((org) => (
                      <tr
                        key={org.id}
                        onClick={() => onSelectOrganization && onSelectOrganization(org.id)}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          onSelectOrganization ? 'cursor-pointer' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{org.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{org.slug}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          {org.usersCount}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          {org.sportsCount}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          {org.facilitiesCount}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          {org.bookingsCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              org.planSlug === 'pro'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {org.planSlug}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                              org.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {org.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 7. PLATFORM HEALTH & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Business Health */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  Platform Health
                </h3>
                <p className="text-xs text-slate-500">
                  Global operational status across tenants and user accounts
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Active Orgs</span>
                  <div className="text-lg font-black text-emerald-600">
                    {data.platformHealth.activeOrganizations}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Suspended Orgs</span>
                  <div className="text-lg font-black text-rose-600">
                    {data.platformHealth.suspendedOrganizations}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Active Users</span>
                  <div className="text-lg font-black text-emerald-600">
                    {data.platformHealth.activeUsers}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Suspended Users</span>
                  <div className="text-lg font-black text-amber-600">
                    {data.platformHealth.suspendedUsers}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Basic Orgs</span>
                  <div className="text-lg font-black text-blue-600">
                    {data.platformHealth.basicOrganizations}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pro Orgs</span>
                  <div className="text-lg font-black text-indigo-600">
                    {data.platformHealth.proOrganizations}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Platform Activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Recent Platform Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Latest administrative operations recorded across the SaaS platform
                </p>
              </div>

              {data.recentActivity.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No recorded audit activity found.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden max-h-72 overflow-y-auto">
                  {data.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                          {act.action.replace(/_/g, ' ')}
                          <span className="text-[10px] font-mono text-slate-400">
                            [{act.entityType}]
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Actor: <span className="font-medium text-slate-700">{act.actorEmail || 'System'}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 shrink-0">
                        {formatDateTime(act.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
