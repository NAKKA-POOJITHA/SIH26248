import React from 'react';
import { useSimulation, ViewType } from '../../context/SimulationContext';
import { 
  LayoutDashboard, 
  Radio, 
  Users, 
  Clock3, 
  HelpCircle, 
  FileText, 
  FileBarChart2, 
  Settings, 
  MonitorDot, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    decisions, 
    activeFaults, 
    divergenceScore, 
    activeRole 
  } = useSimulation();

  const pendingDecisionsCount = decisions.filter(d => d.status === 'PENDING').length;
  const activeFaultsCount = activeFaults.filter(f => f.active).length;

  const navItems: { id: ViewType; label: string; icon: React.ElementType; badge?: string | number; badgeVariant?: 'alert' | 'warning' | 'neutral' }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-exercise', label: 'Live Exercise', icon: Radio, badge: activeFaultsCount > 0 ? `${activeFaultsCount} FAULTS` : undefined, badgeVariant: 'alert' },
    { id: 'trainee-console', label: 'Trainee Console', icon: MonitorDot, badge: pendingDecisionsCount > 0 ? `${pendingDecisionsCount} REQ` : undefined, badgeVariant: 'warning' },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'events', label: 'Events', icon: Clock3 },
    { id: 'decisions', label: 'Decisions', icon: HelpCircle, badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined, badgeVariant: 'warning' },
    { id: 'aar', label: 'AAR', icon: FileBarChart2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-3 min-h-[calc(100vh-57px)]">
      <div>
        {/* Navigation Section */}
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeVariant === 'alert'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Information Status / Divergence Indicator in Sidebar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-900/90 rounded-lg border border-slate-800 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
              Divergence Level
            </span>
            <span className={`text-xs font-mono font-bold ${
              divergenceScore > 50 ? 'text-orange-400' : divergenceScore > 25 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {divergenceScore}%
            </span>
          </div>

          {/* Divergence Progress Bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                divergenceScore > 50 ? 'bg-orange-500' : divergenceScore > 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${divergenceScore}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            {divergenceScore > 50
              ? 'Critical situational discrepancy between units.'
              : divergenceScore > 25
              ? 'Moderate information lag across channels.'
              : 'Nominal shared operational picture.'}
          </div>
        </div>

        {/* Current Active Station Badge */}
        <div className="px-3 py-2 bg-slate-900/60 rounded border border-slate-800/60 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs truncate">
            <span className="text-slate-500 block text-[10px] font-mono uppercase leading-tight">Current Station</span>
            <span className="text-slate-200 font-semibold truncate">{activeRole}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
