import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Clock,
  X as XIcon,
  ArrowUpDown,
  Mail,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import type {
  PlatformUser,
  PlatformUsersSummary,
  PlatformUserRole,
  PlatformUserStatus,
  PlatformOrganization,
  User,
} from '../../types';
import {
  fetchPlatformUsersFromDB,
  fetchPlatformOrganizationsFromDB,
  setPlatformUserStatusInDB,
} from '../../services/apiService';
import { SuperAdminStatCard } from '../../components/super-admin/SuperAdminStatCard';
import { PlatformUserDetailsModal } from '../../components/super-admin/PlatformUserDetailsModal';

interface SuperAdminPlatformUsersProps {
  currentUser?: User | null;
}

export const SuperAdminPlatformUsers: React.FC<SuperAdminPlatformUsersProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [summary, setSummary] = useState<PlatformUsersSummary>({
    totalUsers: 0,
    superAdmins: 0,
    orgAdmins: 0,
    members: 0,
    activeUsers: 0,
    suspendedDisabledUsers: 0,
  });
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Details Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Status Change Dialog
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<{
    id: string;
    name: string;
    role: string;
    targetStatus: PlatformUserStatus;
  } | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load organizations for filter dropdown
  useEffect(() => {
    fetchPlatformOrganizationsFromDB({ pageSize: 100 }).then((res) => {
      if (res.success && res.organizations) {
        setOrganizations(res.organizations);
      }
    });
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlatformUsersFromDB({
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        organizationId: orgFilter,
        subscriptionPlan: planFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        pageSize,
      });

      if (res.success && res.users) {
        setUsers(res.users);
        if (res.summary) setSummary(res.summary);
        setTotalUsersCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        setError(res.error || 'Failed to load platform users.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading platform users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [
    debouncedSearch,
    roleFilter,
    statusFilter,
    orgFilter,
    planFilter,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  const handleOpenDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailsModalOpen(true);
  };

  const handleInitiateStatusChange = (
    userId: string,
    targetStatus: PlatformUserStatus,
    userName: string,
    role: string
  ) => {
    if (
      currentUser &&
      currentUser.id === userId &&
      (targetStatus === 'suspended' || targetStatus === 'disabled')
    ) {
      alert('You cannot suspend or disable your own active Super Administrator account.');
      return;
    }

    setStatusActionError(null);
    setTargetUser({
      id: userId,
      name: userName,
      role,
      targetStatus,
    });
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetUser) return;
    setStatusActionLoading(true);
    setStatusActionError(null);

    try {
      const res = await setPlatformUserStatusInDB(targetUser.id, targetUser.targetStatus);
      if (res.success) {
        setStatusModalOpen(false);
        setTargetUser(null);
        // Refresh users list and any open details modal
        await loadUsers();
      } else {
        setStatusActionError(res.error || 'Failed to update user status.');
      }
    } catch (err: any) {
      setStatusActionError(err.message || 'Error updating user status.');
    } finally {
      setStatusActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
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

  const renderRoleBadge = (role: PlatformUserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'org_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            Org Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <UserIcon className="w-3 h-3 text-slate-500" />
            Member
          </span>
        );
    }
  };

  const renderStatusBadge = (status: PlatformUserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Suspended
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            <Ban className="w-3 h-3 text-slate-500" />
            Disabled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Platform Users Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centrally view and manage administrators and members across all organizations in the platform
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          Refresh
        </button>
      </div>

      {/* 1. Six User Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <SuperAdminStatCard
          title="Total Users"
          value={summary.totalUsers}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          subtitle="All platform accounts"
        />

        <SuperAdminStatCard
          title="Super Admins"
          value={summary.superAdmins}
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
          subtitle="Global operators"
        />

        <SuperAdminStatCard
          title="Org Admins"
          value={summary.orgAdmins}
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          subtitle="Tenant managers"
        />

        <SuperAdminStatCard
          title="Members"
          value={summary.members}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
          subtitle="Sports participants"
        />

        <SuperAdminStatCard
          title="Active Users"
          value={summary.activeUsers}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          subtitle="Can authenticate"
        />

        <SuperAdminStatCard
          title="Suspended / Disabled"
          value={summary.suspendedDisabledUsers}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          subtitle="Access blocked"
        />
      </div>

      {/* 2. Search & Multi-Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or member registration number..."
              className="w-full pl-9.5 pr-8 py-2 rounded-xl border border-slate-200/90 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200/90 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="org_admin">Org Admin</option>
              <option value="member">Member</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200/90 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="disabled">Disabled</option>
            </select>

            {/* Organization Filter */}
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200/90 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>

            {/* Subscription Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200/90 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic Plan</option>
              <option value="pro">Pro Plan</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200/90 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="created_at">Sort: Created Date</option>
              <option value="name">Sort: User Name</option>
              <option value="email">Sort: Email</option>
              <option value="role">Sort: Role</option>
              <option value="status">Sort: Status</option>
              <option value="organization">Sort: Organization</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setCurrentPage(1);
              }}
              title={`Sorting ${sortOrder.toUpperCase()}`}
              className="p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px]">{sortOrder}</span>
            </button>
          </div>
        </div>

        {/* Active filter count & reset */}
        {(debouncedSearch ||
          roleFilter !== 'all' ||
          statusFilter !== 'all' ||
          orgFilter !== 'all' ||
          planFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Filtered results: <strong className="text-slate-800">{totalUsersCount}</strong> users found
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setOrgFilter('all');
                setPlanFilter('all');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Users Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading platform users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No users found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No platform users match the current search query or active filter settings.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User Details</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Organization</th>
                    <th className="px-4 py-3.5">Subscription</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Last Activity</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-200">
                            {u.name.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              {u.isVerified && (
                                <span title="Email verified" className="text-emerald-500">
                                  ●
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {u.email}
                            </div>
                            {u.registrationNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {u.registrationNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">{renderRoleBadge(u.role)}</td>

                      {/* Organization */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {u.organizationName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {u.organizationSlug}
                          </div>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-4 py-3.5">
                        {u.planSlug ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              u.planSlug === 'pro'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.planSlug}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">{renderStatusBadge(u.status)}</td>

                      {/* Last Activity */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {formatDate(u.lastActivityAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(u.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="View Profile Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {u.status === 'active' && (
                            <button
                              onClick={() =>
                                handleInitiateStatusChange(u.id, 'suspended', u.name, u.role)
                              }
                              className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Suspend User"
                            >
                              Suspend
                            </button>
                          )}

                          {u.status === 'suspended' && (
                            <button
                              onClick={() =>
                                handleInitiateStatusChange(u.id, 'active', u.name, u.role)
                              }
                              className="px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Activate User"
                            >
                              Activate
                            </button>
                          )}

                          {u.status !== 'disabled' && (
                            <button
                              onClick={() =>
                                handleInitiateStatusChange(u.id, 'disabled', u.name, u.role)
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Disable User"
                            >
                              Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    {renderRoleBadge(u.role)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Organization</div>
                      <div className="font-semibold text-slate-800 truncate">{u.organizationName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Plan & Status</div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {renderStatusBadge(u.status)}
                        {u.planSlug && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                            {u.planSlug}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Active: {formatDate(u.lastActivityAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetails(u.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Details
                      </button>
                      {u.status === 'active' ? (
                        <button
                          onClick={() =>
                            handleInitiateStatusChange(u.id, 'suspended', u.name, u.role)
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : u.status === 'suspended' ? (
                        <button
                          onClick={() =>
                            handleInitiateStatusChange(u.id, 'active', u.name, u.role)
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-pointer"
                        >
                          Activate
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination & Page Size Footer */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="text-slate-800">
                    {Math.min(totalUsersCount, (currentPage - 1) * pageSize + 1)} -{' '}
                    {Math.min(totalUsersCount, currentPage * pageSize)}
                  </strong>{' '}
                  of <strong className="text-slate-800">{totalUsersCount}</strong> users
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-medium text-slate-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      <PlatformUserDetailsModal
        userId={selectedUserId}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
        onStatusChangeRequest={(uId, targetStatus, userName, role) => {
          setDetailsModalOpen(false);
          handleInitiateStatusChange(uId, targetStatus, userName, role);
        }}
      />

      {/* Status Change Confirmation Modal */}
      {statusModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                  targetUser.targetStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : targetUser.targetStatus === 'suspended'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}
              >
                {targetUser.targetStatus === 'active' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : targetUser.targetStatus === 'suspended' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Ban className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {targetUser.targetStatus} User Account
                </h3>
                <p className="text-xs text-slate-500">Confirm status update action</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to change the status of{' '}
                <strong className="text-slate-900">{targetUser.name}</strong> to{' '}
                <span className="font-bold uppercase tracking-wide text-slate-900">
                  {targetUser.targetStatus}
                </span>
                ?
              </p>

              {targetUser.targetStatus === 'suspended' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
                  <strong>Notice:</strong> Suspending this user immediately invalidates all active
                  session tokens and blocks access until reactivated.
                </div>
              )}

              {targetUser.targetStatus === 'disabled' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                  <strong>Warning:</strong> Disabling this user permanently blocks authentication and
                  revokes all current access.
                </div>
              )}

              {targetUser.role === 'super_admin' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] space-y-1">
                  <strong>Super Administrator Guard:</strong> You cannot suspend your own account or
                  the last active Super Admin.
                </div>
              )}
            </div>

            {statusActionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {statusActionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStatusModalOpen(false);
                  setTargetUser(null);
                }}
                disabled={statusActionLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={statusActionLoading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 ${
                  targetUser.targetStatus === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : targetUser.targetStatus === 'suspended'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {statusActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm {targetUser.targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
