export type ArtifactType = 'triage' | 'fax' | 'camp';

export interface DocumentArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  source: string;
  timestamp: string;
  rawImage: string;
  ocrConfidence: number;
  boundingBoxes: Array<{
    id: string;
    label: string;
    text: string;
    top: number;
    left: number;
    width: number;
    height: number;
    status: 'VALID' | 'WARNING' | 'CRITICAL';
  }>;
  structuredPayload: Record<string, any>;
}

export interface PipelineStage {
  step: number;
  name: string;
  subtitle: string;
  technology: string;
  latencyMs: number;
  status: 'COMPLETED' | 'PROCESSING' | 'READY';
}
