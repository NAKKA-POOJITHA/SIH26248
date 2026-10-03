import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatClockTime } from '../../utils/formatters';
import { 
  X, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Layers, 
  Radio, 
  ShieldCheck,
  Award
} from 'lucide-react';

export const DecisionProvenanceModal: React.FC = () => {
  const { selectedDecisionForProvenance, setSelectedDecisionForProvenance } = useSimulation();

  if (!selectedDecisionForProvenance) return null;

  const dec = selectedDecisionForProvenance;
  const chosenOption = dec.options.find((o) => o.id === dec.resolvedOptionId);
  const prov = dec.provenanceData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  DECISION PROVENANCE AUDIT
                </h3>
                <span className="text-[11px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded">
                  GATE: {dec.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full chronological causality reconstruction: What intelligence existed when the decision was made.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDecisionForProvenance(null)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content: 4-STEP VISUAL PROVENANCE SEQUENCE */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Situation Context */}
          <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
              Decision Gate Context & Dilemma:
            </span>
            <p className="text-xs font-semibold text-slate-200">{dec.situation}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>Decision Maker: <strong className="text-slate-200">{dec.targetRole}</strong></span>
              <span>Trigger Time: <strong className="text-slate-200">{formatClockTime(dec.scenarioTimeSec)}</strong></span>
              {dec.resolvedTimeSec && (
                <span>Executed Time: <strong className="text-emerald-400">{formatClockTime(dec.resolvedTimeSec)}</strong></span>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* STEP 1: AVAILABLE INFORMATION                             */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                1. AVAILABLE INFORMATION AT DECISION TIME
              </span>
              <span className="text-[10px] font-mono text-slate-500">TRAINEE INTEL SNAPSHOT</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {prov?.availableReports ? (
                prov.availableReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 text-[11px]">{rep.id}:</span>
                      <span className="text-slate-200">{rep.title}</span>
                    </div>
                    <StatusBadge status={rep.status} size="sm" />
                  </div>
                ))
              ) : (
                <div className="text-slate-400">Historical reports: MSG-101, MSG-102, MSG-103</div>
              )}
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5 text-indigo-400" />
          </div>

          {/* ========================================================= */}
          {/* STEP 2: COMMUNICATION CONDITION                           */}
          {/* ========================================================= */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                2. COMMUNICATION CONDITION & DEGRADATION
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                ACTIVE NETWORK FAULTS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
              <div className="p-2 bg-slate-950/80 rounded border border-amber-500/20">
                <span className="text-[10px] text-slate-400 uppercase block">Delayed Messages</span>
                <span className="text-base font-bold text-amber-400">
                  {prov?.communicationCondition.delayedCount ?? 1}
                </span>
              </div>
              <div className="p-2 bg-slate-950/80 rounded border border-rose-500/20">
                <span className="text-[10px] text-slate-400 uppercase block">Dropped Alerts</span>
                <span className="text-base font-bold text-rose-400">
                  {prov?.communicationCondition.droppedCount ?? 0}
                </span>
              </div>
              <div className="p-2 bg-slate-950/80 rounded border border-orange-500/20">
                <span className="text-[10px] text-slate-400 uppercase block">Conflicting Telemetry</span>
                <span className="text-base font-bold text-orange-400">
                  {prov?.communicationCondition.conflictCount ?? 1}
                </span>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5 text-indigo-400" />
          </div>

          {/* ========================================================= */}
          {/* STEP 3: DECISION TAKEN                                    */}
          {/* ========================================================= */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                3. DECISION TAKEN
              </span>
              <span className="text-[10px] font-mono text-indigo-400">OPERATIONAL SELECTION</span>
            </div>

            <div className="p-3 bg-slate-950/90 rounded border border-indigo-900/50">
              <h4 className="text-sm font-bold text-white mb-1">
                &ldquo;{prov?.submittedOptionText || chosenOption?.label || 'Action Recorded'}&rdquo;
              </h4>
              <p className="text-slate-400 text-xs">
                {chosenOption?.description}
              </p>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5 text-indigo-400" />
          </div>

          {/* ========================================================= */}
          {/* STEP 4: RATIONALE & EVALUATOR VERDICT                     */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                4. RATIONALE & OUTCOME EVALUATION
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                SCORE: {chosenOption?.scoreBonus ?? 88} / 100
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5 font-bold">
                  Trainee Stated Rationale:
                </span>
                <p className="text-slate-200 italic font-medium">
                  &ldquo;{dec.rationale || 'Reports disagree, so verification was prioritized before changing the response plan.'}&rdquo;
                </p>
              </div>

              <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-500/30 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-0.5 font-bold">
                  Evaluator Ground Truth Assessment:
                </span>
                <p className="text-slate-300">
                  {chosenOption?.impactSummary || 'Optimal response under degraded communication.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setSelectedDecisionForProvenance(null)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded transition-colors"
          >
            Close Provenance Audit
          </button>
        </div>
      </div>
    </div>
  );
};
