import React from 'react';
import { Link } from 'react-router-dom';

export type StepNumber = 1 | 2 | 3 | 4;

interface StepperProps {
  currentStep: StepNumber;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: '01. Prediction', path: '/radar', icon: 'radar' },
    { num: 2, label: '02. Evidence', path: '/decision-center', icon: 'fact_check' },
    { num: 3, label: '03. Decision', path: '/decision-center', icon: 'rule' },
    { num: 4, label: '04. Action', path: '/campaign-studio', icon: 'bolt' },
  ];

  return (
    <nav
      aria-label="Triage Stage Progression"
      className="bg-white border border-slate-200/90 p-1 rounded-xl flex items-center gap-1 shadow-subtle text-xs select-none"
    >
      {steps.map((step, index) => {
        const isActive = currentStep === step.num;
        const isPast = currentStep > step.num;

        return (
          <React.Fragment key={step.num}>
            {index > 0 && <span className="text-slate-300 px-0.5" aria-hidden="true">/</span>}
            <Link
              to={step.path}
              aria-current={isActive ? 'step' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-mono text-[11px] ${
                isActive
                  ? 'bg-primary text-white font-bold shadow-subtle'
                  : isPast
                  ? 'text-ink-main hover:bg-slate-100 font-semibold'
                  : 'text-ink-secondary hover:text-ink-main hover:bg-slate-50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[15px] ${
                  isActive ? 'text-white' : isPast ? 'text-ink-secondary' : 'text-slate-400'
                }`}
                aria-hidden="true"
              >
                {step.icon}
              </span>
              <span>{step.label}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
