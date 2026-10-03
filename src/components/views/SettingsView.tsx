import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { PRESET_SCENARIOS } from '../../data/scenarios';
import { MetricCard } from '../common/MetricCard';
import { 
  Settings, 
  Layers, 
  Zap, 
  RotateCcw, 
  ShieldCheck, 
  Radio, 
  Check, 
  Sliders,
  Volume2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    activeScenario,
    selectScenario,
    resetExercise,
    timeMultiplier,
    setTimeMultiplier,
    isAudioMuted,
    toggleMute,
    injectFault,
  } = useSimulation();

  const [appliedPreset, setAppliedPreset] = useState<string>('');

  const handleApplyFaultPreset = (presetName: string) => {
    if (presetName === 'STORM') {
      injectFault('DELAY', 'COORDINATOR', 'VHF-TACTICAL-1', 240, 45, 'Atmospheric storm interference (+45s latency)');
    } else if (presetName === 'BLACKOUT') {
      injectFault('DROPOUT', 'FIELD_UNIT_ALPHA', 'CELLULAR-MESH', 300, 0, 'Cell tower blackout dropping all packets to Field Unit');
    } else if (presetName === 'SPOOF') {
      injectFault('CONFLICT', 'OPERATIONS_LEAD', 'MUNICIPAL-TELEMETRY', 180, 0, 'Stale sensor telemetry broadcasting false clear road status');
    }

    setAppliedPreset(presetName);
    setTimeout(() => setAppliedPreset(''), 3000);
  };

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="command-card p-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800/60 text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase">
              EXERCISE PARAMETERS & NETWORK DEGRADATION PROFILES
            </h2>
            <p className="text-xs text-slate-400">
              Configure scenarios, simulation clock speeds, degradation profiles, and operational parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Scenario Selection
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">PRESET CATALOG</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PRESET_SCENARIOS.map((scen) => {
            const isSelected = activeScenario.id === scen.id;

            return (
              <div
                key={scen.id}
                onClick={() => selectScenario(scen.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400">{scen.codename}</span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        <Check className="w-3 h-3" /> ACTIVE SCENARIO
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{scen.name}</h4>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{scen.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Zones: {scen.zones.length}</span>
                  <span>Timeline Events: {scen.scriptedTimeline.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Degradation Profile Quick Injectors */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Degradation Test Profiles
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">ONE-CLICK FAULT BUNDLES</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-amber-400 uppercase block mb-1">
                Profile A: Severe Storm Jamming
              </span>
              <p className="text-xs text-slate-300 mb-3">
                Applies +45s delay across tactical radio channels to simulate rain fade.
              </p>
            </div>
            <button
              onClick={() => handleApplyFaultPreset('STORM')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase rounded transition-colors"
            >
              {appliedPreset === 'STORM' ? 'Applied ✓' : 'Apply Storm Fault'}
            </button>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-rose-400 uppercase block mb-1">
                Profile B: Substation Tower Blackout
              </span>
              <p className="text-xs text-slate-300 mb-3">
                Drops 100% of cellular packets to Forward Tactical Alpha.
              </p>
            </div>
            <button
              onClick={() => handleApplyFaultPreset('BLACKOUT')}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase rounded transition-colors"
            >
              {appliedPreset === 'BLACKOUT' ? 'Applied ✓' : 'Apply Blackout Fault'}
            </button>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-orange-400 uppercase block mb-1">
                Profile C: Sensor Telemetry Desync
              </span>
              <p className="text-xs text-slate-300 mb-3">
                Broadcasts contradictory road status to test confirmation bias.
              </p>
            </div>
            <button
              onClick={() => handleApplyFaultPreset('SPOOF')}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold uppercase rounded transition-colors"
            >
              {appliedPreset === 'SPOOF' ? 'Applied ✓' : 'Apply Desync Fault'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Controls & Reset */}
      <div className="command-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200 mb-1">
              Reset Session State
            </h3>
            <p className="text-xs text-slate-400">
              Clear all active faults, reset simulation clock to T+0, and re-initialize scenario.
            </p>
          </div>

          <button
            onClick={resetExercise}
            className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono text-xs font-bold uppercase rounded transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Exercise Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
