# Minecraft Old San Juan

Voxel exploration game that recreates core landmarks of Old San Juan in the browser.

## Status

Playable prototype complete:
- Chunked voxel world streaming
- First-person controls with collision and jump
- Day/night lighting cycle
- Ambient procedural audio (ocean + coqui chirps + footsteps)
- Landmark plaques for El Morro, La Fortaleza, San Juan Cathedral, Paseo, and Puerta de San Juan
- Settings panel with persisted preferences
- Circular minimap with landmark markers

## Tech Stack

- Three.js for rendering
- Vite for dev/build
- Howler.js + WebAudio for ambient sound
- Vanilla JavaScript modules

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Controls

- `W/A/S/D`: Move
- `Mouse`: Look around
- `Space`: Jump
- `Shift`: Sprint
- `E`: Pin/clear landmark plaque
- `Esc`: Open/close settings while in-game

## Project Structure

```text
src/
  engine/       chunk storage, block registry, mesh build, render bridge
  world/        terrain generation, chunk loading, landmark placement
  game/         player controller, day/night, audio
  main.js       bootstrap and game loop
data/
  blocks.json
  structures/landmarks.json
docs/
  implementation_plan.md
  architecture_overview.md
  task.md
```

## Build

```bash
npm run build
npm run preview
```
