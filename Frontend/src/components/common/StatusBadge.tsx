import React from 'react';

export type BadgeVariant = 'critical' | 'warning' | 'stable' | 'stat' | 'urgent' | 'routine' | 'info';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  subtext?: string;
  hasPulseDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  subtext,
  hasPulseDot = false,
}) => {
  const styles: Record<BadgeVariant, { bg: string; border: string; text: string; dot: string }> = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      dot: 'bg-red-600',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      dot: 'bg-amber-600',
    },
    stable: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      dot: 'bg-emerald-600',
    },
    stat: {
      bg: 'bg-primary text-white',
      border: 'border-red-800',
      text: 'text-white',
      dot: 'bg-white',
    },
    urgent: {
      bg: 'bg-amber-600 text-white',
      border: 'border-amber-700',
      text: 'text-white',
      dot: 'bg-white',
    },
    routine: {
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      text: 'text-slate-800',
      dot: 'bg-slate-500',
    },
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      dot: 'bg-sky-600',
    },
  };

  const style = styles[variant] || styles.routine;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider ${style.bg} ${style.border} ${style.text} shadow-subtle select-none`}
    >
      {hasPulseDot && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className={`animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
        </span>
      )}
      <span>{label}</span>
      {subtext && <span className="opacity-80 font-normal">({subtext})</span>}
    </span>
  );
};
