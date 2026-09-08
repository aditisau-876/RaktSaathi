import { ActiveShortageContext } from '@/core/types/incident';

export const ACTIVE_SHORTAGE_INCIDENT: ActiveShortageContext = {
  incidentId: 'INC-2026-0881',
  facilityId: 'BB-DEL-A',
  facilityName: 'Metro Trauma Hub (Bank A)',
  bloodGroup: 'O-',
  currentStock: 8,
  mandatedFloor: 26,
  projectedGap: -18,
  breachHorizonIST: '02:40 IST (T+18h)',
  hoursUntilBreach: 18,
  severity: 'CRITICAL',
  modelIdentifier: 'ML-DL-TRAUMA-9042',
  burnVelocityUnitsPerHour: 1.28,
  rebalanceSourceFacilityId: 'BB-NOI-B',
  rebalanceSourceFacilityName: 'Noida Regional Center (Bank B)',
  rebalanceSurplusUnits: 32,
};
