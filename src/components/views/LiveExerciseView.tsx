import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { InformationStatusPanel } from '../common/InformationStatusPanel';
import { formatSimTime, formatClockTime } from '../../utils/formatters';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Radio, 
  Activity, 
  Users, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Trash2,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { FaultType, ParticipantRole } from '../../types/simulation';

export const LiveExerciseView: React.FC = () => {
  const {
    activeScenario,
    isRunning,
    simTimeSec,
    participants,
    messages,
    activeFaults,
    decisions,
    events,
    divergenceScore,
    startExercise,
    pauseExercise,
    resetExercise,
    injectFault,
    removeFault,
    injectQuickMessage,
    setSelectedDecisionForProvenance,
    setIsInjectFaultModalOpen,
  } = useSimulation();

  // Target role for inline fault buttons
  const [selectedTargetRole, setSelectedTargetRole] = useState<ParticipantRole | 'ALL'>('COORDINATOR');
  const [selectedChannel, setSelectedChannel] = useState<string>('VHF-TACTICAL-1');
  const [delaySecInput, setDelaySecInput] = useState<number>(45);

  const onlineParticipantsCount = participants.filter((p) => p.isOnline).length;
  const pendingDecisions = decisions.filter((d) => d.status === 'PENDING');
  const resolvedDecisions = decisions.filter((d) => d.status === 'RESOLVED');

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Top Section: Executive Exercise Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Exercise Status"
          value={isRunning ? "LIVE" : "PAUSED"}
          subValue={formatSimTime(simTimeSec)}
          icon={Activity}
          variant={isRunning ? "success" : "default"}
          badgeText={activeScenario.codename}
        />
        <MetricCard
          label="Elapsed Time"
          value={formatSimTime(simTimeSec)}
          subValue={formatClockTime(simTimeSec)}
          icon={Clock}
          variant="highlight"
        />
        <MetricCard
          label="Active Participants"
          value={`${onlineParticipantsCount} / ${participants.length}`}
          subValue="STATIONS ONLINE"
          icon={Users}
          variant="default"
        />
        <MetricCard
          label="Divergence Index"
          value={`${divergenceScore}%`}
          subValue="AWARENESS GAP"
          icon={TrendingUp}
          variant={divergenceScore > 50 ? "critical" : divergenceScore > 25 ? "warning" : "success"}
        />
      </div>

      {/* ========================================================= */}
      {/* 8. DEDICATED UNMISTAKABLE FAULT CONTROLS SECTION          */}
      {/* ========================================================= */}
      <div className="command-card border-rose-500/30 bg-slate-900/95 overflow-hidden">
        <div className="command-panel-header bg-slate-950/90 border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-rose-950 border border-rose-800/60 text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-100 tracking-wider">
                COMMUNICATION FAULT CONTROLS
              </h3>
              <p className="text-[11px] text-slate-400">
                Directly inject synthetic network degradation to test participant resilience & awareness.
              </p>
            </div>
          </div>

          {/* Target Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 uppercase font-semibold text-[11px]">Inject Target:</span>
            <select
              value={selectedTargetRole}
              onChange={(e) => setSelectedTargetRole(e.target.value as ParticipantRole | 'ALL')}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="COORDINATOR">Incident Coordinator</option>
              <option value="OPERATIONS_LEAD">Operations Lead</option>
              <option value="LOGISTICS_CHIEF">Logistics Director</option>
              <option value="FIELD_UNIT_ALPHA">Forward Tactical Alpha</option>
              <option value="ALL">ALL PARTICIPANTS (BROADCAST)</option>
            </select>
          </div>
        </div>

        {/* 3 Prominent Dedicated Fault Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. DELAY CARD */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-amber-500/70 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-amber-950/80 text-amber-400 border border-amber-500/30">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="font-mono font-bold text-sm uppercase text-amber-300">DELAY</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                  +45s LAG
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Deliver selected message later. Simulates satellite latency, repeater backpressure, and radio queue backlog.
              </p>
            </div>

            <button
              onClick={() => injectFault('DELAY', selectedTargetRole, selectedChannel, 180, 45, `Storm induced latency (+45s) on ${selectedChannel}`)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject Delay</span>
            </button>
          </div>

          {/* 2. DROPOUT CARD */}
          <div className="bg-slate-950/80 border border-rose-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-rose-500/70 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-rose-950/80 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="font-mono font-bold text-sm uppercase text-rose-300">DROPOUT</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 font-semibold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                  BLACKOUT
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Prevent selected participant from receiving message. Simulates severed fiber links, antenna loss, and total packet drop.
              </p>
            </div>

            <button
              onClick={() => injectFault('DROPOUT', selectedTargetRole, selectedChannel, 240, 0, `Cell tower blackout dropping traffic on ${selectedChannel}`)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Inject Drop</span>
            </button>
          </div>

          {/* 3. CONFLICT CARD */}
          <div className="bg-slate-950/80 border border-orange-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-orange-500/70 transition-all group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-orange-950/80 text-orange-400 border border-orange-500/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="font-mono font-bold text-sm uppercase text-orange-300">CONFLICT</span>
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-semibold bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/30">
                  CONTRADICTORY
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Send contradictory fictional reports. Simulates stale cached sensor data, misinformation, or corrupted telemetry.
              </p>
            </div>

            <button
              onClick={() => {
                injectFault('CONFLICT', selectedTargetRole, selectedChannel, 180, 0, `Telemetry desync sending contradictory status on ${selectedChannel}`);
                injectQuickMessage('LAND', 'HIGH', 'Sensor Discrepancy: Sector Road Operational', 'Municipal telemetry indicates road open despite field warnings.', selectedTargetRole, 'CONFLICT');
              }}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inject Conflict</span>
            </button>
          </div>
        </div>

        {/* Currently Active Faults List */}
        {activeFaults.length > 0 && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800">
            <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
              <span>Currently Active Fault Injections ({activeFaults.length})</span>
              <span className="text-amber-400 text-[11px]">ACTIVE IMPACT</span>
            </div>
            <div className="space-y-2">
              {activeFaults.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={f.type === 'DELAY' ? 'DELAYED' : f.type === 'DROPOUT' ? 'DROPPED' : 'CONFLICT'} size="sm" />
                    <div>
                      <span className="font-bold text-slate-200">{f.id}</span>: <span className="text-slate-300">{f.description}</span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        Target: <strong className="text-slate-200">{f.targetRole}</strong> | Channel: {f.channel} | Elapsed: {Math.max(0, simTimeSec - f.injectedAtSimTime)}s
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFault(f.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                    title="Clear Fault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 9. INFORMATION STATUS MATRIX                              */}
      {/* ========================================================= */}
      <InformationStatusPanel />

      {/* Lower Dual Grid: Live Event Feed & Decision Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 10. LIVE EVENT FEED */}
        <div className="command-card">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                Live Event Feed ({events.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">CHRONOLOGICAL</span>
          </div>

          <div className="p-3 max-h-96 overflow-y-auto space-y-2">
            {events.slice().reverse().map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded text-xs flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {formatClockTime(evt.simTimeSec)}
                    </span>
                    <span className="font-semibold text-slate-200">{evt.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{evt.description}</p>
                  <div className="text-[10px] font-mono text-slate-500">
                    Actor: <span className="text-slate-300">{evt.actor}</span>
                    {evt.target && <> | Target: <span className="text-slate-300">{evt.target}</span></>}
                  </div>
                </div>

                {evt.statusTag && (
                  <StatusBadge status={evt.statusTag} size="sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DECISION MONITOR */}
        <div className="command-card">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                Decision Monitor ({decisions.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 font-semibold">
              {resolvedDecisions.length} / {decisions.length} EVALUATED
            </span>
          </div>

          <div className="p-3 max-h-96 overflow-y-auto space-y-2.5">
            {decisions.map((dec) => {
              const isResolved = dec.status === 'RESOLVED';
              const chosenOption = isResolved
                ? dec.options.find((o) => o.id === dec.resolvedOptionId)
                : null;

              return (
                <div
                  key={dec.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    isResolved
                      ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 cursor-pointer'
                      : 'bg-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-500/20'
                  }`}
                  onClick={() => isResolved && setSelectedDecisionForProvenance(dec)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-[11px] text-indigo-400">
                      GATE: {dec.id} ({dec.targetRole})
                    </span>
                    <StatusBadge status={dec.status} size="sm" />
                  </div>

                  <h4 className="font-semibold text-slate-200 mb-1">{dec.title}</h4>
                  <p className="text-[11px] text-slate-400 mb-2">{dec.situation}</p>

                  {isResolved ? (
                    <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[11px] space-y-1">
                      <div className="font-medium text-emerald-300">
                        ✓ Selected: {chosenOption?.label}
                      </div>
                      <div className="text-slate-400 italic">
                        &ldquo;{dec.rationale}&rdquo;
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-800">
                        <span>Resolved at {formatClockTime(dec.resolvedTimeSec || 0)}</span>
                        <span className="text-indigo-400 font-bold flex items-center gap-1">
                          View Provenance <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Awaiting trainee response...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
