export const WORLD_SCHEMA_VERSION = '1.0.0';
export const GENERATOR_VERSION = '0.1.0';

const BIOMES = ['urban', 'green', 'water', 'industrial'];
const POI_TYPES = ['plaza', 'market', 'station', 'garden', 'workshop'];
const POI_LABELS = ['Central Plaza', 'Market Hall', 'Transit Hub', 'Memory Garden', 'Maker Workshop'];

function isIntegerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isSemver(value) {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function seededRandom(seed) {
  let state = parseInt(fnv1a(seed), 16) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function worldPayload(world) {
  return {
    schemaVersion: world.schemaVersion,
    worldId: world.worldId,
    worldVersion: world.worldVersion,
    generatorVersion: world.generatorVersion,
    seed: world.seed,
    dimensions: world.dimensions,
    map: world.map,
    pointsOfInterest: world.pointsOfInterest,
  };
}

function computeWorldHash(world) {
  return fnv1a(JSON.stringify(worldPayload(world)));
}

function assertGenerationOptions(options) {
  if (!options || typeof options !== 'object') throw new TypeError('options must be an object');
  if (!isSlug(options.worldId)) throw new TypeError('worldId must be lowercase kebab-case');
  if (!isSemver(options.worldVersion)) throw new TypeError('worldVersion must be semantic version text');
  if (typeof options.seed !== 'string' || options.seed.length < 1 || options.seed.length > 128) {
    throw new TypeError('seed must be a string of 1–128 characters');
  }
  const width = options.width === undefined ? 16 : options.width;
  const height = options.height === undefined ? 16 : options.height;
  const poiCount = options.poiCount === undefined ? 8 : options.poiCount;
  if (!isIntegerInRange(width, 4, 128)) throw new RangeError('width must be an integer from 4 to 128');
  if (!isIntegerInRange(height, 4, 128)) throw new RangeError('height must be an integer from 4 to 128');
  if (!isIntegerInRange(poiCount, 0, Math.min(256, width * height))) {
    throw new RangeError('poiCount must be an integer from 0 to min(256, width × height)');
  }
  return { width, height, poiCount };
}

export function validateWorldDefinition(world) {
  const errors = [];
  if (!world || typeof world !== 'object' || Array.isArray(world)) {
    return { valid: false, errors: ['world must be an object'] };
  }
  if (world.schemaVersion !== WORLD_SCHEMA_VERSION) errors.push('unsupported schemaVersion');
  if (!isSlug(world.worldId)) errors.push('worldId must be lowercase kebab-case');
  if (!isSemver(world.worldVersion)) errors.push('worldVersion must be semantic version text');
  if (world.generatorVersion !== GENERATOR_VERSION) errors.push('unsupported generatorVersion');
  if (typeof world.seed !== 'string' || world.seed.length < 1 || world.seed.length > 128) {
    errors.push('seed must be a string of 1–128 characters');
  }

  const width = world.dimensions && world.dimensions.width;
  const height = world.dimensions && world.dimensions.height;
  if (!isIntegerInRange(width, 4, 128)) errors.push('dimensions.width must be from 4 to 128');
  if (!isIntegerInRange(height, 4, 128)) errors.push('dimensions.height must be from 4 to 128');

  if (!Array.isArray(world.map) || world.map.length !== height) {
    errors.push('map height must match dimensions.height');
  } else {
    for (let y = 0; y < world.map.length; y += 1) {
      const row = world.map[y];
      if (!Array.isArray(row) || row.length !== width) {
        errors.push('map row ' + y + ' width must match dimensions.width');
        continue;
      }
      for (let x = 0; x < row.length; x += 1) {
        const tile = row[x];
        if (!tile || tile.x !== x || tile.y !== y) errors.push('tile coordinates must match map position');
        if (!tile || !BIOMES.includes(tile.biome)) errors.push('tile biome is invalid');
        if (!tile || typeof tile.walkable !== 'boolean') errors.push('tile walkable must be boolean');
        if (tile && tile.biome === 'water' && tile.walkable === true) errors.push('water tiles must be non-walkable');
        if (!tile || !isIntegerInRange(tile.elevation, 0, 4)) errors.push('tile elevation must be an integer from 0 to 4');
      }
    }
  }

  if (!Array.isArray(world.pointsOfInterest) || world.pointsOfInterest.length > 256) {
    errors.push('pointsOfInterest must be an array of at most 256 entries');
  } else {
    const ids = new Set();
    const positions = new Set();
    for (const point of world.pointsOfInterest) {
      if (!point || typeof point !== 'object') {
        errors.push('point of interest must be an object');
        continue;
      }
      if (typeof point.id !== 'string' || !/^poi-[0-9]{3}$/.test(point.id)) errors.push('point id is invalid');
      if (ids.has(point.id)) errors.push('point IDs must be unique');
      ids.add(point.id);
      if (!POI_TYPES.includes(point.type)) errors.push('point type is invalid');
      if (typeof point.label !== 'string' || point.label.length < 1 || point.label.length > 80) errors.push('point label is invalid');
      if (!isIntegerInRange(point.x, 0, width - 1) || !isIntegerInRange(point.y, 0, height - 1)) {
        errors.push('point coordinates are outside world bounds');
      } else if (Array.isArray(world.map) && world.map[point.y] && world.map[point.y][point.x] && !world.map[point.y][point.x].walkable) {
        errors.push('points of interest must be placed on walkable tiles');
      }
      const position = point.x + ',' + point.y;
      if (positions.has(position)) errors.push('points of interest must not share a tile');
      positions.add(position);
    }
  }

  if (typeof world.worldHash !== 'string' || !/^[a-f0-9]{8}$/.test(world.worldHash)) {
    errors.push('worldHash must be an eight-character hexadecimal fingerprint');
  } else if (world.worldHash !== computeWorldHash(world)) {
    errors.push('worldHash does not match world content');
  }

  return { valid: errors.length === 0, errors };
}

export function generateWorld(options) {
  const bounds = assertGenerationOptions(options);
  const random = seededRandom(options.seed);
  const map = [];

  for (let y = 0; y < bounds.height; y += 1) {
    const row = [];
    for (let x = 0; x < bounds.width; x += 1) {
      const roll = random();
      const biome = roll < 0.52 ? 'urban' : roll < 0.72 ? 'green' : roll < 0.88 ? 'water' : 'industrial';
      row.push({
        x,
        y,
        biome,
        walkable: biome !== 'water',
        elevation: Math.floor(random() * 5),
      });
    }
    map.push(row);
  }

  let walkableTiles = map.flat().filter(tile => tile.walkable);
  for (let y = 0; walkableTiles.length < bounds.poiCount && y < bounds.height; y += 1) {
    for (let x = 0; walkableTiles.length < bounds.poiCount && x < bounds.width; x += 1) {
      if (!map[y][x].walkable) {
        map[y][x] = { ...map[y][x], biome: 'urban', walkable: true };
        walkableTiles = map.flat().filter(tile => tile.walkable);
      }
    }
  }

  for (let index = walkableTiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const temporary = walkableTiles[index];
    walkableTiles[index] = walkableTiles[swapIndex];
    walkableTiles[swapIndex] = temporary;
  }

  const pointsOfInterest = walkableTiles.slice(0, bounds.poiCount).map((tile, index) => ({
    id: 'poi-' + String(index + 1).padStart(3, '0'),
    type: POI_TYPES[Math.floor(random() * POI_TYPES.length)],
    label: POI_LABELS[index % POI_LABELS.length],
    x: tile.x,
    y: tile.y,
  }));

  const world = {
    schemaVersion: WORLD_SCHEMA_VERSION,
    worldId: options.worldId,
    worldVersion: options.worldVersion,
    generatorVersion: GENERATOR_VERSION,
    seed: options.seed,
    dimensions: { width: bounds.width, height: bounds.height },
    map,
    pointsOfInterest,
  };
  world.worldHash = computeWorldHash(world);
  const validation = validateWorldDefinition(world);
  if (!validation.valid) throw new Error('generated world failed validation: ' + validation.errors.join('; '));
  return world;
}
