import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  AlertCircle
} from 'lucide-react';
import type {
  PlatformOrganization,
  OrganizationStatus,
  OrganizationPagination
} from '../../types';
import { VALID_ORGANIZATION_TYPES } from '../../types/organization-constants';
import {
  fetchPlatformOrganizationsFromDB,
  setPlatformOrganizationStatus
} from '../../services/apiService';
import { SuperAdminStatCard } from '../../components/super-admin/SuperAdminStatCard';
import { AddOrganizationModal } from '../../components/super-admin/AddOrganizationModal';
import { OrganizationDetailsModal } from '../../components/super-admin/OrganizationDetailsModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

interface SuperAdminOrganizationsProps {
  initialSelectedOrgId?: string | null;
}

export const SuperAdminOrganizations: React.FC<SuperAdminOrganizationsProps> = ({
  initialSelectedOrgId,
}) => {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    pendingOrganizations: 0,
    suspendedOrganizations: 0,
  });
  const [pagination, setPagination] = useState<OrganizationPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailsOrgId, setDetailsOrgId] = useState<string | null>(initialSelectedOrgId || null);

  useEffect(() => {
    if (initialSelectedOrgId) {
      setDetailsOrgId(initialSelectedOrgId);
    }
  }, [initialSelectedOrgId]);

  // Confirmation dialog state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmActionOrg, setConfirmActionOrg] = useState<{
    id: string;
    name: string;
    targetStatus: OrganizationStatus;
  } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlatformOrganizationsFromDB({
        search: debouncedSearch,
        status: statusFilter,
        type: typeFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        pageSize: 20,
      });

      if (res.success && res.organizations) {
        setOrganizations(res.organizations);
        if (res.metrics) setMetrics(res.metrics);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setError(res.error || 'Failed to load organizations.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [debouncedSearch, statusFilter, typeFilter, sortBy, sortOrder, currentPage]);

  const handleStatusChangeRequest = (orgId: string, currentStatus: OrganizationStatus) => {
    const org = organizations.find(o => o.id === orgId);
    const orgName = org?.name || 'this organization';
    const targetStatus: OrganizationStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setConfirmActionOrg({ id: orgId, name: orgName, targetStatus });
    setConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmActionOrg) return;
    try {
      const res = await setPlatformOrganizationStatus(confirmActionOrg.id, confirmActionOrg.targetStatus);
      if (res.success) {
        setConfirmModalOpen(false);
        setConfirmActionOrg(null);
        await loadOrganizations();
      } else {
        alert(res.error || 'Failed to update organization status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const formatOrgType = (type: string) => {
    switch (type) {
      case 'sports_club':
        return 'Sports Club';
      case 'sports_academy':
        return 'Sports Academy';
      case 'sports_complex':
        return 'Sports Complex';
      case 'stadium':
        return 'Stadium';
      case 'sports_center':
        return 'Sports Center';
      case 'educational_institution':
        return 'Educational Institution';
      case 'corporate':
        return 'Corporate Sports';
      default:
        return 'Sports Organization';
    }
  };

  const formatStatusBadge = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== 'all' || typeFilter !== 'all');

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Organizations
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage and monitor all organizations on the BookMySlot platform.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-blue-500/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <SuperAdminStatCard
          title="Total Organizations"
          value={metrics.totalOrganizations}
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          subtitle="All platform tenants"
        />

        <SuperAdminStatCard
          title="Active"
          value={metrics.activeOrganizations}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          subtitle={<span className="text-emerald-600 font-bold">{metrics.activeOrganizations} operational</span>}
        />

        <SuperAdminStatCard
          title="Pending"
          value={metrics.pendingOrganizations}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          subtitle={<span className="text-amber-600 font-bold">{metrics.pendingOrganizations} pending</span>}
        />

        <SuperAdminStatCard
          title="Suspended"
          value={metrics.suspendedOrganizations}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          subtitle={<span className="text-rose-600 font-bold">{metrics.suspendedOrganizations} suspended</span>}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations by name, slug, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Types</option>
              {VALID_ORGANIZATION_TYPES.map(type => (
                <option key={type} value={type}>
                  {formatOrgType(type)}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={e => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="status:asc">Status (A-Z)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">
              Showing filtered results ({pagination.total} matching)
            </span>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Organizations List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Unable to load organizations</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              onClick={loadOrganizations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : organizations.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            {hasActiveFilters ? (
              <>
                <h3 className="text-sm font-bold text-slate-800">No organizations match your filters</h3>
                <p className="text-xs text-slate-400">Try modifying your search query or reset filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-800">No organizations found</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Create your first organization to start managing BookMySlot tenants.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Organization</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card List (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {organizations.map(org => (
                <div
                  key={org.id}
                  onClick={() => setDetailsOrgId(org.id)}
                  className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900 block truncate">
                        {org.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        slug: {org.slug}
                      </span>
                    </div>
                    <div>{formatStatusBadge(org.status)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60">
                      {formatOrgType(org.organizationType)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(org.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{org.userCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{org.facilityCount}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setDetailsOrgId(org.id);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Users</th>
                    <th className="py-3 px-4">Facilities</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {organizations.map(org => (
                    <tr
                      key={org.id}
                      onClick={() => setDetailsOrgId(org.id)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {org.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          slug: {org.slug}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                          {formatOrgType(org.organizationType)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {formatStatusBadge(org.status)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {org.userCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {org.facilityCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {formatDate(org.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setDetailsOrgId(org.id)}
                            className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          {org.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChangeRequest(org.id, org.status)}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChangeRequest(org.id, org.status)}
                              className="px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} organizations
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2.5 font-bold text-slate-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Organization Provisioning Modal */}
      <AddOrganizationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadOrganizations();
        }}
      />

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        organizationId={detailsOrgId}
        isOpen={Boolean(detailsOrgId)}
        onClose={() => setDetailsOrgId(null)}
        onStatusChangeRequest={(orgId, currStatus) => {
          setDetailsOrgId(null);
          handleStatusChangeRequest(orgId, currStatus);
        }}
      />

      {/* Confirmation Dialog for Suspend / Activate */}
      <ConfirmDialog
        isOpen={confirmModalOpen}
        title={
          confirmActionOrg?.targetStatus === 'suspended'
            ? 'Suspend organization?'
            : 'Activate organization?'
        }
        message={
          confirmActionOrg?.targetStatus === 'suspended'
            ? `Suspending "${confirmActionOrg?.name}" will instantly invalidate active sessions and prevent its users from accessing tenant services.`
            : `Users belonging to "${confirmActionOrg?.name}" will be able to access BookMySlot tenant facilities again.`
        }
        confirmText={
          confirmActionOrg?.targetStatus === 'suspended'
            ? 'Suspend Organization'
            : 'Activate Organization'
        }
        cancelText="Cancel"
        variant={confirmActionOrg?.targetStatus === 'suspended' ? 'danger' : 'info'}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => {
          setConfirmModalOpen(false);
          setConfirmActionOrg(null);
        }}
      />
    </div>
  );
};

