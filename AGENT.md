# Agent Context & Memory

## Current Focus

- Core playable prototype implemented
- Next focus: polish, save/load, deployment

## Implemented in This Session

### Architecture and Runtime
- Vite browser entry (`index.html`, `src/main.js`, `style.css`)
- Chunked voxel world pipeline
- Dynamic chunk streaming around player
- Face-culled mesh generation for opaque and transparent blocks

### Gameplay
- First-person controls (WASD, mouse look, sprint, jump)
- Pointer lock onboarding flow
- Voxel collision detection
- Landmark plaque interactions (`E` pin/unpin)

### World Content
- Terrain generation with island-style height mask
- Landmark layout for:
  - El Morro
  - San Juan Cathedral
  - La Fortaleza
  - Puerta de San Juan
  - Paseo de la Princesa
- Colonial house rows, roads, palms, and walls

### Environment and Audio
- Day/night lighting and sky transition
- Procedural ambient ocean loop
- Night coqui chirps
- Procedural footsteps

## Data Files Added

- `data/blocks.json`
- `data/structures/landmarks.json`

## Known Gaps

- No persistent world save/load yet
- No NPC guides yet
- No minimap/settings menu yet
- No deployment config yet

## Recommended Next Steps

1. Add save/load for modified chunks and player state
2. Add settings UI for render distance and audio volume
3. Add lightweight minimap and landmark index
4. Prepare production deployment target (GitHub Pages or static host)
