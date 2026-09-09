import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   RAKTSAATHI BLOOD IMPACT VISUAL
   ---------------------------------------------------------
   The falling droplet animation is intentionally preserved.
   Only the impact/splash presentation is refined.
========================================================= */

const BLOOD_RED = "#8a0314";
const LIQUID_RED = "#a90a1d";
const LIQUID_HIGHLIGHT = "#d51c35";
const SPLASH_RED = "#8a0314";

/* =========================================================
   MAIN DROPLET GEOMETRY — KEEP AS-IS
========================================================= */

function useTeardropGeometry() {
  return useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 96;
    const bulge = 0.4;
    const Rmax = 0.5;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;

      if (t <= bulge) {
        const u = t / bulge;
        radius =
          Rmax *
          Math.sqrt(
            Math.max(0, 1 - Math.pow(1 - u, 2))
          );
      } else {
        const u = (t - bulge) / (1 - bulge);
        radius =
          Rmax *
          Math.cos((u * Math.PI) / 2);
      }

      const y = t - 0.5;

      points.push(
        new THREE.Vector2(
          Math.max(0.0008, radius),
          y
        )
      );
    }

    const geom = new THREE.LatheGeometry(points, 96);
    geom.computeVertexNormals();
    return geom;
  }, []);
}

/* =========================================================
   FALLING DROP
   ---------------------------------------------------------
   EXACT ORIGINAL TIMING
========================================================= */

function BloodDrop() {
  const group = useRef<THREE.Group>(null);
  const dropMesh = useRef<THREE.Mesh>(null);
  const dropGeom = useTeardropGeometry();

  const startY = 4.5;
  const impactY = 0.35;

  useFrame((state) => {
    if (!group.current || !dropMesh.current) return;

    const t = state.clock.getElapsedTime();
    const cycle = t % 4.8;

    if (cycle < 0.15) {
      group.current.visible = true;
      group.current.position.y = startY;
      group.current.scale.set(1, 1, 1);
    }

    if (cycle >= 0.15 && cycle < 1.65) {
      const p = (cycle - 0.15) / 1.5;
      const eased = p * p;

      group.current.position.y =
        startY + (impactY - startY) * eased;

      const stretch = 1 + eased * 0.25;
      const squeeze = 1 - eased * 0.1;

      group.current.scale.set(
        squeeze,
        stretch,
        squeeze
      );
    }

    if (cycle >= 1.65 && cycle < 1.8) {
      const p = (cycle - 1.65) / 0.15;

      group.current.position.y =
        impactY - p * 0.1;

      group.current.scale.set(
        1 + p * 0.35,
        1 - p * 0.45,
        1 + p * 0.35
      );
    }

    if (cycle >= 1.8) {
      group.current.visible = false;
    }
  });

  return (
    <group ref={group} position={[0, startY, 0]}>
      <mesh
        ref={dropMesh}
        geometry={dropGeom}
        castShadow
      >
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.6}
          chromaticAberration={0.05}
          anisotropy={0.3}
          distortion={0.12}
          distortionScale={0.3}
          temporalDistortion={0.08}
          transmission={0.25}
          roughness={0.02}
          ior={1.34}
          color={BLOOD_RED}
        />
      </mesh>

      <mesh position={[-0.18, -0.1, 0.38]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SOFT LIQUID FADE
========================================================= */

function useLiquidFadeTexture() {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        size * 0.03,
        size / 2,
        size / 2,
        size * 0.50
      );

      gradient.addColorStop(0, "rgba(255,255,255,0.96)");
      gradient.addColorStop(0.48, "rgba(255,255,255,0.93)");
      gradient.addColorStop(0.66, "rgba(255,255,255,0.72)");
      gradient.addColorStop(0.80, "rgba(255,255,255,0.43)");
      gradient.addColorStop(0.91, "rgba(255,255,255,0.16)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, []);
}

/* =========================================================
   LIQUID SURFACE
   ---------------------------------------------------------
   Large plane + alpha fade = no visible hard edge.
========================================================= */

function LiquidSurface() {
  const surface = useRef<THREE.Mesh>(null);
  const fadeTexture = useLiquidFadeTexture();

  useFrame(({ clock }) => {
    if (!surface.current) return;

    const mat =
      surface.current.material as THREE.MeshPhysicalMaterial;

    mat.clearcoatRoughness =
      0.035 +
      Math.sin(clock.elapsedTime * 1.25) * 0.006;
  });

  return (
    <mesh
      ref={surface}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.015, 0]}
      receiveShadow
      renderOrder={1}
    >
      <planeGeometry args={[24, 24, 1, 1]} />

      <meshPhysicalMaterial
        color={LIQUID_RED}
        roughness={0.13}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.035}
        transmission={0}
        alphaMap={fadeTexture}
        transparent
        opacity={0.90}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   IMPACT RING
   ---------------------------------------------------------
   A soft liquid deformation immediately under the splash.
========================================================= */

function ImpactRing() {
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ring.current) return;

    const cycle = clock.elapsedTime % 4.8;

    if (cycle < 1.65 || cycle > 3.35) {
      ring.current.visible = false;
      return;
    }

    ring.current.visible = true;

    const p = Math.min(
      1,
      (cycle - 1.65) / 1.7
    );

    const grow = Math.sin(
      Math.min(1, p * 1.2) * Math.PI * 0.5
    );

    const fade =
      p < 0.72
        ? 1
        : 1 - (p - 0.72) / 0.28;

    ring.current.scale.set(
      0.25 + grow * 0.85,
      0.25 + grow * 0.85,
      1
    );

    const mat =
      ring.current.material as THREE.MeshBasicMaterial;

    mat.opacity = Math.max(0, fade) * 0.34;
  });

  return (
    <mesh
      ref={ring}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.055, 0]}
      renderOrder={20}
    >
      <ringGeometry args={[0.45, 0.55, 96]} />

      <meshBasicMaterial
        color={LIQUID_HIGHLIGHT}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   RIPPLE
   ---------------------------------------------------------
   Same timing, but brighter near the impact and softer
   as it travels away.
