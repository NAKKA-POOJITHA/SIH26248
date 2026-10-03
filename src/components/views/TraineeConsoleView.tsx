import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { MessageCard } from '../common/MessageCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatSimTime, formatClockTime } from '../../utils/formatters';
import { 
  AlertTriangle, 
  Send, 
  Radio, 
  MapPin, 
  FileText, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Truck, 
  LifeBuoy, 
  Activity,
  Layers,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { ParticipantRole } from '../../types/simulation';

export const TraineeConsoleView: React.FC = () => {
  const {
    activeScenario,
    activeRole,
    participants,
    messages,
    decisions,
    activeFaults,
    teamMessages,
    simTimeSec,
    submitDecision,
    sendTeamMessage,
    setSelectedDecisionForProvenance,
  } = useSimulation();

  // Local state for decision form
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [rationaleText, setRationaleText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState<string>('');

  // Local state for trainee team message draft
  const [chatDraft, setChatDraft] = useState<string>('');
  const [chatRecipient, setChatRecipient] = useState<ParticipantRole | 'ALL'>('ALL');

  // Find current active decision for this role or general
  const activeDecision = decisions.find(
    (d) => d.status === 'PENDING' && (d.targetRole === activeRole || activeRole === 'INSTRUCTOR' || d.targetRole === 'COORDINATOR')
  );

  // Filter messages visible to this trainee (or all if Instructor)
  const visibleMessages = messages.filter(
    (m) => activeRole === 'INSTRUCTOR' || m.targetRole === 'ALL' || m.targetRole === activeRole
  );

  // Active faults affecting this specific role
  const roleFaults = activeFaults.filter(
    (f) => f.active && (f.targetRole === 'ALL' || f.targetRole === activeRole)
  );

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDecision || !selectedOptionId) return;

    setIsSubmitting(true);
    submitDecision(
      activeDecision.id,
      selectedOptionId,
      rationaleText || 'Proceeding according to situational assessment.'
    );

    setDecisionSuccessMsg('Decision successfully submitted to command hierarchy.');
    setSelectedOptionId('');
    setRationaleText('');
    setIsSubmitting(false);

    setTimeout(() => {
      setDecisionSuccessMsg('');
    }, 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    sendTeamMessage(chatRecipient, chatDraft);
    setChatDraft('');
  };

  const currentRoleObj = participants.find((p) => p.id === activeRole) || participants[0];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Station Identification Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${currentRoleObj.avatarColor} ring-4 ring-slate-800 shrink-0`} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                {currentRoleObj.roleTitle}
              </h2>
              <span className="font-mono text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                CALLSIGN: {currentRoleObj.callsign}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assigned Post: <strong className="text-slate-200">{currentRoleObj.assignedZone}</strong> | Simulation Time: <span className="font-mono text-slate-200 font-bold">{formatSimTime(simTimeSec)}</span>
            </p>
          </div>
        </div>

        {/* Channel Health Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Comms Link:</span>
          {roleFaults.length > 0 ? (
            <div className="inline-flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded text-xs font-mono font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>DEGRADED: {roleFaults[0].type} ({roleFaults[0].channel})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALL CHANNELS NOMINAL</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-COLUMN COMMAND LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================= */}
        {/* COLUMN 1 (LEFT): Situation & Reports (3 cols)             */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Situation Card */}
          <div className="command-card">
            <div className="command-panel-header">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-200">Current Situation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">LIVE INTEL</span>
            </div>
            <div className="p-3.5 space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {activeScenario.initialSituation}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                  Sector Zone Threat Levels
                </span>
                {activeScenario.zones.map((zone) => (
                  <div key={zone.id} className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{zone.name}</span>
                      <StatusBadge status={zone.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-400">{zone.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Received Situation Reports (SitReps) */}
          <div className="command-card">
            <div className="command-panel-header">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-200">Official SitReps</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{activeScenario.initialSitReps.length} REPORTS</span>
            </div>
            <div className="p-3 space-y-2.5">
              {activeScenario.initialSitReps.map((rep) => (
                <div key={rep.id} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                    <span className="text-emerald-400 font-semibold">{rep.source}</span>
                    <span>{formatClockTime(rep.timeSec)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 mb-1">{rep.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{rep.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2 (CENTER): Most Important Active Information (5 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* VISUALLY PRIORITIZED DECISION REQUIRED CARD */}
          {activeDecision && (
            <div className="rounded-lg border-2 border-indigo-500/80 bg-gradient-to-b from-indigo-950/50 to-slate-900/95 p-4 shadow-lg shadow-indigo-950/40">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-indigo-600 text-white animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-indigo-300">
                    ⚠ DECISION REQUIRED
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700/60 font-semibold">
                  GATE: {activeDecision.id}
                </span>
              </div>

              <div className="mb-4 bg-slate-950/80 p-3 rounded border border-indigo-900/50">
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block mb-1">
                  Situation Assessment:
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  {activeDecision.situation}
                </p>
              </div>

              {/* Decision Options Form */}
              <form onSubmit={handleDecisionSubmit} className="space-y-3">
                <label className="text-xs font-mono uppercase font-bold text-slate-300 block">
                  Choose an action:
                </label>

                <div className="space-y-2">
                  {activeDecision.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                        selectedOptionId === opt.id
                          ? 'bg-indigo-900/40 border-indigo-400 ring-1 ring-indigo-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decisionOption"
                        value={opt.id}
                        checked={selectedOptionId === opt.id}
                        onChange={() => setSelectedOptionId(opt.id)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-100 mb-0.5">{opt.label}</div>
                        <div className="text-slate-400 text-[11px]">{opt.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Rationale Input */}
                <div className="pt-2">
                  <label className="text-xs font-mono uppercase font-bold text-slate-300 block mb-1.5">
                    Command Rationale & Evidence:
                  </label>
                  <textarea
                    rows={2}
                    value={rationaleText}
                    onChange={(e) => setRationaleText(e.target.value)}
                    placeholder="State reason for action based on current available intelligence..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={!selectedOptionId || isSubmitting}
                  className={`w-full py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    selectedOptionId && !isSubmitting
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SUBMIT DECISION</span>
                </button>
              </form>

              {decisionSuccessMsg && (
                <div className="mt-3 p-2 bg-emerald-950 border border-emerald-500/50 rounded text-xs text-emerald-300 font-mono text-center">
                  ✓ {decisionSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* Incoming Information Feed */}
          <div className="command-card">
            <div className="command-panel-header">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-200">
                  Incoming Information ({visibleMessages.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">REAL-TIME FEED</span>
            </div>

            <div className="p-3.5 space-y-3">
              {visibleMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No incoming messages received on this channel yet.
                </div>
              ) : (
                visibleMessages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3 (RIGHT): Actions & Team Communication (4 cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Tactical Action Dispatch Panel */}
          <div className="command-card">
            <div className="command-panel-header">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-200">Available Actions</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">DISPATCH</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => sendTeamMessage('ALL', 'REQUESTING IMMEDIATE SITREP RE-CONFIRMATION FROM ALL SECTORS.')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  Request Re-check
                </div>
                <span className="text-[10px] text-slate-400">Broadcast verification ping</span>
              </button>

              <button
                onClick={() => sendTeamMessage('FIELD_UNIT_ALPHA', 'FIELD ALPHA: HOLD CONVOY DISPATCH PENDING ROUTE RECON.')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Hold Convoys
                </div>
                <span className="text-[10px] text-slate-400">Halt movement into North Zone</span>
              </button>

              <button
                onClick={() => sendTeamMessage('LOGISTICS_CHIEF', 'LOGISTICS: STAGE BACKUP EVACUATION BOATS AT SECTOR 4.')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  Deploy Logistics
                </div>
                <span className="text-[10px] text-slate-400">Stage watercraft at Sector 4</span>
              </button>

              <button
                onClick={() => sendTeamMessage('OPERATIONS_LEAD', 'OPS: SHUT DOWN VENTILATION AT SHELTER HUB ECHO.')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors flex flex-col justify-between"
              >
                <div className="font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
                  <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                  Shelter Lockdown
                </div>
                <span className="text-[10px] text-slate-400">Isolate HVAC against Hazmat</span>
              </button>
            </div>
          </div>

          {/* Secure Team Communication Channel */}
          <div className="command-card">
            <div className="command-panel-header">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold font-mono uppercase text-slate-200">
                  Team Radio & Messages
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{teamMessages.length} LOGGED</span>
            </div>

            {/* Chat message stream */}
            <div className="p-3 max-h-56 overflow-y-auto space-y-2.5">
              {teamMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No radio traffic recorded.
                </div>
              ) : (
                teamMessages.map((msg) => (
                  <div key={msg.id} className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="font-bold text-blue-400">{msg.sender} ➔ {msg.recipient}</span>
                      <span>{formatClockTime(msg.timeSec)}</span>
                    </div>
                    <p className="text-slate-200 text-[11px]">{msg.text}</p>
                    <div className="flex justify-end">
                      <StatusBadge
                        status={msg.status === 'SENT' ? 'DELIVERED' : msg.status}
                        size="sm"
                        labelOverride={msg.status}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Send Radio Message Input */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">To:</span>
                <select
                  value={chatRecipient}
                  onChange={(e) => setChatRecipient(e.target.value as ParticipantRole | 'ALL')}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none"
                >
                  <option value="ALL">ALL PARTICIPANTS (BROADCAST)</option>
                  <option value="COORDINATOR">INCIDENT COORDINATOR</option>
                  <option value="OPERATIONS_LEAD">OPERATIONS LEAD</option>
                  <option value="LOGISTICS_CHIEF">LOGISTICS DIRECTOR</option>
                  <option value="FIELD_UNIT_ALPHA">FORWARD TACTICAL ALPHA</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Send tactical radio update..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatDraft.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Decision History on this console */}
          <div className="command-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">Decisions Recorded</span>
              <span className="text-xs font-mono text-emerald-400">
                {decisions.filter(d => d.status === 'RESOLVED').length} / {decisions.length}
              </span>
            </div>
            {decisions.filter(d => d.status === 'RESOLVED').length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No decisions submitted yet.</p>
            ) : (
              <div className="space-y-1.5">
                {decisions.filter(d => d.status === 'RESOLVED').map((dec) => (
                  <div
                    key={dec.id}
                    onClick={() => setSelectedDecisionForProvenance(dec)}
                    className="p-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-[11px]">{dec.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">Resolved at {formatClockTime(dec.resolvedTimeSec || 0)}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
