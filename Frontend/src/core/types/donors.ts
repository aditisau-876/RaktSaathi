import { BloodGroup } from './inventory';

export interface DonorRecord {
  id: string;
  pseudonym: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  travelMinutes: number;
  responseProbability: number;
  lastDonationWeeks: number;
  contactMasked: string;
  wave: 1 | 2 | 3;
  cluster: string;
  status: 'READY' | 'CONTACTED' | 'CONFIRMED' | 'IN_TRANSIT';
}

export interface DonorWaveSummary {
  wave: 1 | 2 | 3;
  radiusKm: number;
  donorCount: number;
  estimatedUnits: number;
  avgResponseMins: number;
}
