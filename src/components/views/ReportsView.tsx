import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { formatClockTime } from '../../utils/formatters';
import { 
  FileText, 
  MapPin, 
  ShieldAlert, 
  Radio, 
  Layers, 
  AlertTriangle, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { activeScenario, messages, simTimeSec } = useSimulation();

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <MetricCard
          label="Active Incident Zones"
          value={activeScenario.zones.length}
          subValue="SECTORS MONITORED"
          icon={MapPin}
          variant="highlight"
        />
        <MetricCard
          label="Official Situation Reports"
          value={activeScenario.initialSitReps.length}
          subValue="COMMAND DOSSIERS"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          label="Field Intelligence Logs"
          value={messages.length}
          subValue="TELEMETRY FEEDS"
          icon={Radio}
          variant="success"
        />
      </div>

      {/* Operational Zones & Spatial Intel */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Sector Operational Zones & Hazard Status
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">SPATIAL TELEMETRY</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeScenario.zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300 uppercase">
                      {zone.id}
                    </span>
                    <span className="font-semibold text-slate-100 text-sm">{zone.name}</span>
                  </div>
                  <StatusBadge status={zone.status} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {zone.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Threat Level: <strong className="text-slate-200">{zone.status}</strong></span>
                <span className="text-blue-400 font-semibold">Active Monitoring</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Situation Reports (SitReps) */}
      <div className="command-card">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Official Incident Dossiers & Meteorological SitReps
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">AUTHENTICATED SOURCES</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeScenario.initialSitReps.map((rep) => (
            <div
              key={rep.id}
              className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold">{rep.source}</span>
                <span>T+{rep.timeSec}s ({formatClockTime(rep.timeSec)})</span>
              </div>
              <h4 className="font-bold text-sm text-white">{rep.title}</h4>
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                {rep.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Field Intelligence Feeds Table */}
      <div className="command-card overflow-hidden">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Field Intelligence Feed Log ({messages.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">TACTICAL BROADCASTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="p-3 font-semibold">Report ID</th>
                <th className="p-3 font-semibold">Domain / Priority</th>
                <th className="p-3 font-semibold">Source Author</th>
                <th className="p-3 font-semibold min-w-[240px]">Intelligence Content</th>
                <th className="p-3 font-semibold">Ground Truth</th>
                <th className="p-3 font-semibold text-right">Comms Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-300">{msg.id}</td>
                  <td className="p-3 font-mono">
                    <span className="text-slate-300 font-semibold">{msg.domain}</span>
                    <span className="text-slate-500 block text-[10px]">{msg.priority}</span>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{msg.author}</td>
                  <td className="p-3 text-slate-200">{msg.content}</td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                      msg.groundTruthVerdict === 'TRUE'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : msg.groundTruthVerdict === 'FALSE'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {msg.groundTruthVerdict || 'UNVERIFIED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <StatusBadge status={msg.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
