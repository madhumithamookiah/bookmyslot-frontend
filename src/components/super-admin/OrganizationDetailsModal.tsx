import React, { useEffect, useState } from 'react';
import {
  Building2,
  X,
  Users,
  CalendarCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  Layers,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import type { OrganizationDetails, OrganizationStatus } from '../../types';
import { fetchPlatformOrganizationDetailsFromDB } from '../../services/apiService';

interface OrganizationDetailsModalProps {
  organizationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChangeRequest: (orgId: string, currentStatus: OrganizationStatus) => void;
}

export const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
  organizationId,
  isOpen,
  onClose,
  onStatusChangeRequest,
}) => {
  const [details, setDetails] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !organizationId) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPlatformOrganizationDetailsFromDB(organizationId)
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.organization) {
          setDetails({
            organization: res.organization,
            stats: res.stats || {
              totalUsers: 0,
              totalBookings: 0,
              totalFacilities: 0,
              totalSports: 0,
              activeRestrictions: 0,
            },
            settings: res.settings,
          });
        } else {
          setError(res.error || 'Unable to load organization details.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'An unexpected error occurred.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, organizationId]);

  if (!isOpen || !organizationId) return null;

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Suspended
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const org = details?.organization;
  const stats = details?.stats;
  const settings = details?.settings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-7 space-y-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading organization telemetry...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Failed to Load Details</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {org && !loading && (
          <>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                      {org.name}
                    </h2>
                    <div>{formatStatusBadge(org.status)}</div>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                      slug: {org.slug}
                    </span>
                    <span>•</span>
                    <span>{formatOrgType(org.organizationType)}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex-shrink-0 self-start">
                {org.status === 'active' ? (
                  <button
                    onClick={() => onStatusChangeRequest(org.id, org.status)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Suspend Organization
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusChangeRequest(org.id, org.status)}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Activate Organization
                  </button>
                )}
              </div>
            </div>

            {/* Tenant Statistics Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Tenant Statistics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-semibold">Users</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {stats?.totalUsers.toLocaleString() ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-semibold">Bookings</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {stats?.totalBookings.toLocaleString() ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-semibold">Facilities</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {stats?.totalFacilities.toLocaleString() ?? 0}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span className="text-[11px] font-semibold">Sports</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {stats?.totalSports.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Contact & General Information
              </div>
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{org.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{org.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{org.website || 'No website registered'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {[org.city, org.state, org.country].filter(Boolean).join(', ') || 'India'}
                    </span>
                  </div>
                </div>

                {org.description && (
                  <div className="pt-2 border-t border-slate-200/60 text-slate-500">
                    {org.description}
                  </div>
                )}
              </div>
            </div>

            {/* Organization Settings */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Tenant Operational Settings
              </div>
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Operating Hours</span>
                  <span className="font-bold text-slate-800">
                    {settings?.openingTime || '10:00'} - {settings?.closingTime || '18:00'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Slot Duration</span>
                  <span className="font-bold text-slate-800">
                    {settings?.bookingDurationMinutes || 60} mins
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Advance Window</span>
                  <span className="font-bold text-slate-800">
                    {settings?.advanceBookingDays || 14} days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approval Mode</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {settings?.approvalMode || 'auto'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Mode</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {settings?.paymentMode || 'free'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Active per User</span>
                  <span className="font-bold text-slate-800">
                    {settings?.maxActiveBookingsPerUser || 3}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
              <span>Created: {formatDate(org.createdAt)}</span>
              <span>Updated: {formatDate(org.updatedAt)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
