import { MessageStatus } from '../types/simulation';

export function formatSimTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatClockTime(simSeconds: number, baseHour = 14, baseMin = 30): string {
  const totalSeconds = baseHour * 3600 + baseMin * 60 + simSeconds;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getStatusTheme(status: MessageStatus | string) {
  switch (status) {
    case 'DELIVERED':
    case 'SUCCESS':
    case 'SAFE':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'DELIVERED',
        icon: 'CheckCircle2',
      };
    case 'DELAYED':
    case 'WARNING':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'DELAYED',
        icon: 'Clock',
      };
    case 'DROPPED':
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'DROPPED',
        icon: 'XCircle',
      };
    case 'CONFLICT':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/35',
        dot: 'bg-orange-400',
        label: 'CONFLICT',
        icon: 'AlertTriangle',
      };
    case 'DECISION':
      return {
        bg: 'bg-indigo-500/15',
        text: 'text-indigo-400',
        border: 'border-indigo-500/35',
        dot: 'bg-indigo-400',
        label: 'DECISION',
        icon: 'HelpCircle',
      };
    default:
      return {
        bg: 'bg-slate-800/50',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
        label: status || 'NORMAL',
        icon: 'Info',
      };
  }
}
