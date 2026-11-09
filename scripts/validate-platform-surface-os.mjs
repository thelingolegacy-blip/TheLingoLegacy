import fs from 'node:fs';

const file = 'config/platform-surface-os-matrix.json';
const matrix = JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
const requiredPlatforms = ['web', 'android', 'ios', 'macos', 'windows', 'linux', 'smart_tv_web', 'unity_games'];
const ids = new Set((matrix.platforms || []).map((item) => item.id));

if (matrix.schema_version !== 1) failures.push('schema_version must equal 1');
if (matrix.advancement_mode !== 'manual_g02_independent') failures.push('advancement must remain independent of G02/Fallgate');
for (const id of requiredPlatforms) if (!ids.has(id)) failures.push(`missing platform entry: ${id}`);

for (const platform of matrix.platforms || []) {
  if (!platform.runtime || !platform.status || !Array.isArray(platform.operating_systems) || !Array.isArray(platform.blockers)) {
    failures.push(`platform ${platform.id || '(unknown)'} is missing runtime, status, operating_systems, or blockers`);
  }
}
for (const service of matrix.shared_services || []) {
  if (!service.id || !service.role || !service.status) failures.push('shared service entry is incomplete');
}
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
  required_platforms: requiredPlatforms,
  failures
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
