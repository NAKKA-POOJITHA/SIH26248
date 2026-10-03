import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { formatClockTime } from '../../utils/formatters';
import { 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { DecisionGate } from '../../types/simulation';

export const DecisionsView: React.FC = () => {
  const { decisions, setSelectedDecisionForProvenance, setActiveView } = useSimulation();

  const resolved = decisions.filter(d => d.status === 'RESOLVED');
  const pending = decisions.filter(d => d.status === 'PENDING');

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <MetricCard
          label="Total Decision Gates"
          value={decisions.length}
          subValue="EXERCISE MILESTONES"
          icon={HelpCircle}
          variant="default"
        />
        <MetricCard
          label="Resolved Decisions"
          value={resolved.length}
          subValue="PROVENANCE RECORDED"
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          label="Pending Responses"
          value={pending.length}
          subValue={pending.length > 0 ? "AWAITING TRAINEE" : "ALL SUBMITTED"}
          icon={Clock}
          variant={pending.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Decision Provenance Flow Explanation Banner */}
      <div className="command-card p-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              DECISION PROVENANCE ARCHITECTURE
            </span>
            <p className="text-xs text-slate-300">
              Every trainee choice is preserved with an immutable snapshot: What was known, what network faults existed, what rationale was chosen, and how it compared to objective ground truth.
            </p>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800 shrink-0">
            <span className="text-blue-400">INFO AVAILABLE</span>
            <span className="text-slate-500">➔</span>
            <span className="text-amber-400">COMMS FAULT</span>
            <span className="text-slate-500">➔</span>
            <span className="text-indigo-400">DECISION</span>
            <span className="text-slate-500">➔</span>
            <span className="text-emerald-400">RATIONALE</span>
          </div>
        </div>
      </div>

      {/* Decisions Registry Table */}
      <div className="command-card overflow-hidden">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Decisions Registry & Provenance Audit
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">TABLE VIEW</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="p-3 font-semibold">Time</th>
                <th className="p-3 font-semibold">Participant / Station</th>
                <th className="p-3 font-semibold min-w-[200px]">Decision Gate & Situation</th>
                <th className="p-3 font-semibold min-w-[200px]">Chosen Action & Rationale</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Audit Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {decisions.map((dec) => {
                const isResolved = dec.status === 'RESOLVED';
                const chosenOpt = dec.options.find(o => o.id === dec.resolvedOptionId);

                return (
                  <tr key={dec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-300">
                      {formatClockTime(dec.resolvedTimeSec || dec.scenarioTimeSec)}
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-slate-200 block">{dec.targetRole}</span>
                      <span className="text-[10px] font-mono text-slate-400">GATE: {dec.id}</span>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-100">{dec.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{dec.situation}</div>
                    </td>

                    <td className="p-3">
                      {isResolved ? (
                        <div>
                          <span className="font-semibold text-emerald-300 block">
                            {chosenOpt?.label || 'Action Selected'}
                          </span>
                          <span className="text-[11px] text-slate-400 italic line-clamp-1">
                            &ldquo;{dec.rationale}&rdquo;
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-mono text-[11px]">
                          Pending participant submission...
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <StatusBadge status={dec.status} size="sm" />
                    </td>

                    <td className="p-3 text-right">
                      {isResolved ? (
                        <button
                          onClick={() => setSelectedDecisionForProvenance(dec)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-semibold font-mono text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Provenance</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveView('trainee-console')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-semibold font-mono text-[11px] transition-colors"
                        >
                          <span>Respond Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
