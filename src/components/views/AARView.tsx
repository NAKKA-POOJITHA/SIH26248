import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { InformationStatusPanel } from '../common/InformationStatusPanel';
import { formatSimTime, formatClockTime } from '../../utils/formatters';
import { 
  FileBarChart2, 
  Clock, 
  Users, 
  Zap, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const AARView: React.FC = () => {
  const {
    activeScenario,
    simTimeSec,
    participants,
    messages,
    decisions,
    activeFaults,
    events,
    getAARSummary,
    setSelectedDecisionForProvenance,
    setIsExportModalOpen,
  } = useSimulation();

  const aar = getAARSummary();

  const totalComms = aar.communicationStats.deliveredCount + 
                     aar.communicationStats.delayedCount + 
                     aar.communicationStats.droppedCount + 
                     aar.communicationStats.conflictCount || 1;

  const deliveredPct = Math.round((aar.communicationStats.deliveredCount / totalComms) * 100);
  const delayedPct = Math.round((aar.communicationStats.delayedCount / totalComms) * 100);
  const droppedPct = Math.round((aar.communicationStats.droppedCount / totalComms) * 100);
  const conflictPct = Math.round((aar.communicationStats.conflictCount / totalComms) * 100);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                AFTER-ACTION REVIEW (AAR)
              </h2>
              <span className="text-[11px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                EVALUATION REPORT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Scenario: <strong className="text-slate-200">{aar.scenarioName}</strong> ({aar.exerciseId})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export AAR Report</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. EXECUTIVE SUMMARY (4 Primary Cards)                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Exercise Elapsed"
          value={formatSimTime(aar.totalDurationSec)}
          subValue={formatClockTime(aar.totalDurationSec)}
          icon={Clock}
          variant="highlight"
        />
        <MetricCard
          label="Active Participants"
          value={aar.participantsCount}
          subValue="ROLES EVALUATED"
          icon={Users}
          variant="default"
        />
        <MetricCard
          label="Communication Faults"
          value={aar.totalFaultsInjected}
          subValue="DELAY / DROP / CONFLICT"
          icon={Zap}
          variant="warning"
        />
        <MetricCard
          label="Team Resilience Score"
          value={`${aar.teamPerformanceScore}%`}
          subValue="OVERALL RATING: A-"
          icon={Award}
          variant="success"
        />
      </div>

      {/* ========================================================= */}
      {/* 2. WHAT HAPPENED? — Visual Timeline of Events             */}
      {/* ========================================================= */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              WHAT HAPPENED? — Chronological Incident Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">GROUND TRUTH VS TRAINEE ACTIONS</span>
        </div>

        <div className="p-4">
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4">
            {events.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-slate-950 ${
                  evt.type === 'FAULT_INJECTED'
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : evt.type === 'DECISION_SUBMITTED'
                    ? 'border-indigo-400 ring-2 ring-indigo-400/20'
                    : evt.type === 'COMM_RESTORED'
                    ? 'border-emerald-400'
                    : 'border-blue-400'
                }`} />

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-400 text-[11px]">{formatClockTime(evt.simTimeSec)}</span>
                      <span className="font-semibold text-slate-100">{evt.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{evt.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Origin: <span className="text-slate-300">{evt.actor}</span>
                      {evt.target && <> ➔ <span className="text-slate-300">{evt.target}</span></>}
                    </div>
                  </div>

                  {evt.statusTag && (
                    <StatusBadge status={evt.statusTag} size="sm" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. WHAT DID EACH PARTICIPANT KNOW? (Comparative Status)   */}
      {/* ========================================================= */}
      <InformationStatusPanel
        title="WHAT DID EACH PARTICIPANT KNOW? — Perception Divergence"
        subtitle="Comparing actual ground truth vs individual participant situational awareness."
      />

      {/* ========================================================= */}
      {/* 4. HOW DID THEY DECIDE? — Decision Provenance Matrix       */}
      {/* ========================================================= */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              HOW DID THEY DECIDE? — Provenance & Rationale Review
            </h3>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold">CAUSALITY AUDIT</span>
        </div>

        <div className="p-4 space-y-3">
          {decisions.map((dec) => {
            const isResolved = dec.status === 'RESOLVED';
            const chosenOpt = isResolved ? dec.options.find(o => o.id === dec.resolvedOptionId) : null;

            return (
              <div
                key={dec.id}
                className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 hover:border-indigo-500/40 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-indigo-400 text-xs">GATE {dec.id}: {dec.title}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300 font-semibold">{dec.targetRole}</span>
                  </div>
                  <StatusBadge status={dec.status} size="sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2.5">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                      1. Available Information:
                    </span>
                    <span className="text-slate-300 block">
                      {dec.contextReports.join(', ')} (With active latency & contradictory camera telemetry)
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                      2. Selected Action:
                    </span>
                    <span className="text-emerald-300 font-semibold block">
                      {chosenOpt?.label || 'Action Recorded'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                      3. Stated Rationale:
                    </span>
                    <span className="text-slate-300 italic block">
                      &ldquo;{dec.rationale || 'Prioritized route verification.'}&rdquo;
                    </span>
                  </div>
                </div>

                {isResolved && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">
                      Evaluator Verdict: <strong className="text-slate-200">{chosenOpt?.impactSummary}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedDecisionForProvenance(dec)}
                      className="text-indigo-400 hover:text-indigo-300 font-mono font-semibold flex items-center gap-1"
                    >
                      <span>Full Provenance Breakdown</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. COMMUNICATION IMPACT & 6. PERFORMANCE METRICS          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COMMUNICATION IMPACT */}
        <div className="command-card">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                COMMUNICATION IMPACT BREAKDOWN
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">CHANNEL HEALTH</span>
          </div>

          <div className="p-4 space-y-4 text-xs">
            {/* Multi-segment distribution bar */}
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                <span className="text-slate-400 font-semibold uppercase text-[11px]">Message Delivery Integrity</span>
                <span className="text-slate-200 font-bold">{totalComms} TOTAL DISPATCHES</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${deliveredPct}%` }} className="bg-emerald-500" title={`Delivered: ${deliveredPct}%`} />
                <div style={{ width: `${delayedPct}%` }} className="bg-amber-500" title={`Delayed: ${delayedPct}%`} />
                <div style={{ width: `${droppedPct}%` }} className="bg-rose-500" title={`Dropped: ${droppedPct}%`} />
                <div style={{ width: `${conflictPct}%` }} className="bg-orange-500" title={`Conflicting: ${conflictPct}%`} />
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 bg-emerald-950/40 rounded border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase block font-semibold">Delivered</span>
                <span className="text-lg font-bold text-emerald-300">{aar.communicationStats.deliveredCount}</span>
                <span className="text-[10px] text-slate-400 block">({deliveredPct}%)</span>
              </div>
              <div className="p-2.5 bg-amber-950/40 rounded border border-amber-500/30">
                <span className="text-[10px] text-amber-400 uppercase block font-semibold">Delayed</span>
                <span className="text-lg font-bold text-amber-300">{aar.communicationStats.delayedCount}</span>
                <span className="text-[10px] text-slate-400 block">({delayedPct}%)</span>
              </div>
              <div className="p-2.5 bg-rose-950/40 rounded border border-rose-500/30">
                <span className="text-[10px] text-rose-400 uppercase block font-semibold">Dropped</span>
                <span className="text-lg font-bold text-rose-300">{aar.communicationStats.droppedCount}</span>
                <span className="text-[10px] text-slate-400 block">({droppedPct}%)</span>
              </div>
              <div className="p-2.5 bg-orange-950/40 rounded border border-orange-500/30">
                <span className="text-[10px] text-orange-400 uppercase block font-semibold">Conflict</span>
                <span className="text-lg font-bold text-orange-300">{aar.communicationStats.conflictCount}</span>
                <span className="text-[10px] text-slate-400 block">({conflictPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE METRICS & KEY TAKEAWAYS */}
        <div className="command-card">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                PERFORMANCE METRICS & LESSONS LEARNED
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">EVALUATOR DEBRIEF</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                Key After-Action Findings:
              </span>
              {aar.keyTakeaways.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  <span className="font-mono text-blue-400 font-bold">{idx + 1}.</span>
                  <span className="text-slate-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
