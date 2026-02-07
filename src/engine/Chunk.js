import { BLOCKS_PER_CHUNK, CHUNK_HEIGHT, CHUNK_SIZE } from "./constants.js";

export function chunkKey(chunkX, chunkZ) {
  return `${chunkX},${chunkZ}`;
}

export class Chunk {
  constructor(chunkX, chunkZ) {
    this.x = chunkX;
    this.z = chunkZ;
    this.blocks = new Uint8Array(BLOCKS_PER_CHUNK);
    this.generated = false;
    this.modified = false;
  }

  index(localX, y, localZ) {
    return localX + localZ * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
  }

  inBounds(localX, y, localZ) {
    return (
      localX >= 0 &&
      localX < CHUNK_SIZE &&
      localZ >= 0 &&
      localZ < CHUNK_SIZE &&
      y >= 0 &&
      y < CHUNK_HEIGHT
    );
  }

  get(localX, y, localZ) {
    if (!this.inBounds(localX, y, localZ)) {
      return 0;
    }
    return this.blocks[this.index(localX, y, localZ)];
  }

  set(localX, y, localZ, blockId) {
    if (!this.inBounds(localX, y, localZ)) {
      return;
    }
    const idx = this.index(localX, y, localZ);
    this.blocks[idx] = blockId;
    this.modified = true;
  }
}
