import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BloodDropSplash3D } from '@/components/landing/BloodDropSplash3D';
import { Button } from '@/components/common/Button';
import { RadarNetwork3D } from '@/features/radar/RadarNetwork3D';

const journey = [
  ['01', 'Donation', 'Voluntary mobile camps & walk-ins', '84 Donors Ready', 'volunteer_activism'],
  ['02', 'Blood Bank', 'Cold-chain inventory custody', '4 Regional Depots', 'local_hospital'],
  ['03', 'Prediction', 'Burn velocity algorithms', 'T+18h Horizon', 'query_stats'],
  ['04', 'Shortage Detected', 'Critical deficit alert triggered', '-18u Deficit', 'crisis_alert'],
  ['05', 'Rebalance', 'Inter-facility corridor transit', '38m Transit ETA', 'local_shipping'],
  ['06', 'Hospital Impact', 'Life-saving clinical continuity', '100% Infusion SLA', 'verified'],
];

export const LandingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf9] text-ink-main selection:bg-red-100 selection:text-primary">
      <header className="landing-nav sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="brand-mark">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] font-extrabold tracking-[-0.04em]">RaktSaathi</span>
                <span className="hidden sm:inline-flex landing-chip">PLATFORM</span>
              </div>
              <span className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400">
                Blood shortage intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-9 text-[12px] font-semibold text-slate-500">
            <a href="#journey" className="landing-nav-link">How it works</a>
            <a href="#radar" className="landing-nav-link">Predictive radar</a>
            <a href="#decision-loop" className="landing-nav-link">Decision loop</a>
            <a href="#response" className="landing-nav-link">Platform</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" size="sm" icon="arrow_forward" iconPosition="right">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[720px] lg:min-h-[790px] flex items-center overflow-hidden">
          <div className="landing-orb landing-orb-a" />
          <div className="landing-orb landing-orb-b" />
          <div className="landing-grid" />

          <div className="relative z-10 max-w-[1440px] w-full mx-auto px-5 sm:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-2 items-center">
              <div className="max-w-[620px]">
                <div className="landing-eyebrow mb-7">
                  <span className="live-dot" />
                  <span>REGIONAL BLOOD SHORTAGE INTELLIGENCE</span>
                </div>

                <h1 className="font-display text-[clamp(3.1rem,6.5vw,6.8rem)] leading-[0.91] tracking-[-0.065em] font-black">
                  Predict the shortage.
                  <span className="block text-primary mt-2">Move the right blood.</span>
                  <span className="block text-slate-300 mt-2">Before it’s too late.</span>
                </h1>

                <p className="mt-8 max-w-[570px] text-[15px] sm:text-[17px] leading-7 text-slate-600">
                  RaktSaathi connects inventory, demand signals and regional logistics to
                  anticipate depletion before a blood bank reaches its safety floor — then
                  turns the signal into a coordinated response.
                </p>

                <div className="flex flex-wrap gap-3 mt-9">
                  <Link to="/auth">
                    <Button variant="primary" size="lg" icon="arrow_forward" iconPosition="right" className="landing-primary-btn">
                      Enter RaktSaathi
                    </Button>
                  </Link>
                  <a href="#journey">
                    <Button variant="secondary" size="lg" icon="play_arrow" className="landing-secondary-btn">
                      See the story
                    </Button>
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                  <div className="landing-stat">
                    <strong>72h</strong><span>forecast horizon</span>
                  </div>
                  <div className="landing-stat">
                    <strong>184ms</strong><span>edge ingestion</span>
                  </div>
                  <div className="landing-stat">
                    <strong>Delhi-NCR</strong><span>demo region</span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[560px] lg:min-h-[650px] flex items-center justify-center">
                <div className="absolute w-[560px] h-[560px] rounded-full border border-red-100/80 landing-orbit" />
                <div className="absolute w-[420px] h-[420px] rounded-full border border-slate-200/80 landing-orbit landing-orbit-slow" />
                <div className="absolute right-[6%] top-[16%] hidden xl:block landing-floating-label">
                  <span>01</span>
                  <b>DROP</b>
                  <small>impact sequence</small>
                </div>
                <div className="absolute left-[3%] bottom-[18%] hidden xl:block landing-floating-label">
                  <span>02</span>
                  <b>RIPPLE</b>
                  <small>signal becomes action</small>
                </div>
                <div className="landing-drop-stage">
                  <BloodDropSplash3D className="h-[570px] lg:h-[650px]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="relative py-24 sm:py-32 bg-white scroll-mt-20">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl">
              <span className="section-kicker">THE RAKTSAATHI LOOP</span>
              <h2 className="section-title">One drop. Six moments. One coordinated response.</h2>
              <p className="section-copy">
                Follow a blood unit from intake to clinical impact. RaktSaathi keeps the
                shortage signal visible while the operational response moves forward.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {journey.map(([num, title, subtitle, metric, icon], index) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`story-card text-left ${activeStep === index ? 'story-card-active' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="story-number">{num}</span>
                    <span className={`material-symbols-outlined story-icon ${index === 3 ? 'text-primary' : ''}`}>{icon}</span>
                  </div>
                  <div className="mt-10">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                  </div>
                  <div className="mt-7 pt-4 border-t border-slate-200/70 flex items-center justify-between">
                    <span>{metric}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-[#f8f7f6] p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="journey-pulse"><span className="material-symbols-outlined">water_drop</span></div>
                <div>
                  <span className="section-kicker">CURRENT SIGNAL</span>
                  <p className="font-display font-bold text-lg">
                    {journey[activeStep][1]} <span className="text-slate-400 font-normal">— {journey[activeStep][2]}</span>
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-primary">{journey[activeStep][3]}</span>
            </div>
          </div>
        </section>

        <section id="radar" className="py-24 sm:py-32 bg-[#f5f4f2] scroll-mt-20 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-12 items-end">
              <div>
                <span className="section-kicker">SEE IT BEFORE IT HAPPENS</span>
                <h2 className="section-title">A shortage is a moving signal, not a spreadsheet cell.</h2>
                <p className="section-copy">
                  The predictive radar turns regional inventory into a spatial picture of
                  deficit, surplus and the corridor between them.
                </p>
                <Link to="/radar" className="inline-flex mt-8">
                  <Button variant="secondary" size="md" icon="arrow_forward" iconPosition="right">
                    Open shortage radar
                  </Button>
                </Link>
              </div>
              <div className="landing-radar-frame">
                <div className="landing-radar-topbar">
                  <span><i /> LIVE DEMO REGION</span>
                  <span>O− / 72H FORECAST</span>
                </div>
                <RadarNetwork3D selectedSerotype="O-" selectedFacilityId="BB-DEL-A" onSelectFacility={() => {}} />
              </div>
            </div>
          </div>
        </section>

        <section id="decision-loop" className="py-24 sm:py-32 bg-white scroll-mt-20">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8">
            <div className="grid lg:grid-cols-[0.55fr_1.45fr] gap-12">
              <div>
                <span className="section-kicker">FROM PREDICTION TO ACTION</span>
                <h2 className="section-title">Intelligence should end in a decision.</h2>
                <p className="section-copy">
                  The same incident follows the operator from forecast to evidence,
                  simulation and coordinated response.
                </p>
              </div>
              <div className="decision-flow">
                {['Prediction', 'Evidence', 'Decision', 'Rebalance', 'Campaign'].map((item, i) => (
                  <div key={item} className="decision-step">
                    <span>0{i + 1}</span>
                    <div>
                      <strong>{item}</strong>
                      <small>{['Detect burn-rate breach', 'Quantify the gap', 'Compare response paths', 'Move available supply', 'Mobilize donor network'][i]}</small>
                    </div>
                    {i < 4 && <span className="material-symbols-outlined decision-arrow">arrow_forward</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="response" className="py-24 sm:py-32 bg-[#fbfaf9] scroll-mt-20">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8">
            <div className="max-w-3xl">
              <span className="section-kicker">ONE PLATFORM, DIFFERENT VIEWS</span>
              <h2 className="section-title">Built so every signal has somewhere to go.</h2>
            </div>
            <div className="mt-12 grid lg:grid-cols-12 gap-5">
              <div className="platform-feature lg:col-span-7">
                <span className="platform-index">01</span>
                <div>
                  <span className="section-kicker text-red-300">SPATIAL LOGISTICS</span>
                  <h3>Blood Banks</h3>
                  <p>See surplus, deficit and the movement corridor between facilities.</p>
                </div>
                <Link to="/blood-banks">Explore directory <span className="material-symbols-outlined">arrow_forward</span></Link>
              </div>
              <div className="platform-tile lg:col-span-5">
                <span className="platform-index">02</span>
                <h3>Hospital Requests</h3>
                <p>Keep STAT and surgical requisitions visible against the inventory they consume.</p>
                <Link to="/requests">Open queue <span className="material-symbols-outlined">arrow_forward</span></Link>
              </div>
              <div className="platform-tile lg:col-span-4">
                <span className="platform-index">03</span>
                <h3>Donor Network</h3>
                <p>Turn proximity and readiness into targeted mobilization waves.</p>
                <Link to="/donor-network">View network <span className="material-symbols-outlined">arrow_forward</span></Link>
              </div>
              <div className="platform-tile lg:col-span-4">
                <span className="platform-index">04</span>
                <h3>Data Ingestion</h3>
                <p>Trace incoming documents and signals through the intelligence pipeline.</p>
                <Link to="/data-ingestion">Inspect stream <span className="material-symbols-outlined">arrow_forward</span></Link>
              </div>
              <div className="platform-tile lg:col-span-4">
                <span className="platform-index">05</span>
                <h3>Campaign Studio</h3>
                <p>Convert a shortage signal into a coordinated donor communication asset.</p>
                <Link to="/campaign-studio">Enter studio <span className="material-symbols-outlined">arrow_forward</span></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950 text-white py-28 sm:py-36">
          <div className="absolute inset-0 landing-cta-grid" />
          <div className="absolute w-[600px] h-[300px] rounded-full bg-red-700/15 blur-[100px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
            <span className="section-kicker text-red-300">THE RESPONSE STARTS BEFORE THE RUNOUT</span>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl font-black tracking-[-0.05em] leading-[0.98]">
              Predict it. Coordinate it. <span className="text-red-400">Respond in time.</span>
            </h2>
            <p className="mt-7 text-slate-300 max-w-2xl mx-auto leading-7">
              RaktSaathi turns shortage intelligence into a clear operational path — from
              the first warning to the action that closes the gap.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/auth"><Button variant="primary" size="lg" icon="arrow_forward" iconPosition="right">Enter RaktSaathi</Button></Link>
              <Link to="/overview"><Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/15 hover:bg-white/15">Launch demo sandbox</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-9">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">water_drop</span>
            <strong className="text-slate-700">RaktSaathi</strong>
            <span>• Blood Shortage Intelligence</span>
          </div>
          <span>Demo Region: Delhi-NCR • 2026</span>
          <div className="flex gap-4"><span>Snowflake DW Core</span><span>Cloudinary Edge</span><span>NBTC Gate</span></div>
        </div>
      </footer>
    </div>
  );
};
