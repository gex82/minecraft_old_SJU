export const BlockId = Object.freeze({
  AIR: 0,
  COBBLESTONE: 1,
  BRICK: 2,
  STUCCO_WHITE: 3,
  STUCCO_BLUE: 4,
  STUCCO_PINK: 5,
  STUCCO_YELLOW: 6,
  TERRACOTTA_TILE: 7,
  WOOD_DARK: 8,
  IRON_GRATE: 9,
  WATER: 10,
  SAND: 11,
  PALM_TRUNK: 12,
  PALM_LEAVES: 13,
});

const DEFAULT_BLOCKS = [
  { id: BlockId.AIR, name: "air", solid: false, transparent: true, color: 0x000000 },
  { id: BlockId.COBBLESTONE, name: "cobblestone", solid: true, transparent: false, color: 0x6f7a82 },
  { id: BlockId.BRICK, name: "brick", solid: true, transparent: false, color: 0x836756 },
  { id: BlockId.STUCCO_WHITE, name: "stucco_white", solid: true, transparent: false, color: 0xd9d2c4 },
  { id: BlockId.STUCCO_BLUE, name: "stucco_blue", solid: true, transparent: false, color: 0x6ea6bb },
  { id: BlockId.STUCCO_PINK, name: "stucco_pink", solid: true, transparent: false, color: 0xe0a08d },
  { id: BlockId.STUCCO_YELLOW, name: "stucco_yellow", solid: true, transparent: false, color: 0xdabf6f },
  { id: BlockId.TERRACOTTA_TILE, name: "terracotta_tile", solid: true, transparent: false, color: 0xaa633f },
  { id: BlockId.WOOD_DARK, name: "wood_dark", solid: true, transparent: false, color: 0x4f3629 },
  { id: BlockId.IRON_GRATE, name: "iron_grate", solid: true, transparent: true, color: 0x707478 },
  { id: BlockId.WATER, name: "water", solid: false, transparent: true, color: 0x3e7ba1 },
  { id: BlockId.SAND, name: "sand", solid: true, transparent: false, color: 0xc3b278 },
  { id: BlockId.PALM_TRUNK, name: "palm_trunk", solid: true, transparent: false, color: 0x74553a },
  { id: BlockId.PALM_LEAVES, name: "palm_leaves", solid: false, transparent: true, color: 0x4b8f52 },
];

function colorToRgb(hexColor) {
  return {
    r: ((hexColor >> 16) & 255) / 255,
    g: ((hexColor >> 8) & 255) / 255,
    b: (hexColor & 255) / 255,
  };
}

export class BlockRegistry {
  constructor(blockDefinitions = DEFAULT_BLOCKS) {
    this.byId = new Map();

    for (const definition of blockDefinitions) {
      this.byId.set(definition.id, {
        ...definition,
        colorRgb: colorToRgb(definition.color),
      });
    }
  }

  get(id) {
    return this.byId.get(id) ?? this.byId.get(BlockId.AIR);
  }

  isSolid(id) {
    return this.get(id).solid;
  }

  isTransparent(id) {
    return this.get(id).transparent;
  }
}

export function createDefaultBlockRegistry() {
  return new BlockRegistry(DEFAULT_BLOCKS);
}
