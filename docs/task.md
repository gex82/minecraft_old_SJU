# Minecraft Old San Juan - Task Roadmap

> **Status**: 🟡 Planning Phase  
> **Last Updated**: 2026-02-07

---

## Phase 0: Project Initialization ✅

- [x] Create project directory structure
- [x] Set up `.gitignore`
- [x] Create `docs/implementation_plan.md`
- [x] Create `docs/task.md` (this file)
- [x] Create `docs/architecture_overview.md`
- [x] Create `docs/data_contract.md`
- [x] Create `README.md`
- [x] Create `AGENT.md`
- [x] Initialize Git repository
- [x] Connect to GitHub remote
- [ ] **User approval of planning documents**

---

## Phase 1: Core Engine Setup ⬜

### 1.1 Project Bootstrap
- [ ] Initialize Vite project with vanilla JS/TS
- [ ] Install Three.js and dependencies
- [ ] Configure development server
- [ ] Set up basic HTML canvas

### 1.2 Voxel Engine Foundation
- [ ] Implement basic block rendering
- [ ] Create chunk data structure
- [ ] Build chunk mesh generator
- [ ] Implement frustum culling

### 1.3 Camera & Controls
- [ ] First-person camera setup
- [ ] WASD movement controls
- [ ] Mouse look (pointer lock)
- [ ] Jump and collision detection

### 1.4 World Management
- [ ] Chunk loading system
- [ ] Distance-based chunk unloading
- [ ] Basic terrain generation
- [ ] Save/load world state

---

## Phase 2: Old San Juan Assets ⬜

### 2.1 Block Types
- [ ] Define block type registry
- [ ] Cobblestone (adoquines)
- [ ] Spanish colonial stucco (various colors)
- [ ] Terracotta roof tiles
- [ ] Wrought iron details
- [ ] Wooden doors and shutters
- [ ] Brick and stone walls

### 2.2 Texture Creation
- [ ] Create texture atlas (16x16 or 32x32 blocks)
- [ ] Colonial color palette (blue, pink, yellow, green)
- [ ] Weathered/aged texture variants
- [ ] UV mapping optimization

### 2.3 Landmark Structures
- [ ] El Morro fortress
- [ ] San Juan Cathedral
- [ ] La Fortaleza
- [ ] Paseo de la Princesa
- [ ] City gates (Puerta de San Juan)
- [ ] Typical colonial houses

---

## Phase 3: Game Features ⬜

### 3.1 Environment
- [ ] Day/night cycle
- [ ] Sky dome with Caribbean sky
- [ ] Ocean water shader
- [ ] Clouds and weather

### 3.2 Audio
- [ ] Ambient ocean waves
- [ ] Coquí frog sounds (night)
- [ ] Footsteps on cobblestone
- [ ] Colonial music/guitar

### 3.3 Interactivity
- [ ] Block interaction system
- [ ] Information plaques at landmarks
- [ ] Simple NPC tour guides
- [ ] Photo mode

---

## Phase 4: Polish & Launch ⬜

### 4.1 Performance
- [ ] Level of detail (LOD) system
- [ ] Occlusion culling
- [ ] Texture compression
- [ ] Mobile optimization

### 4.2 UI/UX
- [ ] Main menu
- [ ] Settings (graphics, audio, controls)
- [ ] Map/minimap
- [ ] Loading screens with historic facts

### 4.3 Deployment
- [ ] Production build optimization
- [ ] GitHub Pages hosting (or alternative)
- [ ] README with play instructions
- [ ] Demo video/screenshots

---

## Milestones

| Milestone | Description | Target |
|-----------|-------------|--------|
| M0 | Planning Complete | ✅ |
| M1 | Walkable voxel world | TBD |
| M2 | El Morro visible | TBD |
| M3 | Full Old San Juan | TBD |
| M4 | Public release | TBD |

---

## Notes & Decisions

- **Rendering**: Web-based (Three.js) for accessibility
- **Style**: Voxel aesthetic, not photorealistic
- **Scope**: Exploration-focused, minimal combat/survival mechanics
