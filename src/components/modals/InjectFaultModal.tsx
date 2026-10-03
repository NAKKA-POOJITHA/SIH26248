import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { FaultType, ParticipantRole } from '../../types/simulation';
import { X, Zap, Clock, XCircle, AlertTriangle, Radio } from 'lucide-react';

export const InjectFaultModal: React.FC = () => {
  const { isInjectFaultModalOpen, setIsInjectFaultModalOpen, injectFault, injectQuickMessage } = useSimulation();

  const [faultType, setFaultType] = useState<FaultType>('DELAY');
  const [targetRole, setTargetRole] = useState<ParticipantRole | 'ALL'>('COORDINATOR');
  const [channel, setChannel] = useState<string>('VHF-TACTICAL-1');
  const [delaySec, setDelaySec] = useState<number>(45);
  const [durationSec, setDurationSec] = useState<number>(180);
  const [customDescription, setCustomDescription] = useState<string>('');

  if (!isInjectFaultModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    injectFault(
      faultType,
      targetRole,
      channel,
      durationSec,
      delaySec,
      customDescription || `${faultType} injected on ${channel} targeting ${targetRole}`
    );

    if (faultType === 'CONFLICT') {
      injectQuickMessage(
        'LAND',
        'HIGH',
        'Conflicting Field Observation',
        'Secondary report conflicts with main routing corridor status.',
        targetRole,
        'CONFLICT'
      );
    }

    setIsInjectFaultModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-rose-950 border border-rose-800/60 text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              INJECT COMMUNICATION DEGRADATION
            </h3>
          </div>
          <button
            onClick={() => setIsInjectFaultModalOpen(false)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Fault Type Selector */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              1. Degradation Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFaultType('DELAY')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  faultType === 'DELAY'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400 mb-1" />
                <div className="font-bold text-xs">DELAY</div>
                <div className="text-[10px] text-slate-500">Latency lag</div>
              </button>

              <button
                type="button"
                onClick={() => setFaultType('DROPOUT')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  faultType === 'DROPOUT'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-400 mb-1" />
                <div className="font-bold text-xs">DROPOUT</div>
                <div className="text-[10px] text-slate-500">Complete loss</div>
              </button>

              <button
                type="button"
                onClick={() => setFaultType('CONFLICT')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  faultType === 'CONFLICT'
                    ? 'bg-orange-950/60 border-orange-500 text-orange-300 ring-1 ring-orange-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-orange-400 mb-1" />
                <div className="font-bold text-xs">CONFLICT</div>
                <div className="text-[10px] text-slate-500">Contradiction</div>
              </button>
            </div>
          </div>

          {/* Target Role & Channel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                Target Role:
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as ParticipantRole | 'ALL')}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="COORDINATOR">Incident Coordinator</option>
                <option value="OPERATIONS_LEAD">Operations Lead</option>
                <option value="LOGISTICS_CHIEF">Logistics Director</option>
                <option value="FIELD_UNIT_ALPHA">Forward Tactical Alpha</option>
                <option value="ALL">ALL PARTICIPANTS</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                Channel / Subsystem:
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="VHF-TACTICAL-1">VHF-TACTICAL-1</option>
                <option value="CELLULAR-MESH">CELLULAR-MESH</option>
                <option value="SATCOM-TRUNK">SATCOM-TRUNK</option>
                <option value="MUNICIPAL-TELEMETRY">MUNICIPAL-TELEMETRY</option>
              </select>
            </div>
          </div>

          {/* Latency setting if DELAY */}
          {faultType === 'DELAY' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                  Artificial Latency Lag (seconds):
                </label>
                <span className="font-mono text-amber-400 font-bold">{delaySec}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={delaySec}
                onChange={(e) => setDelaySec(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
              Rationale / Description (Optional):
            </label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g. Atmospheric storm cell interfering with bridge antenna..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInjectFaultModalOpen(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold uppercase rounded flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Confirm & Inject</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
