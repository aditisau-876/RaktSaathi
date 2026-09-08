export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export interface BloodStockItem {
  bloodGroup: BloodGroup;
  units: number;
  safetyFloor: number;
  status: 'critical' | 'warning' | 'nominal';
  depletionHours?: number;
}

export interface FacilityInventory {
  facilityId: string;
  facilityName: string;
  shortName: string;
  location: string;
  type: 'Trauma Hub' | 'Regional Depository' | 'Specialty Depot';
  activeAlertCount: number;
  totalUnits: number;
  stocks: Record<BloodGroup, BloodStockItem>;
  coordinates?: { lat: number; lng: number };
}
