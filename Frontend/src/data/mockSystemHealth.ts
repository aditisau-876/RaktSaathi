export interface SystemMetric {
  title: string;
  value: string;
  subtext: string;
  status: 'nominal' | 'surge' | 'sync';
  delta?: string;
}

export const MOCK_SYSTEM_METRICS: SystemMetric[] = [
  {
    title: 'ENVIRONMENT POSTURE',
    value: 'Production Sandbox',
    subtext: 'Synthetic Grounding Active (Build v4.8)',
    status: 'nominal',
  },
  {
    title: 'CORE SLA RELIABILITY',
    value: '99.98%',
    subtext: 'All 4 Core Clinical Engines Nominal',
    status: 'nominal',
    delta: '+0.04%',
  },
  {
    title: 'PIPELINE LATENCY',
    value: '14ms',
    subtext: 'Snowflake Lakehouse Streaming Active',
    status: 'sync',
    delta: '<0.02s lag',
  },
  {
    title: 'ASSET SYNDICATION',
    value: '184ms',
    subtext: 'Cloudinary Edge Computer Vision Ready',
    status: 'sync',
  },
];

export const MOCK_INTEGRATIONS = [
  {
    name: 'Snowflake Core Lakehouse',
    cluster: 'snowflake-delhi-dw01.aws-ap-south-1',
    status: 'CONNECTED',
    pingMs: 14,
    syncCadence: '60s Real-Time Micro-Batch',
    recordsIn24h: '1,420 records',
  },
  {
    name: 'Cloudinary Computer Vision Edge',
    cluster: 'cloudinary-edge-media-ap-south-1',
    status: 'ONLINE',
    pingMs: 24,
    syncCadence: 'Sub-second webhook ingest',
    recordsIn24h: '48 documents parsed',
  },
  {
    name: 'NBTC Regulatory Compliance Engine',
    cluster: 'nbtc-safety-audit-node-delhi',
    status: 'LOCKED',
    pingMs: 8,
    syncCadence: 'Deterministic Rule Validation',
    recordsIn24h: '100% Passed (14/14 Rules)',
  },
];
