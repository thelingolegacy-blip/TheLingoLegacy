import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvidence } from './verify-release-evidence.mjs';

const valid = () => ({
  schemaVersion: 1,
  repository: 'thelingolegacy-blip/TheLingoLegacy',
  commitSha: 'a'.repeat(40),
  capturedAtUtc: '2026-10-24T21:00:00Z',
  pullRequest: { number: 355, approved: true },
  workflow: { runId: 40127783266, attempt: 1, jobId: 'job-123', runnerId: 42, runnerName: 'isolated-linux-x64' },
  checks: [{ name: 'unit-contracts', status: 'PASS' }, { name: 'static-gates', status: 'PASS' }],
  artifacts: [{ name: 'test-report.json', sha256: 'b'.repeat(64) }],
});

test('accepts a complete evidence manifest', () => assert.deepEqual(validateEvidence(valid()), []));
test('rejects non-object input', () => assert.match(validateEvidence(null)[0], /JSON object/));
test('rejects abbreviated commit SHA', () => assert.ok(validateEvidence({ ...valid(), commitSha: 'abc123' }).some((e) => /full 40-character/.test(e))));
test('requires approval evidence', () => assert.ok(validateEvidence({ ...valid(), pullRequest: { number: 355, approved: false } }).some((e) => /approved must be true/.test(e))));
test('rejects missing real runner assignment', () => assert.ok(validateEvidence({ ...valid(), workflow: { ...valid().workflow, runnerId: 0, jobId: '' } }).some((e) => /runnerId must be a positive integer/.test(e))));
test('fails closed on a failed check', () => assert.ok(validateEvidence({ ...valid(), checks: [{ name: 'unit-contracts', status: 'FAIL' }] }).some((e) => /status must equal PASS/.test(e))));
test('requires artifact checksum', () => assert.ok(validateEvidence({ ...valid(), artifacts: [{ name: 'report.json', sha256: 'not-a-checksum' }] }).some((e) => /64-character SHA-256/.test(e))));
test('requires at least one check and artifact', () => assert.ok(validateEvidence({ ...valid(), checks: [], artifacts: [] }).length >= 2));
test('rejects non-UTC or malformed timestamp', () => assert.ok(validateEvidence({ ...valid(), capturedAtUtc: 'yesterday' }).some((e) => /UTC ISO-8601/.test(e))));
