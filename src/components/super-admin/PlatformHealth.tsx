import React from 'react';
import { Database, ShieldCheck, CalendarCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import type { PlatformHealthStatus } from '../../types';

interface PlatformHealthProps {
  health: PlatformHealthStatus;
}

export const PlatformHealth: React.FC<PlatformHealthProps> = ({ health }) => {
  const getStatusBadge = (status: 'operational' | 'degraded' | 'outage') => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Degraded
          </span>
        );
      case 'outage':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Outage
          </span>
        );
    }
  };

  const systems = [
    {
      name: 'PostgreSQL Database',
      description: 'Primary relational store & connection pool',
      icon: <Database className="w-4 h-4 text-slate-500" />,
      status: health.database,
    },
    {
      name: 'Authentication & Session Service',
      description: 'HMAC signature verification & token revocation',
      icon: <ShieldCheck className="w-4 h-4 text-slate-500" />,
      status: health.authentication,
    },
    {
      name: 'Tenant Routing & Isolation',
      description: 'Multi-tenant isolation barrier & context resolver',
      icon: <Building2 className="w-4 h-4 text-slate-500" />,
      status: health.organizations,
    },
    {
      name: 'Booking Engine & Constraints',
      description: 'Slot concurrency and restriction evaluator',
      icon: <CalendarCheck className="w-4 h-4 text-slate-500" />,
      status: health.bookingSystem,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Platform Health
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of critical SaaS infrastructure components
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {systems.map(s => (
          <div
            key={s.name}
            className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                {s.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {s.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {s.description}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">{getStatusBadge(s.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
