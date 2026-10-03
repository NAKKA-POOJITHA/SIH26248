export type ParticipantRole = 
  | 'INSTRUCTOR'
  | 'COORDINATOR'
  | 'OPERATIONS_LEAD'
  | 'LOGISTICS_CHIEF'
  | 'FIELD_UNIT_ALPHA';

export type MessageStatus = 'DELIVERED' | 'DELAYED' | 'DROPPED' | 'CONFLICT';

export type FaultType = 'DELAY' | 'DROPOUT' | 'CONFLICT' | 'JITTER';

export type EventType = 
  | 'SYSTEM'
  | 'MESSAGE_GENERATED'
  | 'MESSAGE_DELIVERED'
  | 'FAULT_INJECTED'
  | 'DECISION_REQUIRED'
  | 'DECISION_SUBMITTED'
  | 'COMM_RESTORED'
  | 'ZONE_UPDATE';

export interface Participant {
  id: ParticipantRole;
  name: string;
  callsign: string;
  roleTitle: string;
  isOnline: boolean;
  pingMs: number;
  unacknowledgedCount: number;
  divergenceScore: number; // 0 to 100%
  avatarColor: string;
  assignedZone: string;
}

export interface SimulationMessage {
  id: string;
  domain: string; // e.g., 'LAND', 'INFRASTRUCTURE', 'HAZMAT', 'MEDICAL', 'AIR'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  title: string;
  content: string;
  author: string;
  targetRole: ParticipantRole | 'ALL';
  generatedSimTime: number; // in seconds
  deliveredSimTime?: number;
  deliveryDelaySec: number;
  status: MessageStatus;
  isContradictory?: boolean;
  contradictsMessageId?: string;
  groundTruthVerdict?: 'TRUE' | 'FALSE' | 'PARTIAL';
  explanation?: string;
  acknowledgedBy: ParticipantRole[];
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  impactSummary: string;
  scoreBonus: number; // Evaluator metric
  isOptimalUnderGroundTruth: boolean;
  isOptimalUnderDegradedInfo: boolean;
}

export interface DecisionGate {
  id: string;
  scenarioTimeSec: number;
  targetRole: ParticipantRole;
  title: string;
  situation: string;
  contextReports: string[];
  options: DecisionOption[];
  status: 'PENDING' | 'RESOLVED' | 'EXPIRED';
  resolvedOptionId?: string;
  resolvedTimeSec?: number;
  rationale?: string;
  provenanceData?: {
    availableReports: { id: string; title: string; status: MessageStatus; delaySec?: number }[];
    communicationCondition: {
      delayedCount: number;
      droppedCount: number;
      conflictCount: number;
    };
    submittedOptionText: string;
    rationaleText: string;
    evaluationSummary: string;
  };
}

export interface SimEvent {
  id: string;
  simTimeSec: number;
  type: EventType;
  title: string;
  description: string;
  actor: string;
  target?: string;
  statusTag?: MessageStatus | 'ACTION' | 'ALERT' | 'INFO';
  metadata?: Record<string, string | number | boolean>;
}

export interface ActiveFault {
  id: string;
  type: FaultType;
  targetRole: ParticipantRole | 'ALL';
  channel: string;
  injectedAtSimTime: number;
  durationSec: number;
  delaySec?: number;
  description: string;
  active: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  codename: string;
  description: string;
  initialSituation: string;
  durationLimitSec: number;
  zones: { id: string; name: string; status: 'SAFE' | 'WARNING' | 'CRITICAL'; notes: string }[];
  initialSitReps: {
    id: string;
    title: string;
    source: string;
    summary: string;
    timeSec: number;
  }[];
  scriptedTimeline: {
    simTimeSec: number;
    action: 'INJECT_MESSAGE' | 'INJECT_FAULT' | 'TRIGGER_DECISION' | 'ZONE_CHANGE';
    payload: any;
  }[];
}

export interface AARSummary {
  exerciseId: string;
  scenarioName: string;
  totalDurationSec: number;
  participantsCount: number;
  totalFaultsInjected: number;
  totalDecisionsMade: number;
  teamPerformanceScore: number; // 0 - 100
  divergencePeakPercent: number;
  communicationStats: {
    deliveredCount: number;
    delayedCount: number;
    droppedCount: number;
    conflictCount: number;
  };
  keyTakeaways: string[];
  participantBreakdown: {
    role: ParticipantRole;
    name: string;
    receivedReports: number;
    missedCriticalAlerts: number;
    decisionAccuracy: number;
    divergenceAvg: number;
  }[];
}
