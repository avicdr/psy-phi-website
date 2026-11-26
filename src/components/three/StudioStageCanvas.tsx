"use client";

import React, {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  GARMENTS,
  Garment,
  GarmentHotspot,
  GarmentSide,
  MANNEQUIN_MODEL_URL,
} from "@/lib/garments";

export type StudioViewMode = "full" | "front" | "back" | "detail" | "fabric";
export type LightingMood = "darkroom" | "gallery" | "oxblood";

interface StudioStageProps {
  garment: Garment;
  colorwayId: string;
  side: GarmentSide;
  viewMode: StudioViewMode;
  turntable?: boolean;
  lightingMood?: LightingMood;
  transparentBackground?: boolean;
  hideOverlayBadge?: boolean;
  className?: string;
  compact?: boolean;
  enableZoom?: boolean;
  scrollProgress?: number;
  hotspots?: GarmentHotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot?: (spot: GarmentHotspot) => void;
  onUserInteract?: () => void;
}

class WebGLErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const LIGHTING_PRESETS: Record<
  LightingMood,
  {
    ambient: number;
    keyColor: string;
    keyIntensity: number;
    fillIntensity: number;
    rimColor: string;
    rimIntensity: number;
    bgHex: string;
  }
> = {
  darkroom: {
    ambient: 0.54,
    keyColor: "#fff8ee",
    keyIntensity: 62,
    fillIntensity: 18,
    rimColor: "#ebe4d6",
    rimIntensity: 26,
    bgHex: "#080706",
  },
  gallery: {
    ambient: 0.92,
    keyColor: "#ffffff",
    keyIntensity: 78,
    fillIntensity: 26,
    rimColor: "#f4efe4",
    rimIntensity: 30,
    bgHex: "#161513",
  },
  oxblood: {
    ambient: 0.48,
    keyColor: "#ffece7",
    keyIntensity: 56,
    fillIntensity: 24,
    rimColor: "#c83e2e",
    rimIntensity: 34,
    bgHex: "#0b0706",
  },
};

function StudioDustMotes({ accentHex }: { accentHex: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 88;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 43758.5453;
      const c = Math.sin(i * 39.425) * 43758.5453;
      positions[i * 3] = (a - Math.floor(a) - 0.5) * 5.2;
      positions[i * 3 + 1] = (b - Math.floor(b)) * 3.4 - 1.2;
      positions[i * 3 + 2] = (c - Math.floor(c) - 0.5) * 4.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += Math.min(delta, 0.05) * 0.035;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.015}
        color={accentHex}
        transparent
        opacity={0.34}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function HotspotBeacon3D({
  spot,
  isActive,
  onSelect,
  assemblyRef,
}: {
  spot: GarmentHotspot;
  isActive: boolean;
  onSelect: (spot: GarmentHotspot) => void;
  assemblyRef: React.RefObject<THREE.Group | null>;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const vecsRef = useRef({
    worldPos: new THREE.Vector3(),
    worldNorm: new THREE.Vector3(),
    camDir: new THREE.Vector3(),
  });

  useFrame(({ camera }) => {
    const el = btnRef.current;
    const grp = assemblyRef.current;
    if (!el || !grp) return;

    const { worldPos, worldNorm, camDir } = vecsRef.current;
    worldPos
      .set(spot.position3D[0], spot.position3D[1], spot.position3D[2])
      .applyMatrix4(grp.matrixWorld);
    worldNorm
      .set(spot.normal3D[0], spot.normal3D[1], spot.normal3D[2])
      .transformDirection(grp.matrixWorld)
      .normalize();

    camDir.copy(camera.position).sub(worldPos).normalize();
    const facing = worldNorm.dot(camDir);

    const visible = facing > 0.08;
    if (visible || isActive) {
      el.style.visibility = "visible";
      const opacity = isActive
        ? 1
        : THREE.MathUtils.clamp((facing - 0.08) * 3.2, 0.35, 1);
      el.style.opacity = String(opacity.toFixed(2));
      el.style.pointerEvents = "auto";
    } else {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.style.visibility = "hidden";
    }
  });

  return (
    <Html position={spot.position3D} center zIndexRange={[25, 0]}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(spot);
        }}
        data-cursor="inspect"
        aria-label={`3D Specimen Pin ${spot.code}: ${spot.title}`}
        className={`flex h-6 w-6 items-center justify-center border font-mono text-[10px] shadow-lg transition-transform duration-200 hover:scale-115 ${
          isActive
            ? "border-[#EDE7D9] bg-[#B23A2E] text-[#EDE7D9] scale-110"
            : "border-[#EDE7D9]/85 bg-[#090807]/90 text-[#EDE7D9]"
        }`}
      >
        {isActive ? "×" : "+"}
      </button>
    </Html>
  );
}

