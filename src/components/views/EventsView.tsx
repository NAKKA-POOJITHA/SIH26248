import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { formatClockTime } from '../../utils/formatters';
import { 
  Clock, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Zap, 
  HelpCircle, 
  Radio, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { EventType, SimEvent } from '../../types/simulation';

export const EventsView: React.FC = () => {
  const { events, simTimeSec } = useSimulation();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'ALL' && evt.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <MetricCard
          label="Total Logged Events"
          value={events.length}
          subValue="AUDIT LOG"
          icon={Clock}
          variant="default"
        />
        <MetricCard
          label="Message Dispatches"
          value={events.filter(e => e.type.includes('MESSAGE')).length}
          subValue="TELEMETRY"
          icon={Radio}
          variant="highlight"
        />
        <MetricCard
          label="Fault Injections"
          value={events.filter(e => e.type === 'FAULT_INJECTED').length}
          subValue="DEGRADATION EVENTS"
          icon={Zap}
          variant="warning"
        />
        <MetricCard
          label="Decisions Evaluated"
          value={events.filter(e => e.type.includes('DECISION')).length}
          subValue="TRAINEE ACTIONS"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="command-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">ALL EVENT TYPES ({events.length})</option>
            <option value="MESSAGE_GENERATED">MESSAGE GENERATED</option>
            <option value="MESSAGE_DELIVERED">MESSAGE DELIVERED</option>
            <option value="FAULT_INJECTED">FAULT INJECTED</option>
            <option value="DECISION_REQUIRED">DECISION REQUIRED</option>
            <option value="DECISION_SUBMITTED">DECISION SUBMITTED</option>
            <option value="SYSTEM">SYSTEM EVENTS</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, actors, text..."
            className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Structured Events Table */}
      <div className="command-card overflow-hidden">
        <div className="command-panel-header">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold font-mono uppercase text-slate-200">
              Live Event History & Audit Log ({filteredEvents.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">COMPACT ROWS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="p-3 font-semibold min-w-[90px]">Time</th>
                <th className="p-3 font-semibold min-w-[220px]">Event Description</th>
                <th className="p-3 font-semibold min-w-[150px]">Participant / Actor</th>
                <th className="p-3 font-semibold min-w-[120px]">Status</th>
                <th className="p-3 font-semibold text-right min-w-[80px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                    No matching events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice().reverse().map((evt) => {
                  const isExpanded = expandedEventId === evt.id;

                  return (
                    <React.Fragment key={evt.id}>
                      <tr
                        onClick={() => toggleExpand(evt.id)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-mono font-bold text-slate-300">
                          {formatClockTime(evt.simTimeSec)}
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-slate-100">{evt.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-md">
                            {evt.description}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-slate-200 block">{evt.actor}</span>
                          {evt.target && (
                            <span className="text-[10px] font-mono text-slate-400">➔ {evt.target}</span>
                          )}
                        </td>

                        <td className="p-3">
                          {evt.statusTag && (
                            <StatusBadge status={evt.statusTag} size="sm" />
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <button className="p-1 rounded hover:bg-slate-800 text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b border-slate-800">
                          <td colSpan={5} className="p-4 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Event Identifier</span>
                                <span className="text-slate-200 font-mono font-semibold">{evt.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Classification Type</span>
                                <span className="text-blue-400 font-mono font-semibold">{evt.type}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Simulation Timestamp</span>
                                <span className="text-slate-200 font-mono font-semibold">T+{evt.simTimeSec}s ({formatClockTime(evt.simTimeSec)})</span>
                              </div>
                            </div>
                            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Full Content / Telemetry:</span>
                              <p className="leading-relaxed">{evt.description}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
