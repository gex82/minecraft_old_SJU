# Minecraft Old San Juan - Implementation Plan

Project goal: build a browser-based voxel exploration experience of Old San Juan with recognizable landmarks, smooth traversal, and lightweight game systems.

Last updated: 2026-02-07

## Current Delivery State

### Completed
- Vite + Three.js runtime bootstrapped
- Chunked voxel renderer with dynamic load/unload
- First-person controller (WASD, mouse look, jump, collision)
- Day/night cycle with sky and fog transitions
- Ambient procedural audio (ocean, coqui, footsteps)
- Landmark structures and plaque interactions
- Settings panel (render distance, volume, HUD toggles)
- Circular minimap overlay
- GitHub Pages deployment workflow

### In Progress / Remaining
- Performance tuning (LOD, frustum culling, chunk rebuild optimization)
- Save/load for player and modified chunks
- Optional polish (sun/moon indicator, deeper atmosphere effects)
- Optional feature growth (NPC tour guides, photo mode)

## Implemented File Map

### Core runtime
- `src/main.js`
- `index.html`
- `style.css`

### Engine
- `src/engine/BlockRegistry.js`
- `src/engine/Chunk.js`
- `src/engine/MeshBuilder.js`
- `src/engine/VoxelEngine.js`
- `src/engine/constants.js`

### World
- `src/world/WorldManager.js`
- `src/world/structures/LandmarkLayout.js`

### Gameplay systems
- `src/game/Player.js`
- `src/game/DayNight.js`
- `src/game/Audio.js`
- `src/game/Settings.js`
- `src/game/Minimap.js`

### Data and deployment
- `data/blocks.json`
- `data/structures/landmarks.json`
- `vite.config.js`
- `.github/workflows/deploy.yml`

## Verification Plan

1. Install dependencies: `npm install`
2. Run local dev: `npm run dev`
3. Build production bundle: `npm run build`
4. Validate controls and systems manually:
   - Movement, collision, jumping
   - Landmark plaques and minimap markers
   - Settings persistence and volume behavior
   - Render distance changes without crashes

## Next Execution Steps

1. Add chunk/save persistence layer
2. Implement mesh rebuild batching for better frame stability
3. Add optional gameplay extensions (NPC guides, photo mode)
