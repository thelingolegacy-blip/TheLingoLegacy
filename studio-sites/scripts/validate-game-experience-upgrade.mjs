import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'studio-sites/config/game-experience-upgrade.json');
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const requiredClasses = ['deluxeSlots', 'deluxeCards', 'arcadeAdventure'];
const requiredAssetFamilies = [
  'symbol-atlas', 'reel-symbols', 'card-faces-and-backs', 'game-board-and-table',
  'character-portraits', 'player-avatar-portraits', 'avatar-frames', 'profile-banners',
  'background-environments', 'ui-icons', 'particles-and-overlays',
  'animation-spritesheets', 'music-loops', 'sound-effects', 'voice-lines',
  'accessibility-transcripts'
];
if (spec.schemaVersion !== '1.0.0') errors.push('Unsupported schemaVersion.');
if (!spec.sharedRuntime || !spec.sharedRuntime.animation || !spec.sharedRuntime.audio || !spec.sharedRuntime.profiles || !spec.sharedRuntime.assetIsolation) errors.push('Shared runtime contracts are incomplete.');
for (const key of requiredClasses) {
  if (!Array.isArray(spec.gameClasses?.[key]?.sharedFeatures) || !spec.gameClasses[key].sharedFeatures.length) errors.push('Missing game class contract: ' + key);
}
const ids = new Set();
const assets = new Set();
const audio = new Set();
for (const game of spec.games || []) {
  if (!game.id || ids.has(game.id)) errors.push('Missing or duplicate game id: ' + game.id);
  ids.add(game.id);
  if (!['LINGOslots', 'LINGOarcade'].includes(game.division)) errors.push(game.id + ': invalid division.');
  if (!requiredClasses.includes(game.class)) errors.push(game.id + ': invalid game class.');
  if (!game.assetNamespace || assets.has(game.assetNamespace)) errors.push(game.id + ': missing or duplicate asset namespace.');
  if (!game.audioNamespace || audio.has(game.audioNamespace)) errors.push(game.id + ': missing or duplicate audio namespace.');
  assets.add(game.assetNamespace);
  audio.add(game.audioNamespace);
  if (!Array.isArray(game.signature) || !game.signature.length) errors.push(game.id + ': signature feature set is empty.');
}
for (const family of requiredAssetFamilies) if (!(spec.assetFamilies || []).includes(family)) errors.push('Missing asset family: ' + family);
if ((spec.games || []).length < 10) errors.push('Expected the ten named LINGO game experiences.');
if (spec.sharedRuntime.audio.defaultState !== 'muted-until-user-gesture') errors.push('Audio must remain muted until a user gesture.');
if (spec.sharedRuntime.profiles.privateByDefault !== true) errors.push('Player profiles must default to private.');
if (spec.sharedRuntime.economy.realMoneyWagering !== false || spec.sharedRuntime.economy.cashout !== false || spec.sharedRuntime.economy.sweepstakesEnabled !== false) errors.push('Entertainment-only economy guardrails must remain disabled.');
if (!(spec.prohibitions || []).some(x => x.includes('namespace'))) errors.push('Cross-world asset namespace prohibition is missing.');
if (errors.length) {
  console.error('GAME_EXPERIENCE_UPGRADE_VALIDATION=FAIL');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('GAME_EXPERIENCE_UPGRADE_VALIDATION=PASS');
console.log('GAME_COUNT=' + spec.games.length);
console.log('GAME_CLASSES=' + requiredClasses.join(','));
console.log('ASSET_FAMILIES=' + spec.assetFamilies.length);
console.log('PRODUCTION_ACCEPTANCE=REQUIRED');
console.log('PRODUCTION_ACTIVATION=DISABLED');
