import React, { useState } from 'react';
import { IncidentSeverity } from '@/core/types/incident';

interface RiskPulseProps {
  severity: IncidentSeverity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  units?: number;
  mandatedFloor?: number;
  label?: string;
  sublabel?: string;
  showHalo?: boolean;
}

export const RiskPulse: React.FC<RiskPulseProps> = ({
  severity,
  size = 'md',
  units,
  mandatedFloor = 26,
  label = 'O−',
  sublabel,
  showHalo = true,
}) => {
  const isCritical = severity === 'CRITICAL';
  const isWarning = severity === 'WARNING';
  const isStable = severity === 'STABLE';

  // Mouse tilt state for subtle 3D depth reaction
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (size === 'sm') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14; // max +-7 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Dimension scaling
  const dimensions = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-56 h-56',
  }[size];

  const textSize = {
    sm: 'text-sm font-bold',
    md: 'text-2xl font-extrabold',
    lg: 'text-4xl font-extrabold',
    xl: 'text-5xl font-extrabold',
  }[size];

  const haloClass = isCritical
    ? 'risk-pulse-critical bg-red-500/15 ring-2 ring-red-400/30'
    : isWarning
    ? 'risk-pulse-warning bg-amber-500/10 ring-1 ring-amber-400/20'
    : 'risk-pulse-stable bg-emerald-500/8 ring-1 ring-emerald-400/15';

  const strokeColor = isCritical
    ? 'text-primary'
    : isWarning
    ? 'text-amber-600'
    : 'text-emerald-600';

  // Calculate proportional fill based on units vs floor
  const safeUnits = units !== undefined ? units : (isCritical ? 8 : isWarning ? 12 : 32);
  const liquidPercent = Math.min(100, Math.round((safeUnits / Math.max(mandatedFloor, 1)) * 100));

  // Gauge arc parameters (r = 42, circumference ≈ 263.89)
  const strokeDashoffset = Math.max(20, Math.min(250, 264 - (liquidPercent / 100) * 200));

  // Calibrated radial tick marks around the perimeter
  const tickCount = size === 'sm' ? 12 : 24;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360;
    const isFloorMarker = Math.abs(angle - 210) < 15; // Represents the ~70% mandated safety mark
    return { angle, isFloorMarker };
  });

  return (
    <div
      className={`relative flex items-center justify-center ${dimensions} select-none cursor-default transition-transform duration-300 ease-out`}
      role="status"
      aria-label={`Shortage severity: ${severity}, stock: ${units !== undefined ? `${units} units` : ''} ${label}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 1. Volumetric Multi-Tier Depth Layer: Outer Ambient Pulsing Halo */}
      {showHalo && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${haloClass}`}
          aria-hidden="true"
        />
      )}

      {/* 2. Outer Precision Bezel (Machined Porcelain / Titanium Ring with shadow) */}
      <div
        className={`absolute inset-1.5 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] ${
          isCritical
            ? 'border-red-200/90 shadow-red-500/10'
            : isWarning
            ? 'border-amber-200/90'
            : 'border-emerald-200/90'
        }`}
        aria-hidden="true"
      />

      {/* 3. Calibrated Tick Ring (Surgical Instrument Dial) */}
      {size !== 'sm' && (
        <svg
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none opacity-40"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {ticks.map((t, idx) => {
            const rad = (t.angle * Math.PI) / 180;
            const x1 = 50 + 44 * Math.cos(rad);
            const y1 = 50 + 44 * Math.sin(rad);
            const x2 = 50 + (t.isFloorMarker ? 38 : 41) * Math.cos(rad);
            const y2 = 50 + (t.isFloorMarker ? 38 : 41) * Math.sin(rad);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={t.isFloorMarker ? (isCritical ? '#93000B' : '#0F172A') : '#64748B'}
                strokeWidth={t.isFloorMarker ? 2.5 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {/* 4. Radial Telemetry Arc Gauge */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={size === 'xl' ? 4 : size === 'lg' ? 3.5 : 3}
          className="text-slate-100"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={size === 'xl' ? 4 : size === 'lg' ? 3.5 : 3}
          strokeDasharray="264"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${strokeColor}`}
        />
      </svg>

      {/* 5. Recessed Concave Liquid Chamber with Specular Glaze */}
      <div
        className={`absolute inset-4 rounded-full overflow-hidden flex flex-col justify-end bg-slate-900/[0.02] shadow-[inset_0_4px_8px_rgba(0,0,0,0.12),inset_0_-2px_4px_rgba(255,255,255,0.8)] border ${
          isCritical
            ? 'border-red-100'
            : isWarning
            ? 'border-amber-100'
            : 'border-emerald-100'
        }`}
        aria-hidden="true"
      >
        {/* Volumetric Liquid Fill Layer */}
        <div
          className={`w-full transition-all duration-700 ease-out relative ${
            isCritical
              ? 'bg-gradient-to-t from-red-600/25 via-red-500/15 to-red-400/5'
              : isWarning
              ? 'bg-gradient-to-t from-amber-600/20 via-amber-500/10 to-transparent'
              : 'bg-gradient-to-t from-emerald-600/18 via-emerald-500/10 to-transparent'
          }`}
          style={{ height: `${Math.min(92, Math.max(12, liquidPercent * 0.75))}%` }}
        >
          {/* Liquid Meniscus Surface Glow Line */}
          <div
            className={`absolute top-0 inset-x-0 h-0.5 shadow-sm ${
              isCritical
                ? 'bg-red-500/70 shadow-red-500/50'
                : isWarning
                ? 'bg-amber-500/60'
                : 'bg-emerald-500/50'
            }`}
          />
        </div>

        {/* Specular Glaze Reflection */}
        <div
          className="absolute top-1 left-3 right-3 h-1/3 rounded-t-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 6. Core Telemetry Metric (Foreground with Z-Depth) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-2"
        style={{ transform: 'translateZ(12px)' }}
      >
        {units !== undefined && (
          <span
            className={`font-display tracking-tight leading-none tabular-nums ${textSize} ${
              isCritical
                ? 'text-primary'
                : isWarning
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {units}u
          </span>
        )}
        <span
          className={`font-mono font-bold uppercase tracking-wider text-ink-main mt-0.5 ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-wider mt-0.5 ${
              isCritical
                ? 'text-primary'
                : isWarning
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {sublabel}
          </span>
        )}
      </div>

      {/* 7. Minimal Semantic Status Bead */}
      <div
        className="absolute -bottom-1 inset-x-0 flex justify-center"
        aria-hidden="true"
        style={{ transform: 'translateZ(16px)' }}
      >
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shadow-subtle border backdrop-blur-sm ${
            isCritical
              ? 'bg-red-50 text-primary border-red-200'
              : isWarning
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Nominal'}
        </span>
      </div>
    </div>
  );
};
