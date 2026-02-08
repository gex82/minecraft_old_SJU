# Minecraft Old San Juan - Task Roadmap

Status: Phase 4 Complete  
Last Updated: 2026-02-07

## Phase 0: Project Initialization
- [x] Project directory scaffold
- [x] Planning documents
- [x] Git repository setup
- [x] README and agent context setup

## Phase 1: Core Engine Setup
- [x] Vite-compatible project entry
- [x] Three.js dependencies configured
- [x] Voxel engine with chunk streaming
- [x] First-person camera + WASD controls + collision

## Phase 2: Old San Juan Assets
- [x] Block types (cobblestone, stucco, terracotta, etc.)
- [x] Landmark structures (El Morro, Cathedral, La Fortaleza, Puerta, Paseo)
- [x] Colonial housing rows and city walls

## Phase 3: Game Features
- [x] Day/night cycle with sky/fog transitions
- [x] Ambient audio (ocean, coqui, footsteps)
- [x] Landmark plaque interactions

## Phase 4: Polish and Launch
- [x] Settings menu (render distance, volume, toggles)
- [x] Minimap (player position, landmarks, terrain)
- [x] GitHub Pages deployment workflow (`.github/workflows/deploy.yml`)
- [ ] Performance tuning (LOD, frustum culling) - optional
- [ ] Visual polish (sun/moon, improved fog) - optional

## Deployment Instructions

```bash
# Local development
npm run dev

# Production build
npm run build

# Serve production locally
npx serve dist
```

GitHub Pages deployment is configured to run on push to `main`.
Expected Pages URL: `https://gex82.github.io/minecraft_old_SJU/`
