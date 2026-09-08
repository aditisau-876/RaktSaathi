import { DocumentArtifact } from '@/core/types/ingestion';

export const MOCK_DOCUMENTS: DocumentArtifact[] = [
  {
    id: 'DOC-TRIAGE-01',
    type: 'triage',
    title: 'Night Shift Triage Log (BB-DEL-A)',
    source: 'Central Trauma Register • Hardcopy Scan',
    timestamp: '22:30 IST • Verified',
    rawImage: 'triage_sheet_preview',
    ocrConfidence: 99.4,
    boundingBoxes: [
      { id: 'b1', label: 'Facility', text: 'METRO TRAUMA HUB - BANK A', top: 12, left: 10, width: 45, height: 6, status: 'VALID' },
      { id: 'b2', label: 'Blood Group', text: 'O NEGATIVE (PRBC)', top: 28, left: 15, width: 30, height: 8, status: 'CRITICAL' },
      { id: 'b3', label: 'Current Units', text: '8 UNITS AVAILABLE', top: 38, left: 15, width: 25, height: 8, status: 'CRITICAL' },
      { id: 'b4', label: 'Safety Threshold', text: 'MANDATED FLOOR: 26 UNITS', top: 50, left: 15, width: 35, height: 7, status: 'VALID' },
      { id: 'b5', label: 'Duty Clinician', text: 'DR. V. RAO (REG: 48921)', top: 70, left: 55, width: 35, height: 7, status: 'VALID' },
    ],
    structuredPayload: {
      ingestionId: "ING-2026-9041",
      ingestedAt: "2026-09-08T22:30:14Z",
      source: "CLOUDINARY_EDGE_OCR",
      targetTable: "SNOWFLAKE.INVENTORY.REALTIME_STOCK",
      confidence: 0.994,
      facility: {
        code: "BB-DEL-A",
        name: "Metro Trauma Hub (Bank A)",
        tier: 1,
        jurisdiction: "Delhi-NCR Central"
      },
      telemetry: {
        bloodGroup: "O-",
        availableUnits: 8,
        mandatedSafetyFloor: 26,
        netDeficit: -18,
        status: "CODE_RED_CRITICAL",
        forecastExhaustionHorizonHours: 18.0
      },
      auditSignature: {
        verifiedBy: "OCR_VISION_ENGINE_4.2",
        nbtcComplianceCheck: "PASSED",
        piiScrubbed: true
      }
    }
  },
  {
    id: 'DOC-FAX-02',
    type: 'fax',
    title: 'Emergency Surgical Requisition Fax (#REQ-8821)',
    source: 'AIIMS Cardiothoracic OR 4 • Telefax Stream',
    timestamp: '22:38 IST • High Priority',
    rawImage: 'surgical_fax_preview',
    ocrConfidence: 98.8,
    boundingBoxes: [
      { id: 'f1', label: 'Requesting Center', text: 'AIIMS APEX TRAUMA CENTER', top: 14, left: 12, width: 42, height: 6, status: 'VALID' },
      { id: 'f2', label: 'Priority', text: 'STAT - EMERGENCY TRANSFUSION', top: 24, left: 12, width: 40, height: 7, status: 'CRITICAL' },
      { id: 'f3', label: 'Serotype & Volume', text: 'O-NEG • 6 UNITS REQUIRED', top: 38, left: 18, width: 35, height: 9, status: 'CRITICAL' },
      { id: 'f4', label: 'Clinical Indication', text: 'RUPTURED AORTIC ANEURYSM', top: 52, left: 18, width: 40, height: 7, status: 'WARNING' },
    ],
    structuredPayload: {
      requisitionId: "REQ-8821",
      submittedAt: "2026-09-08T22:38:00Z",
      hospital: "AIIMS Apex Trauma Center",
      clinicalPriority: "STAT",
      bloodGroup: "O-",
      unitsDemanded: 6,
      procedure: "Ruptured Thoracic Aortic Aneurysm",
      crossmatchStatus: "EMERGENCY_UNMATCHED_O_NEG",
      estimatedDispatchWindowMins: 15
    }
  },
  {
    id: 'DOC-CAMP-03',
    type: 'camp',
    title: 'Mobile Donation Camp Log (#MOB-VAN-02)',
    source: 'Red Cross Noida Mobile Unit • Tablet Upload',
    timestamp: '21:15 IST • Verified',
    rawImage: 'camp_log_preview',
    ocrConfidence: 99.6,
    boundingBoxes: [
      { id: 'c1', label: 'Camp Identifier', text: 'NOIDA SECTOR 62 MOBILE DRIVE', top: 10, left: 15, width: 40, height: 6, status: 'VALID' },
      { id: 'c2', label: 'Total Units Collected', text: '42 WHOLE BLOOD UNITS', top: 26, left: 20, width: 30, height: 8, status: 'VALID' },
      { id: 'c3', label: 'Cold Chain Status', text: 'CONTAINER #04: 3.8°C NOMINAL', top: 44, left: 20, width: 35, height: 7, status: 'VALID' },
      { id: 'c4', label: 'O- Negative Yield', text: '4 UNITS O-NEG INGESTED', top: 60, left: 20, width: 32, height: 8, status: 'VALID' },
    ],
    structuredPayload: {
      batchId: "MOB-2026-042",
      collectionCenter: "Noida Mobile Van #02",
      totalYield: 42,
      coldChainTempCelsius: 3.8,
      breakdownByGroup: {
        "O+": 16, "O-": 4, "A+": 10, "B+": 8, "AB+": 4
      },
      targetDepository: "BB-NOI-B (Noida Regional Center)",
      transitEtaIST: "23:15 IST"
    }
  }
];
