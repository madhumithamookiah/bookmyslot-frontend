import React from 'react';
import { Building2, Calendar, Users } from 'lucide-react';
import type { PlatformRecentOrg } from '../../types';

interface RecentOrganizationsProps {
  organizations: PlatformRecentOrg[];
  onSelectOrganization?: (orgId: string) => void;
}

export const RecentOrganizations: React.FC<RecentOrganizationsProps> = ({
  organizations,
  onSelectOrganization,
}) => {
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

  const formatStatusBadge = (status: string) => {
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
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Organizations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest tenants onboarded to the BookMySlot platform
          </p>
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">No organizations found yet.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            New organizations will appear here as tenants are provisioned.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {organizations.map(org => (
              <div
                key={org.id}
                onClick={() => onSelectOrganization?.(org.id)}
                className={`py-3.5 first:pt-0 last:pb-0 space-y-2 ${onSelectOrganization ? 'cursor-pointer hover:bg-slate-50/50 transition-colors rounded-xl px-2' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {org.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {formatOrgType(org.organizationType)}
                    </span>
                  </div>
                  <div>{formatStatusBadge(org.status)}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{org.userCount} users</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(org.createdAt)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet Table (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Users</th>
                  <th className="py-3 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {organizations.map(org => (
                  <tr
                    key={org.id}
                    onClick={() => onSelectOrganization?.(org.id)}
                    className={`transition-colors ${onSelectOrganization ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{org.name}</div>
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
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-medium text-slate-500">
                      {formatDate(org.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
