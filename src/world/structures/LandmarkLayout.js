import { BlockId } from "../../engine/BlockRegistry.js";
import { CHUNK_HEIGHT } from "../../engine/constants.js";

function worldKey(x, y, z) {
  return `${x},${y},${z}`;
}

export function buildLandmarkLayout() {
  const overrides = new Map();
  const landmarks = [];

  const setBlock = (x, y, z, id) => {
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return;
    }
    overrides.set(worldKey(x, y, z), id);
  };

  const fillBox = (x1, y1, z1, x2, y2, z2, id) => {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          setBlock(x, y, z, id);
        }
      }
    }
  };

  const carveBox = (x1, y1, z1, x2, y2, z2) => {
    fillBox(x1, y1, z1, x2, y2, z2, BlockId.AIR);
  };

  const hollowBox = (x1, y1, z1, x2, y2, z2, id) => {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          const isShell =
            x === minX ||
            x === maxX ||
            y === minY ||
            y === maxY ||
            z === minZ ||
            z === maxZ;
          if (isShell) {
            setBlock(x, y, z, id);
          } else {
            setBlock(x, y, z, BlockId.AIR);
          }
        }
      }
    }
  };

  const placePalm = (baseX, baseY, baseZ) => {
    for (let y = baseY; y < baseY + 5; y += 1) {
      setBlock(baseX, y, baseZ, BlockId.PALM_TRUNK);
    }

    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dz = -2; dz <= 2; dz += 1) {
        const manhattanDistance = Math.abs(dx) + Math.abs(dz);
        if (manhattanDistance <= 3) {
          setBlock(baseX + dx, baseY + 5, baseZ + dz, BlockId.PALM_LEAVES);
        }
      }
    }

    setBlock(baseX, baseY + 6, baseZ, BlockId.PALM_LEAVES);
  };

  const placeHouse = (x, y, z, width, depth, wallBlockId) => {
    fillBox(x, y, z, x + width - 1, y, z + depth - 1, BlockId.COBBLESTONE);
    hollowBox(x, y + 1, z, x + width - 1, y + 6, z + depth - 1, wallBlockId);

    const doorX = x + Math.floor(width / 2);
    carveBox(doorX, y + 1, z, doorX, y + 3, z);
    setBlock(doorX, y + 1, z, BlockId.WOOD_DARK);
    setBlock(doorX, y + 2, z, BlockId.WOOD_DARK);

    for (let roofOffset = 0; roofOffset < Math.ceil(width / 2); roofOffset += 1) {
      const roofY = y + 7 + roofOffset;
      fillBox(
        x + roofOffset,
        roofY,
        z - 1,
        x + width - 1 - roofOffset,
        roofY,
        z + depth,
        BlockId.TERRACOTTA_TILE,
      );
    }

    setBlock(x + 1, y + 3, z, BlockId.IRON_GRATE);
    setBlock(x + width - 2, y + 3, z, BlockId.IRON_GRATE);
  };

  // Central plaza
  fillBox(-16, 12, -16, 16, 12, 16, BlockId.COBBLESTONE);

  // Main street grid
  for (let x = -80; x <= 80; x += 1) {
    for (let z = -80; z <= 80; z += 1) {
      const roadX = Math.abs((((x - 2) % 18) + 18) % 18 - 9) <= 1;
      const roadZ = Math.abs((((z + 5) % 18) + 18) % 18 - 9) <= 1;
      if (roadX || roadZ) {
        setBlock(x, 12, z, BlockId.COBBLESTONE);
      }
    }
  }

  // Paseo de la Princesa
  for (let x = -24; x <= 62; x += 1) {
    for (let z = -43; z <= -38; z += 1) {
      setBlock(x, 12, z, BlockId.COBBLESTONE);
    }
    setBlock(x, 13, -43, BlockId.BRICK);
    setBlock(x, 13, -38, BlockId.BRICK);
  }
  for (let x = -20; x <= 58; x += 16) {
    placePalm(x, 13, -36);
  }
  landmarks.push({
    id: "paseo-princesa",
    name: "Paseo de la Princesa",
    description: "Historic waterfront promenade along San Juan Bay.",
    position: { x: 20, y: 14, z: -41 },
    radius: 24,
  });

  // Puerta de San Juan
  fillBox(-2, 12, -36, 6, 20, -34, BlockId.BRICK);
  carveBox(1, 12, -36, 3, 18, -34);
  fillBox(-1, 21, -36, 5, 22, -34, BlockId.BRICK);
  landmarks.push({
    id: "puerta-san-juan",
    name: "Puerta de San Juan",
    description: "Original city gate that connected the old city to the harbor.",
    position: { x: 2, y: 16, z: -35 },
    radius: 16,
  });

  // El Morro fortress
  const morroX = -78;
  const morroY = 12;
  const morroZ = -30;
  fillBox(morroX, morroY, morroZ, morroX + 36, morroY + 5, morroZ + 30, BlockId.BRICK);
  carveBox(morroX + 8, morroY + 1, morroZ + 7, morroX + 28, morroY + 5, morroZ + 23);
  fillBox(morroX, morroY + 6, morroZ, morroX + 36, morroY + 14, morroZ + 1, BlockId.BRICK);
  fillBox(morroX, morroY + 6, morroZ + 29, morroX + 36, morroY + 14, morroZ + 30, BlockId.BRICK);
  fillBox(morroX, morroY + 6, morroZ, morroX + 1, morroY + 14, morroZ + 30, BlockId.BRICK);
  fillBox(morroX + 35, morroY + 6, morroZ, morroX + 36, morroY + 14, morroZ + 30, BlockId.BRICK);
  fillBox(morroX - 4, morroY + 4, morroZ - 4, morroX + 2, morroY + 12, morroZ + 2, BlockId.BRICK);
  fillBox(morroX + 34, morroY + 4, morroZ - 4, morroX + 40, morroY + 12, morroZ + 2, BlockId.BRICK);
  fillBox(morroX + 14, morroY + 6, morroZ + 12, morroX + 21, morroY + 20, morroZ + 19, BlockId.STUCCO_WHITE);
  fillBox(
    morroX + 13,
    morroY + 21,
    morroZ + 11,
    morroX + 22,
    morroY + 22,
    morroZ + 20,
    BlockId.TERRACOTTA_TILE,
  );
  landmarks.push({
    id: "el-morro",
    name: "Castillo San Felipe del Morro",
    description: "16th-century fortress guarding the entrance to San Juan Bay.",
    position: { x: morroX + 18, y: morroY + 12, z: morroZ + 15 },
    radius: 26,
  });

  // San Juan Cathedral
  const cathedralX = 20;
  const cathedralY = 12;
  const cathedralZ = 20;
  fillBox(
    cathedralX,
    cathedralY,
    cathedralZ,
    cathedralX + 20,
    cathedralY + 1,
    cathedralZ + 28,
    BlockId.COBBLESTONE,
  );
  hollowBox(
    cathedralX + 1,
    cathedralY + 2,
    cathedralZ + 1,
    cathedralX + 19,
    cathedralY + 16,
    cathedralZ + 27,
    BlockId.STUCCO_WHITE,
  );
  carveBox(
    cathedralX + 2,
    cathedralY + 3,
    cathedralZ + 2,
    cathedralX + 18,
    cathedralY + 15,
    cathedralZ + 26,
  );
  fillBox(
    cathedralX + 8,
    cathedralY + 17,
    cathedralZ + 0,
    cathedralX + 12,
    cathedralY + 19,
    cathedralZ + 28,
    BlockId.TERRACOTTA_TILE,
  );
  fillBox(
    cathedralX + 2,
    cathedralY + 2,
    cathedralZ,
    cathedralX + 4,
    cathedralY + 20,
    cathedralZ + 4,
    BlockId.STUCCO_YELLOW,
  );
  fillBox(
    cathedralX + 16,
    cathedralY + 2,
    cathedralZ,
    cathedralX + 18,
    cathedralY + 20,
    cathedralZ + 4,
    BlockId.STUCCO_YELLOW,
  );
  carveBox(cathedralX + 9, cathedralY + 2, cathedralZ, cathedralX + 11, cathedralY + 5, cathedralZ);
  setBlock(cathedralX + 9, cathedralY + 2, cathedralZ, BlockId.WOOD_DARK);
  setBlock(cathedralX + 10, cathedralY + 2, cathedralZ, BlockId.WOOD_DARK);
  setBlock(cathedralX + 11, cathedralY + 2, cathedralZ, BlockId.WOOD_DARK);
  landmarks.push({
    id: "san-juan-cathedral",
    name: "San Juan Cathedral",
    description: "One of the oldest cathedrals in the Americas.",
    position: { x: cathedralX + 10, y: cathedralY + 10, z: cathedralZ + 14 },
    radius: 22,
  });

  // La Fortaleza
  const fortalezaX = 38;
  const fortalezaY = 12;
  const fortalezaZ = -12;
  fillBox(
    fortalezaX,
    fortalezaY,
    fortalezaZ,
    fortalezaX + 28,
    fortalezaY + 1,
    fortalezaZ + 20,
    BlockId.COBBLESTONE,
  );
  hollowBox(
    fortalezaX + 1,
    fortalezaY + 2,
    fortalezaZ + 1,
    fortalezaX + 27,
    fortalezaY + 12,
    fortalezaZ + 19,
    BlockId.STUCCO_BLUE,
  );
  carveBox(
    fortalezaX + 3,
    fortalezaY + 3,
    fortalezaZ + 3,
    fortalezaX + 25,
    fortalezaY + 11,
    fortalezaZ + 17,
  );
  fillBox(
    fortalezaX + 8,
    fortalezaY + 13,
    fortalezaZ + 4,
    fortalezaX + 20,
    fortalezaY + 14,
    fortalezaZ + 16,
    BlockId.TERRACOTTA_TILE,
  );
  fillBox(
    fortalezaX + 12,
    fortalezaY + 3,
    fortalezaZ,
    fortalezaX + 16,
    fortalezaY + 6,
    fortalezaZ,
    BlockId.WOOD_DARK,
  );
  landmarks.push({
    id: "la-fortaleza",
    name: "La Fortaleza",
    description: "Historic governor residence and UNESCO World Heritage Site.",
    position: { x: fortalezaX + 14, y: fortalezaY + 8, z: fortalezaZ + 10 },
    radius: 20,
  });

  // Colonial housing rows
  const housePalette = [
    BlockId.STUCCO_BLUE,
    BlockId.STUCCO_PINK,
    BlockId.STUCCO_YELLOW,
    BlockId.STUCCO_WHITE,
  ];
  const houseRows = [
    { x: -20, z: 22, count: 5, step: 11 },
    { x: -18, z: 34, count: 4, step: 12 },
    { x: -48, z: -6, count: 6, step: 10 },
    { x: 16, z: -26, count: 4, step: 12 },
  ];

  let paletteIndex = 0;
  for (const row of houseRows) {
    for (let i = 0; i < row.count; i += 1) {
      const wallColor = housePalette[paletteIndex % housePalette.length];
      placeHouse(row.x + i * row.step, 12, row.z, 8, 9, wallColor);
      paletteIndex += 1;
    }
  }

  // City walls and lookout line
  fillBox(-38, 12, -34, -36, 20, 40, BlockId.BRICK);
  fillBox(-38, 21, -34, -36, 22, 40, BlockId.BRICK);

  return { overrides, landmarks };
}
