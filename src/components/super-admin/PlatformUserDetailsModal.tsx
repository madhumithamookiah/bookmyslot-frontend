import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Building2,
  CreditCard,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Activity,
  Hash,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import type { PlatformUserDetails, PlatformUserStatus } from '../../types';
import { fetchPlatformUserDetailsFromDB } from '../../services/apiService';

interface PlatformUserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChangeRequest: (
    userId: string,
    targetStatus: PlatformUserStatus,
    userName: string,
    role: string
  ) => void;
}

export const PlatformUserDetailsModal: React.FC<PlatformUserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
  onStatusChangeRequest,
}) => {
  const [details, setDetails] = useState<PlatformUserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPlatformUserDetailsFromDB(userId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.user) {
          setDetails(res.user);
        } else {
          setError(res.error || 'Failed to load user profile details.');
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message || 'Error fetching user details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not available';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Super Admin
          </span>
        );
      case 'org_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Org Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <UserIcon className="w-3.5 h-3.5" />
            Member
          </span>
        );
    }
  };

  const renderStatusBadge = (status: PlatformUserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Verification
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Suspended
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            Disabled
          </span>
        );
    }
  };

  const u = details?.user;
  const org = details?.organization;
  const sub = details?.subscription;
  const activity = details?.recentActivity || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Platform User Details
              </h2>
              <p className="text-xs text-slate-500">
                User profile, organization tenancy, and activity audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading user profile & history...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : u ? (
            <>
              {/* User Identity Header Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{u.name}</h3>
                    {renderRoleBadge(u.role)}
                    {renderStatusBadge(u.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                  {u.registrationNumber && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <span>ID: {u.registrationNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      u.isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {u.isVerified ? 'Email Verified' : 'Unverified Email'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Joined: {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>

              {/* Organization & Subscription Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organization Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Assigned Organization
                  </div>
                  {org ? (
                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-slate-900 text-sm">{org.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">slug: {org.slug}</div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium capitalize">
                          {org.organizationType.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${
                            org.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          Org Status: {org.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Global Platform Admin</p>
                  )}
                </div>

                {/* Subscription Plan Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Subscription Plan
                  </div>
                  {sub ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{sub.planName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            sub.planSlug === 'pro'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sub.planSlug}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Status: <span className="font-medium text-slate-700 capitalize">{sub.status}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Valid since: {formatDate(sub.startsAt)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No active plan assigned</p>
                  )}
                </div>
              </div>

              {/* Activity & Audit Trail */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Activity className="w-4 h-4 text-slate-500" />
                    Recent Audit Activity
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Last active: {formatDate(u.lastActivityAt)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white max-h-48 overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No recorded audit logs found for this user account.
                    </div>
                  ) : (
                    activity.map((item) => (
                      <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="font-semibold text-slate-800 capitalize">
                            {item.action.replace(/_/g, ' ')}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Entity: <span className="font-mono text-slate-600">{item.entityType}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 shrink-0">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer with Status Actions */}
        {u && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">ID: {u.id}</div>

            <div className="flex items-center gap-2">
              {u.status !== 'active' && u.status !== 'pending' && (
                <button
                  onClick={() => onStatusChangeRequest(u.id, 'active', u.name, u.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Activate Account
                </button>
              )}

              {u.status === 'active' && (
                <button
                  onClick={() => onStatusChangeRequest(u.id, 'suspended', u.name, u.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Suspend Account
                </button>
              )}

              {u.status !== 'disabled' && (
                <button
                  onClick={() => onStatusChangeRequest(u.id, 'disabled', u.name, u.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Disable Account
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
