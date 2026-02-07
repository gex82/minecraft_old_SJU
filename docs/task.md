# Minecraft Old San Juan - Task Roadmap

Status: Phase 1 MVP implemented  
Last Updated: 2026-02-07

## Phase 0: Project Initialization

- [x] Project directory scaffold
- [x] Planning documents
- [x] Git repository setup
- [x] README and agent context setup

## Phase 1: Core Engine Setup

### 1.1 Project Bootstrap
- [x] Vite-compatible project entry
- [x] Three.js dependencies configured
- [x] Development/build scripts
- [x] Canvas render bootstrap

### 1.2 Voxel Engine Foundation
- [x] Block registry
- [x] Chunk data structure (16x64x16)
- [x] Chunk mesh generation with face culling
- [x] Chunk load/unload based on player chunk

### 1.3 Camera and Controls
- [x] First-person camera
- [x] WASD movement
- [x] Pointer-lock mouse look
- [x] Jump + collision against solid voxels

### 1.4 World Management
- [x] Procedural island terrain
- [x] Dynamic chunk streaming
- [x] Landmark placement system
- [ ] Persistent save/load state

## Phase 2: Old San Juan Assets

### 2.1 Block Types
- [x] Cobblestone, stucco palette, terracotta, water, sand, palm blocks
- [x] Data contract file (`data/blocks.json`)

### 2.2 Landmark Structures
- [x] El Morro
- [x] San Juan Cathedral
- [x] La Fortaleza
- [x] Puerta de San Juan
- [x] Paseo de la Princesa
- [x] Colonial housing rows and city walls

## Phase 3: Game Features

### 3.1 Environment
- [x] Day/night cycle and sky/fog transitions
- [x] Ocean zone in terrain

### 3.2 Audio
- [x] Ambient ocean bed (procedural)
- [x] Coqui chirps at night (procedural)
- [x] Footstep sounds while walking

### 3.3 Interactivity
- [x] Landmark plaques with proximity detection
- [x] Pin/unpin plaque interaction (`E`)
- [ ] NPC guides
- [ ] Photo mode

## Phase 4: Polish and Launch

- [ ] Performance tuning pass (LOD/occlusion)
- [ ] Settings menu
- [ ] Minimap
- [ ] Deployment pipeline
- [ ] Demo capture
