import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { MOCK_DOCUMENTS } from '@/data/mockDocuments';
import { DocumentArtifact } from '@/core/types/ingestion';

export const DataIngestionPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('DOC-TRIAGE-01');
  const [simulatingBatch, setSimulatingBatch] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

  const selectedDoc: DocumentArtifact =
    MOCK_DOCUMENTS.find(d => d.id === selectedDocId) || MOCK_DOCUMENTS[0];

  const handleSimulateBatch = () => {
    setSimulatingBatch(true);
    setTimeout(() => {
      setSimulatingBatch(false);
    }, 1800);
  };

  const stages = [
    {
      step: 1,
      title: '01 • Multi-Channel Ingestion',
      desc: 'Triage desks, legacy fax lines, barcode scanners, and camp logs.',
      subtext: 'Transport: TLS 1.3 Edge',
      icon: 'description',
    },
    {
      step: 2,
      title: '02 • Edge Extraction',
      desc: 'Cloudinary Vision Model extracts fields & bounding boxes in 184ms.',
      subtext: 'Confidence: 99.4% mean',
      icon: 'visibility',
    },
    {
      step: 3,
      title: '03 • Clinical Gate & NBTC',
      desc: 'Automated NBTC compliance, cold-chain checks, and PII anonymization.',
      subtext: 'Rules: 100% Passed',
      icon: 'verified_user',
    },
    {
      step: 4,
      title: '04 • Snowflake Lakehouse',
      desc: 'Structured into relational inventory dimensions & telemetry tables.',
      subtext: 'Latency: 14ms Stream',
      icon: 'database',
    },
    {
      step: 5,
      title: '05 • Downstream Dispatch',
      desc: 'Instant trigger of Shortage Radar alerts and Decision Center re-routes.',
      subtext: 'Deficit Engine: ARMED',
      icon: 'crisis_alert',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header & Controls */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="material-symbols-outlined text-[16px]">document_scanner</span>
            <span>ETL PIPELINE INTELLIGENCE • SNOWFLAKE LAKEHOUSE EDGE</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Data Ingestion: Turn operational inputs into trusted intelligence.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Automated edge pipeline transforming physical paper triage registers, emergency fax requisitions, and cold-chain barcode manifests into verified clinical truth within milliseconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon="play_circle"
            onClick={handleSimulateBatch}
            isLoading={simulatingBatch}
          >
            {simulatingBatch ? 'Processing Ingest Stream...' : 'Simulate Live Ingest Batch'}
          </Button>
        </div>
      </section>

      {/* 2. KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Ingestion Throughput</span>
            <span className="material-symbols-outlined text-primary text-[18px]">move_to_inbox</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">1,420</div>
            <p className="text-xs text-slate-500 mt-0.5">Records synced / 24h</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold mt-3 block">
            +18.4% intake capacity
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Cloudinary OCR Confidence</span>
            <span className="material-symbols-outlined text-primary text-[18px]">document_scanner</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">99.4%</div>
            <p className="text-xs text-slate-500 mt-0.5">Mean extraction precision</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-semibold mt-3 block">
            AI Edge Vision Model v4.2
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Snowflake DW Sync</span>
            <span className="material-symbols-outlined text-primary text-[18px]">database</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-ink-main">14ms</div>
            <p className="text-xs text-slate-500 mt-0.5">Edge to lakehouse latency</p>
          </div>
          <span className="text-[11px] font-mono text-sky-600 font-semibold mt-3 block">
            Micro-batch streaming
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Verified Pipelines</span>
            <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
          </div>
          <div>
            <div className="text-3xl font-display font-extrabold text-primary">5 / 5</div>
            <p className="text-xs text-slate-500 mt-0.5">All production paths online</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold mt-3 block">
            Zero queue backlog
          </span>
        </div>
      </div>

      {/* 3. 5-Stage Transformation Architecture Flow */}
      <GlassPanel className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-primary">Architecture Flow</span>
            <h2 className="font-display font-bold text-base text-ink-main">
              End-to-End Clinical Data Transformation Corridor
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Latency: ~198ms</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map(s => (
            <div
              key={s.step}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                s.step === 5
                  ? 'bg-red-50/70 border-primary/40'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Stage 0{s.step}
                  </span>
                  <span className={`material-symbols-outlined text-[17px] ${
                    s.step === 5 ? 'text-primary' : 'text-slate-400'
                  }`}>
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xs text-ink-main">{s.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.desc}</p>
              </div>
              <span className={`text-[10px] font-mono font-bold pt-2 border-t border-slate-200/60 block ${
                s.step === 5 ? 'text-primary' : 'text-slate-400'
              }`}>
                {s.subtext}
              </span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* 4. Live Execution Workbench: Interactive Document Sandbox */}
      <GlassPanel elevation={2} className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-primary">Live Execution Workbench</span>
            <h2 className="font-display font-bold text-lg text-ink-main">
              Interactive Document Ingestion Sandbox
            </h2>
            <p className="text-xs text-slate-500">
              Select an operational artifact below to observe computer-vision field parsing and Snowflake lakehouse ingestion in real time.
            </p>
          </div>

          {/* Document Picker Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {MOCK_DOCUMENTS.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedDocId === doc.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {doc.type === 'triage' ? '1. Triage Sheet' : doc.type === 'fax' ? '2. Surgical Fax' : '3. Camp Log'}
              </button>
            ))}
          </div>
        </div>

        {/* Dual-Pane View: Document Preview (Left) & Structured JSON (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Pane: Scan Preview with Bounding Boxes (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
            <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-slate-800">
              <span className="text-slate-400">{selectedDoc.source}</span>
              <span className="text-emerald-400 font-bold">OCR: {selectedDoc.ocrConfidence}%</span>
            </div>

            {/* Document Emulation with Highlighted Bounding Boxes */}
            <div className="my-4 p-5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3 font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase">Artifact ID: {selectedDoc.id}</div>
              <div className="font-bold text-sm text-white">{selectedDoc.title}</div>

              {/* Bounding Box Highlights */}
              <div className="space-y-2 pt-2">
                {selectedDoc.boundingBoxes.map(b => (
                  <div
                    key={b.id}
                    className={`p-2 rounded border flex items-center justify-between ${
                      b.status === 'CRITICAL'
                        ? 'bg-red-950/60 border-red-500 text-red-200'
                        : b.status === 'WARNING'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-slate-900 border-slate-600 text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">{b.label}</span>
                      <span className="font-bold">{b.text}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 font-mono font-bold">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
              <span>Timestamp: {selectedDoc.timestamp}</span>
              <span className="text-emerald-400 font-bold">LAKEHOUSE COMMITTED</span>
            </div>
          </div>

          {/* Right Pane: Structured JSON View (6 cols) */}
          <div className="lg:col-span-6 bg-slate-950 text-slate-200 rounded-xl p-5 font-mono text-xs flex flex-col justify-between overflow-x-auto min-h-[360px] border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-bold">
                Snowflake Stream Payload (HL7 / JSON)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                SCHEMA LOCKED
              </span>
            </div>

            <pre className="p-3 my-2 text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
              {JSON.stringify(selectedDoc.structuredPayload, null, 2)}
            </pre>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Auto-parsed via Cloudinary Edge Webhook</span>
              <span className="text-white font-bold">Latency: 14ms</span>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
