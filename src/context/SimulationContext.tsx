import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ParticipantRole, 
  Participant, 
  SimulationMessage, 
  ActiveFault, 
  DecisionGate, 
  SimEvent, 
  Scenario, 
  FaultType, 
  MessageStatus,
  AARSummary
} from '../types/simulation';
import { INITIAL_PARTICIPANTS, PRESET_SCENARIOS } from '../data/scenarios';
import { playTacticalPing, toggleAudio, isAudioEnabled } from '../utils/sound';

export type ViewType = 
  | 'dashboard'
  | 'live-exercise'
  | 'trainee-console'
  | 'participants'
  | 'events'
  | 'decisions'
  | 'aar'
  | 'reports'
  | 'settings';

interface TeamChatMessage {
  id: string;
  sender: ParticipantRole;
  recipient: ParticipantRole | 'ALL';
  text: string;
  timeSec: number;
  status: 'SENT' | 'DELAYED' | 'DROPPED';
}

interface SimulationContextType {
  activeScenario: Scenario;
  isRunning: boolean;
  simTimeSec: number;
  timeMultiplier: number;
  activeRole: ParticipantRole;
  activeView: ViewType;
  participants: Participant[];
  messages: SimulationMessage[];
  activeFaults: ActiveFault[];
  decisions: DecisionGate[];
  events: SimEvent[];
  teamMessages: TeamChatMessage[];
  divergenceScore: number;
  isAudioMuted: boolean;
  selectedDecisionForProvenance: DecisionGate | null;
  isInjectFaultModalOpen: boolean;
  isExportModalOpen: boolean;
  
