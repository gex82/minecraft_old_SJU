import * as THREE from "three";

import { BlockId } from "./BlockRegistry.js";
import { CHUNK_HEIGHT, CHUNK_SIZE } from "./constants.js";

const FACE_DEFINITIONS = [
  {
    direction: [1, 0, 0],
    corners: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ],
    shade: 0.82,
  },
  {
    direction: [-1, 0, 0],
    corners: [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    shade: 0.7,
  },
  {
    direction: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    shade: 1.0,
  },
  {
    direction: [0, -1, 0],
    corners: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1],
    ],
    shade: 0.58,
  },
  {
    direction: [0, 0, 1],
    corners: [
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
    ],
    shade: 0.9,
  },
  {
    direction: [0, 0, -1],
    corners: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
    shade: 0.75,
  },
];

function createBuffers() {
  return {
    positions: [],
    normals: [],
    colors: [],
    indices: [],
  };
}

function pushFace(buffers, localX, y, localZ, faceDefinition, color) {
  const vertexOffset = buffers.positions.length / 3;
  const [nx, ny, nz] = faceDefinition.direction;
  const shade = faceDefinition.shade;
  const r = color.r * shade;
  const g = color.g * shade;
  const b = color.b * shade;

  for (const [cx, cy, cz] of faceDefinition.corners) {
    buffers.positions.push(localX + cx, y + cy, localZ + cz);
    buffers.normals.push(nx, ny, nz);
    buffers.colors.push(r, g, b);
  }

  buffers.indices.push(
    vertexOffset,
    vertexOffset + 1,
    vertexOffset + 2,
    vertexOffset,
    vertexOffset + 2,
    vertexOffset + 3,
  );
}

function toGeometry(buffers) {
  if (buffers.positions.length === 0) {
    return null;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(buffers.positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(buffers.normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(buffers.colors, 3));
  geometry.setIndex(buffers.indices);
  geometry.computeBoundingSphere();
  return geometry;
}

export function buildChunkGeometry(chunk, blockRegistry, getBlockAtWorld) {
  const opaqueBuffers = createBuffers();
  const transparentBuffers = createBuffers();
  const baseWorldX = chunk.x * CHUNK_SIZE;
  const baseWorldZ = chunk.z * CHUNK_SIZE;

  for (let localX = 0; localX < CHUNK_SIZE; localX += 1) {
    for (let localZ = 0; localZ < CHUNK_SIZE; localZ += 1) {
      for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
        const blockId = chunk.get(localX, y, localZ);
        if (blockId === BlockId.AIR) {
          continue;
        }

        const block = blockRegistry.get(blockId);
        const isTransparent = block.transparent;
        const targetBuffers = isTransparent ? transparentBuffers : opaqueBuffers;

        const worldX = baseWorldX + localX;
        const worldZ = baseWorldZ + localZ;

        for (const faceDefinition of FACE_DEFINITIONS) {
          const [dx, dy, dz] = faceDefinition.direction;
          const neighborId = getBlockAtWorld(worldX + dx, y + dy, worldZ + dz);

          if (neighborId !== BlockId.AIR) {
            const neighborBlock = blockRegistry.get(neighborId);
            const hidesFace = !neighborBlock.transparent || neighborId === blockId;
            if (hidesFace) {
              continue;
            }
          }

          pushFace(targetBuffers, localX, y, localZ, faceDefinition, block.colorRgb);
        }
      }
    }
  }

  return {
    opaque: toGeometry(opaqueBuffers),
    transparent: toGeometry(transparentBuffers),
  };
}
