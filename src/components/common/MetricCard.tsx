import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'highlight';
  badgeText?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  badgeText,
  onClick,
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-800 hover:border-slate-700',
      bg: 'bg-slate-900/90',
      valueColor: 'text-slate-100',
      iconBg: 'bg-slate-800 text-slate-400',
    },
    success: {
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      bg: 'bg-slate-900/90',
      valueColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    },
    warning: {
      border: 'border-amber-500/40 hover:border-amber-500/60',
      bg: 'bg-slate-900/90',
      valueColor: 'text-amber-400',
      iconBg: 'bg-amber-950/80 text-amber-400 border border-amber-500/30',
    },
    critical: {
      border: 'border-rose-500/40 hover:border-rose-500/60',
      bg: 'bg-slate-900/90',
      valueColor: 'text-rose-400',
      iconBg: 'bg-rose-950/80 text-rose-400 border border-rose-500/30',
    },
    highlight: {
      border: 'border-blue-500/40 hover:border-blue-500/60',
      bg: 'bg-slate-900/90',
      valueColor: 'text-blue-400',
      iconBg: 'bg-blue-950/80 text-blue-400 border border-blue-500/30',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-4 transition-all shadow-sm flex flex-col justify-between ${variantStyles.border} ${variantStyles.bg} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 truncate">
          {label}
        </span>
        <div className={`p-2 rounded-md shrink-0 ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${variantStyles.valueColor}`}>
            {value}
          </span>
          {subValue && (
            <span className="text-xs font-mono text-slate-400">
              {subValue}
            </span>
          )}
        </div>

        {badgeText && (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
