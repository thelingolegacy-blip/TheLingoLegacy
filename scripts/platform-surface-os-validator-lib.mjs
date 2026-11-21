export const REQUIRED_PLATFORMS = ['web', 'android', 'ios', 'macos', 'windows', 'linux', 'smart_tv_web', 'unity_games'];
export const REQUIRED_SERVICES = ['github', 'cloudflare', 'firebase', 'observability', 'commerce'];
export const REQUIRED_DIVISIONS = ['LINGOlegacy_MASTER', 'LINGOlegacy', 'LINGOlane', 'LINGOslots', 'LINGOarcade', 'LINGOlibrary', 'LINGOmedia', 'LINGOworld', 'LegacyXclub'];

export function validateMatrix(matrix) {
  const failures = [];
  function uniqueIds(items, label) {
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

  if (matrix?.schema_version !== 1) failures.push('schema_version must equal 1');
  if (matrix?.advancement_mode !== 'manual_g02_independent') failures.push('advancement must remain independent of G02/Fallgate');

  const platformIds = uniqueIds(matrix?.platforms, 'platforms');
  for (const id of REQUIRED_PLATFORMS) if (!platformIds.has(id)) failures.push(`missing platform entry: ${id}`);
  for (const platform of matrix?.platforms || []) {
    if (!platform.runtime || !platform.status || !Array.isArray(platform.operating_systems) || !Array.isArray(platform.blockers)) {
      failures.push(`platform ${platform.id || '(unknown)'} is missing runtime, status, operating_systems, or blockers`);
    }
    if (!Array.isArray(platform.surfaces) || platform.surfaces.length === 0) failures.push(`platform ${platform.id || '(unknown)'} must declare at least one surface`);
  }

  const serviceIds = uniqueIds(matrix?.shared_services, 'shared_services');
  for (const id of REQUIRED_SERVICES) if (!serviceIds.has(id)) failures.push(`missing shared service: ${id}`);
  for (const service of matrix?.shared_services || []) {
    if (!service.role || !service.status) failures.push(`shared service ${service.id} is missing role or status`);
  }

  const firebase = (matrix?.shared_services || []).find((service) => service.id === 'firebase');
  if (firebase && (!Array.isArray(firebase.evidence) || !Array.isArray(firebase.blockers) || firebase.blockers.length === 0)) {
    failures.push('Firebase must carry evidence and unresolved activation blockers');
  }

  const divisionIds = uniqueIds(matrix?.enterprise_divisions, 'enterprise_divisions');
  for (const id of REQUIRED_DIVISIONS) if (!divisionIds.has(id)) failures.push(`missing enterprise division: ${id}`);

  const productIds = uniqueIds(matrix?.product_surfaces, 'product_surfaces');
  for (const product of matrix?.product_surfaces || []) {
    if (!product.division || !Array.isArray(product.platform_targets) || !product.status) failures.push(`product surface ${product.id || '(unknown)'} is missing division, platform_targets, or status`);
    if (!divisionIds.has(product.division)) failures.push(`product surface ${product.id} references unknown division ${product.division}`);
    for (const target of product.platform_targets || []) if (!platformIds.has(target)) failures.push(`product surface ${product.id} references unknown platform ${target}`);
  }
  if (productIds.size === 0) failures.push('product_surfaces must not be empty');

  const pageIds = uniqueIds(matrix?.web_pages, 'web_pages');
  if (pageIds.size !== 25) failures.push('web_pages must contain all 25 catalogued routes');
  for (const page of matrix?.web_pages || []) {
    if (!page.route || !page.entity || page.certification !== 'unverified') failures.push(`web page ${page.id || '(unknown)'} must retain route, entity, and unverified certification`);
  }
  const appIds = new Set();
  if (!Array.isArray(matrix?.appdeploy_surfaces) || matrix.appdeploy_surfaces.length !== 7) failures.push('appdeploy_surfaces must contain all 7 catalogued apps');
  for (const app of matrix?.appdeploy_surfaces || []) {
    if (!app.app_id || appIds.has(app.app_id)) failures.push('AppDeploy surface is missing a unique app_id');
    appIds.add(app.app_id);
    if (app.live_status !== 'not_rechecked_in_this_task') failures.push(`AppDeploy surface ${app.app_id} must not claim an unverified live status`);
  }

  const snapshot = matrix?.observed_infrastructure;
  if (snapshot?.read_only !== true) failures.push('Cloudflare inventory must be explicitly marked read_only');
  if (snapshot?.zone?.name !== 'thelingolegacy.com' || snapshot?.zone?.status !== 'active') failures.push('active canonical Cloudflare zone evidence is missing');
  if (!snapshot?.production_routing?.apex_wildcard?.worker || !snapshot?.production_routing?.exact_root?.worker) failures.push('apex and exact-root Worker route evidence is required');
  if (!snapshot?.worker_versions?.['thelingolegacyv-5']?.currently_deployed_version) failures.push('current production Worker deployment version evidence is required');

  if (!matrix?.global_rules?.some((rule) => rule.includes('G02/Fallgate is not a prerequisite'))) failures.push('G02/Fallgate independence rule is missing');
  if (!matrix?.global_rules?.some((rule) => rule.includes('Never commit API keys'))) failures.push('secret-handling rule is missing');
  if (!matrix?.global_rules?.some((rule) => rule.includes('Firebase Hosting configuration is not proof'))) failures.push('canonical Cloudflare delivery rule is missing');

  return failures;
}