========================================================= */

function Ripple({
  delay = 0,
  size = 1,
  color = "#ff5a68",
  thickness = 0.045,
  maxOpacity = 0.4,
}: {
  delay?: number;
  size?: number;
  color?: string;
  thickness?: number;
  maxOpacity?: number;
}) {
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ring.current) return;

    const cycle =
      (clock.elapsedTime - delay) % 4.8;

    if (cycle < 1.65 || cycle > 4.6) {
      ring.current.visible = false;
      return;
    }

    ring.current.visible = true;

    const p =
      (cycle - 1.65) / 2.95;

    const currentScale =
      0.1 + p * size * 3.2;

    ring.current.scale.set(
      currentScale,
      currentScale,
      1
    );

    const mat =
      ring.current.material as THREE.MeshBasicMaterial;

    const fade =
      Math.sin((1 - p) * Math.PI);

    mat.opacity =
      fade * maxOpacity;
  });

  return (
    <mesh
      ref={ring}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.065, 0]}
      renderOrder={25}
    >
      <ringGeometry
        args={[
          0.7,
          0.7 + thickness,
          128
        ]}
      />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   RIPPLE FIELD
========================================================= */

function RippleField() {
  const ripples = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const tone = i % 3;

      return {
        delay: i * 0.14,
        size: 1.1 + (i % 5) * 0.55,
        thickness: 0.035 + (i % 4) * 0.018,
        maxOpacity: 0.42 - (i % 5) * 0.045,
        color:
          tone === 0
            ? "#ffb5be"
            : tone === 1
            ? "#ff4355"
            : "#c40017",
      };
    });
  }, []);

  return (
    <>
      {ripples.map((r, i) => (
        <Ripple
          key={i}
          delay={r.delay}
          size={r.size}
          thickness={r.thickness}
          maxOpacity={r.maxOpacity}
          color={r.color}
        />
      ))}
    </>
  );
}

/* =========================================================
   REALISTIC LIQUID SPLASH ARC
   ---------------------------------------------------------
   The arc is generated in a radial vertical plane.
   depthTest=false is intentional: the liquid surface must
   never hide the visible splash.
========================================================= */