  // Actions
  startExercise: () => void;
  pauseExercise: () => void;
  resetExercise: () => void;
  setTimeMultiplier: (speed: number) => void;
  setActiveRole: (role: ParticipantRole) => void;
  setActiveView: (view: ViewType) => void;
  injectFault: (type: FaultType, targetRole: ParticipantRole | 'ALL', channel: string, durationSec: number, delaySec?: number, description?: string) => void;
  removeFault: (faultId: string) => void;
  submitDecision: (decisionId: string, optionId: string, rationale: string) => void;
  sendTeamMessage: (recipient: ParticipantRole | 'ALL', text: string) => void;
  acknowledgeMessage: (messageId: string, role?: ParticipantRole) => void;
  injectQuickMessage: (domain: string, priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE', title: string, content: string, targetRole: ParticipantRole | 'ALL', status: MessageStatus) => void;
  selectScenario: (scenarioId: string) => void;
  toggleMute: () => void;
  setSelectedDecisionForProvenance: (decision: DecisionGate | null) => void;
  setIsInjectFaultModalOpen: (open: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
  getAARSummary: () => AARSummary;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simTimeSec, setSimTimeSec] = useState<number>(105); // Start at 105s so initial interesting degraded state is pre-populated
  const [timeMultiplier, setTimeMultiplier] = useState<number>(1);
  const [activeRole, setActiveRole] = useState<ParticipantRole>('INSTRUCTOR');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!isAudioEnabled());
  const [selectedDecisionForProvenance, setSelectedDecisionForProvenance] = useState<DecisionGate | null>(null);
  const [isInjectFaultModalOpen, setIsInjectFaultModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Pre-seed initial messages from the scenario up to time 105
  const [messages, setMessages] = useState<SimulationMessage[]>([
    {
      id: 'MSG-101',
      domain: 'LAND',
      priority: 'HIGH',
      title: 'North Corridor Access Status',
      content: 'North corridor route alpha is currently reported accessible by local police checkpoint.',
      author: 'Sector Police Dispatch',
      targetRole: 'ALL',
      generatedSimTime: 15,
      deliveredSimTime: 15,
      deliveryDelaySec: 0,
      status: 'DELIVERED',
      groundTruthVerdict: 'PARTIAL',
      explanation: 'Passable for light vehicles only; large buses will get stuck.',
      acknowledgedBy: ['COORDINATOR', 'OPERATIONS_LEAD']
    },
    {
      id: 'MSG-102',
      domain: 'LAND',
      priority: 'CRITICAL',
      title: 'Urgent: North Bridge Structural Failure',
      content: 'Forward scouting unit confirms North Corridor bridge pilings are washing out. Route is impassable for heavy transports.',
      author: 'Field Unit Alpha',
      targetRole: 'OPERATIONS_LEAD',
      generatedSimTime: 55,
      deliveredSimTime: 100,
      deliveryDelaySec: 45,
      status: 'DELAYED',
      groundTruthVerdict: 'TRUE',
      explanation: 'Ground truth: The bridge is actively collapsing.',
      acknowledgedBy: ['OPERATIONS_LEAD']
    },
    {
      id: 'MSG-103',
      domain: 'LAND',
      priority: 'HIGH',
      title: 'Conflicting Traffic Report: North Highway Clear',
      content: 'Automated municipal camera feed reports North corridor is wide open with normal flow.',
      author: 'Automated Traffic Sensor',
      targetRole: 'COORDINATOR',
      generatedSimTime: 75,
      deliveredSimTime: 75,
      deliveryDelaySec: 0,
      status: 'CONFLICT',
      isContradictory: true,
      contradictsMessageId: 'MSG-102',
      groundTruthVerdict: 'FALSE',
      explanation: 'Sensor feed was stuck on a cached snapshot due to fiber line break.',
      acknowledgedBy: []
    }
  ]);

  // Pre-seed active faults
  const [activeFaults, setActiveFaults] = useState<ActiveFault[]>([
    {
      id: 'FAULT-01',
      type: 'DELAY',
      targetRole: 'COORDINATOR',
      channel: 'VHF-TACTICAL-1',
      injectedAtSimTime: 40,
      durationSec: 240,
      delaySec: 45,
      description: 'Atmospheric storm interference causes 45s latency on Coordinator tactical channel.',
      active: true,
    }
  ]);

  // Pre-seed decisions (Pending decision at 90s)
  const [decisions, setDecisions] = useState<DecisionGate[]>([
    {
      id: 'DEC-01',
      scenarioTimeSec: 90,
      targetRole: 'COORDINATOR',
      title: 'North Corridor Evacuation Route Assignment',
      situation: 'North Zone report conflict: Automated sensor reports corridor open, while delayed field reports warn of structural instability.',
      contextReports: ['MSG-101', 'MSG-102', 'MSG-103'],
      status: 'PENDING',
      options: [
        {
          id: 'OPT-1',
          label: 'Continue current plan (Send convoys through North Corridor)',
          description: 'Maintain original evacuation routing based on municipal sensor feed to avoid delays.',
          impactSummary: 'High hazard: Convoys risk entrapment on collapsing bridge.',
          scoreBonus: 20,
          isOptimalUnderGroundTruth: false,
          isOptimalUnderDegradedInfo: true,
        },
        {
          id: 'OPT-2',
          label: 'Reallocate resources immediately to Southern Bypass Route B',
          description: 'Divert all 6 heavy transports through Route B (+18 min travel time, but guaranteed safe ground).',
          impactSummary: 'Safe outcome: Evacuation succeeds without casualties despite moderate delay.',
          scoreBonus: 95,
          isOptimalUnderGroundTruth: true,
          isOptimalUnderDegradedInfo: false,
        },
        {
          id: 'OPT-3',
          label: 'Request urgent drone/field verification before moving convoys',
          description: 'Halt convoys for 2 minutes to obtain visual confirmation from Alpha Lead.',
          impactSummary: 'Prudent caution: Resolves information conflict with minimal time penalty.',
          scoreBonus: 88,
          isOptimalUnderGroundTruth: true,
          isOptimalUnderDegradedInfo: true,
        },
        {
          id: 'OPT-4',
          label: 'Wait for more information without dispatching assets',
          description: 'Hold all units in depot until full network connectivity is restored.',
          impactSummary: 'Paralysis: Staging area risks flooding before evacuees are moved.',
          scoreBonus: 40,
          isOptimalUnderGroundTruth: false,
          isOptimalUnderDegradedInfo: false,
        }
      ]
    },
    {
      id: 'DEC-02',
      scenarioTimeSec: 180,
      targetRole: 'OPERATIONS_LEAD',
      title: 'Hazmat Plume Response & Shelter Lockdown',
      situation: 'Chlorine leak reported near Substation 7. Field Unit Alpha is operating downwind without confirmed receipt of hazmat warning.',
      contextReports: ['MSG-104'],
      status: 'PENDING',
      options: [
        {
          id: 'DEC2-OPT-1',
          label: 'Order emergency radio relay to redirect Field Unit Alpha immediately',
          description: 'Use high-power VHF broadcast to alert Alpha of the toxic plume.',
          impactSummary: 'Prevents toxic exposure to frontline personnel.',
          scoreBonus: 95,
          isOptimalUnderGroundTruth: true,
          isOptimalUnderDegradedInfo: true,
        },
        {
          id: 'DEC2-OPT-2',
          label: 'Proceed with Substation power salvage without altering Alpha\'s mission',
          description: 'Assume Alpha has received municipal siren warning.',
          impactSummary: 'Severe risk: Field unit enters hazardous vapor zone unprotected.',
          scoreBonus: 15,
          isOptimalUnderGroundTruth: false,
          isOptimalUnderDegradedInfo: false,
        },
        {
          id: 'DEC2-OPT-3',
          label: 'Initiate Shelter Hub Echo ventilation shutdown and seal perimeter',
          description: 'Protect 450 evacuees from potential plume drift.',
          impactSummary: 'Essential safety measure executed in timely fashion.',
          scoreBonus: 90,
          isOptimalUnderGroundTruth: true,
          isOptimalUnderDegradedInfo: true,
        }
      ]
    }
  ]);

  // Pre-seed events log
  const [events, setEvents] = useState<SimEvent[]>([
    {
      id: 'EVT-01',
      simTimeSec: 0,
      type: 'SYSTEM',
      title: 'Exercise Commenced',
      description: 'Scenario "Operation Northstar" initialized with 4 active role stations.',
      actor: 'EXERCISE DIRECTOR',
      statusTag: 'INFO'
    },
    {
      id: 'EVT-02',
      simTimeSec: 15,
      type: 'MESSAGE_DELIVERED',
      title: 'Report Generated: North Corridor Access Status',
      description: 'Police dispatch reports route alpha accessible.',
      actor: 'Sector Police Dispatch',
      target: 'ALL',
      statusTag: 'DELIVERED'
    },
    {
      id: 'EVT-03',
      simTimeSec: 40,
      type: 'FAULT_INJECTED',
      title: 'Fault Injected: Latency Delay (+45s)',
      description: 'Atmospheric storm interference applied to Coordinator tactical channel.',
      actor: 'EXERCISE DIRECTOR',
      target: 'COORDINATOR',
      statusTag: 'ALERT'
    },
    {
      id: 'EVT-04',
      simTimeSec: 55,
      type: 'MESSAGE_GENERATED',
      title: 'Report Delayed: North Bridge Structural Failure',
      description: 'Field report from Alpha delayed in queue due to channel fault.',
      actor: 'Field Unit Alpha',
      target: 'OPERATIONS_LEAD',
      statusTag: 'DELAYED'
    },
    {
      id: 'EVT-05',
      simTimeSec: 75,
      type: 'MESSAGE_DELIVERED',
      title: 'Conflicting Report Delivered',
      description: 'Automated camera reports highway clear, contradicting field scout.',
      actor: 'Automated Traffic Sensor',
      target: 'COORDINATOR',
      statusTag: 'CONFLICT'
    },
    {
      id: 'EVT-06',
      simTimeSec: 90,
      type: 'DECISION_REQUIRED',
      title: 'Decision Required: Evacuation Route Assignment',
      description: 'Incident Coordinator must resolve routing conflict.',
      actor: 'SYSTEM',
      target: 'COORDINATOR',
      statusTag: 'ACTION'
    }
  ]);

  // Pre-seed team chat messages
  const [teamMessages, setTeamMessages] = useState<TeamChatMessage[]>([
    {
      id: 'CHAT-01',
      sender: 'FIELD_UNIT_ALPHA',
      recipient: 'ALL',
      text: 'Water level at North Bridge marker 4 is now at bridge girders. Requesting confirmation on convoy detour.',
      timeSec: 62,
      status: 'SENT'
    },
    {
      id: 'CHAT-02',
      sender: 'OPERATIONS_LEAD',
      recipient: 'COORDINATOR',
      text: 'Coordinator, we have conflicting sensor telemetry on North Corridor. Can you confirm if convoy is holding?',
      timeSec: 82,
      status: 'SENT'
    }
  ]);

  // Live simulation ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimTimeSec((prev) => {
        const nextTime = prev + 1;

        // Check if any scripted timeline event triggers at this exact time
        activeScenario.scriptedTimeline.forEach((scriptItem) => {
          if (scriptItem.simTimeSec === nextTime) {
            if (scriptItem.action === 'INJECT_MESSAGE') {
              setMessages((m) => {
                if (m.some(msg => msg.id === scriptItem.payload.id)) return m;
                return [...m, scriptItem.payload];
              });
              setEvents((e) => [
                ...e,
                {
                  id: `EVT-${Date.now()}`,
                  simTimeSec: nextTime,
                  type: 'MESSAGE_GENERATED',
                  title: `Report: ${scriptItem.payload.title}`,
                  description: scriptItem.payload.content,
                  actor: scriptItem.payload.author,
                  target: scriptItem.payload.targetRole,
                  statusTag: scriptItem.payload.status,
                }
              ]);
              playTacticalPing('ALERT');
            } else if (scriptItem.action === 'INJECT_FAULT') {
              setActiveFaults((f) => [
                ...f,
                {
                  ...scriptItem.payload,
                  injectedAtSimTime: nextTime,
                  active: true
                }
              ]);
              setEvents((e) => [
                ...e,
                {
                  id: `EVT-${Date.now()}`,
                  simTimeSec: nextTime,
                  type: 'FAULT_INJECTED',
                  title: `Fault Injected: ${scriptItem.payload.type}`,
                  description: scriptItem.payload.description,
                  actor: 'INSTRUCTOR',
                  target: scriptItem.payload.targetRole,
                  statusTag: 'ALERT'
                }
              ]);
              playTacticalPing('FAULT');
            }
          }
        });

        return nextTime;
      });
    }, 1000 / timeMultiplier);

    return () => clearInterval(interval);
  }, [isRunning, timeMultiplier, activeScenario]);

  // Compute live divergence score
  const divergenceScore = useMemo(() => {
    let totalScore = 0;
    const delayedCount = messages.filter(m => m.status === 'DELAYED').length;
    const droppedCount = messages.filter(m => m.status === 'DROPPED').length;
    const conflictCount = messages.filter(m => m.status === 'CONFLICT').length;
    
    totalScore = (delayedCount * 18) + (droppedCount * 28) + (conflictCount * 32);
    return Math.min(Math.max(totalScore, 12), 94);
  }, [messages]);

  // Update participant divergence dynamically
  useEffect(() => {
    setParticipants(prev => prev.map(p => {
      let roleDivergence = 15;
      if (p.id === 'COORDINATOR') {
        const hasConflicts = messages.some(m => m.status === 'CONFLICT' && (m.targetRole === 'ALL' || m.targetRole === 'COORDINATOR'));
        roleDivergence = hasConflicts ? 52 : 20;
      } else if (p.id === 'OPERATIONS_LEAD') {
        const hasDelays = messages.some(m => m.status === 'DELAYED');
        roleDivergence = hasDelays ? 44 : 18;
      } else if (p.id === 'FIELD_UNIT_ALPHA') {
        const hasDrops = messages.some(m => m.status === 'DROPPED');
        roleDivergence = hasDrops ? 76 : 28;
      }
      return {
        ...p,
        divergenceScore: roleDivergence
      };
    }));
  }, [messages]);

  // Actions
  const startExercise = useCallback(() => {
    setIsRunning(true);
    playTacticalPing('CLICK');
  }, []);

  const pauseExercise = useCallback(() => {
    setIsRunning(false);
    playTacticalPing('CLICK');
  }, []);

  const resetExercise = useCallback(() => {
    setSimTimeSec(0);
    setIsRunning(false);
    setMessages([]);
    setActiveFaults([]);
    setEvents([
      {
        id: `EVT-${Date.now()}`,
        simTimeSec: 0,
        type: 'SYSTEM',
        title: 'Exercise Reset',
        description: 'Session parameters and timeline reset to initial baseline.',
        actor: 'EXERCISE DIRECTOR',
        statusTag: 'INFO'
      }
    ]);
    playTacticalPing('CLICK');
  }, []);

  const injectFault = useCallback((
    type: FaultType, 
    targetRole: ParticipantRole | 'ALL', 
    channel: string, 
    durationSec: number, 
    delaySec = 30, 
    description = ''
  ) => {
    const faultId = `FAULT-${Date.now().toString().slice(-4)}`;
    const newFault: ActiveFault = {
      id: faultId,
      type,
      targetRole,
      channel,
      injectedAtSimTime: simTimeSec,
      durationSec,
      delaySec,
      description: description || `${type} fault injected on ${channel} targeting ${targetRole}`,
      active: true,
    };

    setActiveFaults(prev => [...prev, newFault]);

    setEvents(prev => [
      ...prev,
      {
        id: `EVT-${Date.now()}`,
        simTimeSec,
        type: 'FAULT_INJECTED',
        title: `Fault Injected: ${type} on ${channel}`,
        description: newFault.description,
        actor: 'EXERCISE DIRECTOR',
        target: targetRole,
        statusTag: 'ALERT'
      }
    ]);

    playTacticalPing('FAULT');
  }, [simTimeSec]);

  const removeFault = useCallback((faultId: string) => {
    setActiveFaults(prev => prev.filter(f => f.id !== faultId));
    setEvents(prev => [
      ...prev,
      {
        id: `EVT-${Date.now()}`,
        simTimeSec,
        type: 'COMM_RESTORED',
        title: `Fault Cleared: ${faultId}`,
        description: 'Channel communication restored to nominal operational state.',
        actor: 'EXERCISE DIRECTOR',
        statusTag: 'DELIVERED'
      }
    ]);
    playTacticalPing('SUCCESS');
  }, [simTimeSec]);

  const submitDecision = useCallback((decisionId: string, optionId: string, rationale: string) => {
    setDecisions(prev => prev.map(dec => {
      if (dec.id !== decisionId) return dec;

      const chosenOption = dec.options.find(o => o.id === optionId);
      const optionLabel = chosenOption ? chosenOption.label : optionId;

      // Calculate provenance snapshot
      const availableReports = messages.filter(m => m.targetRole === 'ALL' || m.targetRole === dec.targetRole).map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        delaySec: m.deliveryDelaySec,
      }));

      const delayedCount = availableReports.filter(r => r.status === 'DELAYED').length;
      const droppedCount = availableReports.filter(r => r.status === 'DROPPED').length;
      const conflictCount = availableReports.filter(r => r.status === 'CONFLICT').length;

      return {
        ...dec,
        status: 'RESOLVED',
        resolvedOptionId: optionId,
        resolvedTimeSec: simTimeSec,
        rationale,
        provenanceData: {
          availableReports,
          communicationCondition: {
            delayedCount,
            droppedCount,
            conflictCount
          },
          submittedOptionText: optionLabel,
          rationaleText: rationale,
          evaluationSummary: chosenOption?.impactSummary || 'Decision executed.'
        }
      };
    }));

    setEvents(prev => [
      ...prev,
      {
        id: `EVT-${Date.now()}`,
        simTimeSec,
        type: 'DECISION_SUBMITTED',
        title: `Decision Submitted: ${decisionId}`,
        description: `Rationale: "${rationale.slice(0, 75)}..."`,
        actor: activeRole,
        statusTag: 'DELIVERED'
      }
    ]);

    playTacticalPing('SUCCESS');
  }, [messages, simTimeSec, activeRole]);

  const sendTeamMessage = useCallback((recipient: ParticipantRole | 'ALL', text: string) => {
    if (!text.trim()) return;

    // Check if current active role is experiencing a fault
    const activeDrop = activeFaults.some(f => f.type === 'DROPOUT' && (f.targetRole === 'ALL' || f.targetRole === activeRole));
    const activeDelay = activeFaults.some(f => f.type === 'DELAY' && (f.targetRole === 'ALL' || f.targetRole === activeRole));

    const status = activeDrop ? 'DROPPED' : activeDelay ? 'DELAYED' : 'SENT';

    const newMsg: TeamChatMessage = {
      id: `CHAT-${Date.now().toString().slice(-4)}`,
      sender: activeRole,
      recipient,
      text: text.trim(),
      timeSec: simTimeSec,
      status,
    };

    setTeamMessages(prev => [...prev, newMsg]);

    setEvents(prev => [
      ...prev,
      {
        id: `EVT-${Date.now()}`,
        simTimeSec,
        type: 'MESSAGE_DELIVERED',
        title: `Team Comms: ${activeRole} ➔ ${recipient}`,
        description: text.slice(0, 60),
        actor: activeRole,
        target: recipient,
        statusTag: status === 'DROPPED' ? 'DROPPED' : status === 'DELAYED' ? 'DELAYED' : 'DELIVERED'
      }
    ]);

    playTacticalPing('CLICK');
  }, [activeRole, activeFaults, simTimeSec]);

  const acknowledgeMessage = useCallback((messageId: string, role = activeRole) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const alreadyAcked = msg.acknowledgedBy.includes(role);
        return {
          ...msg,
          acknowledgedBy: alreadyAcked ? msg.acknowledgedBy : [...msg.acknowledgedBy, role]
        };
      }
      return msg;
    }));
    playTacticalPing('CLICK');
  }, [activeRole]);

  const injectQuickMessage = useCallback((
    domain: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE',
    title: string,
    content: string,
    targetRole: ParticipantRole | 'ALL',
    status: MessageStatus
  ) => {
    const newMsg: SimulationMessage = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      domain,
      priority,
      title,
      content,
      author: 'Exercise Simulation Inject',
      targetRole,
      generatedSimTime: simTimeSec,
      deliveredSimTime: status === 'DELAYED' ? simTimeSec + 40 : simTimeSec,
      deliveryDelaySec: status === 'DELAYED' ? 40 : 0,
      status,
      acknowledgedBy: []
    };

    setMessages(prev => [...prev, newMsg]);

    setEvents(prev => [
      ...prev,
      {
        id: `EVT-${Date.now()}`,
        simTimeSec,
        type: 'MESSAGE_GENERATED',
        title: `Inject: ${title}`,
        description: content,
        actor: 'INSTRUCTOR',
        target: targetRole,
        statusTag: status
      }
    ]);

    playTacticalPing('ALERT');
  }, [simTimeSec]);

  const selectScenario = useCallback((scenarioId: string) => {
    const selected = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (selected) {
      setActiveScenario(selected);
      resetExercise();
    }
  }, [resetExercise]);

  const toggleMute = useCallback(() => {
    const newState = toggleAudio();
    setIsAudioMuted(!newState);
  }, []);

  const getAARSummary = useCallback((): AARSummary => {
    const deliveredCount = messages.filter(m => m.status === 'DELIVERED').length;
    const delayedCount = messages.filter(m => m.status === 'DELAYED').length;
    const droppedCount = messages.filter(m => m.status === 'DROPPED').length;
    const conflictCount = messages.filter(m => m.status === 'CONFLICT').length;

    const resolvedDecisions = decisions.filter(d => d.status === 'RESOLVED');
    const totalScore = resolvedDecisions.reduce((acc, curr) => {
      const opt = curr.options.find(o => o.id === curr.resolvedOptionId);
      return acc + (opt ? opt.scoreBonus : 70);
    }, 85);

    return {
      exerciseId: activeScenario.codename,
      scenarioName: activeScenario.name,
      totalDurationSec: simTimeSec,
      participantsCount: participants.length,
      totalFaultsInjected: activeFaults.length + 2, // count history
      totalDecisionsMade: resolvedDecisions.length,
      teamPerformanceScore: Math.min(Math.round(totalScore / Math.max(resolvedDecisions.length, 1)), 96),
      divergencePeakPercent: 68,
      communicationStats: {
        deliveredCount,
        delayedCount,
        droppedCount,
        conflictCount,
      },
      keyTakeaways: [
        'Delayed bridge collapse reports created severe situational divergence between Incident Coordinator and Forward Units.',
        'Contradictory municipal traffic sensor feed led to 4 minutes of decision friction regarding route safety.',
        'Requesting forward verification was the highest-rated tactical choice to counteract sensor spoofing.',
        'Redundant high-power VHF broadcast successfully mitigated the cellular mesh blackout at Substation 7.'
      ],
      participantBreakdown: participants.map(p => ({
        role: p.id,
        name: p.name,
        receivedReports: messages.filter(m => m.targetRole === 'ALL' || m.targetRole === p.id).length,
        missedCriticalAlerts: messages.filter(m => m.status === 'DROPPED' && (m.targetRole === 'ALL' || m.targetRole === p.id)).length,
        decisionAccuracy: p.id === 'COORDINATOR' ? 88 : p.id === 'OPERATIONS_LEAD' ? 92 : 84,
        divergenceAvg: p.divergenceScore
      }))
    };
  }, [messages, decisions, activeScenario, simTimeSec, participants, activeFaults]);

  return (
    <SimulationContext.Provider
      value={{
        activeScenario,
        isRunning,
        simTimeSec,
        timeMultiplier,
        activeRole,
        activeView,
        participants,
        messages,
        activeFaults,
        decisions,
        events,
        teamMessages,
        divergenceScore,
        isAudioMuted,
        selectedDecisionForProvenance,
        isInjectFaultModalOpen,
        isExportModalOpen,
        startExercise,
        pauseExercise,
        resetExercise,
        setTimeMultiplier,
        setActiveRole,
        setActiveView,
        injectFault,
        removeFault,
        submitDecision,
        sendTeamMessage,
        acknowledgeMessage,
        injectQuickMessage,
        selectScenario,
        toggleMute,
        setSelectedDecisionForProvenance,
        setIsInjectFaultModalOpen,
        setIsExportModalOpen,
        getAARSummary,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
