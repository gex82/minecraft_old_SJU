import { BlockId } from "../engine/BlockRegistry.js";
import { Chunk, chunkKey } from "../engine/Chunk.js";
import { CHUNK_HEIGHT, CHUNK_SIZE, LOAD_RADIUS, SEA_LEVEL } from "../engine/constants.js";
import { buildLandmarkLayout } from "./structures/LandmarkLayout.js";

function floorDiv(value, divisor) {
  return Math.floor(value / divisor);
}

function positiveMod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function parseChunkKey(key) {
  const [x, z] = key.split(",").map((entry) => Number(entry));
  return [x, z];
}

function worldKey(x, y, z) {
  return `${x},${y},${z}`;
}

export class WorldManager {
  constructor(blockRegistry, options = {}) {
    this.blockRegistry = blockRegistry;
    this.seed = options.seed ?? 1942;
    this.loadRadius = options.loadRadius ?? LOAD_RADIUS;

    this.chunkMap = new Map();
    this.activeChunkKeys = new Set();
    this.engine = null;

    const layout = buildLandmarkLayout();
    this.structureOverrides = layout.overrides;
    this.landmarks = layout.landmarks;
  }

  attachEngine(engine) {
    this.engine = engine;
  }

  getChunk(chunkX, chunkZ) {
    return this.chunkMap.get(chunkKey(chunkX, chunkZ)) ?? null;
  }

  ensureChunk(chunkX, chunkZ) {
    const key = chunkKey(chunkX, chunkZ);
    let chunk = this.chunkMap.get(key);
    if (!chunk) {
      chunk = this.generateChunk(chunkX, chunkZ);
      this.chunkMap.set(key, chunk);
    }
    return chunk;
  }

  update(playerPosition) {
    const playerChunkX = floorDiv(Math.floor(playerPosition.x), CHUNK_SIZE);
    const playerChunkZ = floorDiv(Math.floor(playerPosition.z), CHUNK_SIZE);
    const required = new Set();
    const newlyLoaded = [];

    for (let dz = -this.loadRadius; dz <= this.loadRadius; dz += 1) {
      for (let dx = -this.loadRadius; dx <= this.loadRadius; dx += 1) {
        const chunkX = playerChunkX + dx;
        const chunkZ = playerChunkZ + dz;
        const key = chunkKey(chunkX, chunkZ);
        required.add(key);

        if (!this.activeChunkKeys.has(key)) {
          const chunk = this.ensureChunk(chunkX, chunkZ);
          this.activeChunkKeys.add(key);
          newlyLoaded.push([chunkX, chunkZ]);
          if (this.engine) {
            this.engine.mountChunk(chunk);
          }
        }
      }
    }

    for (const key of [...this.activeChunkKeys]) {
      if (required.has(key)) {
        continue;
      }
      this.activeChunkKeys.delete(key);
      if (this.engine) {
        this.engine.unmountChunk(key);
      }
    }

    if (this.engine) {
      for (const [chunkX, chunkZ] of newlyLoaded) {
        this.engine.markChunkAndNeighborsDirty(chunkX, chunkZ);
      }
    }
  }

  generateChunk(chunkX, chunkZ) {
    const chunk = new Chunk(chunkX, chunkZ);
    const baseX = chunkX * CHUNK_SIZE;
    const baseZ = chunkZ * CHUNK_SIZE;

    for (let localX = 0; localX < CHUNK_SIZE; localX += 1) {
      for (let localZ = 0; localZ < CHUNK_SIZE; localZ += 1) {
        const worldX = baseX + localX;
        const worldZ = baseZ + localZ;
        const topY = this.terrainHeight(worldX, worldZ);

        for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
          let blockId = BlockId.AIR;

          if (y <= topY) {
            if (y === topY) {
              if (topY <= SEA_LEVEL + 1) {
                blockId = BlockId.SAND;
              } else if (this.isRoad(worldX, worldZ)) {
                blockId = BlockId.COBBLESTONE;
              } else if (this.cityMask(worldX, worldZ) > 0.6) {
                blockId = BlockId.COBBLESTONE;
              } else {
                blockId = BlockId.SAND;
              }
            } else if (y >= topY - 2) {
              blockId = BlockId.BRICK;
            } else {
              blockId = BlockId.BRICK;
            }
          } else if (y <= SEA_LEVEL) {
            blockId = BlockId.WATER;
          }

          const overrideKey = worldKey(worldX, y, worldZ);
          if (this.structureOverrides.has(overrideKey)) {
            blockId = this.structureOverrides.get(overrideKey);
          }

          if (blockId !== BlockId.AIR) {
            chunk.set(localX, y, localZ, blockId);
          }
        }
      }
    }

