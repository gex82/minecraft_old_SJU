# Minecraft Old San Juan - Data Contract

> Defines data structures and schemas for the voxel world

---

## Block Data Schema

### Block Type Definition

```json
{
  "id": 1,
  "name": "cobblestone",
  "displayName": "Adoquín (Cobblestone)",
  "category": "ground",
  "solid": true,
  "transparent": false,
  "textures": {
    "top": "cobblestone.png",
    "bottom": "cobblestone.png",
    "sides": "cobblestone.png"
  },
  "sounds": {
    "walk": "stone_walk.ogg",
    "place": "stone_place.ogg"
  }
}
```

### Block Registry (blocks.json)

```json
{
  "version": "1.0.0",
  "blocks": [
    { "id": 0, "name": "air", "solid": false, "transparent": true },
    { "id": 1, "name": "cobblestone", "solid": true },
    { "id": 2, "name": "brick", "solid": true },
    { "id": 3, "name": "stucco_white", "solid": true },
    { "id": 4, "name": "stucco_blue", "solid": true },
    { "id": 5, "name": "stucco_pink", "solid": true },
    { "id": 6, "name": "stucco_yellow", "solid": true },
    { "id": 7, "name": "terracotta_tile", "solid": true },
    { "id": 8, "name": "wood_dark", "solid": true },
    { "id": 9, "name": "iron_grate", "solid": true, "transparent": true },
    { "id": 10, "name": "water", "solid": false, "transparent": true },
    { "id": 11, "name": "sand", "solid": true },
    { "id": 12, "name": "palm_trunk", "solid": true },
    { "id": 13, "name": "palm_leaves", "solid": false, "transparent": true }
  ]
}
```

---

## Chunk Data Schema

### Chunk Storage Format

```typescript
interface Chunk {
  x: number;           // Chunk X coordinate (world space / 16)
  z: number;           // Chunk Z coordinate (world space / 16)
  blocks: Uint8Array;  // 16x256x16 = 65,536 block IDs
  version: number;     // Schema version
  generated: boolean;  // True if terrain generated
  modified: boolean;   // True if player modified
}
```

### Block Index Calculation

```javascript
// Convert (x, y, z) within chunk to array index
function getBlockIndex(x, y, z) {
  // x: 0-15, y: 0-255, z: 0-15
  return x + (z * 16) + (y * 16 * 16);
}

// Chunk dimensions
const CHUNK_SIZE_X = 16;
const CHUNK_SIZE_Z = 16;
const CHUNK_SIZE_Y = 256;
const BLOCKS_PER_CHUNK = CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z;
```

---

## World Save Format

### World Metadata (world.json)

```json
{
  "name": "Old San Juan",
  "version": "1.0.0",
  "created": "2026-02-07T16:31:00Z",
  "lastPlayed": "2026-02-07T16:31:00Z",
  "spawn": { "x": 0, "y": 64, "z": 0 },
  "time": 6000,
  "weather": "clear"
}
```

### Chunk File Naming

```
data/chunks/
├── chunk_0_0.bin     # Chunk at (0, 0)
├── chunk_-1_0.bin    # Chunk at (-1, 0)
├── chunk_0_1.bin     # Chunk at (0, 1)
└── ...
```

---

## Structure Schema

### Pre-built Structure (structures/el_morro.json)

```json
{
  "name": "El Morro",
  "description": "Castillo San Felipe del Morro",
  "size": { "x": 64, "y": 48, "z": 80 },
  "origin": { "x": 0, "y": 0, "z": 0 },
  "blocks": [
    { "x": 0, "y": 0, "z": 0, "type": "brick" },
    { "x": 1, "y": 0, "z": 0, "type": "brick" }
  ],
  "metadata": {
    "historicInfo": "Built in the 16th century...",
    "yearBuilt": 1539
  }
}
```

---

## Player Data Schema

```json
{
  "position": { "x": 0, "y": 64, "z": 0 },
  "rotation": { "yaw": 0, "pitch": 0 },
  "inventory": [],
  "settings": {
    "renderDistance": 8,
    "audioVolume": 0.8
  }
}
```

---

## Texture Atlas

| ID | Name | Atlas Position |
|----|------|----------------|
| 0 | air | N/A |
| 1 | cobblestone | (0, 0) |
| 2 | brick | (1, 0) |
| 3 | stucco_white | (2, 0) |
| 4 | stucco_blue | (3, 0) |
| 5 | stucco_pink | (0, 1) |
| 6 | stucco_yellow | (1, 1) |
| 7 | terracotta_tile | (2, 1) |

**Atlas Format:** 256x256 PNG, 16x16 block textures (16 columns, 16 rows)

---

## API Contracts (Future)

If multiplayer is implemented:

```typescript
// WebSocket Events
interface WorldEvent {
  type: "block_update" | "player_move" | "chat";
  payload: object;
  timestamp: number;
}

interface BlockUpdate {
  x: number;
  y: number;
  z: number;
  blockId: number;
  playerId: string;
}
```
