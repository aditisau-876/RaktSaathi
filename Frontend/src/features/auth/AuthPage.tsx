import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BloodDropSplash3D from '@/components/landing/BloodDropSplash3D';
import { Button } from '@/components/common/Button';

type AuthMode = 'signin' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('v.rao@trauma.delhi.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Dr. V. Rao');
  const [facility, setFacility] = useState('Metro Trauma Hub (Bank A)');
  const [role, setRole] = useState('Regional Dispatch Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === 'forgot') {
        setNotification('Password reset instructions dispatched to your institutional address.');
        setTimeout(() => setMode('signin'), 2200);
      } else navigate('/overview');
    }, 650);
  };

  const handleDemo = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/overview');
    }, 450);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-ink-main flex items-stretch">
      <section className="hidden lg:flex lg:w-[52%] relative overflow-hidden auth-visual-pane">
        <div className="absolute inset-0 auth-visual-glow" />
        <div className="absolute inset-0 auth-visual-grid" />

        <div className="relative z-10 w-full p-10 xl:p-14 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="brand-mark"><span className="material-symbols-outlined">water_drop</span></div>
            <div>
              <div className="font-display font-extrabold tracking-[-.04em]">RaktSaathi</div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-[.15em]">Blood shortage intelligence</div>
            </div>
          </Link>

          <div className="relative flex-1 flex flex-col justify-center">
            <div className="max-w-[680px]">
              <div className="auth-visual-shell">
                <BloodDropSplash3D/>
                <div className="auth-visual-caption">
                  <span className="live-dot" />
                  <span>REAL-TIME PROCEDURAL VISUAL</span>
                </div>
              </div>
              <div className="mt-8 max-w-xl">
                <span className="text-[10px] font-mono uppercase tracking-[.16em] text-red-300">THE RAKTSAATHI IMPERATIVE</span>
                <h2 className="mt-3 font-display text-3xl xl:text-4xl font-black tracking-[-.045em] leading-tight">
                  The right blood, at the right time, can change a life.
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Follow the signal from prediction to coordinated response without losing the context of the shortage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/10 text-[9px] font-mono uppercase tracking-[.1em] text-slate-500">
            <span>Demo region • Delhi-NCR</span>
            <span className="flex items-center gap-2"><i className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> engine online</span>
          </div>
        </div>
      </section>

      <section className="w-full lg:w-[48%] min-h-screen flex flex-col">
        <div className="px-5 sm:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            Public portal
          </Link>
          <span className="auth-trust-chip"><span /> Demo environment</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <div className="w-full max-w-[500px]">
            <div className="auth-panel">
              <div className="mb-7">
                <span className="section-kicker">SECURE OPERATIONS ACCESS</span>
                <h1 className="mt-3 font-display text-3xl sm:text-4xl font-black tracking-[-.045em]">
                  {mode === 'signin' ? 'Welcome back.' : mode === 'register' ? 'Request access.' : 'Recover access.'}
                </h1>
                <p className="mt-3 text-sm text-slate-500 leading-6">
                  {mode === 'signin' && 'Enter the command environment and continue the regional shortage response.'}
                  {mode === 'register' && 'Create a personnel credential for your participating facility.'}
                  {mode === 'forgot' && 'We’ll send reset instructions to your institutional address.'}
                </p>
              </div>

              <div className="auth-tabs">
                <button className={mode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
                <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Create account</button>
              </div>

              {notification && (
                <div className="auth-notice">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{notification}</span>
                </div>
              )}

              {mode === 'signin' && (
                <button type="button" onClick={handleDemo} className="demo-access">
                  <span className="demo-access-icon material-symbols-outlined">bolt</span>
                  <span className="flex-1 text-left">
                    <strong>Instant evaluator access</strong>
                    <small>Dr. V. Rao • Regional Dispatch Officer</small>
                  </span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <label className="auth-field"><span>Full official name</span><input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="Dr. A. Sharma" /></label>
                    <label className="auth-field"><span>Affiliated facility / depot</span><input value={facility} onChange={e=>setFacility(e.target.value)} required placeholder="Metro Trauma Hub" /></label>
                    <label className="auth-field"><span>Operational role</span>
                      <select value={role} onChange={e=>setRole(e.target.value)}>
                        <option>Regional Dispatch Officer</option>
                        <option>Blood Bank Operations Director</option>
                        <option>Emergency Surgical Trauma Chief</option>
                        <option>Cold-Chain Logistics Supervisor</option>
                      </select>
                    </label>
                  </>
                )}

                <label className="auth-field">
                  <span>Institutional email</span>
                  <div className="auth-input-wrap"><span className="material-symbols-outlined">mail</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@institution.gov.in" /></div>
                </label>

                {mode !== 'forgot' && (
                  <label className="auth-field">
                    <span className="flex justify-between">
                      Password
                      <button type="button" onClick={() => switchMode('forgot')} className="text-primary hover:underline">Forgot password?</button>
                    </span>
                    <div className="auth-input-wrap"><span className="material-symbols-outlined">lock</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></div>
                  </label>
                )}

                <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} icon="arrow_forward" iconPosition="right" className="w-full !rounded-[14px] !py-3.5">
                  {mode === 'signin' ? 'Sign in to Operations' : mode === 'register' ? 'Submit access request' : 'Send reset instructions'}
                </Button>
              </form>

              {mode === 'forgot' && (
                <button onClick={() => switchMode('signin')} className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-primary">Return to sign in</button>
              )}

              <div className="mt-7 pt-5 border-t border-slate-200/80 flex items-center justify-between gap-4 text-[9px] font-mono uppercase tracking-[.08em] text-slate-400">
                <span>NBTC governance gate</span>
                <span>TLS 1.3 • Demo v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
