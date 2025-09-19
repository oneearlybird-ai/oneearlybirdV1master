# Three.js Circuit Board Background — 2025-09-19

Summary
- Added a client-only full-screen Three.js background with matte black PCB, copper traces, pulsing chip glow, and scroll-driven light.

Files
- `app/page.tsx` — dynamically imports background component with `ssr: false` so it runs only in the browser.
- `components/circuit-board-background.tsx` — initializes renderer, scene, camera; creates board plane, chip (GLTF fallback to box), copper traces, pulsing chip light; adds traveling light tied to scroll via GSAP ScrollTrigger; handles resize and full cleanup.
- `app/globals.css` — `.webgl-background` fixed, full-viewport, `z-index:-1` and `pointer-events:none` to stay behind content and non-interactive.

Packages
- Installed `three` and `gsap` in `apps/web`.

Notes
- Background is transparent; page CSS provides the dark backdrop.
- Pixel ratio capped at 2 for performance; shadows disabled.
- If `/public/models/microchip.glb` is present it will be used; otherwise a simple chip block renders.
- Single master ScrollTrigger maps page scroll to param along the main curve; easy to extend with per-section curves later.
- All listeners, ScrollTriggers, and GPU resources are disposed on unmount.

Next steps (optional)
- Add an HDR env map for more realistic copper reflections.
- Expand the path to form figure-eight loops around additional sections.
- Add subtle bloom (post-processing) guarded by a perf flag.
