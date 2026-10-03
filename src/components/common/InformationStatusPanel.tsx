import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ParticipantRole } from '../../types/simulation';
import { Check, Clock, X, AlertTriangle, Eye, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface InformationStatusPanelProps {
  title?: string;
  subtitle?: string;
  detailed?: boolean;
}

export const InformationStatusPanel: React.FC<InformationStatusPanelProps> = ({
  title = 'INFORMATION STATUS MATRIX',
  subtitle = 'Visualizing situational divergence: What each role actually knows vs ground truth reality.',
  detailed = true,
}) => {
  const { participants, messages, activeFaults, divergenceScore } = useSimulation();

  // Helper to get a participant's knowledge status for a specific report
  const getReportKnowledgeStatus = (msgId: string, role: ParticipantRole) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return { status: 'NOT_YET', icon: Clock, label: 'NOT YET AVAILABLE', color: 'text-slate-500 bg-slate-900/40 border-slate-800' };

    // Check if message was targeted to this role or ALL
    const isTarget = msg.targetRole === 'ALL' || msg.targetRole === role;

    if (msg.status === 'DROPPED' && isTarget) {
      return { status: 'DROPPED', icon: X, label: 'DROPPED', color: 'text-rose-400 bg-rose-950/40 border-rose-500/40' };
    }

    if (msg.status === 'CONFLICT' && isTarget) {
      return { status: 'CONFLICT', icon: AlertTriangle, label: 'CONFLICTING', color: 'text-orange-400 bg-orange-950/40 border-orange-500/40' };
    }

    if (msg.status === 'DELAYED' && isTarget) {
      return { status: 'DELAYED', icon: Clock, label: 'DELAYED', color: 'text-amber-400 bg-amber-950/40 border-amber-500/40' };
    }

    if (msg.status === 'DELIVERED' || isTarget) {
      return { status: 'AVAILABLE', icon: Check, label: 'AVAILABLE', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' };
    }

    return { status: 'NOT_YET', icon: Clock, label: 'NOT YET AVAILABLE', color: 'text-slate-500 bg-slate-900/40 border-slate-800' };
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="command-panel-header bg-slate-950/80 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-950 border border-blue-800/60 text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-normal">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono font-semibold">
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            <Check className="w-3 h-3" /> AVAILABLE
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            <Clock className="w-3 h-3" /> DELAYED
          </span>
          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
            <X className="w-3 h-3" /> DROPPED
          </span>
          <span className="inline-flex items-center gap-1 text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/30">
            <AlertTriangle className="w-3 h-3" /> CONFLICTING
          </span>
        </div>
      </div>

      {/* Comparative Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800/90 text-[11px] font-mono uppercase text-slate-400">
              <th className="p-3 font-semibold min-w-[160px]">Participant / Role</th>
              <th className="p-3 font-semibold min-w-[80px]">Station Link</th>
              {messages.map((msg) => (
                <th key={msg.id} className="p-3 font-semibold min-w-[150px]">
                  <div className="text-slate-200">{msg.id}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">{msg.title}</div>
                </th>
              ))}
              <th className="p-3 font-semibold min-w-[100px] text-right">Divergence Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {/* Ground Truth Row (Reference) */}
            <tr className="bg-blue-950/20 border-b border-blue-900/30 font-medium">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div>
                    <span className="font-bold text-blue-300 font-mono">GROUND TRUTH (ACTUAL REALITY)</span>
                    <span className="block text-[10px] text-slate-400">Objective System State</span>
                  </div>
                </div>
              </td>
              <td className="p-3 font-mono text-emerald-400 text-[11px]">MASTER LINK</td>
              {messages.map((msg) => (
                <td key={msg.id} className="p-3">
                  <div className="inline-flex items-center gap-1 text-emerald-300 font-mono font-bold text-[11px] bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/40">
                    <Check className="w-3 h-3 text-emerald-400" /> TRUE STATE
                  </div>
                </td>
              ))}
              <td className="p-3 text-right font-mono font-bold text-blue-400">
                0% (BASELINE)
              </td>
            </tr>

            {/* Trainee Participants */}
            {participants.map((p) => {
              const activeFault = activeFaults.find(f => f.active && (f.targetRole === 'ALL' || f.targetRole === p.id));

              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${p.avatarColor} shrink-0`} />
                      <div>
                        <span className="font-semibold text-slate-200 block">{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{p.roleTitle} ({p.callsign})</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    {activeFault ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <AlertTriangle className="w-2.5 h-2.5" /> {activeFault.type}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> NOMINAL
                      </span>
                    )}
                  </td>

                  {/* Knowledge state for each message */}
                  {messages.map((msg) => {
                    const know = getReportKnowledgeStatus(msg.id, p.id);
                    const KnowIcon = know.icon;

                    return (
                      <td key={msg.id} className="p-3">
                        <div className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2 py-1 rounded border ${know.color}`}>
                          <KnowIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{know.label}</span>
                        </div>
                      </td>
                    );
                  })}

                  {/* Divergence Index */}
                  <td className="p-3 text-right">
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                      p.divergenceScore > 50
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                        : p.divergenceScore > 25
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {p.divergenceScore}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailed && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Evaluator Insight:</strong> Incident Coordinator is making evacuation decisions based on contradictory sensor telemetry while Field Unit Alpha is blocked by physical bridge collapse.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 shrink-0">
            Current Divergence Index: <strong className="text-orange-400 font-bold">{divergenceScore}%</strong>
          </span>
        </div>
      )}
    </div>
  );
};
