import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { formatClockTime, formatSimTime } from '../../utils/formatters';
import { X, Download, Printer, Check, FileText } from 'lucide-react';

export const ExportReportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, getAARSummary, activeScenario } = useSimulation();
  const [downloaded, setDownloaded] = useState(false);

  if (!isExportModalOpen) return null;

  const aar = getAARSummary();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(aar, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AAR-REPORT-${activeScenario.codename}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              EXPORT AFTER-ACTION REVIEW (AAR) DOSSIER
            </h3>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300">
            Generate an official audit document containing simulation telemetry, communication fault logs, participant perception divergence, and decision provenance.
          </p>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Exercise Codename:</span>
              <span className="text-slate-200 font-bold">{aar.exerciseId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scenario Title:</span>
              <span className="text-slate-200">{aar.scenarioName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Duration:</span>
              <span className="text-slate-200">{formatSimTime(aar.totalDurationSec)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Team Resilience Score:</span>
              <span className="text-emerald-400 font-bold">{aar.teamPerformanceScore} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Divergence Peak:</span>
              <span className="text-orange-400 font-bold">{aar.divergencePeakPercent}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Downloaded JSON' : 'Download JSON Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
