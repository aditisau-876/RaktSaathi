import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { MOCK_DOCUMENTS } from '@/data/mockDocuments';
import { DocumentArtifact } from '@/core/types/ingestion';

export const DataIngestionPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    MOCK_DOCUMENTS[0]?.id ?? '',
  );

  const selectedDoc: DocumentArtifact | undefined = MOCK_DOCUMENTS.find(
    (document) => document.id === selectedDocId,
  );

  const documentOptions = MOCK_DOCUMENTS.map((document, index) => ({
    value: document.id,
    label: `${index + 1}. ${document.title}`,
  }));

  const stages = [
    {
      step: '01',
      title: 'Data Ingestion',
      description:
        'Receive source documents such as triage sheets, requisitions and donation logs.',
      detail: 'INPUT',
      icon: 'upload_file',
      color: 'text-slate-600',
      background: 'bg-slate-100',
    },
    {
      step: '02',
      title: 'Field Extraction',
      description:
        'Extract relevant fields from document content using OCR or configured parsers.',
      detail: 'EXTRACTION',
      icon: 'document_scanner',
      color: 'text-sky-700',
      background: 'bg-sky-50',
    },
    {
      step: '03',
      title: 'Validation',
      description:
        'Check extracted values against configured validation rules before acceptance.',
      detail: 'QUALITY CHECK',
      icon: 'fact_check',
      color: 'text-emerald-700',
      background: 'bg-emerald-50',
    },
    {
      step: '04',
      title: 'Structured Data',
      description:
        'Represent validated information in a structured format for downstream use.',
      detail: 'TRANSFORMATION',
      icon: 'database',
      color: 'text-violet-700',
      background: 'bg-violet-50',
    },
    {
      step: '05',
      title: 'Downstream Use',
      description:
        'Make accepted data available to connected inventory and shortage-management workflows.',
      detail: 'INTEGRATION',
      icon: 'account_tree',
      color: 'text-rose-700',
      background: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="border-b border-slate-200 pb-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary">
              <span
                className="material-symbols-outlined text-[17px]"
                aria-hidden="true"
              >
                document_scanner
              </span>
              <span>DATA MANAGEMENT / DOCUMENT INGESTION</span>
            </div>

            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-main sm:text-3xl">
              Data Ingestion &amp; Validation
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
              Review source documents, inspect extracted fields and examine
              their structured representation before connecting the ingestion
              workflow to inventory and shortage-management services.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 lg:self-auto">
            <span
              className="material-symbols-outlined text-[17px] text-amber-700"
              aria-hidden="true"
            >
              science
            </span>
            <span className="text-xs font-semibold text-amber-800">
              Sample document workspace
            </span>
          </div>
        </div>
      </section>

      {/* Process overview */}
      <GlassPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Workflow Overview
            </span>
            <h2 className="mt-1 font-display text-lg font-bold text-ink-main">
              From Source Document to Structured Data
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              The logical stages of the ingestion workflow.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Architecture overview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.step}>
              <div className="relative flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stage.background} ${stage.color}`}
                  >
                    <span
                      className="material-symbols-outlined text-[21px]"
                      aria-hidden="true"
                    >
                      {stage.icon}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    {stage.step}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-ink-main">
                  {stage.title}
                </h3>

                <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-muted">
                  {stage.description}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span
                    className={`text-[9px] font-bold tracking-[0.1em] ${stage.color}`}
                  >
                    {stage.detail}
                  </span>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div
                  className="hidden items-center justify-center text-slate-300 xl:flex"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span
            className="material-symbols-outlined mt-0.5 text-base text-slate-500"
            aria-hidden="true"
          >
            info
          </span>
          <p className="text-xs leading-relaxed text-slate-600">
            This diagram describes the intended processing flow. It does not
            indicate that each stage is currently running or connected to a
            live OCR engine, database or alert service.
          </p>
        </div>
      </GlassPanel>

      {/* Document inspection workbench */}
      <GlassPanel elevation={2} className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Document Workbench
            </span>

            <h2 className="font-display text-lg font-bold text-ink-main">
              Document Preview &amp; Structured Payload
            </h2>

            <p className="max-w-2xl text-xs leading-relaxed text-ink-muted">
              Select a sample artifact to inspect its document fields,
              validation labels and associated structured payload.
            </p>
          </div>

          {documentOptions.length > 0 && (
            <div className="w-full lg:max-w-sm">
              <SegmentedControl
                options={documentOptions}
                value={selectedDocId}
                onChange={setSelectedDocId}
                size="sm"
                label="Select sample document"
              />
            </div>
          )}
        </div>

        {!selectedDoc ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <span
              className="material-symbols-outlined text-3xl text-slate-400"
              aria-hidden="true"
            >
              description
            </span>
            <h3 className="mt-3 text-sm font-semibold text-ink-main">
              No sample documents available
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
              Add document artifacts to the sample document collection to
              populate this workbench.
            </p>
          </div>
        ) : (
          <>
            {/* Selected artifact information */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Artifact ID
                </div>
                <div className="mt-1 break-all font-mono text-xs font-bold text-ink-main">
                  {selectedDoc.id}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Source
                </div>
                <div className="mt-1 break-words text-xs font-semibold text-ink-main">
                  {selectedDoc.source}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Sample OCR Confidence
                </div>
                <div className="mt-1 text-xs font-semibold text-ink-main">
                  {selectedDoc.ocrConfidence}%
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Value supplied by the sample artifact
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
              {/* Document preview */}
              <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-lg text-slate-500"
                      aria-hidden="true"
                    >
                      article
                    </span>
                    <h3 className="text-xs font-bold text-ink-main">
                      Source Document
                    </h3>
                  </div>

                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Sample
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                        Document Artifact
                      </span>
                      <span className="font-mono text-[9px] text-slate-500">
                        {selectedDoc.id}
                      </span>
                    </div>

                    <h4 className="mt-4 text-sm font-bold leading-relaxed text-white">
                      {selectedDoc.title}
                    </h4>

                    <div className="mt-4 space-y-2">
                      {selectedDoc.boundingBoxes.map((box) => {
                        const isCritical = box.status === 'CRITICAL';
                        const isWarning = box.status === 'WARNING';

                        const boxStyle = isCritical
                          ? 'border-red-400/50 bg-red-950/40'
                          : isWarning
                            ? 'border-amber-400/50 bg-amber-950/30'
                            : 'border-slate-600 bg-slate-800/80';

                        const statusStyle = isCritical
                          ? 'text-red-300'
                          : isWarning
                            ? 'text-amber-300'
                            : 'text-emerald-300';

                        return (
                          <div
                            key={box.id}
                            className={`rounded-lg border p-3 ${boxStyle}`}
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                              <div className="min-w-0">
                                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                  {box.label}
                                </div>
                                <div className="mt-1 break-words text-xs font-semibold leading-relaxed text-slate-100">
                                  {box.text}
                                </div>
                              </div>

                              <span
                                className={`w-fit shrink-0 rounded-md bg-black/20 px-2 py-1 font-mono text-[9px] font-bold ${statusStyle}`}
                              >
                                {box.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedDoc.boundingBoxes.length === 0 && (
                      <p className="py-6 text-center text-xs text-slate-400">
                        No extracted field examples are available for this
                        artifact.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-start justify-between gap-2 border-t border-slate-200 pt-3">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                        Artifact timestamp
                      </div>
                      <div className="mt-1 break-words font-mono text-[10px] text-slate-600">
                        {selectedDoc.timestamp}
                      </div>
                    </div>

                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-800">
                      Preview only
                    </span>
                  </div>
                </div>
              </section>

              {/* Structured payload */}
              <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="material-symbols-outlined text-lg text-slate-500"
                      aria-hidden="true"
                    >
                      data_object
                    </span>
                    <h3 className="truncate text-xs font-bold text-ink-main">
                      Structured Payload
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-semibold text-slate-600">
                    JSON
                  </span>
                </div>

                <div className="flex flex-1 flex-col bg-[#101827]">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <span className="text-[10px] text-slate-400">
                      Sample structured representation
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      {selectedDoc.id}
                    </span>
                  </div>

                  <pre className="min-h-[280px] flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-emerald-300 sm:p-5">
                    {JSON.stringify(
                      selectedDoc.structuredPayload,
                      null,
                      2,
                    )}
                  </pre>

                  <div className="border-t border-white/10 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span
                        className="material-symbols-outlined text-sm text-slate-400"
                        aria-hidden="true"
                      >
                        info
                      </span>
                      <p className="text-[10px] leading-relaxed text-slate-400">
                        This payload is read from the selected sample artifact.
                        Displaying it here does not confirm database
                        persistence, schema validation or downstream delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </GlassPanel>

      {/* Implementation status */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <span
            className="material-symbols-outlined text-lg"
            aria-hidden="true"
          >
            integration_instructions
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-ink-main">
            Backend integration
          </h3>
          <p className="text-xs leading-relaxed text-ink-muted">
            This page currently uses sample documents. Live ingestion requires
            a connected document-upload or ingestion API, server-side
            extraction and validation results, and a real processing status
            response. No document is uploaded or processed by this page.
          </p>
        </div>
      </div>
    </div>
  );
};
