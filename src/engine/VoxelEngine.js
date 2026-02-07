import * as THREE from "three";

import { chunkKey } from "./Chunk.js";
import { CHUNK_SIZE } from "./constants.js";
import { buildChunkGeometry } from "./MeshBuilder.js";

export class VoxelEngine {
  constructor(scene, worldManager, blockRegistry) {
    this.scene = scene;
    this.worldManager = worldManager;
    this.blockRegistry = blockRegistry;
    this.renderedChunks = new Map();

    this.chunkRoot = new THREE.Group();
    this.chunkRoot.name = "chunk-root";
    this.scene.add(this.chunkRoot);

    this.opaqueMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    });

    this.transparentMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      roughness: 0.42,
      metalness: 0.0,
      flatShading: true,
    });
  }

  mountChunk(chunk) {
    const key = chunkKey(chunk.x, chunk.z);
    if (this.renderedChunks.has(key)) {
      this.rebuildChunk(chunk.x, chunk.z);
      return;
    }

    const group = new THREE.Group();
    group.position.set(chunk.x * CHUNK_SIZE, 0, chunk.z * CHUNK_SIZE);
    group.name = `chunk-${key}`;
    this.chunkRoot.add(group);
    this.renderedChunks.set(key, { group, chunkX: chunk.x, chunkZ: chunk.z });

    this.rebuildChunk(chunk.x, chunk.z);
  }

  unmountChunk(key) {
    const rendered = this.renderedChunks.get(key);
    if (!rendered) {
      return;
    }

    this.disposeChunkGroup(rendered.group);
    this.chunkRoot.remove(rendered.group);
    this.renderedChunks.delete(key);
  }

  rebuildChunk(chunkX, chunkZ) {
    const key = chunkKey(chunkX, chunkZ);
    const rendered = this.renderedChunks.get(key);
    if (!rendered) {
      return;
    }

    const chunk = this.worldManager.getChunk(chunkX, chunkZ);
    if (!chunk) {
      return;
    }

    this.disposeChunkGroup(rendered.group);

    const geometry = buildChunkGeometry(chunk, this.blockRegistry, (x, y, z) =>
      this.worldManager.getBlockAt(x, y, z),
    );

    if (geometry.opaque) {
      const opaqueMesh = new THREE.Mesh(geometry.opaque, this.opaqueMaterial);
      opaqueMesh.castShadow = false;
      opaqueMesh.receiveShadow = true;
      rendered.group.add(opaqueMesh);
    }

    if (geometry.transparent) {
      const transparentMesh = new THREE.Mesh(geometry.transparent, this.transparentMaterial);
      transparentMesh.renderOrder = 1;
      rendered.group.add(transparentMesh);
    }
  }

  markChunkAndNeighborsDirty(chunkX, chunkZ) {
    const neighbors = [
      [chunkX, chunkZ],
      [chunkX + 1, chunkZ],
      [chunkX - 1, chunkZ],
      [chunkX, chunkZ + 1],
      [chunkX, chunkZ - 1],
    ];

    for (const [neighborX, neighborZ] of neighbors) {
      this.rebuildChunk(neighborX, neighborZ);
    }
  }

  disposeChunkGroup(group) {
    for (const child of [...group.children]) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      group.remove(child);
    }
  }

  dispose() {
    for (const key of [...this.renderedChunks.keys()]) {
      this.unmountChunk(key);
    }
    this.opaqueMaterial.dispose();
    this.transparentMaterial.dispose();
    this.scene.remove(this.chunkRoot);
  }
}
