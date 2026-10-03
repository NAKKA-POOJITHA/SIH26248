import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';
import { InformationStatusPanel } from '../common/InformationStatusPanel';
import { formatSimTime, formatClockTime } from '../../utils/formatters';
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight, 
  Radio, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  UserCheck,
  Zap,
  FileBarChart2,
  MonitorDot
} from 'lucide-react';

export const DashboardView: React.FC = () => {
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
    setActiveView,
    setIsInjectFaultModalOpen,
  } = useSimulation();

  const pendingDecisions = decisions.filter((d) => d.status === 'PENDING');
  const resolvedDecisions = decisions.filter((d) => d.status === 'RESOLVED');

  const delayedMsgsCount = messages.filter((m) => m.status === 'DELAYED').length;
  const droppedMsgsCount = messages.filter((m) => m.status === 'DROPPED').length;
  const conflictMsgsCount = messages.filter((m) => m.status === 'CONFLICT').length;

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* 4 PRIMARY METRIC CARDS (Clean, single-concept, high readability) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Incident Status"
          value="CRITICAL"
          subValue={activeScenario.codename}
          icon={ShieldAlert}
          variant="critical"
          badgeText="STAGE 2"
        />
        <MetricCard
          label="Comms Degradation"
          value={`${delayedMsgsCount + droppedMsgsCount + conflictMsgsCount}`}
          subValue={`${activeFaults.length} ACTIVE FAULTS`}
          icon={Radio}
          variant={activeFaults.length > 0 ? "warning" : "default"}
          badgeText={`${delayedMsgsCount}D / ${droppedMsgsCount}X / ${conflictMsgsCount}C`}
        />
        <MetricCard
          label="Divergence Index"
          value={`${divergenceScore}%`}
          subValue="AWARENESS GAP"
          icon={TrendingUp}
          variant={divergenceScore > 50 ? "critical" : divergenceScore > 25 ? "warning" : "success"}
          badgeText={divergenceScore > 50 ? "HIGH GAP" : "MODERATE"}
        />
        <MetricCard
          label="Decision Gates"
          value={`${resolvedDecisions.length} / ${decisions.length}`}
          subValue={pendingDecisions.length > 0 ? `${pendingDecisions.length} PENDING` : "ALL RESOLVED"}
          icon={HelpCircle}
          variant={pendingDecisions.length > 0 ? "highlight" : "success"}
          badgeText="PROVENANCE LOG"
        />
      </div>

      {/* WHAT IS HAPPENING & WHO IS AFFECTED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: What is happening */}
        <div className="lg:col-span-8 command-card">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                1. What is Happening? — Operational Situation
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">EXERCISE ACTIVE</span>
          </div>
          <div className="p-4 space-y-3.5 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <h4 className="font-bold text-sm text-slate-100 mb-1">{activeScenario.name}</h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                {activeScenario.description}
              </p>
            </div>

            {/* Affected Sectors */}
            <div>
              <div className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-2">
                2. Who & What is Affected? — Zone Status Breakdown
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeScenario.zones.map((zone) => (
                  <div key={zone.id} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-200 block text-xs">{zone.name}</span>
                      <span className="text-[11px] text-slate-400">{zone.notes}</span>
                    </div>
                    <StatusBadge status={zone.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="lg:col-span-4 command-card flex flex-col justify-between">
          <div className="command-panel-header">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
                4. What Action Can I Take?
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">COMMAND HUB</span>
          </div>

          <div className="p-3.5 space-y-2.5">
            <button
              onClick={() => setActiveView('trainee-console')}
              className="w-full p-3 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                  <MonitorDot className="w-3.5 h-3.5" />
                  Enter Trainee Console
                </div>
                <div className="text-[11px] text-slate-400">
                  {pendingDecisions.length > 0
                    ? `⚠ ${pendingDecisions.length} pending decision requires input`
                    : 'View operational 3-column feed'}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsInjectFaultModalOpen(true)}
              className="w-full p-3 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/40 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Inject Network Degradation
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulate Delay, Dropout, or Conflicting intel
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveView('decisions')}
              className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  Inspect Decision Provenance
                </div>
                <div className="text-[11px] text-slate-400">
                  Trace Info Available ➔ Condition ➔ Rationale
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setActiveView('aar')}
              className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                  <FileBarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                  Open After-Action Review (AAR)
                </div>
                <div className="text-[11px] text-slate-400">
                  Full comparative analytics & export
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. WHAT INFORMATION IS AVAILABLE? (INFORMATION STATUS MATRIX) */}
      <InformationStatusPanel
        title="3. What Information Is Available? — Perception vs Reality"
        subtitle="Live matrix of what each participant currently knows, showing delays, drops, and contradictions."
      />

      {/* 5. WHAT HAPPENED PREVIOUSLY? (CHRONOLOGICAL EVENT LOG) */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              5. What Happened Previously? — Recent Key Milestones
            </h3>
          </div>
          <button
            onClick={() => setActiveView('events')}
            className="text-xs text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center gap-1"
          >
            <span>View All Events ({events.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-3 divide-y divide-slate-800/60">
          {events.slice(-5).reverse().map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold text-[11px]">
                  {formatClockTime(evt.simTimeSec)}
                </span>
                <div>
                  <span className="font-semibold text-slate-200">{evt.title}</span>
                  <span className="text-slate-400 block text-[11px]">{evt.description}</span>
                </div>
              </div>

              {evt.statusTag && (
                <StatusBadge status={evt.statusTag} size="sm" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
