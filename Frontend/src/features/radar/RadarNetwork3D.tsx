import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BloodGroup } from '@/core/types/inventory';

interface NetworkNode {
  id: string;
  name: string;
  shortName: string;
  location: string;
  // Isometric coordinates in simulation space
  x: number; // -100 to 100
  y: number; // elevation (proportional to inventory reserve)
  z: number; // -100 to 100
  currentStock: number;
  safetyFloor: number;
  status: 'critical' | 'warning' | 'nominal';
  depletionHours?: number;
  burnRate?: number;
}

interface RadarNetwork3DProps {
  selectedSerotype: BloodGroup;
  selectedFacilityId: string;
  onSelectFacility: (facilityId: string) => void;
  className?: string;
}

export const RadarNetwork3D: React.FC<RadarNetwork3DProps> = ({
  selectedSerotype,
  selectedFacilityId,
  onSelectFacility,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Rotation angles for isometric camera
  const [rotation, setRotation] = useState({ yaw: 0.78, pitch: 0.52 }); // ~45 deg yaw, ~30 deg pitch
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Facilities data mapped to spatial topology (Delhi NCR layout)
  const getNodes = useCallback((): NetworkNode[] => {
    return [
      {
        id: 'BB-DEL-A',
        name: 'Metro Trauma Hub (Bank A)',
        shortName: 'Bank A Trauma Hub',
        location: 'Central Delhi • Pusa Road',
        x: -35,
        y: selectedSerotype === 'O-' ? 16 : 38,
        z: -20,
        currentStock: selectedSerotype === 'O-' ? 8 : selectedSerotype === 'AB-' ? 4 : 24,
        safetyFloor: 26,
        status: selectedSerotype === 'O-' || selectedSerotype === 'AB-' ? 'critical' : 'nominal',
        depletionHours: 18,
        burnRate: 1.28,
      },
      {
        id: 'BB-DEL-B',
        name: 'Noida Regional Center (Bank B)',
        shortName: 'Bank B Noida',
        location: 'Sector 62, Noida • Logistics Hub',
        x: 45,
        y: selectedSerotype === 'O-' ? 78 : 55,
        z: 35,
        currentStock: selectedSerotype === 'O-' ? 47 : 36,
        safetyFloor: 15,
        status: 'nominal',
        burnRate: 0.42,
      },
      {
        id: 'BB-DEL-C',
        name: 'Apex Institute Depot (Bank C)',
        shortName: 'Bank C Apex',
        location: 'South Delhi • Saket Corridor',
        x: -15,
        y: 42,
        z: 48,
        currentStock: selectedSerotype === 'O-' ? 28 : 22,
        safetyFloor: 18,
        status: 'nominal',
        burnRate: 0.65,
      },
      {
        id: 'BB-DEL-D',
        name: 'North Valley Blood Depot (Bank D)',
        shortName: 'Bank D North Valley',
        location: 'Rohini Sector 14, North Delhi',
        x: 20,
        y: selectedSerotype === 'O-' ? 26 : 32,
        z: -55,
        currentStock: selectedSerotype === 'O-' ? 14 : 19,
        safetyFloor: 16,
        status: selectedSerotype === 'O-' ? 'warning' : 'nominal',
        depletionHours: 42,
        burnRate: 0.38,
      },
    ];
  }, [selectedSerotype]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const resize = () => {
      const parent = containerRef.current;
      if (!parent || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight || 420;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 3D Isometric projection math
    const project = (
      x: number,
      y: number,
      z: number,
      yaw: number,
      pitch: number,
      width: number,
      height: number
    ) => {
      // Rotation around Y (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotation around X (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Perspective scale factor
      const zoom = 1.85;
      const scale = (Math.min(width, height) / 260) * zoom;
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 + 30 - y2 * scale; // invert Y for screen coords

      return { x: screenX, y: screenY, depth: z2 };
    };

    const render = () => {
      t += 0.025;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // 1. Render Isometric Ground Floor Grid
      const gridSize = 100;
      const gridSteps = 8;
      const stepSize = (gridSize * 2) / gridSteps;

      ctx.save();
      ctx.lineWidth = 1;

      // Subtle base plane boundary shadow
      const p1 = project(-gridSize, 0, -gridSize, rotation.yaw, rotation.pitch, width, height);
      const p2 = project(gridSize, 0, -gridSize, rotation.yaw, rotation.pitch, width, height);
      const p3 = project(gridSize, 0, gridSize, rotation.yaw, rotation.pitch, width, height);
      const p4 = project(-gridSize, 0, gridSize, rotation.yaw, rotation.pitch, width, height);

      const grad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
      grad.addColorStop(0, 'rgba(241, 245, 249, 0.4)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0.7)');

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.stroke();

      // Grid lines along X and Z
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
      for (let i = 0; i <= gridSteps; i++) {
        const coord = -gridSize + i * stepSize;
        // Line parallel to Z
        const startX = project(coord, 0, -gridSize, rotation.yaw, rotation.pitch, width, height);
        const endX = project(coord, 0, gridSize, rotation.yaw, rotation.pitch, width, height);
        ctx.beginPath();
        ctx.moveTo(startX.x, startX.y);
        ctx.lineTo(endX.x, endX.y);
        ctx.stroke();

        // Line parallel to X
        const startZ = project(-gridSize, 0, coord, rotation.yaw, rotation.pitch, width, height);
        const endZ = project(gridSize, 0, coord, rotation.yaw, rotation.pitch, width, height);
        ctx.beginPath();
        ctx.moveTo(startZ.x, startZ.y);
        ctx.lineTo(endZ.x, endZ.y);
        ctx.stroke();
      }
      ctx.restore();

      const nodes = getNodes();

      // 2. Inter-Facility Corridors (Ground & Arc)
      // Highlight Primary Rebalance Highway: Bank B (Noida) -> Bank A (Trauma Hub)
      const bankB = nodes.find(n => n.id === 'BB-DEL-B')!;
      const bankA = nodes.find(n => n.id === 'BB-DEL-A')!;

      if (bankA && bankB) {
        // Ground shadow route line
        const gStart = project(bankB.x, 0, bankB.z, rotation.yaw, rotation.pitch, width, height);
        const gEnd = project(bankA.x, 0, bankA.z, rotation.yaw, rotation.pitch, width, height);

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(147, 0, 11, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gStart.x, gStart.y);
        ctx.lineTo(gEnd.x, gEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 3D Elevated Parabolic Flight/Transit Arc
        const arcSteps = 32;
        ctx.save();
        ctx.strokeStyle = 'rgba(147, 0, 11, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let i = 0; i <= arcSteps; i++) {
          const ratio = i / arcSteps;
          const arcX = bankB.x + (bankA.x - bankB.x) * ratio;
          const arcZ = bankB.z + (bankA.z - bankB.z) * ratio;
          // Arch upward in the middle
          const baseHeight = bankB.y + (bankA.y - bankB.y) * ratio;
          const archBonus = Math.sin(ratio * Math.PI) * 35;
          const arcY = baseHeight + archBonus;

          const pt = project(arcX, arcY, arcZ, rotation.yaw, rotation.pitch, width, height);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Flowing 3D Particles along the corridor
        const particleCount = 4;
        for (let p = 0; p < particleCount; p++) {
          const pRatio = ((t * 0.4 + p / particleCount) % 1);
          const px = bankB.x + (bankA.x - bankB.x) * pRatio;
          const pz = bankB.z + (bankA.z - bankB.z) * pRatio;
          const py = (bankB.y + (bankA.y - bankB.y) * pRatio) + Math.sin(pRatio * Math.PI) * 35;
          const ppt = project(px, py, pz, rotation.yaw, rotation.pitch, width, height);

          // Glowing crimson blood unit packet
          ctx.beginPath();
          ctx.arc(ppt.x, ppt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#93000B';
          ctx.shadowColor = 'rgba(147, 0, 11, 0.8)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner white core
          ctx.beginPath();
          ctx.arc(ppt.x, ppt.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // Mid-route ETA badge in 3D space
        const midRatio = 0.5;
        const midX = bankB.x + (bankA.x - bankB.x) * midRatio;
        const midZ = bankB.z + (bankA.z - bankB.z) * midRatio;
        const midY = (bankB.y + (bankA.y - bankB.y) * midRatio) + Math.sin(midRatio * Math.PI) * 35;
        const midPt = project(midX, midY, midZ, rotation.yaw, rotation.pitch, width, height);

        // Badge pill
        ctx.fillStyle = '#0F172A';
        const text = 'NH-24 • 18u TRANSIT (38m)';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const txtWidth = ctx.measureText(text).width;
        const pad = 6;
        ctx.beginPath();
        ctx.roundRect(midPt.x - txtWidth / 2 - pad, midPt.y - 18, txtWidth + pad * 2, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, midPt.x - txtWidth / 2, midPt.y - 7);
        ctx.restore();
      }

      // Secondary corridors (faint dashed links to Apex & North Valley)
      const otherPairs = [
        { from: 'BB-DEL-A', to: 'BB-DEL-C' },
        { from: 'BB-DEL-B', to: 'BB-DEL-C' },
        { from: 'BB-DEL-A', to: 'BB-DEL-D' },
      ];

      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      otherPairs.forEach(pair => {
        const n1 = nodes.find(n => n.id === pair.from);
        const n2 = nodes.find(n => n.id === pair.to);
        if (n1 && n2) {
          const pt1 = project(n1.x, 0, n1.z, rotation.yaw, rotation.pitch, width, height);
          const pt2 = project(n2.x, 0, n2.z, rotation.yaw, rotation.pitch, width, height);
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Render Nodes with 3D Stems, Ground Rings, and Floating Heads
      // Sort nodes by depth for proper painter's algorithm rendering
      const projectedNodes = nodes.map(node => {
        const ground = project(node.x, 0, node.z, rotation.yaw, rotation.pitch, width, height);
        const elevated = project(node.x, node.y, node.z, rotation.yaw, rotation.pitch, width, height);
        return { node, ground, elevated, depth: elevated.depth };
      });

      projectedNodes.sort((a, b) => b.depth - a.depth);

      projectedNodes.forEach(({ node, ground, elevated }) => {
        const isSelected = node.id === selectedFacilityId;
        const isCritical = node.status === 'critical';
        const isWarning = node.status === 'warning';

        // 3a. Ground Footprint & Radar Pulsing Waves
        ctx.save();
        // Ground drop shadow
        ctx.beginPath();
        ctx.ellipse(ground.x, ground.y, 14, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = isCritical
          ? 'rgba(147, 0, 11, 0.18)'
          : isWarning
          ? 'rgba(217, 119, 6, 0.15)'
          : 'rgba(5, 150, 105, 0.15)';
        ctx.fill();

        // Expanding radar beacon for critical node
        if (isCritical) {
          const pulsePhase = (t * 0.8) % 1;
          const maxR = 40;
          ctx.beginPath();
          ctx.ellipse(ground.x, ground.y, pulsePhase * maxR, pulsePhase * (maxR * 0.5), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(147, 0, 11, ${0.7 * (1 - pulsePhase)})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Ground anchor marker
        ctx.beginPath();
        ctx.arc(ground.x, ground.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? '#93000B' : '#0F172A';
        ctx.fill();
        ctx.restore();

        // 3b. Vertical Elevation Stanchion Line (Height = Inventory Depth)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ground.x, ground.y);
        ctx.lineTo(elevated.x, elevated.y);
        ctx.strokeStyle = isCritical
          ? 'rgba(147, 0, 11, 0.6)'
          : isWarning
          ? 'rgba(217, 119, 6, 0.5)'
          : 'rgba(15, 23, 42, 0.35)';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        if (!isCritical && !isSelected) {
          ctx.setLineDash([2, 3]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 3c. Floating 3D Node Head (Sphere / Cylindrical Receptacle)
        const radius = isSelected ? 16 : 13;
        ctx.save();

        // Node Glow Halo
        if (isCritical) {
          ctx.beginPath();
          ctx.arc(elevated.x, elevated.y, radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(147, 0, 11, 0.18)';
          ctx.fill();
        } else if (node.id === 'BB-DEL-B') {
          // Surplus donor node glow
          ctx.beginPath();
          ctx.arc(elevated.x, elevated.y, radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fill();
        }

        // Node Body Circle
        ctx.beginPath();
        ctx.arc(elevated.x, elevated.y, radius, 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(
          elevated.x - radius * 0.3,
          elevated.y - radius * 0.3,
          radius * 0.2,
          elevated.x,
          elevated.y,
          radius
        );

        if (isCritical) {
          nodeGrad.addColorStop(0, '#FFFFFF');
          nodeGrad.addColorStop(0.4, '#DC2626');
          nodeGrad.addColorStop(1, '#93000B');
        } else if (isWarning) {
          nodeGrad.addColorStop(0, '#FFFFFF');
          nodeGrad.addColorStop(0.4, '#F59E0B');
          nodeGrad.addColorStop(1, '#B45309');
        } else if (node.id === 'BB-DEL-B') {
          nodeGrad.addColorStop(0, '#FFFFFF');
          nodeGrad.addColorStop(0.4, '#10B981');
          nodeGrad.addColorStop(1, '#047857');
        } else {
          nodeGrad.addColorStop(0, '#FFFFFF');
          nodeGrad.addColorStop(0.5, '#F1F5F9');
          nodeGrad.addColorStop(1, '#64748B');
        }

        ctx.fillStyle = nodeGrad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border ring
        ctx.strokeStyle = isSelected ? '#0F172A' : '#FFFFFF';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Inner units label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${isSelected ? 10 : 9}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${node.currentStock}u`, elevated.x, elevated.y);

        // 3d. Node Floating Identity Tag
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const tagY = elevated.y - radius - 5;

        // Tag background
        const tagText = node.shortName;
        ctx.font = 'bold 10px "Inter", sans-serif';
        const tagW = ctx.measureText(tagText).width;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = isCritical
          ? 'rgba(147, 0, 11, 0.4)'
          : isSelected
          ? 'rgba(15, 23, 42, 0.4)'
          : 'rgba(203, 213, 225, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(elevated.x - tagW / 2 - 5, tagY - 14, tagW + 10, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCritical ? '#93000B' : '#0F172A';
        ctx.fillText(tagText, elevated.x, tagY - 2);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [rotation, selectedSerotype, selectedFacilityId, getNodes]);

  // Mouse interaction handlers for smooth 3D orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      setRotation(prev => ({
        yaw: prev.yaw + deltaX * 0.008,
        pitch: Math.max(0.2, Math.min(0.85, prev.pitch - deltaY * 0.008)),
      }));
    } else {
      // Hit testing for hover
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const width = rect.width;
      const height = rect.height;
      const nodes = getNodes();

      // Project nodes and test distance to elevated heads
      let found: NetworkNode | null = null;
      for (const node of nodes) {
        // Compute projected position using same math
        const cosY = Math.cos(rotation.yaw);
        const sinY = Math.sin(rotation.yaw);
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        const cosP = Math.cos(rotation.pitch);
        const sinP = Math.sin(rotation.pitch);
        const y2 = node.y * cosP - z1 * sinP;

        const zoom = 1.85;
        const scale = (Math.min(width, height) / 260) * zoom;
        const screenX = width / 2 + x1 * scale;
        const screenY = height / 2 + 30 - y2 * scale;

        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        if (dist < 22) {
          found = node;
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          break;
        }
      }

      setHoveredNode(found);
      if (!found) setTooltipPos(null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const nodes = getNodes();

    for (const node of nodes) {
      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = node.x * cosY + node.z * sinY;
      const z1 = -node.x * sinY + node.z * cosY;

      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const y2 = node.y * cosP - z1 * sinP;

      const zoom = 1.85;
      const scale = (Math.min(width, height) / 260) * zoom;
      const screenX = width / 2 + x1 * scale;
      const screenY = height / 2 + 30 - y2 * scale;

      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
      if (dist < 24) {
        onSelectFacility(node.id);
        break;
      }
    }
  };

  const handleResetCamera = () => {
    setRotation({ yaw: 0.78, pitch: 0.52 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[400px] lg:h-[440px] bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60 rounded-2xl border border-slate-200/90 shadow-card overflow-hidden select-none ${className}`}
    >
      {/* 3D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setHoveredNode(null);
          setTooltipPos(null);
        }}
        onClick={handleCanvasClick}
        aria-label="3D Spatial Network Radar of Delhi NCR Blood Repositories"
      />

      {/* Floating HUD Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200/90 shadow-subtle backdrop-blur-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-primary animate-beacon" aria-hidden="true" />
          <span className="text-[11px] font-mono font-bold text-ink-main uppercase tracking-wider">
            Spatial Radar: Delhi-NCR Grid
          </span>
          <span className="text-[10px] font-mono bg-red-50 text-primary border border-red-200 px-1.5 py-0.2 rounded font-bold">
            {selectedSerotype} FOCUS
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white border border-slate-200/80 text-[11px] font-mono text-ink-secondary hover:text-ink-main shadow-subtle transition-all"
            title="Reset isometric camera view"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>Reset 3D View</span>
          </button>
        </div>
      </div>

      {/* Spatial Topology Legend & Instructions */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 text-[10px] font-mono text-ink-secondary bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-subtle backdrop-blur-md pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" /> Critical Deficit (Bank A)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Surplus Source (Bank B)
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">touch_app</span>
          Drag to Orbit • Click node to triage
        </span>
      </div>

      {/* Floating Hover Tooltip Card */}
      {hoveredNode && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 p-3 rounded-xl bg-white/92 text-ink-main border border-red-100 shadow-xl backdrop-blur-md w-60 text-xs font-sans transition-opacity duration-150"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-mono text-[10px]">
            <span className="text-slate-400">{hoveredNode.id}</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                hoveredNode.status === 'critical'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {hoveredNode.status}
            </span>
          </div>

          <div className="mt-1.5">
            <span className="font-bold text-[13px] text-white block">{hoveredNode.name}</span>
            <span className="text-[11px] text-slate-400 font-mono block">{hoveredNode.location}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 text-[9px] block uppercase">Current Stock</span>
              <strong
                className={`text-sm ${
                  hoveredNode.status === 'critical' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {hoveredNode.currentStock}u
              </strong>
              <span className="text-slate-500 text-[10px]"> / {hoveredNode.safetyFloor}u fl</span>
            </div>

            <div>
              <span className="text-slate-400 text-[9px] block uppercase">Net Delta</span>
              <strong
                className={`text-sm ${
                  hoveredNode.currentStock - hoveredNode.safetyFloor < 0
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {hoveredNode.currentStock - hoveredNode.safetyFloor > 0 ? '+' : ''}
                {hoveredNode.currentStock - hoveredNode.safetyFloor}u
              </strong>
              {hoveredNode.depletionHours && (
                <span className="text-slate-400 text-[10px] block">T+{hoveredNode.depletionHours}h runout</span>
              )}
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-sky-300 font-mono text-center">
            Click to focus inventory telemetry →
          </div>
        </div>
      )}
    </div>
  );
};
