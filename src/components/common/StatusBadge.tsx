import React from 'react';
import { MessageStatus } from '../../types/simulation';
import { CheckCircle2, Clock, XCircle, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

interface StatusBadgeProps {
  status: MessageStatus | 'SAFE' | 'WARNING' | 'CRITICAL' | 'DECISION' | 'PENDING' | 'RESOLVED' | 'LIVE' | 'PAUSED' | 'INFO' | string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labelOverride?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
  size = 'md',
  labelOverride,
}) => {
  const norm = status?.toUpperCase() || 'INFO';

  let bg = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dot = 'bg-slate-400';
  let IconComponent = Activity;
  let label = labelOverride || norm;

  switch (norm) {
    case 'DELIVERED':
    case 'SUCCESS':
    case 'RESOLVED':
    case 'SAFE':
      bg = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      dot = 'bg-emerald-400';
      IconComponent = CheckCircle2;
      label = labelOverride || 'DELIVERED';
      break;

    case 'DELAYED':
    case 'WARNING':
    case 'PENDING':
      bg = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      dot = 'bg-amber-400';
      IconComponent = Clock;
      label = labelOverride || 'DELAYED';
      break;

    case 'DROPPED':
    case 'CRITICAL':
      bg = 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      dot = 'bg-rose-400';
      IconComponent = XCircle;
      label = labelOverride || 'DROPPED';
      break;

    case 'CONFLICT':
      bg = 'bg-orange-950/60 text-orange-300 border-orange-500/50';
      dot = 'bg-orange-400';
      IconComponent = AlertTriangle;
      label = labelOverride || 'CONFLICT';
      break;

    case 'DECISION':
      bg = 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40';
      dot = 'bg-indigo-400';
      IconComponent = HelpCircle;
      label = labelOverride || 'DECISION REQUIRED';
      break;

    case 'LIVE':
      bg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60';
      dot = 'bg-emerald-400 animate-pulse';
      IconComponent = Activity;
      label = labelOverride || 'LIVE';
      break;

    case 'PAUSED':
      bg = 'bg-slate-800 text-slate-300 border-slate-600';
      dot = 'bg-slate-400';
      IconComponent = Clock;
      label = labelOverride || 'PAUSED';
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wider uppercase border rounded ${bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
