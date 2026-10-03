import React from 'react';
import { SimulationMessage } from '../../types/simulation';
import { StatusBadge } from './StatusBadge';
import { formatClockTime } from '../../utils/formatters';
import { Check, AlertOctagon, Radio } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface MessageCardProps {
  message: SimulationMessage;
  isCompact?: boolean;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, isCompact = false }) => {
  const { activeRole, acknowledgeMessage } = useSimulation();

  const isAcked = message.acknowledgedBy.includes(activeRole);
  const genTimeFormatted = formatClockTime(message.generatedSimTime);
  const recTimeFormatted = message.deliveredSimTime !== undefined 
    ? formatClockTime(message.deliveredSimTime) 
    : 'PENDING QUEUE';

  // Priority color tag
  const priorityBadgeColor = {
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    ROUTINE: 'bg-slate-700/30 text-slate-300 border-slate-600',
  }[message.priority] || 'bg-slate-700/30 text-slate-300';

  // Container border styling based on status
  const statusBorderClass = {
    DELIVERED: 'border-slate-800 hover:border-slate-700 bg-slate-900/90',
    DELAYED: 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50',
    DROPPED: 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50 opacity-75',
    CONFLICT: 'border-orange-500/40 bg-orange-950/25 hover:border-orange-500/60 ring-1 ring-orange-500/30',
  }[message.status];

  return (
    <div className={`rounded-lg border p-3.5 transition-all shadow-sm ${statusBorderClass}`}>
      {/* Top row: Domain, Priority, and Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {message.domain}
          </span>
          <span className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadgeColor}`}>
            {message.priority}
          </span>
          {message.isContradictory && (
            <span className="font-mono text-[10px] font-bold text-orange-300 bg-orange-900/60 border border-orange-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              CONTRADICTS SCOUT
            </span>
          )}
        </div>

        <StatusBadge status={message.status} size="sm" />
      </div>

      {/* Message Title & Quote Body */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          {message.title}
        </h4>
        <p className="text-sm text-slate-300 bg-slate-950/70 p-2.5 rounded border border-slate-800/80 italic font-normal leading-relaxed">
          &ldquo;{message.content}&rdquo;
        </p>
      </div>

      {/* Structured Timestamp Metadata & Latency Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-950/50 p-2 rounded border border-slate-800/60 mb-2.5">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Generated</span>
          <span className="text-slate-200 font-bold">{genTimeFormatted}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Received</span>
          <span className={message.deliveryDelaySec > 0 ? 'text-amber-400 font-bold' : 'text-slate-200 font-bold'}>
            {recTimeFormatted}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Latency Delay</span>
          <span className={`font-bold ${message.deliveryDelaySec > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {message.deliveryDelaySec > 0 ? `+${message.deliveryDelaySec}s lag` : 'Nominal (0s)'}
          </span>
        </div>
      </div>

      {/* Author and Action footer */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        <span className="text-slate-400 font-mono text-[11px]">
          Source: <span className="text-slate-200 font-medium">{message.author}</span>
        </span>

        {!isCompact && (
          <button
            onClick={() => acknowledgeMessage(message.id)}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              isAcked
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
            }`}
          >
            <Check className="w-3 h-3" />
            {isAcked ? 'Acknowledged' : 'Acknowledge'}
          </button>
        )}
      </div>
    </div>
  );
};
