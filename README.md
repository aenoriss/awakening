# Awakening

An interactive Three.js art piece. A lattice of pulsing spheres and turning cubes fills space around a title, a soundtrack loops, and the camera pushes in before it starts to orbit.

## What it is

I made this as a piece, not an exercise. It began from a Three.js scaffold, but the textures, the soundtrack, the title, and the motion are the work. You load it, the camera drifts inward through a field of fire and mud, the words "Awakening / By Aenoris" settle into view, and the whole lattice breathes. You can drag to look around; left alone, it rotates on its own.

## What it does

- A 10 by 10 by 10 grid of objects: 1000 spheres and 1000 cubes filling a cube of space
- Spheres pulse in scale, cubes rotate, so the field never sits still
- 3D beveled text for the title, drawn with a matcap material
- Fire and mud textures on the geometry, lit by ambient, directional, and point lights
- A looping soundtrack through the Three.js audio listener
- An opening camera dolly, then automatic orbit, with drag to look

## How it works

### The breathing lattice

A triple nested loop instantiates 2000 meshes, 1000 spheres and 1000 cubes, sharing two materials and two textures so the whole field is cheap to build. In the render loop each sphere's scale is driven by `Math.sin(elapsedTime + i)`, where `i` is the mesh index. That per-index phase offset is the trick: instead of the whole grid pulsing in unison, a wave ripples across it, because every sphere is a little further along its sine than its neighbor. The cubes rotate on their Y axis each frame. For the first 8 seconds the camera moves from z = 160 toward the center for the reveal, and after that OrbitControls autoRotate takes over. Meshes are tracked by their scene id and looked up each frame to animate them.

```mermaid
flowchart LR
  L[10x10x10 loop: 2000 meshes] --> R[render loop]
  R --> S["spheres: scale = sin(t + i)"]
  R --> C[cubes: rotate Y]
  R --> CAM[camera dolly to z=90, then autorotate]
```

## Tech stack

- Rendering: Three.js r130, WebGL
- Tooling: Webpack, Babel, dat.gui
- Assets: custom fire and mud textures, a beveled 3D title, a soundtrack

## Running it

```bash
npm install
npm run dev       # http://localhost:8080
npm run build     # production build in dist/
```

A built `dist/` is already checked in.

## Status

An interactive art piece from my Three.js work. It runs as a standalone scene, meant to be looked at and listened to rather than used.
