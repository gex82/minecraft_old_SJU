# Minecraft Old San Juan - Architecture Overview

> Technical architecture and system design documentation

---

## System Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        HTML["index.html"]
        CSS["styles.css"]
        JS["main.js"]
        
        subgraph "Game Engine"
            VE["VoxelEngine"]
            WM["WorldManager"]
            PM["PlayerManager"]
            AM["AudioManager"]
        end
        
        subgraph "Rendering"
            THREE["Three.js"]
            SCENE["Scene Graph"]
            CAM["Camera"]
            RENDER["WebGL Renderer"]
        end
        
        subgraph "Physics"
            CANNON["Cannon.js"]
            COL["Collision Detection"]
        end
    end
    
    subgraph "Assets (Static)"
        TEX["Textures/"]
        AUDIO["Audio/"]
        DATA["World Data/"]
    end
    
    HTML --> JS
    JS --> VE
    VE --> WM
    VE --> PM
    VE --> AM
    
    WM --> THREE
    PM --> CAM
    THREE --> SCENE
    SCENE --> RENDER
    
    PM --> CANNON
    CANNON --> COL
    
    WM --> DATA
    RENDER --> TEX
    AM --> AUDIO
```

---

## Component Diagram

```mermaid
classDiagram
    class Game {
        +init()
        +update(deltaTime)
        +render()
    }
    
    class VoxelEngine {
        +blockRegistry: Map
        +chunks: Map
        +addBlock(x, y, z, type)
        +removeBlock(x, y, z)
        +getBlock(x, y, z)
    }
    
    class Chunk {
        +x: number
        +z: number
        +blocks: Uint8Array
        +mesh: THREE.Mesh
        +generateMesh()
        +update()
    }
    
    class WorldManager {
        +chunks: Map
        +loadChunk(x, z)
        +unloadChunk(x, z)
        +getVisibleChunks(camera)
    }
    
    class Player {
        +position: Vector3
        +velocity: Vector3
        +camera: THREE.Camera
        +move(direction)
        +jump()
        +look(dx, dy)
    }
    
    class BlockType {
        +id: number
        +name: string
        +textures: object
        +solid: boolean
    }
    
    Game --> VoxelEngine
    Game --> WorldManager
    Game --> Player
    VoxelEngine --> Chunk
    VoxelEngine --> BlockType
    WorldManager --> Chunk
```

---

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Game
    participant VoxelEngine
    participant WorldManager
    participant Renderer
    
    User->>Browser: Load Page
    Browser->>Game: Initialize
    Game->>VoxelEngine: Create Engine
    Game->>WorldManager: Load Starting Area
    
    loop Game Loop (60 FPS)
        User->>Game: Input (WASD/Mouse)
        Game->>VoxelEngine: Update Player
        VoxelEngine->>WorldManager: Check Chunk Loading
        WorldManager->>VoxelEngine: Return Visible Chunks
        VoxelEngine->>Renderer: Render Frame
        Renderer->>Browser: Display
    end
```

---

## Chunk System

```mermaid
graph LR
    subgraph "Chunk Grid (Top View)"
        C1["Chunk(-1,-1)"]
        C2["Chunk(0,-1)"]
        C3["Chunk(1,-1)"]
        C4["Chunk(-1,0)"]
        C5["Chunk(0,0)<br/>PLAYER"]
        C6["Chunk(1,0)"]
        C7["Chunk(-1,1)"]
        C8["Chunk(0,1)"]
        C9["Chunk(1,1)"]
    end
    
    C1 --- C2 --- C3
    C4 --- C5 --- C6
    C7 --- C8 --- C9
    C1 --- C4 --- C7
    C2 --- C5 --- C8
    C3 --- C6 --- C9
```

**Chunk Properties:**
- Size: 16×16×256 blocks (x, z, y)
- Storage: Flat Uint8Array for block IDs
- Mesh: Generated on demand, cached
- Load radius: 4-8 chunks from player

---

## Directory Structure

```
minecraft_old_SJU/
├── docs/
│   ├── implementation_plan.md
│   ├── task.md
│   ├── architecture_overview.md  ← You are here
│   └── data_contract.md
├── src/
│   ├── engine/
│   │   ├── VoxelEngine.js
│   │   ├── Chunk.js
│   │   ├── BlockRegistry.js
│   │   └── MeshBuilder.js
│   ├── game/
│   │   ├── Player.js
│   │   ├── Camera.js
│   │   ├── DayNight.js
│   │   └── Audio.js
│   ├── world/
│   │   ├── WorldManager.js
│   │   ├── ChunkLoader.js
│   │   └── structures/
│   └── main.js
├── static/
│   ├── textures/
│   ├── audio/
│   └── models/
├── data/
│   ├── blocks.json
│   └── structures/
├── templates/
├── scripts/
├── tests/
├── index.html
├── style.css
├── package.json
├── README.md
├── AGENT.md
└── .gitignore
```

---

## Technology Stack Details

### Rendering Pipeline

```mermaid
graph LR
    A["Block Data"] --> B["Mesh Generator"]
    B --> C["Geometry Buffer"]
    C --> D["Three.js Mesh"]
    D --> E["Scene Graph"]
    E --> F["WebGL Renderer"]
    F --> G["Canvas"]
```

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Three.js | ^0.160.0 | 3D rendering |
| Cannon.js | ^0.6.2 | Physics |
| Howler.js | ^2.2.4 | Audio |
| Vite | ^5.0.0 | Build tool |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | 60 FPS | Chrome DevTools |
| Load Time | <3 sec | Lighthouse |
| Chunk Load | <100ms | Performance API |
| Memory | <512MB | Task Manager |

---

## Old San Juan Map Layout

```mermaid
graph TB
    subgraph "Old San Juan District"
        EM["El Morro<br/>🏰"]
        SC["San Cristóbal<br/>🏰"]
        CAT["Cathedral<br/>⛪"]
        GOV["La Fortaleza<br/>🏛️"]
        GATE["Puerta de San Juan<br/>🚪"]
        PASEO["Paseo de la Princesa<br/>🚶"]
        PLAZA["Plaza de Armas<br/>⛲"]
    end
    
    subgraph "Water"
        BAY["San Juan Bay<br/>🌊"]
        ATL["Atlantic Ocean<br/>🌊"]
    end
    
    EM --- SC
    EM --- GATE
    GATE --- PASEO
    PASEO --- BAY
    SC --- PLAZA
    PLAZA --- CAT
    CAT --- GOV
    GOV --- BAY
    EM --- ATL
    SC --- ATL
```