interface ExhibitionAssemblyProps {
  garment: Garment;
  colorwayId: string;
  side: GarmentSide;
  viewMode: StudioViewMode;
  turntable: boolean;
  lightingMood: LightingMood;
  transparentBackground: boolean;
  compact: boolean;
  enableZoom: boolean;
  scrollProgress: number;
  hotspots?: GarmentHotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot?: (spot: GarmentHotspot) => void;
  onUserInteract?: () => void;
}

function ExhibitionAssembly({
  garment,
  colorwayId,
  side,
  viewMode,
  turntable,
  lightingMood,
  transparentBackground,
  compact,
  enableZoom,
  scrollProgress,
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  onUserInteract,
}: ExhibitionAssemblyProps) {
  const assemblyRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const orbitRef = useRef<OrbitControlsImpl>(null);

  const isTransitioningRef = useRef(true);
  const targetCamSphericalRef = useRef(new THREE.Spherical(3.25, Math.PI * 0.48, 0));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.02, 0));
  const workSphericalRef = useRef(new THREE.Spherical());
  const workVecRef = useRef(new THREE.Vector3());
  const runwayPulseRef = useRef(0);
  const prevSlugRef = useRef(garment.slug);

  const colorway =
    garment.colorways.find((c) => c.id === colorwayId) ?? garment.colorways[0];

  // Load sculpted anatomical mannequin & active garment GLB
  const mannequinGltf = useGLTF(garment.mannequinUrl || MANNEQUIN_MODEL_URL);
  const garmentGltf = useGLTF(garment.modelUrl);

  const mannequinScene = useMemo(
    () => mannequinGltf.scene.clone(true),
    [mannequinGltf.scene]
  );
  const garmentScene = useMemo(
    () => garmentGltf.scene.clone(true),
    [garmentGltf.scene]
  );

  // Load colorway PBR maps (albedo + normal + optional seam patch atlas)
  const texturePaths = useMemo(() => {
    const list = [colorway.textureMap, colorway.normalMap];
    if (colorway.patchAtlasMap) {
      list.push(colorway.patchAtlasMap);
    }
    return list;
  }, [colorway.textureMap, colorway.normalMap, colorway.patchAtlasMap]);

  const loadedTextures = useLoader(THREE.TextureLoader, texturePaths);

  const configuredTextures = useMemo(() => {
    const [rawAlbedo, rawNormal, rawPatch] = loadedTextures;
    const albedoTex = rawAlbedo ? rawAlbedo.clone() : undefined;
    const normalTex = rawNormal ? rawNormal.clone() : undefined;
    const patchTex = rawPatch ? rawPatch.clone() : undefined;

    if (albedoTex) {
      albedoTex.colorSpace = THREE.SRGBColorSpace;
      albedoTex.flipY = true;
      albedoTex.anisotropy = 16;
      albedoTex.needsUpdate = true;
    }
    if (normalTex) {
      normalTex.wrapS = THREE.RepeatWrapping;
      normalTex.wrapT = THREE.RepeatWrapping;
      normalTex.repeat.set(5, 5);
      normalTex.flipY = true;
      normalTex.needsUpdate = true;
    }
    if (patchTex) {
      patchTex.colorSpace = THREE.SRGBColorSpace;
      patchTex.flipY = true;
      patchTex.anisotropy = 16;
      patchTex.needsUpdate = true;
    }
    return [albedoTex, normalTex, patchTex] as const;
  }, [loadedTextures]);

  useEffect(() => {
    return () => {
      configuredTextures.forEach((t) => t?.dispose());
    };
  }, [configuredTextures]);

  useEffect(() => {
    const [albedoTex, normalTex, patchTex] = configuredTextures;

    mannequinScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    garmentScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name;
        const origMat = mesh.material as THREE.MeshStandardMaterial;

        if (
          name.includes("Body") ||
          name.includes("ShirtBody") ||
          name.includes("SewnPatches")
        ) {
          const isPatchMesh = name.includes("SewnPatches") && Boolean(patchTex);
          const physMat = new THREE.MeshPhysicalMaterial({
            map: (isPatchMesh ? patchTex : albedoTex) ?? null,
            normalMap: isPatchMesh ? null : (normalTex ?? null),
            normalScale: new THREE.Vector2(0.32, 0.32),
            roughness: isPatchMesh
              ? 0.88
              : (colorway.roughnessFactor ?? 0.82),
            metalness: 0.03,
            sheen: 0.48,
            sheenRoughness: 0.68,
            sheenColor: new THREE.Color(garment.accentHex).lerp(
              new THREE.Color("#F4EFE4"),
              0.72
            ),
            side: THREE.DoubleSide,
          });
          mesh.material = physMat;
        } else if (origMat) {
          origMat.needsUpdate = true;
        }
      }
    });
  }, [
    mannequinScene,
    garmentScene,
    configuredTextures,
    colorway.roughnessFactor,
    garment.accentHex,
  ]);

  // Trigger spherical arc orbit whenever user switches side, viewMode, or garment style
  useEffect(() => {
    const fullDist = compact ? 2.85 : transparentBackground ? 3.05 : 3.25;
    const bodyDist = compact ? 2.45 : 2.65;
    let radius = fullDist;
    let phi = Math.PI * 0.49;
    let theta = side === "back" ? Math.PI : 0;
    let lx = 0;
    let ly = 0.02;
    const lz = 0;

    if (viewMode === "detail") {
      radius = 1.62;
      phi = Math.PI * 0.45;
      theta = side === "back" ? Math.PI + 0.12 : 0.12;
      ly = 0.12;
      lx = 0.02;
    } else if (viewMode === "fabric") {
      radius = 1.32;
      phi = Math.PI * 0.44;
      theta = side === "back" ? Math.PI - 0.56 : 0.56;
      ly = 0.10;
    } else if (viewMode === "front") {
      radius = bodyDist;
      phi = Math.PI * 0.47;
      theta = 0;
      ly = 0.08;
    } else if (viewMode === "back") {
      radius = bodyDist;
      phi = Math.PI * 0.47;
      theta = Math.PI;
      ly = 0.08;
    }

    targetCamSphericalRef.current.set(radius, phi, theta);
    targetLookAtRef.current.set(lx, ly, lz);
    isTransitioningRef.current = true;
  }, [side, viewMode, garment.slug, compact, transparentBackground]);

  useEffect(() => {
    if (prevSlugRef.current !== garment.slug) {
      prevSlugRef.current = garment.slug;
      runwayPulseRef.current = 1.0;
    }
  }, [garment.slug]);

  const preset = LIGHTING_PRESETS[lightingMood];

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { pointer, camera } = state;

    // 1. Key spotlight tracks cursor gracefully across torso
    if (keyLightRef.current) {
      keyLightRef.current.position.set(
        THREE.MathUtils.damp(
          keyLightRef.current.position.x,
          pointer.x * 2.4 + 1.2,
          4.5,
          dt
        ),
        THREE.MathUtils.damp(
          keyLightRef.current.position.y,
          pointer.y * 1.3 + 2.8,
          4.5,
          dt
        ),
        3.4
      );
    }

    // 2. Spherical arc runway camera transition (never cuts through center of bust!)
    if (isTransitioningRef.current && orbitRef.current) {
      const look = orbitRef.current.target;
      look.lerp(targetLookAtRef.current, Math.min(1, dt * 6));

      const s = workSphericalRef.current;
      const v = workVecRef.current;
      v.copy(camera.position).sub(look);
      s.setFromVector3(v);

      const targetS = targetCamSphericalRef.current;
      s.radius = THREE.MathUtils.damp(s.radius, targetS.radius, 6, dt);
      s.phi = THREE.MathUtils.damp(s.phi, targetS.phi, 6, dt);

      let dTheta = targetS.theta - s.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      if (Math.abs(Math.abs(dTheta) - Math.PI) < 0.02) {
        dTheta = Math.PI - 0.025;
      }
      s.theta += dTheta * Math.min(1, dt * 5.8);

      v.setFromSpherical(s).add(look);
      camera.position.copy(v);
      orbitRef.current.update();

      if (
        Math.abs(s.radius - targetS.radius) < 0.02 &&
        Math.abs(dTheta) < 0.025
      ) {
        isTransitioningRef.current = false;
      }
    }

    // 3. Mannequin turntable spin, runway switch flourish & hero scroll pitch
    if (assemblyRef.current) {
      if (runwayPulseRef.current > 0.005) {
        runwayPulseRef.current = THREE.MathUtils.damp(
          runwayPulseRef.current,
          0,
          4.2,
          dt
        );
      }

      if (turntable && !isTransitioningRef.current) {
        assemblyRef.current.rotation.y += dt * 0.45;
      } else {
        // Gentle magnetic breathing / scroll depth offset without locking OrbitControls
        const targetScrollSpin = scrollProgress * 0.85;
        if (!turntable && Math.abs(scrollProgress) > 0.001) {
          assemblyRef.current.rotation.y = THREE.MathUtils.damp(
            assemblyRef.current.rotation.y,
            targetScrollSpin + runwayPulseRef.current * 0.6,
            5,
            dt
          );
        } else if (!turntable) {
          assemblyRef.current.rotation.y = THREE.MathUtils.damp(
            assemblyRef.current.rotation.y,
            pointer.x * 0.12 + runwayPulseRef.current * 0.65,
            5.5,
            dt
          );
        }
      }

      assemblyRef.current.position.y =
        THREE.MathUtils.damp(
          assemblyRef.current.position.y,
          -0.05 - runwayPulseRef.current * 0.04,
          6,
          dt
        );
    }
  });

  const scaleFactor = compact ? 1.25 : 1.40;

  return (
    <>
      <ambientLight intensity={preset.ambient} color="#ede7d9" />
      <spotLight
        ref={keyLightRef}
        position={[1.4, 2.9, 3.4]}
        angle={0.46}
        penumbra={0.85}
        intensity={preset.keyIntensity}
        color={preset.keyColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      <pointLight
        position={[-2.4, 1.4, 1.8]}
        intensity={preset.fillIntensity}
        color={garment.accentHex}
      />
      <pointLight
        position={[2.4, 1.2, -2.4]}
        intensity={preset.rimIntensity}
        color={preset.rimColor}
      />
      <pointLight position={[-2.2, 1.0, -2.4]} intensity={24} color="#f4efe4" />
      <pointLight position={[0, -1.2, 2.2]} intensity={8} color="#f4efe4" />

      {/* Grounded Sculptural Mannequin + Bespoke .glb Garment */}
      <group
        ref={assemblyRef}
        position={[0, 0, 0]}
        scale={scaleFactor}
      >
        <primitive object={mannequinScene} />
        <primitive object={garmentScene} />

        {/* Accent specimen laser halo ring recessed on plinth surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.685, 0]}>
          <ringGeometry args={[0.455, 0.470, 72]} />
          <meshBasicMaterial color={garment.accentHex} transparent opacity={0.88} />
        </mesh>

        {/* True 3D World-Space Hotspot Pins attached directly to the garment surface */}
        {hotspots &&
          onSelectHotspot &&
          hotspots.map((spot) => (
            <HotspotBeacon3D
              key={spot.id}
              spot={spot}
              isActive={activeHotspotId === spot.id}
              onSelect={onSelectHotspot}
              assemblyRef={assemblyRef}
            />
          ))}
      </group>

      {!transparentBackground && (
        <>
          <mesh position={[-3.4, 0.2, -2.8]} receiveShadow>
            <boxGeometry args={[0.42, 7.0, 0.42]} />
            <meshStandardMaterial
              color="#131210"
              roughness={0.88}
              metalness={0.12}
            />
          </mesh>
          <mesh position={[3.4, 0.2, -2.8]} receiveShadow>
            <boxGeometry args={[0.42, 7.0, 0.42]} />
            <meshStandardMaterial
              color="#131210"
              roughness={0.88}
              metalness={0.12}
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.06, 0]}
            receiveShadow
          >
            <circleGeometry args={[12, 64]} />
            <meshStandardMaterial
              color="#0a0908"
              roughness={0.82}
              metalness={0.18}
            />
          </mesh>
        </>
      )}

      <ContactShadows
        position={[0, -1.03, 0]}
        opacity={0.72}
        scale={5.2}
        blur={2.0}
        far={2.2}
        color="#000000"
      />

      <StudioDustMotes accentHex={garment.accentHex} />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enablePan={false}
        enableZoom={enableZoom}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.82}
        minDistance={1.35}
        maxDistance={4.4}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.62}
        onStart={() => {
          isTransitioningRef.current = false;
          onUserInteract?.();
        }}
      />
    </>
  );
}

