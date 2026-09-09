import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BloodDropSplash3DProps {
  className?: string;
  autoPlay?: boolean;
}

interface SatelliteDroplet {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  settled: boolean;
}

interface Ripple {
  birthTime: number;
  maxRadius: number;
  amplitude: number;
}

export const BloodDropSplash3D: React.FC<BloodDropSplash3DProps> = ({
  className = '',
  autoPlay = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation phase state for accessibility & overlay
  const [currentPhase, setCurrentPhase] = useState<'suspended' | 'falling' | 'impact' | 'ripples' | 'message'>('suspended');
  const [cameraTilt, setCameraTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle subtle mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3; // max +-0.15 rad
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.2;
    setCameraTilt({ x: y, y: x });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCameraTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    // Loop duration: 6.8 seconds total
    const CYCLE_DURATION = 6800; // ms
    const SUSPEND_END = 1200;    // 0 - 1.2s: suspended
    const IMPACT_TIME = 2200;    // 1.2 - 2.2s: falling
    const CROWN_END = 3300;      // 2.2 - 3.3s: crown & satellites
    const RIPPLES_END = 4800;    // 3.3 - 4.8s: ripples settling
    // 4.8 - 6.4s: message display
    // 6.4 - 6.8s: smooth reset

    let satellites: SatelliteDroplet[] = [];
    let ripples: Ripple[] = [];
    let hasCreatedSplash = false;

    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 500;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 3D Isometric / Perspective projection math
    const project3D = (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number,
      pitchOffset: number,
      yawOffset: number
    ) => {
      // Base isometric angle: pitch ~26 deg, yaw ~45 deg
      const basePitch = 0.46 + pitchOffset;
      const baseYaw = 0.78 + yawOffset;

      // Rotate around Y
      const cosY = Math.cos(baseYaw);
      const sinY = Math.sin(baseYaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X (pitch)
      const cosP = Math.cos(basePitch);
      const sinP = Math.sin(basePitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Perspective scale factor
      const fov = 380;
      const distance = 420;
      const scale = fov / (distance + z2);

      const screenX = width / 2 + x1 * scale * 1.6;
      const screenY = height / 2 + 35 - y2 * scale * 1.6;

      return { x: screenX, y: screenY, depth: z2, scale };
    };

    const render = (now: number) => {
      const elapsed = (now - startTime) % CYCLE_DURATION;
      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, width, height);

      // Smooth camera easing towards mouse tilt
      const pitch = cameraTilt.x * 0.5;
      const yaw = cameraTilt.y * 0.5;

      // 1. Draw 3D Reflective Surface Plane
      ctx.save();
      const planeR = 120;
      const p1 = project3D(-planeR, 0, -planeR, width, height, pitch, yaw);
      const p2 = project3D(planeR, 0, -planeR, width, height, pitch, yaw);
      const p3 = project3D(planeR, 0, planeR, width, height, pitch, yaw);
      const p4 = project3D(-planeR, 0, planeR, width, height, pitch, yaw);

      // Subtle translucent porcelain floor
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();

      const floorGrad = ctx.createRadialGradient(
        width / 2,
        height / 2 + 40,
        10,
        width / 2,
        height / 2 + 40,
        width * 0.45
      );
      floorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      floorGrad.addColorStop(0.5, 'rgba(248, 250, 252, 0.85)');
      floorGrad.addColorStop(1, 'rgba(241, 245, 249, 0.2)');
      ctx.fillStyle = floorGrad;
      ctx.fill();

      // Delicate concentric floor coordinate guide rings
      const centerProj = project3D(0, 0, 0, width, height, pitch, yaw);
      [40, 80, 120].forEach(r => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += Math.PI / 16) {
          const pt = project3D(Math.cos(a) * r, 0, Math.sin(a) * r, width, height, pitch, yaw);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // Phase State Management
      if (elapsed < SUSPEND_END) {
        if (currentPhase !== 'suspended') setCurrentPhase('suspended');
        hasCreatedSplash = false;
        satellites = [];
        ripples = [];
      } else if (elapsed < IMPACT_TIME) {
        if (currentPhase !== 'falling') setCurrentPhase('falling');
      } else if (elapsed < CROWN_END) {
        if (currentPhase !== 'impact') setCurrentPhase('impact');
      } else if (elapsed < RIPPLES_END) {
        if (currentPhase !== 'ripples') setCurrentPhase('ripples');
      } else {
        if (currentPhase !== 'message') setCurrentPhase('message');
      }

      // ==========================================
      // STAGE 1 & 2: THE FALLING DROP (0 to 2.2s)
      // ==========================================
      if (elapsed < IMPACT_TIME) {
        let dropY = 110; // Start suspended at height Y = 110
        let elongation = 1.0;
        let dropAlpha = 1.0;

        if (elapsed < SUSPEND_END) {
          // Gentle breathing suspension with surface tension quiver
          const suspendT = elapsed / SUSPEND_END;
          dropY = 110 + Math.sin(suspendT * Math.PI * 2) * 3;
          elongation = 1.0 + Math.sin(suspendT * Math.PI * 4) * 0.05;
        } else {
          // Accelerating downward fall: y = 110 - 110 * t^2.2
          const fallProgress = (elapsed - SUSPEND_END) / (IMPACT_TIME - SUSPEND_END);
          const eased = Math.pow(fallProgress, 2.2);
          dropY = 110 * (1 - eased);
          // Aerodynamic stretch
          elongation = 1.0 + fallProgress * 0.45;
        }

        const dropProj = project3D(0, dropY, 0, width, height, pitch, yaw);
        const shadowProj = project3D(0, 0, 0, width, height, pitch, yaw);

        // Ground Contact Shadow (grows darker and sharper as drop descends)
        ctx.save();
        const distRatio = Math.max(0, 1 - dropY / 110);
        const shadowRadius = 8 + distRatio * 14;
        const shadowAlpha = 0.08 + distRatio * 0.4;
        ctx.beginPath();
        ctx.ellipse(
          shadowProj.x,
          shadowProj.y,
          shadowRadius * shadowProj.scale,
          shadowRadius * 0.45 * shadowProj.scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(147, 0, 11, ${shadowAlpha})`;
        ctx.filter = `blur(${Math.max(1, (1 - distRatio) * 6)}px)`;
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();

        // The 3D Glossy Ruby Blood Drop
        ctx.save();
        const baseRadius = 14 * dropProj.scale;
        const wR = baseRadius / Math.sqrt(elongation);
        const hR = baseRadius * elongation;

        // Ambient Crimson Halo Glow
        ctx.beginPath();
        ctx.arc(dropProj.x, dropProj.y, baseRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
        ctx.fill();

        // 3D Teardrop / Sphere Shape with Specular Highlight
        ctx.beginPath();
        // Top teardrop apex when falling, oval when suspended
        if (elapsed >= SUSPEND_END) {
          ctx.moveTo(dropProj.x, dropProj.y - hR * 1.35);
          ctx.bezierCurveTo(
            dropProj.x + wR * 1.1,
            dropProj.y - hR * 0.4,
            dropProj.x + wR * 1.1,
            dropProj.y + hR * 0.9,
            dropProj.x,
            dropProj.y + hR
          );
          ctx.bezierCurveTo(
            dropProj.x - wR * 1.1,
            dropProj.y + hR * 0.9,
            dropProj.x - wR * 1.1,
            dropProj.y - hR * 0.4,
            dropProj.x,
            dropProj.y - hR * 1.35
          );
        } else {
          ctx.ellipse(dropProj.x, dropProj.y, wR, hR, 0, 0, Math.PI * 2);
        }

        // Deep Ruby Multi-Stop Gradient (Photorealistic liquid depth)
        const dropGrad = ctx.createRadialGradient(
          dropProj.x - wR * 0.35,
          dropProj.y - hR * 0.35,
          baseRadius * 0.1,
          dropProj.x,
          dropProj.y,
          baseRadius * 1.2
        );
        dropGrad.addColorStop(0, '#FF8A8A'); // Inner light reflection
        dropGrad.addColorStop(0.25, '#DC2626'); // Rich arterial crimson
        dropGrad.addColorStop(0.65, '#93000B'); // Deep blood core
        dropGrad.addColorStop(1, '#5C0006'); // Deep shadow edge

        ctx.fillStyle = dropGrad;
        ctx.shadowColor = 'rgba(147, 0, 11, 0.45)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Specular Glaze Highlight (Glassy reflection of studio light)
        ctx.beginPath();
        ctx.ellipse(
          dropProj.x - wR * 0.3,
          dropProj.y - hR * 0.35,
          wR * 0.35,
          hR * 0.22,
          -0.25,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Secondary bottom Fresnel reflection
        ctx.beginPath();
        ctx.arc(dropProj.x, dropProj.y + hR * 0.4, wR * 0.55, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = 'rgba(255, 200, 200, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // ==========================================
      // STAGE 3 & 4: IMPACT, CROWN SPLASH & SATELLITES
      // ==========================================
      if (elapsed >= IMPACT_TIME) {
        // Initialize splash physics exactly once at impact
        if (!hasCreatedSplash) {
          hasCreatedSplash = true;
          satellites = [];
          const dropletCount = 12;

          for (let i = 0; i < dropletCount; i++) {
            const angle = (i / dropletCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
            const speed = 28 + Math.random() * 18; // outward radial speed
            satellites.push({
              x: 0,
              y: 2, // starts at impact surface
              z: 0,
              vx: Math.cos(angle) * speed,
              vy: 38 + Math.random() * 22, // upward initial velocity
              vz: Math.sin(angle) * speed,
              radius: 2.2 + Math.random() * 1.6,
              settled: false,
            });
          }

          // Trigger concentric surface ripples
          ripples = [
            { birthTime: IMPACT_TIME, maxRadius: 75, amplitude: 1.0 },
            { birthTime: IMPACT_TIME + 250, maxRadius: 105, amplitude: 0.75 },
            { birthTime: IMPACT_TIME + 550, maxRadius: 135, amplitude: 0.5 },
          ];
        }

        const splashElapsed = (elapsed - IMPACT_TIME) / 1000; // seconds since impact

        // 3a. Expanding Crown Splash (during first 0.9s post-impact)
        if (elapsed < CROWN_END) {
          const crownT = (elapsed - IMPACT_TIME) / (CROWN_END - IMPACT_TIME); // 0 to 1
          const crownRadius = 16 + crownT * 32;
          const crownHeight = Math.sin(crownT * Math.PI) * 28;
          const crownAlpha = Math.max(0, 1 - crownT * 0.85);

          ctx.save();
          // Draw crown rim in 3D
          const crownPoints = 16;
          ctx.beginPath();
          for (let i = 0; i <= crownPoints; i++) {
            const a = (i / crownPoints) * Math.PI * 2;
            const scallopedR = crownRadius + (i % 2 === 0 ? 5 : -2) * (1 - crownT);
            const pt = project3D(
              Math.cos(a) * scallopedR,
              crownHeight * (i % 2 === 0 ? 1.0 : 0.7),
              Math.sin(a) * scallopedR,
              width,
              height,
              pitch,
              yaw
            );
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(147, 0, 11, ${crownAlpha * 0.85})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Crown translucent body sheath
          ctx.fillStyle = `rgba(220, 38, 38, ${crownAlpha * 0.15})`;
          ctx.fill();
          ctx.restore();
        }

        // 3b. Satellite Droplets Physics (Ballistic 3D parabolas)
        const gravity = 85; // downward acceleration in sim units/s^2
        satellites.forEach(drop => {
          const dt = splashElapsed;
          // Ballistic position: y = vy*t - 0.5*g*t^2
          const curX = drop.vx * dt;
          const curZ = drop.vz * dt;
          const curY = Math.max(0, drop.vy * dt - 0.5 * gravity * dt * dt);

          if (curY <= 0 && dt > 0.3) {
            drop.settled = true;
          }

          if (!drop.settled || elapsed < CROWN_END + 400) {
            const dropP = project3D(curX, curY, curZ, width, height, pitch, yaw);
            const dropShadowP = project3D(curX, 0, curZ, width, height, pitch, yaw);

            // Ground shadow
            ctx.beginPath();
            ctx.ellipse(
              dropShadowP.x,
              dropShadowP.y,
              drop.radius * dropShadowP.scale,
              drop.radius * 0.5 * dropShadowP.scale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = 'rgba(147, 0, 11, 0.15)';
            ctx.fill();

            // 3D droplet bead
            ctx.save();
            ctx.beginPath();
            ctx.arc(dropP.x, dropP.y, drop.radius * dropP.scale, 0, Math.PI * 2);
            ctx.fillStyle = '#93000B';
            ctx.shadowColor = 'rgba(147, 0, 11, 0.6)';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Specular pin
            ctx.beginPath();
            ctx.arc(
              dropP.x - drop.radius * 0.35 * dropP.scale,
              dropP.y - drop.radius * 0.35 * dropP.scale,
              drop.radius * 0.35 * dropP.scale,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.restore();
          }
        });

        // 3c. Concentric Surface Ripples
        ripples.forEach(rip => {
          if (elapsed >= rip.birthTime) {
            const ripAge = (elapsed - rip.birthTime) / 1000;
            const ripProgress = Math.min(1, ripAge / 2.2);
            const r = ripProgress * rip.maxRadius;
            const fade = (1 - ripProgress) * rip.amplitude;

            if (fade > 0.02) {
              ctx.save();
              ctx.beginPath();
              const steps = 36;
              for (let i = 0; i <= steps; i++) {
                const a = (i / steps) * Math.PI * 2;
                // Subtle vertical wave crest: y = sin(kr)*amplitude
                const waveY = Math.sin(ripProgress * Math.PI * 3) * (fade * 2.5);
                const pt = project3D(
                  Math.cos(a) * r,
                  waveY,
                  Math.sin(a) * r,
                  width,
                  height,
                  pitch,
                  yaw
                );
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              }
              ctx.strokeStyle = `rgba(147, 0, 11, ${fade * 0.65})`;
              ctx.lineWidth = Math.max(1, 2.5 * (1 - ripProgress));
              ctx.stroke();

              // Ripple specular crest highlight
              ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.4})`;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.restore();
            }
          }
        });
      }

      // ==========================================
      // STAGE 5: THE CORE TYPOGRAPHIC MESSAGE REVEAL (4.6s to 6.4s)
      // ==========================================
      if (elapsed >= 4200) {
        let msgAlpha = 0;
        if (elapsed < 5000) {
          // Fade in smoothly: 4.2s to 5.0s
          msgAlpha = (elapsed - 4200) / 800;
        } else if (elapsed < 6200) {
          // Fully readable: 5.0s to 6.2s
          msgAlpha = 1.0;
        } else {
          // Fade out before reset: 6.2s to 6.8s
          msgAlpha = Math.max(0, 1 - (elapsed - 6200) / 600);
        }

        if (msgAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = msgAlpha;

          // Projected center anchor for text
          const textCenter = project3D(0, 20, 0, width, height, pitch, yaw);

          // Atmospheric backdrop plaque with soft blur
          const boxW = Math.min(340, width - 40);
          const boxH = 92;
          ctx.beginPath();
          ctx.roundRect(textCenter.x - boxW / 2, textCenter.y - boxH / 2 - 10, boxW, boxH, 14);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.shadowColor = 'rgba(147, 0, 11, 0.14)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Delicate border
          ctx.strokeStyle = 'rgba(255, 218, 214, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Small Eyebrow
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#93000B';
          ctx.fillText('• THE RAKTSAATHI IMPERATIVE •', textCenter.x, textCenter.y - 32);

          // Headline Text Lines
          ctx.font = 'bold 15px "Plus Jakarta Sans", "Inter", sans-serif';
          ctx.fillStyle = '#0F172A';
          ctx.fillText('The right blood,', textCenter.x, textCenter.y - 12);
          ctx.fillText('at the right time,', textCenter.x, textCenter.y + 8);

          ctx.font = 'extrabold 15px "Plus Jakarta Sans", "Inter", sans-serif';
          ctx.fillStyle = '#93000B';
          ctx.fillText('helps people live.', textCenter.x, textCenter.y + 28);

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [cameraTilt]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[460px] lg:h-[540px] flex items-center justify-center overflow-hidden rounded-3xl select-none ${className}`}
      aria-label="Interactive 3D procedural blood drop falling, impacting liquid surface, splashing crown droplets, and revealing the RaktSaathi life-saving motto"
    >
      {/* 3D WebGL / High-DPI Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-default" />

      {/* Subtle Bottom Loop Indicator */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center items-center pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-sm text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-beacon" />
          <span>Real-time Procedural 3D • Single Drop to Impact Loop</span>
        </div>
      </div>
    </div>
  );
};
