import React from 'react';

interface SuperAdminStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  subtitle?: React.ReactNode;
}

export const SuperAdminStatCard: React.FC<SuperAdminStatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:space-y-2">
      <div className="flex items-center sm:block gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-2xl ${iconBgColor} ${iconTextColor} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="sm:hidden min-w-0">
          <span className="text-xs font-bold text-slate-700 block truncate">
            {title}
          </span>
          {subtitle && (
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:space-y-0.5 min-w-0 text-right sm:text-left">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className="hidden sm:block text-xs sm:text-sm font-semibold text-slate-400 truncate">
          {title}
        </span>
      </div>

      {subtitle && (
        <div className="hidden sm:block text-xs font-semibold text-slate-500 pt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};