export function StudioStageCanvas({
  garment,
  colorwayId,
  side,
  viewMode,
  turntable = false,
  lightingMood = "darkroom",
  transparentBackground = false,
  hideOverlayBadge = false,
  className = "",
  compact = false,
  enableZoom = false,
  scrollProgress = 0,
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  onUserInteract,
}: StudioStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    useGLTF.preload(MANNEQUIN_MODEL_URL);
    GARMENTS.forEach((g) => useGLTF.preload(g.modelUrl));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.04 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colorway =
    garment.colorways.find((c) => c.id === colorwayId) ?? garment.colorways[0];

  const activePhoto =
    side === "back"
      ? colorway.backImage
      : viewMode === "detail" || viewMode === "fabric"
        ? colorway.detailImage
        : colorway.frontImage;

  const fallbackUI = (
    <div className="relative flex h-full w-full items-center justify-center bg-transparent p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activePhoto}
        alt={`${garment.title} — ${side} studio view`}
        className="max-h-full w-auto border border-[#EDE7D9]/20 object-contain shadow-2xl"
      />
      <span className="absolute bottom-3 left-3 bg-[#090807]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#948E82]">
        Archival Studio Fallback ({side})
      </span>
    </div>
  );

  const presetBg = LIGHTING_PRESETS[lightingMood].bgHex;

  return (
    <div
      ref={containerRef}
      data-cursor="drag"
      className={`relative h-full w-full select-none overflow-hidden ${className}`}
    >
      <WebGLErrorBoundary fallback={fallbackUI}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          frameloop={inView ? "always" : "demand"}
          camera={{ position: [0, 0.24, 3.0], fov: compact ? 38 : 34 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.16;
            gl.domElement.setAttribute("role", "img");
            gl.domElement.setAttribute(
              "aria-label",
              `Interactive 360-degree 3D mannequin wearing ${garment.title} (${colorway.name}). Drag to orbit.`
            );
          }}
        >
          {!transparentBackground && (
            <>
              <color attach="background" args={[presetBg]} />
              <fog attach="fog" args={[presetBg, 5.2, 13]} />
            </>
          )}

          <Suspense fallback={null}>
            <ExhibitionAssembly
              garment={garment}
              colorwayId={colorwayId}
              side={side}
              viewMode={viewMode}
              turntable={turntable}
              lightingMood={lightingMood}
              transparentBackground={transparentBackground}
              compact={compact}
              enableZoom={enableZoom}
              scrollProgress={scrollProgress}
              hotspots={hotspots}
              activeHotspotId={activeHotspotId}
              onSelectHotspot={onSelectHotspot}
              onUserInteract={onUserInteract}
            />

            <Environment resolution={256} frames={1} environmentIntensity={0.44}>
              <Lightformer
                form="rect"
                intensity={2.6}
                position={[0, 4, 2]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[6, 2, 1]}
                color="#EDE7D9"
              />
              <Lightformer
                form="rect"
                intensity={1.7}
                position={[-4, 1, 1]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[3, 4, 1]}
                color={garment.accentHex}
              />
              <Lightformer
                form="rect"
                intensity={1.4}
                position={[4, 0, -2]}
                rotation={[0, -Math.PI / 2, 0]}
                scale={[3, 4, 1]}
                color="#8f897d"
              />
            </Environment>
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {!hideOverlayBadge && (
        <div className="pointer-events-none absolute top-3.5 left-3.5 flex items-center gap-2 bg-[#090807]/75 px-3 py-1.5 backdrop-blur-md">
          <span
            className="h-1.5 w-1.5"
            style={{ backgroundColor: garment.accentHex }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#F4EFE4]/85">
            360° 3D · {colorway.name.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
