import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  isCritical?: boolean;
  elevation?: 1 | 2;
  isTranslucent?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  isCritical = false,
  elevation = 1,
  isTranslucent = false,
}) => {
  const baseClasses = isTranslucent
    ? 'surface-glass'
    : elevation === 2
    ? 'surface-elevated'
    : 'surface-clean';

  const criticalBorder = isCritical
    ? 'border-red-200/90 border-l-4 border-l-primary'
    : '';

  return (
    <div className={`rounded-xl p-5 relative overflow-hidden transition-all ${baseClasses} ${criticalBorder} ${className}`}>
      {children}
    </div>
  );
};
