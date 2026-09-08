import React from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isWarning?: boolean;
    isCritical?: boolean;
  };
  progressPercent?: number;
  isCritical?: boolean;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  trend,
  progressPercent,
  isCritical = false,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-xl border bg-white shadow-subtle transition-all ${
        isCritical
          ? 'border-red-200/90 border-l-4 border-l-primary'
          : 'border-slate-200/80 hover:border-slate-300'
      } ${className}`}
    >
      {/* 1. Header: Supporting Label & Optional Telemetry Icon */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-secondary truncate">
          {label}
        </span>
        {icon && (
          <span
            className={`material-symbols-outlined text-[17px] ${
              isCritical ? 'text-primary' : 'text-slate-400'
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* 2. Main Number / Metric (Tabular Display) */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span
          className={`font-display font-extrabold tracking-tight tabular-nums text-2xl lg:text-3xl leading-none ${
            isCritical ? 'text-primary' : 'text-ink-main'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-bold text-ink-secondary">
            {unit}
          </span>
        )}
      </div>

      {/* 3. Optional Inline Micro-Progress Meter */}
      {progressPercent !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-primary'
                : progressPercent > 75
                ? 'bg-emerald-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {/* 4. Footer: Contextual Subtext & Status/Trend */}
      {(subtext || trend) && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
          {subtext && (
            <span className="text-ink-secondary text-[11px] truncate">
              {subtext}
            </span>
          )}
          {trend && (
            <span
              className={`font-bold text-[11px] flex-shrink-0 ${
                trend.isCritical
                  ? 'text-primary'
                  : trend.isWarning
                  ? 'text-amber-700'
                  : trend.isPositive
                  ? 'text-emerald-700'
                  : 'text-ink-secondary'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
