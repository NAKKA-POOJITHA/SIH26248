import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { LiveExerciseView } from './components/views/LiveExerciseView';
import { TraineeConsoleView } from './components/views/TraineeConsoleView';
import { ParticipantsView } from './components/views/ParticipantsView';
import { EventsView } from './components/views/EventsView';
import { DecisionsView } from './components/views/DecisionsView';
import { AARView } from './components/views/AARView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { DecisionProvenanceModal } from './components/modals/DecisionProvenanceModal';
import { InjectFaultModal } from './components/modals/InjectFaultModal';
import { ExportReportModal } from './components/modals/ExportReportModal';

const AppContent: React.FC = () => {
  const { activeView } = useSimulation();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'live-exercise':
        return <LiveExerciseView />;
      case 'trainee-console':
        return <TraineeConsoleView />;
      case 'participants':
        return <ParticipantsView />;
      case 'events':
        return <EventsView />;
      case 'decisions':
        return <DecisionsView />;
      case 'aar':
        return <AARView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <TopBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <DecisionProvenanceModal />
      <InjectFaultModal />
      <ExportReportModal />
    </div>
  );
};

export function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

export default App;
