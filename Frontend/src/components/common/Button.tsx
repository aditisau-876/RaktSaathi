import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-[13px] gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-primary hover:bg-primary-hover active:bg-primary-dark text-white border border-red-700/60 shadow-xs ring-offset-2 focus:ring-2 focus:ring-primary',
    secondary:
      'bg-white hover:bg-slate-50 text-ink-main border border-slate-200/90 shadow-xs hover:border-slate-300',
    ghost:
      'bg-transparent hover:bg-slate-100 text-ink-muted hover:text-ink-main border border-transparent',
    danger:
      'bg-red-600 hover:bg-red-700 text-white border border-red-800 shadow-xs',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-800 shadow-xs',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-[17px]">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-[17px]">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
