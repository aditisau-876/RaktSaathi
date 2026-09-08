import { BloodGroup } from './inventory';

export type RequestPriority = 'STAT' | 'URGENT' | 'ROUTINE';
export type RequestStatus = 'ALLOCATED' | 'IN_TRANSIT' | 'QUEUED' | 'ANALYZING';

export interface HospitalRequest {
  id: string;
  timestamp: string;
  hospitalName: string;
  department: string;
  leadClinician: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  priority: RequestPriority;
  status: RequestStatus;
  indication: string;
  etaMinutes?: number;
}
