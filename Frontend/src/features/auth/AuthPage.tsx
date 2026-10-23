
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';

type AuthMode = 'signin' | 'register' | 'forgot';

const workflow = [
  {
    number: '01',
    title: 'Detect',
    description: 'Identify emerging blood shortages.',
    icon: 'query_stats',
  },
  {
    number: '02',
    title: 'Coordinate',
    description: 'Connect hospitals and blood banks.',
    icon: 'hub',
  },
  {
    number: '03',
    title: 'Respond',
    description: 'Prioritise the next critical action.',
    icon: 'emergency',
  },
];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [facility, setFacility] = useState('');
  const [role, setRole] = useState('Regional Dispatch Officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setNotification(null);

    // Demo-only flow. Replace with backend authentication
    // before using this page for real accounts.
    window.setTimeout(() => {
      setIsSubmitting(false);

      if (mode === 'forgot') {
        setNotification(
          'Demo only: password reset is not connected to a backend yet.',
        );
        return;
      }

      if (mode === 'register') {
        setNotification(
          'Demo only: account registration is not connected to a backend yet.',
        );
        return;
      }

      navigate('/overview');
    }, 500);
  };

  const handleDemo = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate('/overview');
    }, 300);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setNotification(null);
  };

  return (
    <main className="flex min-h-screen items-stretch bg-[#faf8f7] text-slate-900">
      {/* Left: RaktSaathi identity and operations overview */}
      <section className="relative hidden w-[52%] flex-col overflow-hidden bg-[#310b16] text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 78% 15%, rgba(190,35,62,.25), transparent 42%), radial-gradient(ellipse at 8% 90%, rgba(128,20,42,.35), transparent 45%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col p-10 xl:p-14">
          <Link to="/" className="flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-rose-300">
              <span className="material-symbols-outlined text-[27px]">
                water_drop
              </span>
            </div>

            <div>
              <div className="font-display text-xl font-extrabold tracking-[-.04em]">
                RaktSaathi
              </div>
              <div className="mt-0.5 text-[9px] font-mono uppercase tracking-[.16em] text-rose-200/65">
                Blood shortage intelligence
              </div>
            </div>
          </Link>

          <div className="flex flex-1 flex-col justify-center py-12">
            <div className="max-w-[600px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/[0.08] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-[.15em] text-rose-100">
                  From shortage signal to response
                </span>
              </div>

              <h1 className="mt-7 max-w-[570px] font-display text-4xl font-black leading-[1.12] tracking-[-.05em] xl:text-5xl">
                Every unit matters.
                <span className="mt-2 block text-rose-300">
                  Every response counts.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-rose-100/65">
                Bring shortage signals, hospital needs and blood-bank
                coordination into one clear operational picture.
              </p>

              {/* Blood group visual — CSS and text only; no splash image */}
              <div className="mt-9 rounded-3xl border border-white/10 bg-white/[0.055] p-5 xl:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.17em] text-rose-200/65">
                      Blood group intelligence
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      Monitor. Prioritise. Respond.
                    </h2>
                  </div>

                  <span className="material-symbols-outlined text-3xl text-rose-300">
                    monitoring
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { group: 'A+', tone: 'border-rose-300/25' },
                    { group: 'B+', tone: 'border-rose-300/25' },
                    { group: 'AB+', tone: 'border-rose-300/25' },
                    { group: 'O−', tone: 'border-rose-300/60' },
                  ].map((item) => (
                    <div
                      key={item.group}
                      className={`flex min-h-[74px] flex-col items-center justify-center rounded-2xl border ${item.tone} bg-[#4a1221]`}
                    >
                      <span className="text-xl font-black tracking-tight text-white xl:text-2xl">
                        {item.group}
                      </span>
                      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-rose-200/60">
                        Blood group
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-300/15 bg-[#250710]/65 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                    <span className="material-symbols-outlined">
                      account_tree
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      One coordinated response
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-rose-100/55">
                      Shortage intelligence designed to support timely
                      operational decisions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {workflow.map((step) => (
                  <div key={step.number} className="flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-rose-300">
                      <span className="material-symbols-outlined text-[20px]">
                        {step.icon}
                      </span>
                    </span>

                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-rose-300/55">
                          {step.number}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-rose-100/55">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[9px] font-mono uppercase tracking-[.1em] text-rose-100/45">
            <span>RaktSaathi · Operations platform</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Demonstration environment
            </span>
          </div>
        </div>
      </section>

      {/* Right: authentication form */}
      <section className="flex min-h-screen w-full flex-col lg:w-[48%]">
        <div className="flex items-center justify-between gap-3 px-5 py-6 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#8f1028]"
          >
            <span className="material-symbols-outlined text-[17px]">
              arrow_back
            </span>
            Public portal
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Demo environment
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[500px]">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_rgba(60,15,28,.07)] sm:p-9">
              <div className="mb-7">
                <span className="text-[10px] font-bold uppercase tracking-[.17em] text-[#a51d37]">
                  Secure operations access
                </span>

                <h2 className="mt-3 font-display text-3xl font-black tracking-[-.045em] sm:text-4xl">
                  {mode === 'signin'
                    ? 'Welcome back.'
                    : mode === 'register'
                      ? 'Request access.'
                      : 'Recover access.'}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {mode === 'signin' &&
                    'Sign in to continue your regional shortage response.'}
                  {mode === 'register' &&
                    'Submit your details to request access for your facility.'}
                  {mode === 'forgot' &&
                    'Enter your institutional email to request password-reset instructions.'}
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                    mode === 'signin'
                      ? 'bg-white text-[#8f1028] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => switchMode('signin')}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                    mode === 'register'
                      ? 'bg-white text-[#8f1028] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => switchMode('register')}
                >
                  Create account
                </button>
              </div>

              {notification && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
                >
                  <span className="material-symbols-outlined text-lg">
                    info
                  </span>
                  <span>{notification}</span>
                </div>
              )}

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={isSubmitting}
                  className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-[#fff8f8] p-4 text-left transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8f1028] text-white">
                    <span className="material-symbols-outlined">bolt</span>
                  </span>

                  <span className="flex-1">
                    <strong className="block text-sm font-bold text-slate-900">
                      Explore demo dashboard
                    </strong>
                    <small className="mt-1 block text-xs text-slate-500">
                      Preview the operations interface without an account.
                    </small>
                  </span>

                  <span className="material-symbols-outlined text-slate-400">
                    arrow_forward
                  </span>
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-700">
                        Full official name
                      </span>
                      <input
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Dr. A. Sharma"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-700">
                        Affiliated facility / depot
                      </span>
                      <input
                        autoComplete="organization"
                        value={facility}
                        onChange={(e) => setFacility(e.target.value)}
                        required
                        placeholder="Hospital or blood-bank name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-slate-700">
                        Operational role
                      </span>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      >
                        <option>Regional Dispatch Officer</option>
                        <option>Blood Bank Operations Director</option>
                        <option>Emergency Surgical Trauma Chief</option>
                        <option>Cold-Chain Logistics Supervisor</option>
                      </select>
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    Institutional email
                  </span>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                      mail
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.org"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                </label>

                {mode !== 'forgot' && (
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-700">
                      Password
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="font-semibold text-[#a51d37] hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </span>

                    <div className="relative">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                        lock
                      </span>
                      <input
                        type="password"
                        autoComplete={
                          mode === 'register'
                            ? 'new-password'
                            : 'current-password'
                        }
                        required
                        minLength={mode === 'register' ? 8 : undefined}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === 'register'
                            ? 'Create a password'
                            : 'Enter your password'
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />
                    </div>
                  </label>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  icon="arrow_forward"
                  iconPosition="right"
                  className="w-full !rounded-[14px] !py-3.5"
                >
                  {mode === 'signin'
                    ? 'Sign in to Operations'
                    : mode === 'register'
                      ? 'Submit access request'
                      : 'Send reset instructions'}
                </Button>
              </form>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-[#8f1028]"
                >
                  Return to sign in
                </button>
              )}

              <div className="mt-7 border-t border-slate-200 pt-5">
                <div className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                  <span className="material-symbols-outlined text-lg text-slate-400">
                    shield
                  </span>
                  <p>
                    Demonstration interface. Account authentication,
                    registration and password recovery require backend
                    integration before production use.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 text-[9px] font-mono uppercase tracking-[.08em] text-slate-400">
                  <span>RaktSaathi</span>
                  <span>Demo v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
