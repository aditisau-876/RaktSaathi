import React, { useState } from 'react';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { CreativeFormat } from '@/core/types/campaigns';
import { useIncident } from '@/context/IncidentContext';

export const CampaignStudioPage: React.FC = () => {
  const { activeIncident } = useIncident();
  const [activeFormat, setActiveFormat] = useState<CreativeFormat>('1:1_SQUARE');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(5);
  const [isBroadcastDispatched, setIsBroadcastDispatched] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

  // Dynamic campaign params
  const [targetRadius, setTargetRadius] = useState<number>(8);
  const [targetDonors, setTargetDonors] = useState<number>(84);
  const [headline, setHeadline] = useState<string>('CRITICAL DEFICIT: O− NEGATIVE BLOOD NEEDED');
  const [bodyCopy, setBodyCopy] = useState<string>(
    'Metro Trauma Hub (Bank A) is facing an emergency shortage of O− blood within the next 18 hours due to scheduled cardiac surgeries. If you are eligible, your immediate donation can save lives today.'
  );

  const formats: Array<{ id: CreativeFormat; label: string; ratio: string; icon: string }> = [
    { id: '1:1_SQUARE', label: '1:1 Square (WhatsApp / IG)', ratio: 'aspect-square', icon: 'chat' },
    { id: '9:16_STORY', label: '9:16 Story (Reels / Status)', ratio: 'aspect-[9/16]', icon: 'smartphone' },
    { id: '16:9_LANDSCAPE', label: '16:9 Banner (Portal / Press)', ratio: 'aspect-video', icon: 'laptop' },
    { id: 'DOOH_TOTEM', label: 'DOOH Totem (Metro Billboards)', ratio: 'aspect-[9/16]', icon: 'tv' },
  ];

  const generationSteps = [
    { step: 1, label: 'Shortage Signal Ingested', detail: 'Deficit −18u Confirmed at Bank A', delay: 300 },
    { step: 2, label: 'Audience Vector Locked', detail: `${targetDonors} Consented Donors within ${targetRadius}km`, delay: 350 },
    { step: 3, label: 'Creative Copy Assembled', detail: 'Emergency Triage Copy Synthesized', delay: 350 },
    { step: 4, label: 'Cloudinary Multi-Crop', detail: '1:1, 9:16, 16:9 & DOOH Rendered in 184ms', delay: 400 },
    { step: 5, label: 'Broadcast Armed', detail: 'Ready for Instant Multi-Channel Dispatch', delay: 150 },
  ];

  const triggerRegeneration = () => {
    setIsGenerating(true);
    setCurrentStep(1);

    let cumulative = 0;
    generationSteps.forEach((s, idx) => {
      cumulative += s.delay;
      setTimeout(() => {
        setCurrentStep(idx + 1);
        if (idx === generationSteps.length - 1) {
          setIsGenerating(false);
        }
      }, cumulative);
    });
  };

  const handleDeployBroadcast = () => {
    setIsBroadcastDispatched(true);
    setShowConfirmationModal(true);
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Diagnostic Stepper */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-beacon" aria-hidden="true" />
            <span>STAGE 03/04: AUTONOMOUS CAMPAIGN SYNDICATION</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-main tracking-tight">
            Campaign Studio & Multi-Format Syndication
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Shortage detected at Bank A has triggered autonomous campaign generation. Pre-approved emergency creative compiled, formatted, and ready for instant multi-channel dispatch.
          </p>
        </div>

        {/* Narrative Stepper */}
        <Stepper currentStep={4} />
      </section>

      {/* 2. Phased Generation Narrative (No circular spinner) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-beacon" aria-hidden="true" />
            <span className="text-xs font-mono font-bold text-ink-main uppercase tracking-wider">
              Algorithmic Asset Generation Pipeline
            </span>
          </div>
          <button
            onClick={triggerRegeneration}
            disabled={isGenerating}
            className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">autorenew</span>
            <span>Re-compile Pipeline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {generationSteps.map(s => {
            const isDone = currentStep >= s.step;
            const isCurrent = currentStep === s.step && isGenerating;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isCurrent
                    ? 'bg-red-50 border-red-300 text-primary animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-mono font-bold">
                  <span className="text-[10px] uppercase">Step 0{s.step}</span>
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    {isDone ? 'check_circle' : 'pending'}
                  </span>
                </div>
                <div className="font-bold font-display text-[13px]">{s.label}</div>
                <div className="text-[10px] opacity-80 font-mono mt-0.5">{s.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 2-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: Campaign Configuration & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <GlassPanel className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-base text-ink-main">
                Campaign Parameters
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 text-primary font-bold">
                INC-2026-0881
              </span>
            </div>

            {/* Target Blood Group */}
            <div>
              <span className="text-xs font-mono uppercase font-bold text-ink-secondary block mb-1">
                Target Serotype
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white font-mono font-extrabold text-sm shadow-subtle">
                  {activeIncident.bloodGroup} Negative
                </span>
                <span className="text-xs text-ink-secondary">
                  Target Deficit: <strong className="text-ink-main font-bold">18 Units</strong>
                </span>
              </div>
            </div>

            {/* Broadcast Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <label htmlFor="radius-slider" className="font-bold text-ink-secondary uppercase">
                  Broadcast Radius
                </label>
                <span className="font-bold text-primary">{targetRadius} km Corridor</span>
              </div>
              <input
                id="radius-slider"
                type="range"
                min={3}
                max={25}
                value={targetRadius}
                aria-label="Broadcast radius slider in kilometers"
                onChange={e => {
                  const val = Number(e.target.value);
                  setTargetRadius(val);
                  setTargetDonors(Math.round(val * 10.5));
                }}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-secondary font-mono mt-1">
                <span>3 km (Wave 1)</span>
                <span>8 km (Wave 2)</span>
                <span>25 km (Regional Max)</span>
              </div>
            </div>

            {/* Target Donors Readout */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-ink-secondary uppercase font-bold block">
                  Eligible Consented Donors
                </span>
                <span className="text-2xl font-display font-bold text-ink-main mt-0.5 tabular-nums">
                  {targetDonors} Donors
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                91.4% Conversion
              </span>
            </div>

            {/* Headline Editor */}
            <div>
              <label htmlFor="headline-input" className="text-xs font-mono uppercase font-bold text-ink-secondary block mb-1">
                Creative Headline
              </label>
              <input
                id="headline-input"
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans font-semibold border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:border-primary outline-none"
              />
            </div>

            {/* Body Copy Editor */}
            <div>
              <label htmlFor="body-copy-input" className="text-xs font-mono uppercase font-bold text-ink-secondary block mb-1">
                Clinical Message Body
              </label>
              <textarea
                id="body-copy-input"
                rows={3}
                value={bodyCopy}
                onChange={e => setBodyCopy(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:border-primary outline-none leading-relaxed"
              />
            </div>

            {/* Dispatch Channels */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-mono uppercase font-bold text-ink-secondary block">
                Syndication Channels
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary" />
                  <span className="text-ink-main">WhatsApp Push</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary" />
                  <span className="text-ink-main">SMS Gateway</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary" />
                  <span className="text-ink-main">Donor App Alert</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary" />
                  <span className="text-ink-main">Digital Billboards</span>
                </label>
              </div>
            </div>

            {/* One-Click Deploy Button */}
            <div className="pt-2">
              <Button
                variant={isBroadcastDispatched ? 'success' : 'primary'}
                size="lg"
                className="w-full"
                icon={isBroadcastDispatched ? 'check_circle' : 'broadcast_on_personal'}
                onClick={handleDeployBroadcast}
              >
                {isBroadcastDispatched ? 'Broadcast Deployed Live' : 'Deploy Multi-Channel Broadcast'}
              </Button>
            </div>
          </GlassPanel>
        </div>

        {/* Right 7 Cols: Master Creative Preview (Fixed Height Stage) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Format Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-subtle">
            {formats.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setActiveFormat(fmt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeFormat === fmt.id
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-ink-secondary hover:bg-slate-100 hover:text-ink-main'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{fmt.icon}</span>
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>

          {/* Master Creative Fixed-Height Stage (Eliminates Vertical Jump) */}
          <div className="p-6 rounded-2xl bg-slate-100/60 border border-slate-200 shadow-subtle flex items-center justify-center min-h-[560px] h-[560px] overflow-hidden relative">
            {/* The Scaled Preview Mockup */}
            <div
              className={`w-full bg-white border border-red-200 rounded-2xl p-6 shadow-card-elevated relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                activeFormat === '9:16_STORY' || activeFormat === 'DOOH_TOTEM'
                  ? 'max-w-[280px] h-[500px]'
                  : activeFormat === '16:9_LANDSCAPE'
                  ? 'max-w-xl h-[340px]'
                  : 'max-w-[380px] h-[460px]'
              }`}
            >
              {/* Top Urgency Header */}
              <div className="flex items-center justify-between pb-3 border-b border-red-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-subtle">
                    RS
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-xs text-ink-main block leading-none">
                      RaktSaathi Clinical Dispatch
                    </span>
                    <span className="text-[10px] font-mono text-primary font-bold">EMERGENCY APPEAL</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px]">
                  STAT PRIORITY
                </span>
              </div>

              {/* Main Headline & Blood Type Callout */}
              <div className="my-auto text-center space-y-3 py-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-display font-black text-2xl shadow-subtle ring-4 ring-red-100">
                  {activeIncident.bloodGroup}
                </div>
                <h3 className="font-display font-extrabold text-base text-ink-main tracking-tight leading-snug uppercase px-1">
                  {headline}
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed max-w-xs mx-auto line-clamp-3">
                  {bodyCopy}
                </p>
              </div>

              {/* Bottom Logistics & Action Callout */}
              <div className="flex-shrink-0 pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-ink-secondary block uppercase">Hub</span>
                    <span className="font-bold text-ink-main text-[11px] truncate block">
                      Metro Trauma Hub
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-ink-secondary block uppercase">Horizon</span>
                    <span className="font-bold text-primary text-[11px] block">Next 18 Hours</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-ink-secondary">Donation Desk:</span>
                    <span className="text-xs font-mono font-bold text-ink-main">Reception Gate #04</span>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-display font-bold text-xs shadow-subtle flex items-center gap-1">
                    <span>Respond</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dispatch Confirmation Modal */}
      {showConfirmationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-card-elevated border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">campaign</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-xl text-ink-main">
                Campaign Syndicated Successfully
              </h3>
              <p className="text-xs text-ink-secondary">
                Automated multi-channel push dispatched to {targetDonors} eligible O− donors within {targetRadius}km.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Channels Armed:</span>
                <strong className="text-ink-main">WhatsApp, SMS, DOOH</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Edge Render Latency:</span>
                <strong className="text-emerald-700">184 ms</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Broadcast ID:</span>
                <strong className="text-ink-main">CMP-2026-881</strong>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => setShowConfirmationModal(false)}
            >
              Close Confirmation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
