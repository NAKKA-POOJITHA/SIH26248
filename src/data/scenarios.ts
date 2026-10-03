import { Participant, Scenario } from '../types/simulation';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'COORDINATOR',
    name: 'Major Sarah Chen',
    callsign: 'COMMAND-1',
    roleTitle: 'Incident Coordinator',
    isOnline: true,
    pingMs: 24,
    unacknowledgedCount: 1,
    divergenceScore: 18,
    avatarColor: 'bg-blue-600',
    assignedZone: 'Sector Command Post',
  },
  {
    id: 'OPERATIONS_LEAD',
    name: 'Captain Marcus Vance',
    callsign: 'OPS-LEAD',
    roleTitle: 'Operations Section Chief',
    isOnline: true,
    pingMs: 42,
    unacknowledgedCount: 2,
    divergenceScore: 45,
    avatarColor: 'bg-amber-600',
    assignedZone: 'Tactical Ops Center',
  },
  {
    id: 'LOGISTICS_CHIEF',
    name: 'Elena Rostova',
    callsign: 'SUPPLY-BASE',
    roleTitle: 'Logistics Director',
    isOnline: true,
    pingMs: 31,
    unacknowledgedCount: 0,
    divergenceScore: 32,
    avatarColor: 'bg-emerald-600',
    assignedZone: 'Depot & Marshalling Yard',
  },
  {
    id: 'FIELD_UNIT_ALPHA',
    name: 'Lt. David O\'Connor',
    callsign: 'ALPHA-LEAD',
    roleTitle: 'Forward Tactical Lead',
    isOnline: true,
    pingMs: 118,
    unacknowledgedCount: 3,
    divergenceScore: 68,
    avatarColor: 'bg-purple-600',
    assignedZone: 'North Sector Perimeter',
  },
];

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'SCENARIO_NORTHSTAR',
    name: 'Operation Northstar: Flash Flood & Industrial Cascade',
    codename: 'EX-2026-NORTHSTAR',
    description: 'Severe flash flooding breaches North Dam containment. Trainees must coordinate evacuation corridors, deploy hazardous material containment, and secure vulnerable civilian shelters under degraded VHF/LTE communications.',
    initialSituation: 'Heavy torrential rainfall has exceeded hydrological limits in Sector 4. North Corridor bridge integrity is questionable. Substation 7 is at risk of cascading electrical failure.',
    durationLimitSec: 900,
    zones: [
      { id: 'ZONE_NORTH', name: 'North River Corridor', status: 'CRITICAL', notes: 'Water levels rising +1.2m/hr. Bridge B structurally compromised.' },
      { id: 'ZONE_SUBSTATION', name: 'Grid Substation 7', status: 'WARNING', notes: 'Back-up generators active. Water perimeter 45 meters out.' },
      { id: 'ZONE_SHELTER', name: 'Shelter Hub Echo (High School)', status: 'SAFE', notes: '450 evacuees present. Medical supplies low.' },
      { id: 'ZONE_DEPOT', name: 'Logistics Staging Yard', status: 'SAFE', notes: '6 heavy evacuation transports and 2 boat units staged.' },
    ],
    initialSitReps: [
      {
        id: 'SITREP-01',
        title: 'Initial Meteorological Assessment',
        source: 'Regional Weather Center',
        summary: 'Sustained precipitation 45mm/hr. Radar indicates heavy cell stationary over Sector 4 watershed for next 40 minutes.',
        timeSec: 10,
      },
      {
        id: 'SITREP-02',
        title: 'Dam Sluice Gate Overflow Alert',
        source: 'Hydroelectric Authority',
        summary: 'Secondary spillway opened at 14:28. Expected river crest in 20 minutes.',
        timeSec: 25,
      },
    ],
    scriptedTimeline: [
      {
        simTimeSec: 15,
        action: 'INJECT_MESSAGE',
        payload: {
          id: 'MSG-101',
          domain: 'LAND',
          priority: 'HIGH',
          title: 'North Corridor Access Status',
          content: 'North corridor route alpha is currently reported accessible by local police checkpoint.',
          author: 'Sector Police Dispatch',
          targetRole: 'ALL',
          generatedSimTime: 15,
          deliveryDelaySec: 0,
          status: 'DELIVERED',
          groundTruthVerdict: 'PARTIAL',
          explanation: 'Passable for light vehicles only; large buses will get stuck.'
        }
      },
      {
        simTimeSec: 40,
        action: 'INJECT_FAULT',
        payload: {
          id: 'FAULT-01',
          type: 'DELAY',
          targetRole: 'COORDINATOR',
          channel: 'VHF-TACTICAL-1',
          durationSec: 120,
          delaySec: 45,
          description: 'Atmospheric storm interference causes 45s latency on Coordinator channel.'
        }
      },
      {
        simTimeSec: 55,
        action: 'INJECT_MESSAGE',
        payload: {
          id: 'MSG-102',
          domain: 'LAND',
          priority: 'CRITICAL',
          title: 'Urgent: North Bridge Structural Failure',
          content: 'Forward scouting unit confirms North Corridor bridge pilings are washing out. Route is impassable for heavy transports.',
          author: 'Field Unit Alpha',
          targetRole: 'OPERATIONS_LEAD',
          generatedSimTime: 55,
          deliveryDelaySec: 45,
          status: 'DELAYED',
          groundTruthVerdict: 'TRUE',
          explanation: 'Ground truth: The bridge is actively collapsing.'
        }
      },
      {
        simTimeSec: 75,
        action: 'INJECT_MESSAGE',
        payload: {
          id: 'MSG-103',
          domain: 'LAND',
          priority: 'HIGH',
          title: 'Conflicting Traffic Report: North Highway Clear',
          content: 'Automated municipal camera feed reports North corridor is wide open with normal flow.',
          author: 'Automated Traffic Sensor',
          targetRole: 'COORDINATOR',
          generatedSimTime: 75,
          deliveryDelaySec: 0,
          status: 'CONFLICT',
          isContradictory: true,
          contradictsMessageId: 'MSG-102',
          groundTruthVerdict: 'FALSE',
          explanation: 'Sensor feed was stuck on a cached snapshot due to fiber line break.'
        }
      },
      {
        simTimeSec: 90,
        action: 'TRIGGER_DECISION',
        payload: {
          id: 'DEC-01',
          scenarioTimeSec: 90,
          targetRole: 'COORDINATOR',
          title: 'North Corridor Evacuation Route Assignment',
          situation: 'North Zone report conflict: Automated sensor reports corridor open, while delayed field reports warn of structural instability.',
          contextReports: ['MSG-101', 'MSG-102', 'MSG-103'],
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
        }
      },
      {
        simTimeSec: 130,
        action: 'INJECT_FAULT',
        payload: {
          id: 'FAULT-02',
          type: 'DROPOUT',
          targetRole: 'FIELD_UNIT_ALPHA',
          channel: 'CELLULAR-MESH',
          durationSec: 180,
          description: 'Substation power drop severs cell tower link to Field Unit Alpha.'
        }
      },
      {
        simTimeSec: 145,
        action: 'INJECT_MESSAGE',
        payload: {
          id: 'MSG-104',
          domain: 'HAZMAT',
          priority: 'CRITICAL',
          title: 'Chemical Tanker Puncture at Substation Perimeter',
          content: 'Chlorine tanker trailer tilted into flood waters. Gas vapor plume moving northeast.',
          author: 'Plant Safety Officer',
          targetRole: 'ALL',
          generatedSimTime: 145,
          deliveryDelaySec: 0,
          status: 'DROPPED',
          groundTruthVerdict: 'TRUE',
          explanation: 'Field Unit Alpha never received this alert due to cell tower dropout.'
        }
      },
      {
        simTimeSec: 180,
        action: 'TRIGGER_DECISION',
        payload: {
          id: 'DEC-02',
          scenarioTimeSec: 180,
          targetRole: 'OPERATIONS_LEAD',
          title: 'Hazmat Plume Response & Shelter Lockdown',
          situation: 'Chlorine leak reported near Substation 7. Field Unit Alpha is operating in the downwind sector without confirmed receipt of hazmat warning.',
          contextReports: ['MSG-104'],
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
      }
    ]
  },
  {
    id: 'SCENARIO_SEISMIC',
    name: 'Operation Aegis: Urban Seismic & Communications Collapse',
    codename: 'EX-2026-AEGIS',
    description: 'Magnitude 6.8 seismic event disrupts central routing nodes, hospital auxiliary power, and emergency service dispatch in Metro Core.',
    initialSituation: 'Widespread structural tremors, gas main fractures in Sector 2, fiber optic backhaul severed across river bridges.',
    durationLimitSec: 900,
    zones: [
      { id: 'ZONE_HOSPITAL', name: 'General Medical Center', status: 'CRITICAL', notes: 'Generator on emergency fuel. Oxygen reserves 4 hours.' },
      { id: 'ZONE_TUNNEL', name: 'Metro Transit Tunnel 3', status: 'WARNING', notes: 'Commuter train stranded. Smoke reported.' },
      { id: 'ZONE_HQ', name: 'Civil Defense Headquarters', status: 'SAFE', notes: 'Operating on satellite link.' },
    ],
    initialSitReps: [
      {
        id: 'SITREP-S01',
        title: 'Seismic Impact Initial Shaking Map',
        source: 'USGS / National Geologic Service',
        summary: 'Epicenter 4km SE of downtown. Peak ground acceleration 0.42g. Significant structural damage expected.',
        timeSec: 10,
      }
    ],
    scriptedTimeline: []
  }
];
