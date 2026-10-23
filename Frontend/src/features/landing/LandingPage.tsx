
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { RadarNetwork3D } from '@/features/radar/RadarNetwork3D';

const journey = [
  ['01', 'Donation', 'Voluntary mobile camps and walk-ins', 'Donation intake', 'volunteer_activism'],
  ['02', 'Blood Bank', 'Cold-chain inventory management', 'Stock visibility', 'local_hospital'],
  ['03', 'Prediction', 'Forecast demand and stock depletion', 'Demand forecast', 'query_stats'],
  ['04', 'Shortage Detected', 'Identify a potential inventory deficit', 'Potential deficit', 'crisis_alert'],
  ['05', 'Rebalance', 'Coordinate supply between facilities', 'Transfer planning', 'local_shipping'],
  ['06', 'Hospital Impact', 'Support timely, coordinated response', 'Response follow-up', 'verified'],
];

const decisionSteps = [
  ['Prediction', 'Detect a potential shortage'],
  ['Evidence', 'Understand stock and demand'],
  ['Decision', 'Compare response options'],
  ['Coordination', 'Review supply movement'],
  ['Outreach', 'Prepare targeted campaigns'],
];

const platformItems = [
  {
    number: '01',
    title: 'Blood Banks',
    description: 'Review facility inventory, potential shortages and available supply.',
    link: '/blood-banks',
    action: 'Explore directory',
    icon: 'local_hospital',
    featured: true,
  },
  {
    number: '02',
    title: 'Hospital Requests',
    description: 'Track requests, urgency, required units and fulfillment status.',
    link: '/requests',
    action: 'Open requests',
    icon: 'clinical_notes',
  },
  {
    number: '03',
    title: 'Donor Network',
    description: 'Support consent-based outreach and donor coordination.',
    link: '/donor-network',
    action: 'View network',
    icon: 'groups',
  },
  {
    number: '04',
    title: 'Data Ingestion',
    description: 'Review incoming documents, extracted fields and import status.',
    link: '/data-ingestion',
    action: 'Inspect data',
    icon: 'database',
  },
  {
    number: '05',
    title: 'Campaign Studio',
    description: 'Prepare donation campaign materials for review and sharing.',
    link: '/campaign-studio',
    action: 'Open studio',
    icon: 'campaign',
  },
];

