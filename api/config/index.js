const { loadConfig, sendJson, readOnlyGuard } = require('./_data');

module.exports = function handler(request, response) {
  if (readOnlyGuard(request, response)) return;
  const config = loadConfig();
  sendJson(response, 200, {
    version: config.version,
    principles: config.principles,
    counts: {
      machines: config.machines.length,
      jackpotProfiles: config.jackpotProfiles.length,
      missions: config.missions.length,
      events: config.events.length,
      cosmetics: config.cosmetics.length,
      worlds: config.worlds.length
    },
    safety: config.safety,
    aiFlavor: config.aiFlavor
  });
};