    chunk.generated = true;
    chunk.modified = false;
    return chunk;
  }

  getBlockAt(worldX, worldY, worldZ) {
    const x = Math.floor(worldX);
    const y = Math.floor(worldY);
    const z = Math.floor(worldZ);

    if (y < 0) {
      return BlockId.BRICK;
    }

    if (y >= CHUNK_HEIGHT) {
      return BlockId.AIR;
    }

    const chunkX = floorDiv(x, CHUNK_SIZE);
    const chunkZ = floorDiv(z, CHUNK_SIZE);
    const localX = positiveMod(x, CHUNK_SIZE);
    const localZ = positiveMod(z, CHUNK_SIZE);
    const chunk = this.ensureChunk(chunkX, chunkZ);

    return chunk.get(localX, y, localZ);
  }

  setBlockAt(worldX, worldY, worldZ, blockId) {
    const x = Math.floor(worldX);
    const y = Math.floor(worldY);
    const z = Math.floor(worldZ);
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return;
    }

    const chunkX = floorDiv(x, CHUNK_SIZE);
    const chunkZ = floorDiv(z, CHUNK_SIZE);
    const localX = positiveMod(x, CHUNK_SIZE);
    const localZ = positiveMod(z, CHUNK_SIZE);
    const chunk = this.ensureChunk(chunkX, chunkZ);
    chunk.set(localX, y, localZ, blockId);

    const activeKey = chunkKey(chunkX, chunkZ);
    if (this.engine && this.activeChunkKeys.has(activeKey)) {
      this.engine.markChunkAndNeighborsDirty(chunkX, chunkZ);
    }
  }

  isSolidAt(worldX, worldY, worldZ) {
    const blockId = this.getBlockAt(worldX, worldY, worldZ);
    return this.blockRegistry.isSolid(blockId);
  }

  getNearestLandmark(position, maxDistance = 18) {
    let bestLandmark = null;

    for (const landmark of this.landmarks) {
      const dx = position.x - landmark.position.x;
      const dz = position.z - landmark.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance > maxDistance) {
        continue;
      }
      if (!bestLandmark || distance < bestLandmark.distance) {
        bestLandmark = { ...landmark, distance };
      }
    }

    return bestLandmark;
  }

  getLandmarkById(id) {
    return this.landmarks.find((landmark) => landmark.id === id) ?? null;
  }

  setLoadRadius(radius) {
    this.loadRadius = Math.max(2, Math.min(8, radius));
  }

  terrainHeight(worldX, worldZ) {
    const islandRadius = Math.sqrt((worldX * worldX) / (132 * 132) + (worldZ * worldZ) / (116 * 116));
    const islandMask = Math.max(0, 1 - islandRadius);
    const macroNoise = this.noise2D(worldX * 0.045, worldZ * 0.045);
    const detailNoise = this.noise2D(worldX * 0.12 + 33, worldZ * 0.12 - 21);
    const cityBoost = this.cityMask(worldX, worldZ) * 2.8;

    const rawHeight = SEA_LEVEL - 2 + islandMask * 16 + macroNoise * 4 + detailNoise * 2 + cityBoost;
    return Math.max(3, Math.min(CHUNK_HEIGHT - 3, Math.floor(rawHeight)));
  }

  cityMask(worldX, worldZ) {
    const distance = Math.sqrt((worldX * worldX) / (94 * 94) + (worldZ * worldZ) / (90 * 90));
    return Math.max(0, 1 - distance);
  }

  isRoad(worldX, worldZ) {
    if (Math.abs(worldX) > 84 || Math.abs(worldZ) > 84) {
      return false;
    }

    const roadX = Math.abs((((worldX - 2) % 18) + 18) % 18 - 9) <= 1;
    const roadZ = Math.abs((((worldZ + 5) % 18) + 18) % 18 - 9) <= 1;
    return roadX || roadZ;
  }

  noise2D(x, z) {
    const value = Math.sin(x * 127.1 + z * 311.7 + this.seed * 0.013) * 43758.5453123;
    return value - Math.floor(value);
  }
}