export const LandingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <div className="rakt-landing min-h-screen overflow-x-hidden bg-white text-slate-800 selection:bg-red-100 selection:text-red-900">
      <style>{`
        .rakt-landing {
          --rakt-red: #b91c35;
          --rakt-red-dark: #8f1027;
          --rakt-ink: #24151a;
          --rakt-muted: #69717e;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 15px;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .rakt-landing .font-display,
        .rakt-landing .section-title,
        .rakt-landing h1,
        .rakt-landing h2,
        .rakt-landing h3 {
          font-family: Inter, "Segoe UI", Arial, ui-sans-serif, system-ui, sans-serif !important;
          letter-spacing: -0.015em !important;
          font-stretch: normal;
          font-kerning: normal;
          overflow-wrap: normal;
        }

        .rakt-landing h1,
        .rakt-landing h2,
        .rakt-landing h3 {
          text-wrap: balance;
        }

        /* Hero: deliberately balanced, with the visual supporting the copy. */
        .rakt-landing .hero-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(ellipse at 78% 42%, rgba(150, 0, 28, .22), transparent 38%),
            linear-gradient(115deg, #100307 0%, #1b050b 55%, #0b0205 100%);
        }

        .rakt-landing .hero-inner {
          width: min(100%, 1440px);
          margin-inline: auto;
          padding: clamp(36px, 5vw, 72px) clamp(20px, 4vw, 56px);
        }

        .rakt-landing .hero-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(300px, .92fr);
          align-items: center;
          gap: clamp(24px, 4vw, 64px);
        }

        .rakt-landing .hero-copy {
          position: relative;
          z-index: 2;
          min-width: 0;
          max-width: 680px;
        }

        .rakt-landing .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: #ff5268;
          box-shadow: 0 0 0 4px rgba(255, 82, 104, .12);
        }

        .rakt-landing .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
          border: 1px solid rgba(255, 180, 192, .24);
          border-radius: 999px;
          background: rgba(100, 0, 20, .28);
          padding: 9px 14px;
          color: #ffdce2;
          font-size: 12px;
          font-weight: 650;
          letter-spacing: .025em;
        }

        .rakt-landing .hero-title {
          max-width: 720px;
          margin: 0;
          color: #fff;
          font-size: clamp(2.55rem, 5.1vw, 4.75rem);
          font-weight: 780;
          line-height: 1.06;
          letter-spacing: -.035em !important;
          text-wrap: balance;
        }

        .rakt-landing .hero-title-accent {
          display: block;
          margin-top: 8px;
          color: #ff5368;
        }

        .rakt-landing .hero-description {
          max-width: 560px;
          margin-top: 24px;
          color: rgba(255,255,255,.76);
          font-size: clamp(15px, 1.2vw, 18px);
          line-height: 1.8;
        }

        .rakt-landing .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 30px;
        }

        .rakt-landing .hero-note {
          max-width: 520px;
          margin-top: 23px;
          color: rgba(255,255,255,.48);
          font-size: 12px;
          line-height: 1.7;
        }

        .rakt-landing .hero-art {
          position: relative;
          display: grid;
          width: 100%;
          min-width: 0;
          place-items: center;
        }

        .rakt-landing .hero-art::before {
          position: absolute;
          inset: 15%;
          border-radius: 50%;
          background: rgba(176, 0, 35, .18);
          filter: blur(55px);
          content: "";
          pointer-events: none;
        }

        .rakt-landing .hero-splash-wrap {
          position: relative;
          width: min(100%, 500px);
          aspect-ratio: 1 / 1;
          isolation: isolate;
        }

        .rakt-landing .hero-splash-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;

          transform: scale(2.0); /* Increase size by 30% */

          user-select: none;
          pointer-events: none;
          mix-blend-mode: screen;
          filter: saturate(1.03) contrast(1.03);
        }

        .rakt-landing .hero-splash-message {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          pointer-events: none;
        }

        .rakt-landing .hero-splash-message p {
          max-width: 310px;
          margin: 0;
          color: #fff;
          font-size: clamp(1.35rem, 2.4vw, 2rem);
          font-weight: 750;
          line-height: 1.2;
          letter-spacing: -.02em;
          text-shadow: 0 2px 14px rgba(0,0,0,.95);
          text-wrap: balance;
        }

        @media (max-width: 760px) {
          .rakt-landing .hero-inner {
            padding: 38px 22px 32px;
          }

          .rakt-landing .hero-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }

          .rakt-landing .hero-copy {
            max-width: 640px;
          }

          .rakt-landing .hero-eyebrow {
            margin-bottom: 20px;
          }

          .rakt-landing .hero-title {
            font-size: clamp(2.45rem, 9vw, 3.6rem);
          }

          .rakt-landing .hero-description {
            margin-top: 18px;
            font-size: 15px;
            line-height: 1.75;
          }

          .rakt-landing .hero-actions {
            margin-top: 23px;
          }

          .rakt-landing .hero-note {
            margin-top: 17px;
          }

          .rakt-landing .hero-art {
            margin-top: 0;
          }

          .rakt-landing .hero-splash-wrap {
            width: min(100%, 390px);
          }

          .rakt-landing .hero-splash-message p {
            max-width: 245px;
            font-size: clamp(1.25rem, 5.5vw, 1.7rem);
          }
        }

        .rakt-landing .section-title {
          margin-top: 14px;
          color: #24151a;
          font-size: clamp(2rem, 3.3vw, 3.25rem);
          font-weight: 750;
          line-height: 1.13;
        }

        .rakt-landing .section-copy {
          margin-top: 17px;
          max-width: 660px;
          color: #69717e;
          font-size: 15px;
          line-height: 1.85;
          letter-spacing: 0;
        }

        .rakt-landing .section-kicker {
          color: #a61b35;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: .11em;
          line-height: 1.6;
        }

        .rakt-landing .landing-nav {
          border-bottom: 1px solid rgba(148, 33, 55, .09);
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(16px);
        }

        .rakt-landing .landing-nav-link {
          color: #606875;
          transition: color .2s ease;
        }

        .rakt-landing .landing-nav-link:hover {
          color: #b91c35;
        }

        .rakt-landing .brand-mark {
          display: grid;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(145deg, #c52a45, #8f1027);
          color: white;
          box-shadow: 0 5px 14px rgba(157, 22, 49, .17);
        }

        .rakt-landing .brand-mark .material-symbols-outlined {
          font-size: 24px;
        }

        .rakt-landing .landing-chip {
          align-items: center;
          border: 1px solid #f2d8dd;
          border-radius: 6px;
          background: #fff6f7;
          padding: 3px 6px;
          color: #a61b35;
          font-size: 8px;
          font-weight: 750;
          letter-spacing: .09em;
        }

        .rakt-landing .landing-stat {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 5px;
        }

        .rakt-landing .landing-stat strong {
          font-size: clamp(16px, 1.7vw, 21px);
          font-weight: 750;
          line-height: 1.3;
          letter-spacing: -.035em;
        }

        .rakt-landing .landing-stat span {
          max-width: 145px;
          color: rgba(255,255,255,.55);
          font-size: 11px;
          line-height: 1.55;
        }

        .rakt-landing .story-card {
          display: flex;
          min-height: 245px;
          flex-direction: column;
          border: 1px solid #eee5e7;
          border-radius: 20px;
          background: white;
          padding: 23px;
          box-shadow: 0 2px 8px rgba(35, 10, 18, .025);
        }

        .rakt-landing .story-card:hover {
          transform: translateY(-3px);
          border-color: #e7bbc4;
          box-shadow: 0 14px 34px rgba(75, 13, 29, .07);
        }

        .rakt-landing .story-card-active {
          border-color: #d99aa7;
          background: linear-gradient(145deg, #fff, #fff6f7);
          box-shadow: 0 8px 25px rgba(128, 20, 44, .06);
        }

        .rakt-landing .story-number {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border-radius: 11px;
          background: #fff0f2;
          color: #a61b35;
          font-size: 12px;
          font-weight: 750;
        }

        .rakt-landing .story-icon {
          color: #9c5261;
          font-size: 24px;
        }

        .rakt-landing .story-card h3 {
          color: #28171c;
          font-size: 19px;
          font-weight: 750;
          line-height: 1.35;
          letter-spacing: -.035em;
        }

        .rakt-landing .story-card p {
          margin-top: 8px;
          color: #69717e;
          font-size: 13px;
          line-height: 1.75;
        }

        .rakt-landing .story-card > div:last-child {
          margin-top: auto;
          padding-top: 19px;
        }

        .rakt-landing .story-card > div:last-child > span:first-child {
          color: #8f1027;
          font-size: 11px;
          font-weight: 700;
        }

        .rakt-landing .journey-pulse {
          display: grid;
          width: 47px;
          height: 47px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #f0cbd3;
          border-radius: 15px;
          background: white;
          color: #b91c35;
        }

        .rakt-landing .decision-flow {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          overflow: hidden;
          border: 1px solid #eee3e6;
          border-radius: 20px;
          background: white;
        }

        .rakt-landing .decision-step {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 26px;
          padding: 23px 17px;
          border-right: 1px solid #f0e8ea;
        }

        .rakt-landing .decision-step:last-child {
          border-right: 0;
        }

        .rakt-landing .decision-step > span:first-child {
          display: grid;
          width: 33px;
          height: 33px;
          place-items: center;
          border-radius: 10px;
          background: #fff0f2;
          color: #a61b35;
          font-size: 11px;
          font-weight: 750;
        }

        .rakt-landing .decision-step strong {
          display: block;
          color: #28171c;
          font-size: 14px;
          font-weight: 750;
        }

        .rakt-landing .decision-step small {
          display: block;
          margin-top: 7px;
          color: #69717e;
          font-size: 11px;
          line-height: 1.65;
        }

        .rakt-landing .decision-arrow {
          position: absolute;
          top: 29px;
          right: 10px;
          color: #bd8a95;
          font-size: 16px;
        }

        .rakt-landing .platform-feature,
        .rakt-landing .platform-tile {
          position: relative;
          display: flex;
          min-height: 240px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 22px;
          border: 1px solid #eee2e5;
          border-radius: 21px;
          background: white;
          padding: 25px;
          transition: border-color .2s ease, box-shadow .2s ease,
            transform .2s ease;
        }

        .rakt-landing .platform-feature:hover,
        .rakt-landing .platform-tile:hover {
          transform: translateY(-3px);
          border-color: #e5bdc6;
          box-shadow: 0 12px 32px rgba(65, 12, 26, .055);
        }

        .rakt-landing .platform-feature {
          min-height: 280px;
          border-color: #4c1a29;
          background:
            radial-gradient(ellipse at 90% 10%, rgba(191,30,61,.22), transparent 45%),
            linear-gradient(140deg, #31101b, #1b090e);
          color: white;
        }

        .rakt-landing .platform-index {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 10px;
          background: #fff0f2;
          color: #a61b35;
          font-size: 11px;
          font-weight: 750;
        }

        .rakt-landing .platform-feature .platform-index {
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: #ffd8df;
        }

        .rakt-landing .platform-feature h3,
        .rakt-landing .platform-tile h3 {
          margin-top: 15px;
          color: inherit;
          font-size: 22px;
          font-weight: 750;
          line-height: 1.3;
        }

        .rakt-landing .platform-feature p,
        .rakt-landing .platform-tile p {
          max-width: 450px;
          margin-top: 8px;
          color: #727986;
          font-size: 13px;
          line-height: 1.8;
        }

        .rakt-landing .platform-feature p {
          color: rgba(255,255,255,.68);
        }

        .rakt-landing .platform-feature a,
        .rakt-landing .platform-tile a {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #a61b35;
          font-size: 12px;
          font-weight: 750;
        }

        .rakt-landing .platform-feature a {
          color: #ffd1da;
        }

        .rakt-landing .platform-feature a:hover,
        .rakt-landing .platform-tile a:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .rakt-landing .landing-radar-frame {
          border: 1px solid #ebdfe2;
          border-radius: 22px;
          background: white;
          box-shadow: 0 12px 40px rgba(55, 10, 22, .05);
        }

        .rakt-landing .landing-radar-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid #f0e7e9;
          padding: 15px 18px;
          color: #69717e;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .045em;
        }

        .rakt-landing .landing-radar-topbar > span:first-child {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .rakt-landing .landing-radar-topbar i {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c12842;
        }

        .rakt-landing .landing-cta-panel {
          border: 1px solid #f0dfe3;
          border-radius: 26px;
          background: rgba(255,255,255,.82);
          padding: 38px 22px;
          box-shadow: 0 10px 40px rgba(84, 15, 31, .035);
        }

        .rakt-landing .landing-cta-grid-light {
          background-image: radial-gradient(#d9aab4 0.7px, transparent 0.7px);
          background-size: 22px 22px;
          opacity: .2;
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }

        @media (min-width: 768px) {
          .rakt-landing .landing-cta-panel {
            padding: 58px 42px;
          }
        }

        @media (max-width: 1023px) {
          .rakt-landing .decision-flow {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .rakt-landing .decision-step:nth-child(3) {
            border-right: 0;
          }

          .rakt-landing .decision-step:nth-child(n+4) {
            border-top: 1px solid #f0e8ea;
          }
        }

        @media (max-width: 639px) {
          .rakt-landing .section-title {
            font-size: 30px;
            line-height: 1.18;
          }

          .rakt-landing .section-copy {
            font-size: 14px;
            line-height: 1.8;
          }

          .rakt-landing .story-card {
            min-height: 215px;
            padding: 19px;
          }

          .rakt-landing .decision-flow {
            grid-template-columns: 1fr;
          }

          .rakt-landing .decision-step {
            min-height: 105px;
            flex-direction: row;
            align-items: flex-start;
            gap: 14px;
            border-right: 0;
            border-bottom: 1px solid #f0e8ea;
            padding: 17px;
          }

          .rakt-landing .decision-step:last-child {
            border-bottom: 0;
          }

          .rakt-landing .decision-step:nth-child(n+4) {
            border-top: 0;
          }

          .rakt-landing .decision-step > div {
            flex: 1;
            padding-right: 12px;
          }

          .rakt-landing .decision-arrow {
            top: 23px;
            right: 15px;
          }

          .rakt-landing .platform-feature,
          .rakt-landing .platform-tile {
            min-height: 220px;
            padding: 21px;
          }

          .rakt-landing .landing-cta-panel {
            padding: 32px 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rakt-landing *,
          .rakt-landing *::before,
          .rakt-landing *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <header className="landing-nav sticky top-0 z-50">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <div className="brand-mark">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] font-bold tracking-normal">
                  RaktSaathi
                </span>
                <span className="landing-chip hidden sm:inline-flex">PLATFORM</span>
              </div>
              <span className="hidden text-[10px] leading-4 text-slate-400 sm:block">
                Blood shortage intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] font-medium xl:flex">
            <a href="#journey" className="landing-nav-link">How it works</a>
            <a href="#radar" className="landing-nav-link">Shortage radar</a>
            <a href="#decision-loop" className="landing-nav-link">Decision process</a>
            <a href="#response" className="landing-nav-link">Platform</a>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button variant="primary" size="sm" icon="arrow_forward" iconPosition="right">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-inner">
            <div className="hero-layout">
              <div className="hero-copy">
                <div className="hero-eyebrow">
                  <span className="live-dot" aria-hidden="true" />
                  BLOOD SHORTAGE INTELLIGENCE
                </div>

                <h1 className="hero-title">
                  Predict the shortage.
                  <span className="hero-title-accent">Act before it happens.</span>
                </h1>

                <p className="hero-description">
                  See where blood may run short, understand the evidence, and help
                  blood-bank teams coordinate the next response — before time runs out.
                </p>

                <div className="hero-actions">
                  <Link to="/auth">
                    <Button variant="primary" size="lg" icon="arrow_forward" iconPosition="right" className="landing-primary-btn">
                      Enter RaktSaathi
                    </Button>
                  </Link>
                  <a href="#journey">
                    <Button variant="secondary" size="lg" icon="play_arrow" className="landing-secondary-btn">
                      See how it works
                    </Button>
                  </a>
                </div>

                <p className="hero-note">
                  A decision-support platform for blood banks and hospitals. Forecasts and
                  example figures should be verified against real operational data before use.
                </p>
              </div>

              <div className="hero-art" aria-label="RaktSaathi campaign visual">
                <div className="hero-splash-wrap">
                  <img
                    src="/images/rakt-saathi-blood-splash.png"
                    alt="Crimson liquid splash representing the urgency of timely blood availability"
                    className="hero-splash-image"
                  />
                  <div className="hero-splash-message">
                    <p>
                      The right blood,<br />
                      at the right time,<br />
                      can change a life.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section id="journey" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <div className="max-w-[720px]">
              <span className="section-kicker">THE RAKTSAATHI JOURNEY</span>
              <h2 className="section-title">
                From donation to a coordinated response.
              </h2>
              <p className="section-copy">
                Follow how blood supply moves through the system and how
                shortage intelligence can help teams identify risk and
                coordinate the next step.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 xl:grid-cols-3">
              {journey.map(([num, title, subtitle, metric, icon], index) => (
                <button
                  key={num}
                  type="button"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`story-card text-left transition-all duration-200 ${
                    activeStep === index ? 'story-card-active' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="story-number">{num}</span>
                    <span className="material-symbols-outlined story-icon">{icon}</span>
                  </div>
                  <div className="mt-8">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/70">
                    <span>{metric}</span>
                    <span className="material-symbols-outlined text-base">arrow_outward</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-[20px] border border-red-100 bg-[#fff8f9] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-4">
                <div className="journey-pulse">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <div>
                  <span className="section-kicker">SELECTED STAGE</span>
                  <p className="mt-1 text-base font-semibold leading-7 text-slate-800">
                    {journey[activeStep][1]}
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    {journey[activeStep][2]}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-primary">
                {journey[activeStep][3]}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Journey figures are illustrative and should not be interpreted
              as verified live inventory or performance data.
            </p>
          </div>
        </section>

        {/* Radar */}
        <section id="radar" className="scroll-mt-20 overflow-hidden bg-[#fbf7f8] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
              <div>
                <span className="section-kicker">PREDICTIVE RADAR</span>
                <h2 className="section-title">
                  See a potential shortage before it becomes urgent.
                </h2>
                <p className="section-copy">
                  Explore how regional stock, projected demand and available
                  supply can be brought together to help teams investigate
                  possible deficits.
                </p>
                <Link to="/radar" className="mt-7 inline-flex">
                  <Button variant="secondary" size="md" icon="arrow_forward" iconPosition="right">
                    Explore shortage radar
                  </Button>
                </Link>
                <p className="mt-4 max-w-lg text-xs leading-6 text-slate-400">
                  Forecasts are decision-support estimates. Actual response
                  depends on verified stock, compatibility and authorized review.
                </p>
              </div>

              <div className="landing-radar-frame min-w-0 overflow-hidden">
                <div className="landing-radar-topbar">
                  <span><i /> DEMONSTRATION REGION</span>
                  <span>O− / 72H FORECAST</span>
                </div>
                <RadarNetwork3D
                  selectedSerotype="O-"
                  selectedFacilityId="BB-DEL-A"
                  onSelectFacility={() => {}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Decision process */}
        <section id="decision-loop" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
              <div>
                <span className="section-kicker">FROM SIGNAL TO RESPONSE</span>
                <h2 className="section-title">
                  Make every alert easier to understand and act on.
                </h2>
                <p className="section-copy">
                  A forecast is only the beginning. Staff need to understand
                  the evidence, compare response options and record the
                  decisions taken.
                </p>
              </div>

              <div className="decision-flow">
                {decisionSteps.map(([title, description], index) => (
                  <div key={title} className="decision-step">
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </div>
                    {index < decisionSteps.length - 1 && (
                      <span className="material-symbols-outlined decision-arrow" aria-hidden="true">
                        arrow_forward
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform features */}
        <section id="response" className="scroll-mt-20 bg-[#fbf8f8] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <div className="max-w-[720px]">
              <span className="section-kicker">THE PLATFORM</span>
              <h2 className="section-title">
                The tools teams need, in one connected workspace.
              </h2>
              <p className="section-copy">
                Move from inventory and requests to data review and donor
                outreach without losing sight of the shortage that needs attention.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-12">
              {platformItems.map((item) => (
                <article
                  key={item.number}
                  className={`${
                    item.featured ? 'platform-feature lg:col-span-7' : 'platform-tile lg:col-span-4'
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <span className="platform-index">{item.number}</span>
                    <span className="material-symbols-outlined text-[23px] opacity-70">
                      {item.icon}
                    </span>
                  </div>

                  <div>
                    {item.featured && (
                      <span className="section-kicker text-red-300">SPATIAL LOGISTICS</span>
                    )}
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <Link to={item.link}>
                    {item.action}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="relative isolate overflow-hidden bg-[#fff7f8] py-20 sm:py-24 lg:py-28">
          <div className="landing-cta-grid-light absolute inset-0" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/60 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-[1100px] px-5">
            <div className="landing-cta-panel text-center">
              <span className="section-kicker">EARLIER INSIGHT. BETTER COORDINATION.</span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-normal text-slate-900 sm:text-4xl lg:text-5xl">
                Predict earlier.
                <span className="block text-primary">Coordinate with purpose.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                RaktSaathi helps teams turn shortage signals into a clearer
                operational path — from the first warning to a reviewed response.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/auth">
                  <Button variant="primary" size="lg" icon="arrow_forward" iconPosition="right">
                    Enter RaktSaathi
                  </Button>
                </Link>
                <Link to="/overview">
                  <Button variant="secondary" size="lg">
                    Explore demo workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-red-100 bg-white py-8 sm:py-9">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 text-center text-xs text-slate-500 sm:px-8 md:flex-row md:text-left">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">water_drop</span>
            <strong className="font-semibold text-slate-800">RaktSaathi</strong>
            <span className="text-slate-400">Blood shortage intelligence</span>
          </Link>

          <span>Demonstration environment · Illustrative data</span>

          <div className="flex flex-wrap justify-center gap-4 text-[11px]">
            <span>Snowflake</span>
            <span>Cloudinary</span>
            <span>Data validation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
