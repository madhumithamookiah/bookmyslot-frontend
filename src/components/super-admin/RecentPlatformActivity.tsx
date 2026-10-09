import React from 'react';
import { Activity, Clock } from 'lucide-react';
import type { PlatformRecentActivity } from '../../types';

interface RecentPlatformActivityProps {
  activities: PlatformRecentActivity[];
}

export const RecentPlatformActivity: React.FC<RecentPlatformActivityProps> = ({ activities }) => {
  const formatTimeAgo = (dateString: string) => {
    try {
      const now = Date.now();
      const past = new Date(dateString).getTime();
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return dateString;
    }
  };

  const formatActionTitle = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Platform Activity
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs recorded across organizations
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">No recent platform activity.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            System and tenant actions will be displayed as they occur.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map(item => (
            <div
              key={item.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                    {formatActionTitle(item.action)}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-blue-600 truncate max-w-[160px]">
                      {item.organizationName || 'System'}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[160px] text-slate-400">
                      {item.userEmail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
