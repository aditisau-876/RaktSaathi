import { BloodGroup } from './inventory';

export type CreativeFormat = '1:1_SQUARE' | '9:16_STORY' | '16:9_LANDSCAPE' | 'DOOH_TOTEM';

export interface CampaignConfig {
  campaignId: string;
  incidentId: string;
  facilityName: string;
  bloodGroup: BloodGroup;
  headline: string;
  bodyText: string;
  urgencyLevel: string;
  targetDonorCount: number;
  broadcastRadiusKm: number;
  targetUnits: number;
  incentive: string;
  channels: {
    whatsapp: boolean;
    sms: boolean;
    pushNotification: boolean;
    digitalBillboard: boolean;
  };
}

export interface CampaignFormatSpec {
  format: CreativeFormat;
  label: string;
  aspectRatio: string;
  dimensions: string;
  channelName: string;
  mockupDescription: string;
}
