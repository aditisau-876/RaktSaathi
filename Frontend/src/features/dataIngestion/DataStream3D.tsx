import React, { useRef, useEffect, useState } from 'react';

interface DataStream3DProps {
  isSimulating: boolean;
  onGateSelect?: (stageIndex: number) => void;
  className?: string;
}

interface Particle {
  id: number;
  progress: number; // 0 to 1 along pipeline
  lane: number; // -1, 0, 1 lane offset
  speed: number;
  payloadType: 'fax' | 'triage' | 'barcode';
  size: number;
  color: string;
}

interface Gate {
  id: number;
  name: string;
  stageName: string;
  subtext: string;
  progress: number; // 0 to 1
  color: string;
  metric: string;
}

export const DataStream3D: React.FC<DataStream3DProps> = ({
  isSimulating,
  onGateSelect,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeGateIndex, setActiveGateIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const gates: Gate[] = [
    {
      id: 1,
      name: 'Paper & Fax Ingest',
      stageName: 'Stage 01: Ingestion',
      subtext: 'Analog inputs & OCR scans',
      progress: 0.1,
      color: '#94A3B8',
      metric: '184ms Latency',
    },
    {
      id: 2,
      name: 'Vision Extraction',
      stageName: 'Stage 02: Edge CV',
      subtext: 'Cloudinary Bounding Box model',
      progress: 0.32,
      color: '#38BDF8',
      metric: '99.4% Accuracy',
    },
    {
      id: 3,
      name: 'NBTC Clinical Gate',
      stageName: 'Stage 03: Compliance',
      subtext: 'Rule verification & PII redact',
      progress: 0.55,
      color: '#10B981',
      metric: '100% Passed',
    },
    {
      id: 4,
      name: 'Snowflake Lakehouse',
      stageName: 'Stage 04: Persistence',
      subtext: 'Transactional inventory stream',
      progress: 0.78,
      color: '#c1121f',
      metric: '14ms Commit',
    },
    {
      id: 5,
      name: 'Radar & Dispatch Alert',
      stageName: 'Stage 05: Action Trigger',
      subtext: 'Instant Shortage Radar update',
      progress: 0.94,
      color: '#DC2626',
      metric: 'ARMED Active',
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    // Initialize particle stream
    const particleCount = 28;
    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      progress: (i / particleCount) + Math.random() * 0.05,
      lane: (i % 3) - 1, // -1, 0, 1
      speed: 0.003 + Math.random() * 0.002,
      payloadType: (['fax', 'triage', 'barcode'] as const)[i % 3],
      size: 2.5 + Math.random() * 1.5,
      color: '#38BDF8',
    }));

    const resize = () => {
      const parent = containerRef.current;
      if (!parent || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight || 260;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 3D Perspective coordinate transform along corridor
    const project = (progress: number, laneOffset: number, yOffset: number, width: number, height: number) => {
      // Curve slightly in isometric depth
      const startX = 50;
      const endX = width - 50;
      const x = startX + (endX - startX) * progress;

      // Vertical perspective curve: slightly descending towards mid, ascending at end
      const centerY = height * 0.52;
      const depthFactor = 0.8 + 0.3 * Math.sin(progress * Math.PI); // perspective bulge in middle
      const laneSpread = 26 * depthFactor;
      const y = centerY + laneOffset * laneSpread + yOffset * depthFactor;

      return { x, y, scale: depthFactor };
    };

    const render = () => {
      if (!isPaused) {
        t += 0.02;
      }
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Pipeline Backbone Track (Guide Rails with Glowing Grid)
      ctx.save();
      const railLanes = [-1.3, 0, 1.3];
      railLanes.forEach(lane => {
        ctx.beginPath();
        ctx.strokeStyle = lane === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = lane === 0 ? 1.5 : 1;
        if (lane !== 0) ctx.setLineDash([4, 6]);

        const steps = 40;
        for (let s = 0; s <= steps; s++) {
          const prog = s / steps;
          const pt = project(prog, lane, 0, width, height);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      // 2. Draw Transverse Grid Ties (Sleeper Rungs)
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      for (let r = 0; r <= 30; r++) {
        const prog = r / 30;
        const left = project(prog, -1.3, 0, width, height);
        const right = project(prog, 1.3, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render 5 3D Optical Processing Gates
      gates.forEach((gate, gIdx) => {
        const top = project(gate.progress, 0, -42, width, height);
        const bottom = project(gate.progress, 0, 42, width, height);
        const left = project(gate.progress, -1.4, 0, width, height);
        const right = project(gate.progress, 1.4, 0, width, height);
        const center = project(gate.progress, 0, 0, width, height);

        const isHovered = activeGateIndex === gIdx;

        ctx.save();

        // Hexagonal / Rounded Gate Arch
        ctx.beginPath();
        ctx.moveTo(left.x, bottom.y);
        ctx.lineTo(left.x, top.y + 10);
        ctx.quadraticCurveTo(left.x, top.y, center.x, top.y);
        ctx.quadraticCurveTo(right.x, top.y, right.x, top.y + 10);
        ctx.lineTo(right.x, bottom.y);
        ctx.strokeStyle = isHovered ? '#FFFFFF' : `${gate.color}80`;
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Ground anchor pedestal
        ctx.beginPath();
        ctx.ellipse(center.x, bottom.y, 20, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `${gate.color}15`;
        ctx.fill();
        ctx.strokeStyle = `${gate.color}40`;
        ctx.stroke();

        // Laser Scan Sensor Beam (Vertical Scanning Pulse)
        const scanOffset = Math.sin(t * 3 + gIdx) * 36;
        ctx.beginPath();
        ctx.moveTo(left.x, center.y + scanOffset);
        ctx.lineTo(right.x, center.y + scanOffset);
        ctx.strokeStyle = `${gate.color}90`;
        ctx.lineWidth = 2;
        ctx.shadowColor = gate.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Gate Status Tag (Above Arch)
        ctx.fillStyle = '#fff8f7';
        ctx.beginPath();
        ctx.roundRect(center.x - 45, top.y - 24, 90, 18, 4);
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#FFFFFF' : `${gate.color}60`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text in Tag
        ctx.fillStyle = gate.color;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gate.name, center.x, top.y - 15);

        // Subtext / Metric Below Track
        ctx.fillStyle = '#94A3B8';
        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillText(gate.metric, center.x, bottom.y + 16);

        ctx.restore();
      });

      // 4. Update and Render Flowing 3D Data Packets
      const speedMultiplier = isSimulating ? 3.2 : 1.0;

      particles.forEach(p => {
        if (!isPaused) {
          p.progress += p.speed * speedMultiplier;
          if (p.progress > 1) {
            p.progress = 0;
            p.lane = (Math.floor(Math.random() * 3)) - 1;
          }
        }

        // Color dynamic transformation as packet passes through pipeline:
        // Raw fax (gray) -> OCR parsed (cyan) -> NBTC verified (emerald) -> lakehouse commit (teal) -> radar alert (red)
        let currentColor = '#94A3B8';
        if (p.progress > 0.85) currentColor = '#DC2626'; // Alert stage
        else if (p.progress > 0.65) currentColor = '#c1121f'; // Lakehouse
        else if (p.progress > 0.45) currentColor = '#10B981'; // NBTC pass
        else if (p.progress > 0.22) currentColor = '#38BDF8'; // Edge Vision

        const pt = project(p.progress, p.lane, Math.sin(p.progress * Math.PI * 4 + p.id) * 3, width, height);

        ctx.save();
        // Particle glow
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = isSimulating ? 10 : 5;
        ctx.fill();

        // Particle core highlight
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (p.size * 0.4) * pt.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Subtle comet tail behind packet
        const tailLength = isSimulating ? 0.035 : 0.018;
        const tailPt = project(Math.max(0, p.progress - tailLength), p.lane, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(tailPt.x, tailPt.y);
        ctx.strokeStyle = `${currentColor}50`;
        ctx.lineWidth = p.size * pt.scale * 0.8;
        ctx.stroke();

        ctx.restore();
      });

      // 5. If Simulating Batch: Render Energy Surge Wave
      if (isSimulating) {
        const waveProg = (t * 1.5) % 1;
        const wavePt = project(waveProg, 0, 0, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.arc(wavePt.x, wavePt.y, 40 * wavePt.scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isSimulating, isPaused, activeGateIndex]);

  // Click handler to inspect gates
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Check which gate was clicked based on progress along width
    gates.forEach((gate, idx) => {
      const gateX = 50 + (width - 100) * gate.progress;
      if (Math.abs(x - gateX) < 40) {
        setActiveGateIndex(idx);
        onGateSelect?.(idx);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[260px] rs-light-console rounded-[24px] border border-red-100/70 shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        aria-label="3D Data Pipeline Ingestion Corridor Simulation"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/85 border border-red-100 text-slate-600 text-[11px] font-mono pointer-events-auto shadow-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isSimulating ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-white font-bold uppercase tracking-wider">
            Lakehouse Ingestion Corridor
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-sky-400 font-bold">
            {isSimulating ? 'BURST STREAM ACTIVE' : 'STEADY STREAM 14ms'}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="px-2 py-1 rounded bg-white/80 hover:bg-white border border-red-100 text-slate-600 hover:text-primary text-[10px] font-mono transition-colors shadow-sm flex items-center gap-1"
            title={isPaused ? 'Resume stream' : 'Pause stream'}
          >
            <span className="material-symbols-outlined text-[13px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2.5 left-4 text-[10px] font-mono text-slate-500 pointer-events-none flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[13px]">info</span>
        <span>Click any gate to inspect transformation stage metrics</span>
      </div>
    </div>
  );
};
