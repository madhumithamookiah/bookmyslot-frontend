import React, { useState } from 'react';
import { Building2, X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import type { OrganizationType, OrganizationProvisioningPayload } from '../../types';
import { VALID_ORGANIZATION_TYPES } from '../../types/organization-constants';
import { provisionOrganizationFromDB } from '../../services/apiService';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('sports_club');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Initial Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminReg, setAdminReg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto slug generation from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanAdminName = adminName.trim();
    const cleanAdminEmail = adminEmail.trim().toLowerCase();

    if (!cleanName) {
      setError('Organization name is required.');
      return;
    }
    if (!cleanSlug || cleanSlug.length < 3) {
      setError('Slug must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens without consecutive hyphens.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Valid contact email is required.');
      return;
    }
    if (!cleanAdminName) {
      setError('Initial administrator name is required.');
      return;
    }
    if (!cleanAdminEmail || !cleanAdminEmail.includes('@')) {
      setError('Initial administrator email is required.');
      return;
    }
    if (adminPassword && adminPassword.length < 6) {
      setError('Administrator password must be at least 6 characters.');
      return;
    }

    const payload: OrganizationProvisioningPayload = {
      name: cleanName,
      slug: cleanSlug,
      organizationType,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      initialAdmin: {
        name: cleanAdminName,
        email: cleanAdminEmail,
        password: adminPassword.trim() || undefined,
        registrationNumber: adminReg.trim().toUpperCase() || 'ADM001',
      },
    };

    setLoading(true);
    try {
      const res = await provisionOrganizationFromDB(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        if (res.error?.includes('already in use')) {
          setError(`Organization slug "${cleanSlug}" is already in use.`);
        } else {
          setError(res.error || 'Failed to provision organization.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during provisioning.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatOrgTypeLabel = (type: string) => {
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
        return 'Other Organization';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-7 space-y-5 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Provision New Organization
            </h2>
            <p className="text-xs text-slate-500">
              Create an isolated tenant environment with baseline sports and initial administrator.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="font-semibold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Organization Details */}
          <div className="space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Organization Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Sports Club"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tenant Slug *
                </label>
                <input
                  type="text"
                  placeholder="e.g. apex-sports"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase())}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Used for tenant URL identification (lowercase & hyphens only)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Organization Type *
                </label>
                <select
                  value={organizationType}
                  onChange={e => setOrganizationType(e.target.value as OrganizationType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {VALID_ORGANIZATION_TYPES.map(type => (
                    <option key={type} value={type}>
                      {formatOrgTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@apexclub.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://apexclub.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of the sports organization..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
              />
            </div>
          </div>

          {/* Section 2: Initial Organization Administrator */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Initial Organization Administrator
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Login Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. admin@apexclub.com"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if left empty"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Leave blank to generate a secure random password
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Identifier (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. APEX-ADM01"
                  value={adminReg}
                  onChange={e => setAdminReg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Tenant...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Provision Organization</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