function SplashArc({
  angle,
  height,
  radius,
  thickness,
  phase,
}: {
  angle: number;
  height: number;
  radius: number;
  thickness: number;
  phase: number;
}) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 28;

    for (let i = 0; i <= segments; i++) {
      const p = i / segments;

      /*
       * A narrow liquid jet rises from the impact,
       * crests, then falls back toward the surface.
       */

      const radial =
        0.10 +
        Math.sin(p * Math.PI) *
          (radius * (0.78 + phase * 0.06));

      const y =
        Math.sin(p * Math.PI) *
          height +
        Math.sin(p * Math.PI * 2) *
          0.035;

      points.push(
        new THREE.Vector3(
          radial,
          y,
          0
        )
      );
    }

    return new THREE.CatmullRomCurve3(
      points,
      false,
      "catmullrom",
      0.55
    );
  }, [height, radius, phase]);

  const tube = useMemo(() => {
    return new THREE.TubeGeometry(
      geometry,
      36,
      thickness,
      12,
      false
    );
  }, [geometry, thickness]);

  return (
    <mesh
      geometry={tube}
      rotation={[0, angle, 0]}
      renderOrder={30}
    >
      <meshPhysicalMaterial
        color={SPLASH_RED}
        roughness={0.07}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.025}
        transmission={0}
        transparent
        opacity={0.98}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   SPLASH CROWN
   ---------------------------------------------------------
   ORIGINAL SPLASH WINDOW PRESERVED: 1.65 -> 3.2
========================================================= */

function SplashCrown() {
  const crownGroup = useRef<THREE.Group>(null);
  const reboundDrop = useRef<THREE.Mesh>(null);
  const teardropGeom = useTeardropGeometry();

  const arcs = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const angle =
        (i / 14) * Math.PI * 2;

      const major =
        i % 4 === 0;

      return {
        angle,
        height:
          major
            ? 0.78
            : 0.48 + (i % 3) * 0.08,
        radius:
          major
            ? 0.56
            : 0.40 + (i % 2) * 0.08,
        thickness:
          major
            ? 0.040
            : 0.028 + (i % 2) * 0.005,
        phase: i % 5,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (
      !crownGroup.current ||
      !reboundDrop.current
    ) {
      return;
    }

    const cycle =
      clock.elapsedTime % 4.8;

    if (
      cycle < 1.65 ||
      cycle > 3.2
    ) {
      crownGroup.current.visible = false;
      reboundDrop.current.visible = false;
      return;
    }

    crownGroup.current.visible = true;

    const p =
      (cycle - 1.65) / 1.55;

    /*
     * Keep the original crown scale behaviour.
     */

    const crownScale =
      Math.sin(
        Math.min(p * 2, 1) *
          Math.PI *
          0.5
      );

    crownGroup.current.scale.set(
      0.2 + crownScale * 0.9,
      Math.sin(p * Math.PI) * 0.8,
      0.2 + crownScale * 0.9
    );

    /*
     * Original rebound timing preserved.
     */

    if (p > 0.15 && p < 0.8) {
      reboundDrop.current.visible = true;

      const reboundP =
        (p - 0.15) / 0.65;

      const reboundY =
        Math.sin(
          reboundP * Math.PI
        ) * 1.1;

      reboundDrop.current.position.y =
        reboundY;

      reboundDrop.current.scale.setScalar(
        0.4 *
          Math.sin(
            reboundP * Math.PI
          )
      );
    } else {
      reboundDrop.current.visible = false;
    }
  });

  return (
    <group
      position={[0, 0.08, 0]}
      renderOrder={30}
    >
      <group ref={crownGroup}>
        {arcs.map((arc, i) => (
          <SplashArc
            key={i}
            angle={arc.angle}
            height={arc.height}
            radius={arc.radius}
            thickness={arc.thickness}
            phase={arc.phase}
          />
        ))}

        {/* Small suspended droplets */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle =
            (i / 18) *
              Math.PI *
              2 +
            (i % 2) * 0.16;

          const distance =
            0.42 +
            (i % 4) * 0.085;

          const height =
            0.18 +
            (i % 5) * 0.09;

          return (
            <mesh
              key={`micro-${i}`}
              position={[
                Math.cos(angle) *
                  distance,
                height,
                Math.sin(angle) *
                  distance,
              ]}
              renderOrder={32}
            >
              <sphereGeometry
                args={[
                  0.025 +
                    (i % 3) * 0.008,
                  16,
                  16,
                ]}
              />

              <meshPhysicalMaterial
                color={SPLASH_RED}
                roughness={0.055}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.025}
                transmission={0}
                transparent
                opacity={0.98}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* Rebound drop — opaque so it stays blood-red */}
      <mesh
        ref={reboundDrop}
        geometry={teardropGeom}
        position={[0, 0, 0]}
        renderOrder={34}
      >
        <meshPhysicalMaterial
          color={BLOOD_RED}
          roughness={0.06}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.025}
          transmission={0}
          transparent
          opacity={0.98}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SECONDARY DROPLETS
   ---------------------------------------------------------
   ORIGINAL TIMING PRESERVED
