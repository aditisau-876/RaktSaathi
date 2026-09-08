import React from 'react';
import { IncidentSeverity } from '@/core/types/incident';

interface RiskPulseProps {
  severity: IncidentSeverity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  units?: number;
  label?: string;
  sublabel?: string;
  showHalo?: boolean;
}

export const RiskPulse: React.FC<RiskPulseProps> = ({
  severity,
  size = 'md',
  units,
  label = 'O−',
  sublabel,
  showHalo = true,
}) => {
  const isCritical = severity === 'CRITICAL';
  const isWarning = severity === 'WARNING';
  const isStable = severity === 'STABLE';

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
    ? 'risk-pulse-critical bg-red-500/12 ring-2 ring-red-400/25'
    : isWarning
    ? 'risk-pulse-warning bg-amber-500/10 ring-1 ring-amber-400/20'
    : 'risk-pulse-stable bg-emerald-500/8 ring-1 ring-emerald-400/15';

  const coreAnimationClass = isCritical ? 'risk-core-critical' : '';

  const strokeColor = isCritical
    ? 'text-primary'
    : isWarning
    ? 'text-amber-600'
    : 'text-emerald-600';

  const trackColor = 'text-slate-100';

  // SVG stroke parameters
  const strokeWidth = size === 'xl' ? 4 : size === 'lg' ? 3.5 : 3;
  // Circumference for r=42 is 2 * PI * 42 ≈ 263.89
  const strokeDashoffset = isCritical ? 180 : isWarning ? 110 : 40;

  return (
    <div
      className={`relative flex items-center justify-center ${dimensions} select-none`}
      role="status"
      aria-label={`Shortage severity: ${severity}, stock: ${units !== undefined ? `${units} units` : ''} ${label}`}
    >
      {/* 1. Outer Radial Telemetry Halo (Communicates Severity State) */}
      {showHalo && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${haloClass}`}
          aria-hidden="true"
        />
      )}

      {/* 2. Secondary Precision Buffer Ring */}
      <div
        className={`absolute inset-2 rounded-full border bg-white shadow-subtle ${
          isCritical
            ? 'border-red-200/90'
            : isWarning
            ? 'border-amber-200/90'
            : 'border-emerald-200/90'
        } ${coreAnimationClass}`}
        aria-hidden="true"
      />

      {/* 3. Radial Telemetry Arc Meter */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {/* Background Track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        {/* Active Measured Meter */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="264"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${strokeColor}`}
        />
      </svg>

      {/* 4. Core Telemetry Metric */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-2">
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

      {/* 5. Minimal Semantic Status Bead */}
      <div className="absolute -bottom-1 inset-x-0 flex justify-center" aria-hidden="true">
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shadow-subtle border ${
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
