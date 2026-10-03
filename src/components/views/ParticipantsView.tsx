import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { InformationStatusPanel } from '../common/InformationStatusPanel';
import { 
  Users, 
  Wifi, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Radio, 
  MessageSquare
} from 'lucide-react';
import { ParticipantRole } from '../../types/simulation';

export const ParticipantsView: React.FC = () => {
  const { participants, activeFaults, messages, divergenceScore, injectFault, setActiveRole, setActiveView } = useSimulation();

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <MetricCard
          label="Total Active Stations"
          value={`${participants.filter(p => p.isOnline).length} / ${participants.length}`}
          subValue="CONNECTED"
          icon={Users}
          variant="success"
        />
        <MetricCard
          label="Active Fault Injections"
          value={activeFaults.length}
          subValue="DEGRADATION ACTIVE"
          icon={Zap}
          variant={activeFaults.length > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Mean Situational Divergence"
          value={`${divergenceScore}%`}
          subValue="GAP TO GROUND TRUTH"
          icon={Activity}
          variant={divergenceScore > 50 ? "critical" : "warning"}
        />
      </div>

      {/* Participants Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {participants.map((p) => {
          const activeRoleFaults = activeFaults.filter(f => f.active && (f.targetRole === 'ALL' || f.targetRole === p.id));
          const receivedCount = messages.filter(m => m.targetRole === 'ALL' || m.targetRole === p.id).length;
          const droppedCount = messages.filter(m => m.status === 'DROPPED' && (m.targetRole === 'ALL' || m.targetRole === p.id)).length;

          return (
            <div
              key={p.id}
              className="command-card p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${p.avatarColor} ring-2 ring-slate-800 shrink-0`} />
                    <span className="font-mono text-xs font-bold text-slate-200 uppercase truncate">
                      {p.callsign}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mb-0.5">{p.name}</h4>
                <p className="text-xs text-slate-400 mb-3">{p.roleTitle}</p>

                {/* Status Stats */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Assigned Post:</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[130px]">{p.assignedZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Link Latency:</span>
                    <span className="text-slate-300">{p.pingMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Received Intel:</span>
                    <span className="text-slate-200 font-bold">{receivedCount} Reports</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Divergence Index:</span>
                    <span className={`font-bold ${p.divergenceScore > 50 ? 'text-rose-400' : p.divergenceScore > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {p.divergenceScore}%
                    </span>
                  </div>
                </div>

                {/* Channel Degradation Warning */}
                {activeRoleFaults.length > 0 && (
                  <div className="mt-2.5 p-2 bg-amber-950/60 border border-amber-500/40 rounded text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="truncate">Active Fault: {activeRoleFaults[0].type}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveRole(p.id);
                    setActiveView('trainee-console');
                  }}
                  className="py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded text-center text-xs font-mono font-semibold transition-colors"
                >
                  Assume Role
                </button>
                <button
                  onClick={() => injectFault('DELAY', p.id, 'VHF-TACTICAL-1', 120, 45, `Targeted latency (+45s) on ${p.callsign}`)}
                  className="py-1.5 px-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded text-center text-xs font-mono font-semibold transition-colors"
                >
                  Inject Fault
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Status Matrix */}
      <InformationStatusPanel
        title="PARTICIPANT INFORMATION STATUS MATRIX"
        subtitle="Direct comparative map of all participants against objective ground truth."
      />
    </div>
  );
};
