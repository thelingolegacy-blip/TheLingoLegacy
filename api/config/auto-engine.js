const { loadConfig, sendJson, readOnlyGuard } = require('./_data');

module.exports = function handler(request, response) {
  if (readOnlyGuard(request, response)) return;
  const config = loadConfig();
  sendJson(response, 200, { version: config.version, autoEngine: config.autoEngine, aiFlavor: config.aiFlavor, safety: config.safety });
};
