import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { formatSimTime, formatClockTime } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Volume2, 
  VolumeX, 
  UserCheck, 
  ShieldAlert,
  FastForward,
  Radio
} from 'lucide-react';
import { ParticipantRole } from '../../types/simulation';

export const TopBar: React.FC = () => {
  const {
    activeScenario,
    isRunning,
    simTimeSec,
    timeMultiplier,
    activeRole,
    activeView,
    participants,
    decisions,
    isAudioMuted,
    startExercise,
    pauseExercise,
    resetExercise,
    setTimeMultiplier,
    setActiveRole,
    toggleMute,
    setIsInjectFaultModalOpen,
  } = useSimulation();

  const pendingDecisionsCount = decisions.filter(d => d.status === 'PENDING').length;
  const onlineCount = participants.filter(p => p.isOnline).length;

  const viewTitles: Record<string, string> = {
    'dashboard': 'Executive Command Dashboard',
    'live-exercise': 'Instructor Live Control Center',
    'trainee-console': 'Trainee Operational Console',
    'participants': 'Participant Status & Link Matrix',
    'events': 'Live Event & Audit Timeline',
    'decisions': 'Decision Registry & Provenance Flow',
    'aar': 'After-Action Review (AAR)',
    'reports': 'Situation Reports & Spatial Intel',
    'settings': 'Simulation Parameters & Network Profiles',
  };

  const currentRoleObj = participants.find(p => p.id === activeRole);

  const roleOptions: { id: ParticipantRole; label: string; badge: string }[] = [
    { id: 'INSTRUCTOR', label: 'Exercise Director (Instructor)', badge: 'ALL-ACCESS' },
    { id: 'COORDINATOR', label: 'Incident Coordinator', badge: 'COMMAND-1' },
    { id: 'OPERATIONS_LEAD', label: 'Operations Lead', badge: 'OPS-LEAD' },
    { id: 'LOGISTICS_CHIEF', label: 'Logistics Director', badge: 'SUPPLY-BASE' },
    { id: 'FIELD_UNIT_ALPHA', label: 'Forward Tactical Alpha', badge: 'ALPHA-LEAD' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 py-2.5 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Section: App Logo, View Title, Session Code */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-mono font-black text-sm">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">AURA COMMAND</span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                  {activeScenario.codename}
                </span>
              </div>
              <h1 className="text-xs text-slate-400 font-medium">
                {viewTitles[activeView] || 'Command Console'}
              </h1>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          {/* Exercise Status & Sim Timers */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 px-3 py-1.5 rounded-md border border-slate-800">
            <StatusBadge status={isRunning ? 'LIVE' : 'PAUSED'} size="sm" />
            <div className="flex items-baseline gap-1.5 font-mono text-xs">
              <span className="text-slate-500 uppercase text-[10px]">Elapsed:</span>
              <span className="text-white font-bold text-sm tracking-wider">
                {formatSimTime(simTimeSec)}
              </span>
              <span className="text-slate-500 text-[11px]">({formatClockTime(simTimeSec)})</span>
            </div>
          </div>
        </div>

        {/* Right Section: Role Switcher & Live Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end">
          {/* Quick Simulation Ticker Controls */}
          <div className="flex items-center bg-slate-900 p-1 rounded-md border border-slate-800 gap-1">
            {isRunning ? (
              <button
                onClick={pauseExercise}
                className="p-1.5 rounded hover:bg-slate-800 text-amber-400 transition-colors title='Pause exercise'"
                title="Pause exercise"
                aria-label="Pause exercise"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startExercise}
                className="p-1.5 rounded hover:bg-slate-800 text-emerald-400 transition-colors"
                title="Start/Resume exercise"
                aria-label="Start exercise"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setTimeMultiplier(timeMultiplier === 1 ? 2 : timeMultiplier === 2 ? 5 : 1)}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                timeMultiplier > 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Simulation Speed Multiplier"
            >
              {timeMultiplier}x
            </button>

            <button
              onClick={resetExercise}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Reset simulation timeline"
              aria-label="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-md border transition-colors ${
              isAudioMuted
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-slate-900 text-blue-400 border-slate-800 hover:bg-slate-800'
            }`}
            title={isAudioMuted ? 'Tactical Audio Muted' : 'Tactical Audio Active'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fault Injector Quick Action */}
          <button
            onClick={() => setIsInjectFaultModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md border border-rose-500 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inject Fault</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 uppercase mr-1.5 hidden xl:inline">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as ParticipantRole)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {roleOptions.map((role) => (
                <option key={role.id} value={role.id} className="bg-slate-900 text-slate-200">
                  {role.label} [{role.badge}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