========================================================= */

function SecondaryDroplets() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const cycle =
      clock.elapsedTime % 4.8;

    group.current.visible =
      cycle >= 1.68 &&
      cycle <= 2.9;

    if (!group.current.visible) return;

    const p =
      (cycle - 1.68) / 1.22;

    group.current.children.forEach(
      (child, index) => {
        const angle =
          (index / 10) *
            Math.PI *
            2 +
          (index % 2) *
            0.2;

        const speed =
          1.1 +
          (index % 4) *
            0.25;

        const dist =
          0.5 +
          p * speed;

        child.position.x =
          Math.cos(angle) * dist;

        child.position.z =
          Math.sin(angle) * dist;

        const arcHeight =
          0.7 +
          (index % 3) *
            0.3;

        child.position.y =
          0.08 +
          Math.sin(p * Math.PI) *
            arcHeight;

        const size =
          Math.max(
            0.01,
            (1 - p * 0.6) *
              (0.05 +
                (index % 3) *
                  0.02)
          );

        child.scale.setScalar(
          size * 12
        );
      }
    );
  });

  return (
    <group
      ref={group}
      renderOrder={31}
    >
      {Array.from({ length: 10 }).map(
        (_, i) => (
          <mesh key={i}>
            <sphereGeometry
              args={[
                0.04,
                20,
                20
              ]}
            />

            <meshPhysicalMaterial
              color={SPLASH_RED}
              roughness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.02}
              transmission={0}
              transparent
              opacity={0.96}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   SCENE
========================================================= */

function BloodScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[
          0,
          3.05,
          6.6
        ]}
        fov={38}
      />

      <ambientLight intensity={0.58} />

      <directionalLight
        position={[
          -3,
          7,
          4
        ]}
        intensity={3.2}
        castShadow
        shadow-mapSize={[
          1024,
          1024
        ]}
      />

      <pointLight
        position={[
          3,
          3,
          3
        ]}
        intensity={2.2}
        color="#ff3344"
      />

      <pointLight
        position={[
          -3,
          1,
          -2
        ]}
        intensity={1.5}
        color="#990011"
      />

      <Environment preset="studio" />

      <LiquidSurface />

      <ImpactRing />

      <BloodDrop />

      <SplashCrown />

      <SecondaryDroplets />

      <RippleField />
    </>
  );
}

/* =========================================================
   EXPORTED COMPONENT
========================================================= */

function BloodDropSplash3D() {
  const [
    showMessage,
    setShowMessage
  ] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 2850);

    return () =>
      clearTimeout(timer);
  }, []);

  return (
    <div
      className="blood-drop-splash-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "620px",
        background: "transparent",
        overflow: "visible",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping:
            THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          overflow: "visible",
        }}
      >
        <BloodScene />
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "45px",
          transform: "translateX(-50%)",
          width: "100%",
          textAlign: "center",
          pointerEvents: "none",
          opacity: showMessage ? 1 : 0,
          transition:
            "opacity 1.2s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1)",
          zIndex: 50,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: "#c1121f",
            textShadow:
              "0 4px 20px rgba(193,18,31,.16)",
          }}
        >
          The right blood, at the right time,
          <br />
          can change a life.
        </p>
      </div>
    </div>
  );
}

export {
  BloodDropSplash3D
};

export default BloodDropSplash3D;
