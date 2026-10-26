import React, { useCallback, useEffect, useRef, useState } from 'react';

interface DataStream3DProps {
  isSimulating: boolean;
  onGateSelect?: (stageIndex: number) => void;
  className?: string;
}

interface Particle {
  id: number;
  progress: number;
  lane: number;
  speed: number;
  size: number;
  phase: number;
}

interface Gate {
  id: number;
  name: string;
  stageName: string;
  subtext: string;
  progress: number;
  color: string;
  metric: string;
  shortName: string;
}

const GATES: Gate[] = [
  {
    id: 1,
    name: 'Paper & Fax Ingest',
    shortName: 'INGEST',
    stageName: 'STAGE 01',
    subtext: 'Analog inputs and OCR scans',
    progress: 0.09,
    color: '#A8B6C9',
    metric: '184 ms',
  },
  {
    id: 2,
    name: 'Vision Extraction',
    shortName: 'VISION',
    stageName: 'STAGE 02',
    subtext: 'Image recognition and extraction',
    progress: 0.30,
    color: '#38BDF8',
    metric: 'CV ENGINE',
  },
  {
    id: 3,
    name: 'NBTC Clinical Gate',
    shortName: 'VALIDATE',
    stageName: 'STAGE 03',
    subtext: 'Rules, validation and PII redaction',
    progress: 0.51,
    color: '#34D399',
    metric: 'RULE CHECK',
  },
  {
    id: 4,
    name: 'Inventory Lakehouse',
    shortName: 'COMMIT',
    stageName: 'STAGE 04',
    subtext: 'Transactional inventory persistence',
    progress: 0.72,
    color: '#F87171',
    metric: '14 ms',
  },
  {
    id: 5,
    name: 'Radar & Dispatch Alert',
    shortName: 'RADAR',
    stageName: 'STAGE 05',
    subtext: 'Shortage radar and alert trigger',
    progress: 0.93,
    color: '#FB7185',
    metric: 'ALERT ROUTE',
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const DataStream3D: React.FC<DataStream3DProps> = ({
  isSimulating,
  onGateSelect,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeGateRef = useRef<number | null>(null);

  const [activeGateIndex, setActiveGateIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    activeGateRef.current = activeGateIndex;
  }, [activeGateIndex]);

  const selectGate = useCallback(
    (index: number) => {
      setActiveGateIndex(index);
      onGateSelect?.(index);
    },
    [onGateSelect],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !container || !ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let elapsed = 0;
    let previousTime = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    const particleCount = 48;

    const particles: Particle[] = Array.from(
      { length: particleCount },
      (_, id) => ({
        id,
        progress: (id / particleCount + Math.random() * 0.012) % 1,
        lane: [-1, 0, 1][id % 3],
        speed: 0.045 + Math.random() * 0.035,
        size: 1.5 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
      }),
    );

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      if (width === lastWidth && height === lastHeight) return;

      lastWidth = width;
      lastHeight = height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset the transform instead of repeatedly scaling the context.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    // Project the data corridor into a shallow perspective.
    const project = (
      progress: number,
      lane: number,
      verticalOffset = 0,
    ) => {
      const x = 26 + progress * (width - 52);
      const centerY = height * 0.49;
      const perspective = 0.76 + Math.sin(progress * Math.PI) * 0.28;

      return {
        x,
        y: centerY + lane * 25 * perspective + verticalOffset * perspective,
        perspective,
      };
    };

    const roundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number,
    ) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
    };

    const drawBackground = () => {
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#0B1220');
      bg.addColorStop(0.52, '#111827');
      bg.addColorStop(1, '#180F19');

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric lighting.
      const glow = ctx.createRadialGradient(
        width * 0.52,
        height * 0.45,
        5,
        width * 0.52,
        height * 0.45,
        width * 0.62,
      );

      glow.addColorStop(0, 'rgba(56, 189, 248, 0.075)');
      glow.addColorStop(0.5, 'rgba(193, 18, 31, 0.035)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Fine technical grid.
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.055)';
      ctx.lineWidth = 1;

      const gridSize = 28;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawCorridor = () => {
      // Three longitudinal rails.
      [-1, 0, 1].forEach((lane) => {
        ctx.beginPath();

        for (let step = 0; step <= 100; step++) {
          const p = project(step / 100, lane);
          if (step === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }

        ctx.strokeStyle =
          lane === 0
            ? 'rgba(56, 189, 248, 0.35)'
            : 'rgba(148, 163, 184, 0.17)';

        ctx.lineWidth = lane === 0 ? 1.5 : 1;
        ctx.setLineDash(lane === 0 ? [] : [3, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Perspective floor ties.
      for (let step = 0; step <= 32; step++) {
        const progress = step / 32;
        const left = project(progress, -1.28);
        const right = project(progress, 1.28);

        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.105)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Soft illuminated center flow.
      const center = project(0, 0);
      const end = project(1, 0);
      const flowGradient = ctx.createLinearGradient(
        center.x,
        center.y,
        end.x,
        end.y,
      );

      flowGradient.addColorStop(0, 'rgba(148, 163, 184, 0.05)');
      flowGradient.addColorStop(0.32, 'rgba(56, 189, 248, 0.15)');
      flowGradient.addColorStop(0.58, 'rgba(52, 211, 153, 0.14)');
      flowGradient.addColorStop(1, 'rgba(251, 113, 133, 0.2)');

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = flowGradient;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawGate = (gate: Gate, index: number, time: number) => {
      const center = project(gate.progress, 0);
      const left = project(gate.progress, -1.18);
      const right = project(gate.progress, 1.18);
      const topY = center.y - 40 * center.perspective;
      const bottomY = center.y + 40 * center.perspective;
      const selected = activeGateRef.current === index;
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + index * 1.1);

      ctx.save();

      // Floor glow.
      const floorGlow = ctx.createRadialGradient(
        center.x,
        bottomY,
        2,
        center.x,
        bottomY,
        selected ? 45 : 29,
      );

      floorGlow.addColorStop(
        0,
        selected ? `${gate.color}38` : `${gate.color}18`,
      );
      floorGlow.addColorStop(1, `${gate.color}00`);

      ctx.fillStyle = floorGlow;
      ctx.fillRect(center.x - 48, bottomY - 24, 96, 48);

      // Gate structure.
      ctx.beginPath();
      ctx.moveTo(left.x, bottomY);
      ctx.lineTo(left.x, topY + 11);
      ctx.quadraticCurveTo(left.x, topY, center.x, topY);
      ctx.quadraticCurveTo(right.x, topY, right.x, topY + 11);
      ctx.lineTo(right.x, bottomY);

      ctx.strokeStyle = `${gate.color}${selected ? 'EE' : '88'}`;
      ctx.lineWidth = selected ? 2.5 : 1.4;
      ctx.shadowColor = gate.color;
      ctx.shadowBlur = selected ? 16 : 5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner arch gives the gate more depth.
      ctx.beginPath();
      ctx.moveTo(left.x + 6, bottomY - 2);
      ctx.lineTo(left.x + 6, topY + 13);
      ctx.quadraticCurveTo(left.x + 6, topY + 7, center.x, topY + 7);
      ctx.quadraticCurveTo(right.x - 6, topY + 7, right.x - 6, topY + 13);
      ctx.lineTo(right.x - 6, bottomY - 2);

      ctx.strokeStyle = `${gate.color}35`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Animated scanner.
      const scanY =
        center.y + Math.sin(time * 2.1 + index * 1.45) * 30;

      const scanGradient = ctx.createLinearGradient(
        left.x,
        scanY,
        right.x,
        scanY,
      );

      scanGradient.addColorStop(0, `${gate.color}00`);
      scanGradient.addColorStop(0.5, `${gate.color}CC`);
      scanGradient.addColorStop(1, `${gate.color}00`);

      ctx.beginPath();
      ctx.moveTo(left.x, scanY);
      ctx.lineTo(right.x, scanY);
      ctx.strokeStyle = scanGradient;
      ctx.lineWidth = selected ? 2.5 : 1.6;
      ctx.shadowColor = gate.color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Number marker at the gate crown.
      const markerY = topY - 8;

      ctx.beginPath();
      ctx.arc(center.x, markerY, selected ? 12 : 10, 0, Math.PI * 2);
      ctx.fillStyle = '#111827';
      ctx.fill();

      ctx.strokeStyle = `${gate.color}${selected ? 'FF' : 'A0'}`;
      ctx.lineWidth = selected ? 2 : 1.3;
      ctx.stroke();

      ctx.fillStyle = gate.color;
      ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(gate.id).padStart(2, '0'), center.x, markerY);

      // Small status light at the foot of each gate.
      ctx.beginPath();
      ctx.ellipse(
        center.x,
        bottomY + 2,
        selected ? 18 : 12,
        4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `${gate.color}28`;
      ctx.fill();
      ctx.strokeStyle = `${gate.color}70`;
      ctx.stroke();

      if (selected) {
        ctx.beginPath();
        ctx.arc(center.x, markerY, 16 + pulse * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `${gate.color}55`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawParticles = (deltaSeconds: number, time: number) => {
      const speedMultiplier = isSimulating ? 2.7 : 1;

      particles.forEach((particle) => {
        if (!isPaused) {
          particle.progress +=
            particle.speed * speedMultiplier * deltaSeconds;

          if (particle.progress >= 1) {
            particle.progress %= 1;
            particle.lane = [-1, 0, 1][
              Math.floor(Math.random() * 3)
            ];
          }
        }

        const p = particle.progress;

        let color = '#A8B6C9';
        if (p > 0.82) color = '#FB7185';
        else if (p > 0.62) color = '#F87171';
        else if (p > 0.41) color = '#34D399';
        else if (p > 0.2) color = '#38BDF8';

        const verticalOffset =
          Math.sin(time * 2 + particle.phase) * 2.2;

        const point = project(p, particle.lane, verticalOffset);
        const radius = particle.size * point.perspective;

        // Comet trail.
        const trailLength = isSimulating ? 0.045 : 0.022;
        const tail = project(
          Math.max(0, p - trailLength),
          particle.lane,
          verticalOffset,
        );

        const trailGradient = ctx.createLinearGradient(
          tail.x,
          tail.y,
          point.x,
          point.y,
        );

        trailGradient.addColorStop(0, `${color}00`);
        trailGradient.addColorStop(1, `${color}B0`);

        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = radius * 1.35;
        ctx.stroke();

        // Packet glow.
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `${color}18`;
        ctx.fill();

        // Packet body.
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isSimulating ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(
          point.x - radius * 0.2,
          point.y - radius * 0.2,
          Math.max(0.6, radius * 0.3),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });
    };

    const drawSurge = (time: number) => {
      if (!isSimulating) return;

      const progress = (time * 0.34) % 1;
      const point = project(progress, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      [1, 1.55, 2.1].forEach((factor, index) => {
        ctx.beginPath();
        ctx.ellipse(
          point.x,
          point.y,
          12 * factor,
          19 * factor,
          0,
          0,
          Math.PI * 2,
        );

        ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 - index * 0.12})`;
        ctx.lineWidth = index === 0 ? 2 : 1;
        ctx.stroke();
      });

      ctx.restore();
    };

    const render = (timestamp: number) => {
      animationId = requestAnimationFrame(render);

      const deltaSeconds = previousTime
        ? Math.min((timestamp - previousTime) / 1000, 0.05)
        : 0;

      previousTime = timestamp;

      if (!isPaused) elapsed += deltaSeconds;

      ctx.clearRect(0, 0, width, height);

      drawBackground();
      drawCorridor();

      GATES.forEach((gate, index) => {
        drawGate(gate, index, elapsed);
      });

      drawParticles(deltaSeconds, elapsed);
      drawSurge(elapsed);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [isSimulating, isPaused]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    let closestIndex = -1;
    let closestDistance = Infinity;

    GATES.forEach((gate, index) => {
      const gateX = 26 + gate.progress * (rect.width - 52);
      const distance = Math.abs(clickX - gateX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1 && closestDistance < 48) {
      selectGate(closestIndex);
    }
  };

  const selectedGate =
    activeGateIndex === null ? null : GATES[activeGateIndex];

  return (
    <div
      ref={containerRef}
      className={`relative isolate w-full overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0B1220] shadow-[0_16px_50px_rgba(15,23,42,0.14)] select-none ${className}`}
    >
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        onClick={handleCanvasClick}
        aria-label="Animated clinical data processing pipeline"
      />

      {/* Top console header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0B1220]/85 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-rose-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M4 7h6l2 3h8M4 17h6l2-3h8" />
              <circle cx="4" cy="7" r="1.5" />
              <circle cx="4" cy="17" r="1.5" />
              <circle cx="20" cy="10" r="1.5" />
              <circle cx="20" cy="14" r="1.5" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="truncate text-[11px] font-bold uppercase tracking-[0.17em] text-slate-100 sm:text-xs">
              Data Processing Pipeline
            </div>
            <div className="mt-1 text-[10px] tracking-wide text-slate-400">
              CLINICAL INGESTION / VALIDATION / INVENTORY
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isPaused
                ? 'bg-amber-400'
                : isSimulating
                  ? 'animate-pulse bg-sky-400'
                  : 'bg-emerald-400'
            }`}
          />

          <span
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
              isPaused
                ? 'text-amber-300'
                : isSimulating
                  ? 'text-sky-300'
                  : 'text-emerald-300'
            }`}
          >
            {isPaused
              ? 'Stream Paused'
              : isSimulating
                ? 'Burst Simulation'
                : 'Stream Active'}
          </span>

          <button
            type="button"
            onClick={() => setIsPaused((previous) => !previous)}
            className="ml-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            title={isPaused ? 'Resume animation' : 'Pause animation'}
            aria-pressed={isPaused}
          >
            {isPaused ? (
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 5h4v14H7zM15 5h4v14h-4z" />
              </svg>
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Main animation area */}
      <div className="relative h-[225px] sm:h-[250px]">
        <canvas
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Floating annotations */}
        <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 text-[9px] font-medium tracking-wider text-slate-500 sm:left-5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          LIVE PACKET FLOW
        </div>

        <div className="pointer-events-none absolute right-4 top-3 text-right text-[9px] tracking-wider text-slate-500 sm:right-5">
          5 PROCESSING STAGES
        </div>

        <canvas
          ref={undefined}
          aria-hidden="true"
          className="hidden"
        />
      </div>

      {/* Stage selector */}
      <div className="relative z-10 border-t border-white/[0.07] bg-[#0B1220]/90 px-3 py-3 backdrop-blur-sm sm:px-4">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pipeline stages
          </span>
          <span className="text-[9px] text-slate-500">
            Select a stage to inspect
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {GATES.map((gate, index) => {
            const isSelected = activeGateIndex === index;

            return (
              <button
                key={gate.id}
                type="button"
                onClick={() => selectGate(index)}
                aria-pressed={isSelected}
                className={`min-w-0 rounded-xl border px-1.5 py-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 sm:px-2.5 ${
                  isSelected
                    ? 'border-white/20 bg-white/[0.09]'
                    : 'border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.055]'
                }`}
                style={
                  isSelected
                    ? {
                        boxShadow: `inset 0 2px 0 ${gate.color}`,
                      }
                    : undefined
                }
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: gate.color }}
                  />
                  <span className="truncate text-[8px] font-medium tracking-wide text-slate-500 sm:text-[9px]">
                    {gate.stageName}
                  </span>
                </div>

                <div className="truncate text-[9px] font-bold tracking-wide text-slate-200 sm:text-[11px]">
                  {gate.shortName}
                </div>

                <div
                  className="mt-1.5 truncate text-[8px] sm:text-[9px]"
                  style={{ color: gate.color }}
                >
                  {gate.metric}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected stage details */}
        {selectedGate && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5">
            <div
              className="mt-0.5 h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: selectedGate.color }}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] font-bold text-slate-100 sm:text-xs">
                  {selectedGate.name}
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[8px] font-bold tracking-wide"
                  style={{
                    color: selectedGate.color,
                    backgroundColor: `${selectedGate.color}18`,
                  }}
                >
                  {selectedGate.stageName}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                {selectedGate.subtext}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveGateIndex(null)}
              className="shrink-0 rounded-md px-2 py-1 text-[10px] text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
              aria-label="Close stage details"
            >
              Close
            </button>
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Packet visualization
          </span>
          <span>
            {isSimulating
              ? 'Accelerated animation enabled'
              : 'Normal animation speed'}
          </span>
        </div>
      </div>
    </div>
  );
};
