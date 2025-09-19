"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-screen Three.js background: matte black PCB with copper traces,
 * pulsing chip glow, and a scroll-driven traveling light.
 *
 * Notes:
 * - Non-interactive: pointer-events: none and fixed positioning via CSS.
 * - Client-only: uses WebGL and window.
 */
export function CircuitBoardBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === "undefined") return;

    // Sizes
    const sizes = { width: window.innerWidth, height: window.innerHeight };

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    // Leave background transparent; page CSS provides black backdrop.

    const camera = new THREE.PerspectiveCamera(
      55,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 80);
    scene.add(camera);

    // Lights: ambient fill + faint directional + chip glow
    const ambient = new THREE.AmbientLight(0x222222, 0.3);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.12);
    dir.position.set(-30, 60, 80);
    scene.add(dir);

    // Board plane (optional, very subtle sheen)
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    {
      const boardGeom = new THREE.PlaneGeometry(400, 800);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0x0a0b0f,
        metalness: 0.25,
        roughness: 0.75,
      });
      const board = new THREE.Mesh(boardGeom, boardMat);
      board.position.set(0, 0, -5);
      boardGroup.add(board);
    }

    // Microchip: try to load glb, else fallback to simple geometry
    const chipGroup = new THREE.Group();
    scene.add(chipGroup);
    const chipPos = new THREE.Vector3(22, 28, 0); // top-right-ish

    const loader = new GLTFLoader();
    let chipLoaded = false;
    loader.load(
      "/models/microchip.glb",
      (gltf: any) => {
        const chip = gltf.scene;
        chip.position.copy(chipPos);
        chip.scale.set(6, 6, 6);
        chip.rotation.set(-Math.PI / 2, 0, 0); // lay flat
        chipGroup.add(chip);
        chipLoaded = true;
      },
      undefined,
      () => {
        // Fallback: simple chip block
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(16, 16, 3),
          new THREE.MeshStandardMaterial({ color: 0x111316, metalness: 0.05, roughness: 0.8 })
        );
        body.position.copy(chipPos);
        body.position.z = 1.5;
        chipGroup.add(body);

        // Pins (simple cylinders on two sides)
        const pinMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, metalness: 0.2, roughness: 0.6 });
        for (let i = -7; i <= 7; i += 2) {
          const pinLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 8), pinMat);
          pinLeft.position.set(chipPos.x - 8.8, chipPos.y + i, 0);
          pinLeft.rotation.z = Math.PI / 2;
          chipGroup.add(pinLeft);

          const pinRight = pinLeft.clone();
          // Align right-side pin material with pinMat without type narrowing
          // (local TS shims declare 'three' modules loosely for CSP-safe build)
          (pinRight as any).material = pinMat;
          pinRight.position.set(chipPos.x + 8.8, chipPos.y + i, 0);
          chipGroup.add(pinRight);
        }
      }
    );

    // Chip pulsing light
    const chipLight = new THREE.PointLight(0x00ffff, 0.9, 60, 2.0);
    chipLight.position.set(chipPos.x, chipPos.y, 10);
    scene.add(chipLight);

    // Copper traces: main curve with gentle loops and branches
    const copperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff8844),
      metalness: 1.0,
      roughness: 0.4,
      emissive: new THREE.Color(0x995522),
      emissiveIntensity: 0.05,
    });

    // Define a flowing path from top-right downward with a side loop near mid
    const mainPoints = [
      new THREE.Vector3(chipPos.x - 2, chipPos.y - 2, 0),
      new THREE.Vector3(16, 18, 0),
      new THREE.Vector3(8, 10, 0),
      new THREE.Vector3(0, 8, 0),
      // a soft loop left
      new THREE.Vector3(-10, 6, 0),
      new THREE.Vector3(-16, 0, 0),
      new THREE.Vector3(-10, -6, 0),
      new THREE.Vector3(0, -8, 0),
      // back to center then right a bit
      new THREE.Vector3(10, -12, 0),
      new THREE.Vector3(6, -24, 0),
      new THREE.Vector3(0, -36, 0),
      new THREE.Vector3(-6, -52, 0),
      new THREE.Vector3(0, -70, 0),
    ];
    const mainCurve = new THREE.CatmullRomCurve3(mainPoints, false, "centripetal", 0.5);
    const mainTube = new THREE.Mesh(
      new THREE.TubeGeometry(mainCurve, 400, 0.5, 8, false),
      copperMat
    );
    scene.add(mainTube);

    // Secondary branches
    const branches: any[] = [];
    const makeBranch = (anchor: any, delta: any[]) => {
      const pts = [anchor.clone(), ...delta.map((d) => anchor.clone().add(d))];
      const c = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 120, 0.28, 6, false), copperMat);
      scene.add(tube);
      branches.push(tube);
    };
    makeBranch(new THREE.Vector3(8, 10, 0), [new THREE.Vector3(14, 8, 0), new THREE.Vector3(18, 2, 0)]);
    makeBranch(new THREE.Vector3(-16, 0, 0), [new THREE.Vector3(-24, 2, 0), new THREE.Vector3(-28, 8, 0)]);
    makeBranch(new THREE.Vector3(0, -36, 0), [new THREE.Vector3(12, -40, 0), new THREE.Vector3(18, -48, 0)]);

    // Traveling light + small sphere for visibility
    const travelLight = new THREE.PointLight(0x00ffff, 2.4, 30, 2.0);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    travelLight.add(sphere);
    scene.add(travelLight);
    // Initialize at start of curve
    {
      const p0 = mainCurve.getPointAt(0);
      travelLight.position.copy(p0);
    }

    // Animation state
    let rafId = 0;
    let start = performance.now();
    let scrollProgress = 0; // 0..1 mapped to mainCurve

    // ScrollTrigger: single master mapping page scroll to path progress
    const body = document.scrollingElement || document.documentElement;
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: () => Math.max(2000, body.scrollHeight - window.innerHeight) + "px",
      scrub: true,
      onUpdate: (self: any) => {
        scrollProgress = THREE.MathUtils.clamp(self.progress, 0, 1);
      },
    });
    // Ensure initial measurements after content loads
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // Resize handling
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    // Render loop
    const tick = () => {
      const now = performance.now();
      const t = (now - start) / 1000; // seconds

      // Chip pulsing color + intensity
      const hue = (0.6 + 0.15 * Math.sin(t * 0.2)) % 1; // ~blue/teal/violet range
      const tmp = new THREE.Color().setHSL(hue, 0.7, 0.6);
      chipLight.color.copy(tmp);
      chipLight.intensity = 0.8 + 0.4 * Math.sin(t * 1.2);

      // Fallback mapping in case ScrollTrigger is unavailable or not updating
      if (!scrollProgress || Number.isNaN(scrollProgress)) {
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const denom = Math.max(1, docH - window.innerHeight);
        scrollProgress = THREE.MathUtils.clamp(window.scrollY / denom, 0, 1);
      }
      const pos = mainCurve.getPointAt(scrollProgress);
      travelLight.position.copy(pos);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      try {
        st.kill();
      } catch {}

      // Dispose geometries/materials
      const disposeMesh = (m: any) => {
        m.traverse((obj: any) => {
          const mesh = obj as any;
          if (mesh.geometry) mesh.geometry.dispose?.();
          const mat = (mesh as any).material as any;
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose?.());
          else mat?.dispose?.();
        });
      };
      disposeMesh(boardGroup);
      disposeMesh(chipGroup);
      disposeMesh(mainTube);
      branches.forEach(disposeMesh);
      disposeMesh(sphere);
      renderer.dispose();
      // Remove canvas
      renderer.domElement?.parentElement?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="webgl-background" aria-hidden="true" />;
}
