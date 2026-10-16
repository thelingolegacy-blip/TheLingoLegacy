import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_IR_ITEMS = ['IR-01', 'IR-02', 'IR-03', 'IR-04', 'IR-05', 'IR-06'];
const SHA_RE = /^[a-f0-9]{40}$/i;
const DIGEST_RE = /^[a-f0-9]{64}$/i;

function parseTime(value, label) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a valid ISO-8601 timestamp`);
  return parsed;
}

export async function verifyReadinessManifest(manifestPath, expectedCommitSha, options = {}) {
  const maxAgeHours = options.maxAgeHours ?? 24;
  const nowMs = options.nowMs ?? Date.now();
  const failures = [];

  if (!SHA_RE.test(expectedCommitSha ?? '')) {
    return { ok: false, failures: ['Expected commit SHA must be a 40-character hexadecimal SHA.'] };
  }
  if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) {
    return { ok: false, failures: ['Maximum evidence age must be a positive number of hours.'] };
  }

  let manifest;
  let absoluteManifestPath;
  try {
    absoluteManifestPath = path.resolve(manifestPath);
    manifest = JSON.parse(await readFile(absoluteManifestPath, 'utf8'));
  } catch (error) {
    return { ok: false, failures: [`Cannot read valid JSON manifest: ${error.message}`] };
  }

  if (manifest.schemaVersion !== '1.0') failures.push('schemaVersion must equal "1.0".');
  if (manifest.source?.repository !== 'thelingolegacy-blip/TheLingoLegacy') {
    failures.push('Evidence repository must equal the canonical repository.');
  }
  if (manifest.source?.commitSha !== expectedCommitSha) {
    failures.push('Evidence commit SHA does not match the exact source commit being evaluated.');
  }

  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  let generatedAtMs;
  try {
    generatedAtMs = parseTime(manifest.generatedAt, 'generatedAt');
    if (generatedAtMs > nowMs + 5 * 60 * 1000) failures.push('generatedAt is in the future beyond the allowed clock-skew tolerance.');
    if (nowMs - generatedAtMs > maxAgeMs) failures.push('Readiness manifest is stale.');
  } catch (error) {
    failures.push(error.message);
  }

  if (!manifest.items || typeof manifest.items !== 'object' || Array.isArray(manifest.items)) {
    failures.push('items must be an object containing IR-01 through IR-06.');
    return { ok: false, failures };
  }

  const manifestDirectory = path.dirname(absoluteManifestPath);
  for (const id of REQUIRED_IR_ITEMS) {
    const item = manifest.items[id];
    if (!item || typeof item !== 'object') {
      failures.push(`${id} is missing.`);
      continue;
    }
    if (item.status !== 'PASS') failures.push(`${id} status must be PASS; found ${String(item.status)}.`);

    const acceptance = item.reviewerAcceptance;
    if (!acceptance || typeof acceptance.reviewer !== 'string' || !acceptance.reviewer.trim()) {
      failures.push(`${id} requires a named reviewer acceptance.`);
    }
    try {
      const acceptedAtMs = parseTime(acceptance?.acceptedAt, `${id}.reviewerAcceptance.acceptedAt`);
      if (acceptedAtMs > nowMs + 5 * 60 * 1000) failures.push(`${id} reviewer acceptance is dated in the future.`);
      if (nowMs - acceptedAtMs > maxAgeMs) failures.push(`${id} reviewer acceptance is stale.`);
      if (generatedAtMs !== undefined && acceptedAtMs > generatedAtMs + 5 * 60 * 1000) {
        failures.push(`${id} reviewer acceptance occurs after manifest generation.`);
      }
    } catch (error) {
      failures.push(error.message);
    }

    if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
      failures.push(`${id} requires at least one evidence artifact.`);
      continue;
    }

    for (const [index, evidence] of item.evidence.entries()) {
      const label = `${id}.evidence[${index}]`;
      if (!evidence || typeof evidence.path !== 'string' || !evidence.path.trim()) {
        failures.push(`${label} requires a relative artifact path.`);
        continue;
      }
      if (!DIGEST_RE.test(evidence.sha256 ?? '')) {
        failures.push(`${label} requires a 64-character SHA-256 digest.`);
        continue;
      }

      const evidencePath = path.resolve(manifestDirectory, evidence.path);
      const relative = path.relative(manifestDirectory, evidencePath);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        failures.push(`${label} path must remain inside the manifest directory.`);
        continue;
      }
      try {
        const resolvedPath = await realpath(evidencePath);
        const resolvedRelative = path.relative(await realpath(manifestDirectory), resolvedPath);
        if (resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) {
          failures.push(`${label} resolves outside the manifest directory.`);
          continue;
        }
        const bytes = await readFile(resolvedPath);
        const actual = createHash('sha256').update(bytes).digest('hex');
        if (actual !== evidence.sha256.toLowerCase()) failures.push(`${label} SHA-256 does not match artifact bytes.`);
      } catch (error) {
        failures.push(`${label} artifact is missing or unreadable: ${error.message}`);
      }
    }
  }

  const extraItems = Object.keys(manifest.items).filter((id) => !REQUIRED_IR_ITEMS.includes(id));
  if (extraItems.length) failures.push(`Unexpected IR item(s): ${extraItems.join(', ')}.`);

  return { ok: failures.length === 0, failures };
}

async function main() {
  const [, , manifestPath, expectedCommitSha, maxAgeArgument] = process.argv;
  if (!manifestPath || !expectedCommitSha) {
    console.error('Usage: node scripts/verify-ir-readiness.mjs <manifest.json> <expected-commit-sha> [max-age-hours]');
    process.exitCode = 2;
    return;
  }
  const maxAgeHours = maxAgeArgument === undefined ? 24 : Number(maxAgeArgument);
  const result = await verifyReadinessManifest(manifestPath, expectedCommitSha, { maxAgeHours });
  if (!result.ok) {
    console.error('IR_READINESS=BLOCKED');
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('IR_READINESS=PASS');
  console.log(`SOURCE_COMMIT=${expectedCommitSha}`);
  console.log(`MAX_EVIDENCE_AGE_HOURS=${maxAgeHours}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
