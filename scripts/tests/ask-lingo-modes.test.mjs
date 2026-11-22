import assert from 'node:assert/strict';
import test from 'node:test';
import { listAskLingoModes, getAskLingoModeGroups, resolveAskLingoMode, resolveAskLingoOperatingState, modeGrantsAuthority } from '../../src/ai/v2/modes.mjs';

test('registers the complete canonical set of thirteen modes', () => {
  const modes = listAskLingoModes();
  assert.equal(modes.length, 13);
  for (const id of ['chat','research','generation','help','training','examples','teach','govern','law','medicine','firefighter','emt','law_enforcement']) {
    assert.equal(resolveAskLingoMode(id)?.id, id);
  }
});

test('rejects unknown modes instead of silently falling back to chat', () => {
  assert.equal(resolveAskLingoMode('unknown'), null);
  assert.equal(resolveAskLingoMode(''), null);
  assert.equal(resolveAskLingoMode(null), null);
});

test('keeps professional subject modes explicitly educational', () => {
  for (const id of ['law','medicine','firefighter','emt','law_enforcement']) {
    assert.equal(resolveAskLingoMode(id).educationalOnly, true);
    assert.equal(resolveAskLingoMode(id).research, true);
  }
});

test('groups modes without changing their canonical identifiers', () => {
  const groups = getAskLingoModeGroups();
  assert.deepEqual(groups.discover, ['chat','research','help']);
  assert.deepEqual(groups.professional_education, ['law','medicine','firefighter','emt','law_enforcement']);
});

test('operating states are distinct from intelligence modes', () => {
  assert.deepEqual(['operating','build','analysis'], ['operating','build','analysis']);
  assert.equal(resolveAskLingoOperatingState('operating'), 'operating');
  assert.equal(resolveAskLingoOperatingState('build'), 'build');
  assert.equal(resolveAskLingoOperatingState('analysis'), 'analysis');
  assert.equal(resolveAskLingoOperatingState('research'), null);
});

test('mode and operating state never grant authority', () => {
  for (const id of ['chat','research','generation','govern','law','medicine']) {
    assert.equal(modeGrantsAuthority(resolveAskLingoMode(id)), false);
  }
  assert.equal(modeGrantsAuthority(resolveAskLingoOperatingState('build')), false);
});
