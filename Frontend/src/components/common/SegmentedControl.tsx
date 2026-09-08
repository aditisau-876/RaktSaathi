import React from 'react';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  badge?: string | number;
  alertDot?: boolean;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  label,
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1 text-xs gap-1',
  }[size];

  const buttonPadding = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5';

  return (
    <div
      role="group"
      aria-label={label || 'Filter options'}
      className={`inline-flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl select-none ${sizeClasses} ${className}`}
    >
      {options.map(opt => {
        const isSelected = opt.value === value;

        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isSelected}
            className={`relative flex items-center gap-1.5 rounded-lg font-mono font-bold transition-all ${buttonPadding} ${
              isSelected
                ? 'bg-white text-ink-main shadow-subtle border border-slate-200/90'
                : 'text-ink-secondary hover:text-ink-main hover:bg-slate-200/50'
            }`}
          >
            {opt.alertDot && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            )}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
