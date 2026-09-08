export type IncidentSeverity = 'CRITICAL' | 'WARNING' | 'STABLE';

export interface ActiveShortageContext {
  incidentId: string;
  facilityId: string;
  facilityName: string;
  bloodGroup: string;
  currentStock: number;
  mandatedFloor: number;
  projectedGap: number;
  breachHorizonIST: string;
  hoursUntilBreach: number;
  severity: IncidentSeverity;
  modelIdentifier: string;
  burnVelocityUnitsPerHour: number;
  rebalanceSourceFacilityId?: string;
  rebalanceSourceFacilityName?: string;
  rebalanceSurplusUnits?: number;
}
