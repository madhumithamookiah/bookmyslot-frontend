import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import type { OrganizationSubscription, SubscriptionStatus } from '../../types';
import { changeOrganizationPlanInDB, setOrganizationSubscriptionStatusInDB } from '../../services/apiService';
import { ConfirmDialog } from '../admin/ConfirmDialog';

interface ManageSubscriptionModalProps {
  subscription: OrganizationSubscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSubscriptionUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'info',
    action: async () => {},
  });

  if (!isOpen || !subscription) return null;

  const isBasic = (subscription.planSlug || 'basic') === 'basic';

  const handlePlanChangeClick = () => {
    if (isBasic) {
      setConfirmConfig({
        open: true,
        title: 'Upgrade organization to Pro?',
        message:
          'This will unlock unlimited facilities, unlimited sports, advanced organization features, and branding entitlements for this organization.',
        variant: 'info',
        action: async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await changeOrganizationPlanInDB(subscription.organizationId, 'pro');
            if (res.success) {
              setConfirmConfig(prev => ({ ...prev, open: false }));
              onSubscriptionUpdated();
              onClose();
            } else {
              setError(res.error || 'Failed to upgrade plan.');
            }
          } catch (err: any) {
            setError(err.message || 'Error executing upgrade.');
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      setConfirmConfig({
        open: true,
        title: 'Downgrade organization to Basic?',
        message:
          'Basic has usage limits. Existing resources above the Basic limits will not be deleted automatically, but the organization may be prevented from creating additional resources until it is within the allowed limits.',
        variant: 'warning',
        action: async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await changeOrganizationPlanInDB(subscription.organizationId, 'basic');
            if (res.success) {
              setConfirmConfig(prev => ({ ...prev, open: false }));
              onSubscriptionUpdated();
              onClose();
            } else {
              setError(res.error || 'Failed to downgrade plan.');
            }
          } catch (err: any) {
            setError(err.message || 'Error executing downgrade.');
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

  const handleStatusChangeClick = (newStatus: SubscriptionStatus) => {
    const isCancel = newStatus === 'cancelled';
    setConfirmConfig({
      open: true,
      title: isCancel ? 'Cancel subscription?' : 'Activate subscription?',
      message: isCancel
        ? `Are you sure you want to cancel the subscription for "${subscription.organizationName || subscription.organizationSlug}"? The tenant may lose access to paid entitlements.`
        : `Reactivate the subscription for "${subscription.organizationName || subscription.organizationSlug}"?`,
      variant: isCancel ? 'danger' : 'info',
      action: async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await setOrganizationSubscriptionStatusInDB(subscription.organizationId, newStatus);
          if (res.success) {
            setConfirmConfig(prev => ({ ...prev, open: false }));
            onSubscriptionUpdated();
            onClose();
          } else {
            setError(res.error || 'Failed to update subscription status.');
          }
        } catch (err: any) {
          setError(err.message || 'Error updating status.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Subscription</h2>
              <p className="text-xs text-slate-500">Plan lifecycle & entitlement administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Organization Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{subscription.organizationName}</h3>
                  <p className="text-xs text-slate-400 font-mono">slug: {subscription.organizationSlug}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    subscription.planSlug === 'pro'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {subscription.planName || 'Basic'} Plan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Subscription Status</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold capitalize mt-0.5 ${
                    subscription.status === 'active'
                      ? 'text-emerald-600'
                      : subscription.status === 'expired'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {subscription.status === 'active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {subscription.status === 'expired' && <Clock className="w-3.5 h-3.5" />}
                  {subscription.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                  {subscription.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Interval</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">Monthly Renewal</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Started On</span>
                <span className="font-medium text-slate-600 mt-0.5 block">{formatDate(subscription.startsAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expires / Renews</span>
                <span className="font-medium text-slate-600 mt-0.5 block">{formatDate(subscription.endsAt)}</span>
              </div>
            </div>
          </div>

          {/* Action 1: Change Subscription Plan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Change Subscription Tier
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isBasic ? 'Upgrade to Pro Plan' : 'Downgrade to Basic Plan'}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBasic
                      ? 'Unlock unlimited capacity & organization branding entitlements.'
                      : 'Switch back to standard usage limits (3 facilities, 5 sports, 1000 members).'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlanChangeClick}
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isBasic
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isBasic ? (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Upgrade to Pro Plan
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    Downgrade to Basic Plan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action 2: Subscription Status Transitions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subscription Lifecycle
            </h4>
            <div className="flex items-center gap-2">
              {subscription.status !== 'active' && (
                <button
                  type="button"
                  onClick={() => handleStatusChangeClick('active')}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Activate Subscription
                </button>
              )}

              {subscription.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleStatusChangeClick('cancelled')}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText="Confirm Change"
        cancelText="Cancel"
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};
