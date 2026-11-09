import fs from 'node:fs';

const file = 'config/platform-surface-os-matrix.json';
const matrix = JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
const requiredPlatforms = ['web', 'android', 'ios', 'macos', 'windows', 'linux', 'smart_tv_web', 'unity_games'];
const requiredServices = ['github', 'cloudflare', 'firebase', 'observability', 'commerce'];

function requireUniqueIds(items, label) {
  if (!Array.isArray(items)) {
    failures.push(`${label} must be an array`);
    return new Set();
  }
  const ids = new Set();
  for (const item of items) {
    if (!item?.id) {
      failures.push(`${label} contains an entry without an id`);
      continue;
    }
    if (ids.has(item.id)) failures.push(`${label} contains duplicate id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

if (matrix.schema_version !== 1) failures.push('schema_version must equal 1');
if (matrix.advancement_mode !== 'manual_g02_independent') failures.push('advancement must remain independent of G02/Fallgate');

const platformIds = requireUniqueIds(matrix.platforms, 'platforms');
for (const id of requiredPlatforms) if (!platformIds.has(id)) failures.push(`missing platform entry: ${id}`);

for (const platform of matrix.platforms || []) {
  if (!platform.runtime || !platform.status || !Array.isArray(platform.operating_systems) || !Array.isArray(platform.blockers)) {
    failures.push(`platform ${platform.id || '(unknown)'} is missing runtime, status, operating_systems, or blockers`);
  }
  if (!Array.isArray(platform.surfaces) || platform.surfaces.length === 0) {
    failures.push(`platform ${platform.id || '(unknown)'} must declare at least one surface`);
  }
}

const serviceIds = requireUniqueIds(matrix.shared_services, 'shared_services');
for (const id of requiredServices) if (!serviceIds.has(id)) failures.push(`missing shared service: ${id}`);
for (const service of matrix.shared_services || []) {
  if (!service.role || !service.status) failures.push(`shared service ${service.id} is missing role or status`);
}

const divisionIds = requireUniqueIds(matrix.enterprise_divisions, 'enterprise_divisions');
const requiredDivisions = ['LINGOlegacy_MASTER', 'LINGOlegacy', 'LINGOlane', 'LINGOslots', 'LINGOarcade', 'LINGOlibrary', 'LINGOmedia', 'LINGOworld', 'LegacyXclub'];
for (const id of requiredDivisions) if (!divisionIds.has(id)) failures.push(`missing enterprise division: ${id}`);

const productIds = requireUniqueIds(matrix.product_surfaces, 'product_surfaces');
for (const product of matrix.product_surfaces || []) {
  if (!product.division || !Array.isArray(product.platform_targets) || !product.status) {
    failures.push(`product surface ${product.id || '(unknown)'} is missing division, platform_targets, or status`);
  }
  if (!divisionIds.has(product.division)) failures.push(`product surface ${product.id} references unknown division ${product.division}`);
  for (const target of product.platform_targets || []) {
    if (!platformIds.has(target)) failures.push(`product surface ${product.id} references unknown platform ${target}`);
  }
}
if (!productIds.size) failures.push('product_surfaces must not be empty');

if (!matrix.global_rules?.some((rule) => rule.includes('G02/Fallgate is not a prerequisite'))) {
  failures.push('G02/Fallgate independence rule is missing');
}
if (!matrix.global_rules?.some((rule) => rule.includes('Never commit API keys'))) {
  failures.push('secret-handling rule is missing');
}

const result = {
  check: 'platform-surface-os-matrix-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  platform_count: matrix.platforms?.length || 0,
  shared_service_count: matrix.shared_services?.length || 0,
  enterprise_division_count: matrix.enterprise_divisions?.length || 0,
  product_surface_count: matrix.product_surfaces?.length || 0,
  required_platforms: requiredPlatforms,
  required_services: requiredServices,
  failures
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
