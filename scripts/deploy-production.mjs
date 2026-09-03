import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
const skipPull = args.has('--skip-pull');
const liveBase = process.env.LIVE_BASE_URL || 'https://thelingolegacy.com';
const probePaths = process.env.LIVE_PROBE_PATHS || '/|/healthz|/api/v1/runtime|/api/v1/platform/manifest|/api/v1/platform/status';

function run(command, commandArgs, options = {}) {
  console.log(`\n$ ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: false, ...options });
  if (result.status !== 0) throw new Error(`Command failed (${result.status ?? 'signal'}): ${command}`);
}

function output(command, commandArgs) {
  return execFileSync(command, commandArgs, { encoding: 'utf8' }).trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(`PRODUCTION GATE FAILED: ${message}`);
}

try {
  assert(fs.existsSync('wrangler.jsonc'), 'wrangler.jsonc is missing');
  assert(fs.existsSync('worker.js'), 'worker.js is missing');
  assert(fs.existsSync('scripts/verify-dynamic-runtime.mjs'), 'dynamic runtime verifier is missing');
  assert(fs.existsSync('scripts/live-probes.mjs'), 'live probe harness is missing');

  const branch = output('git', ['branch', '--show-current']);
  assert(branch === 'production-deploy', `expected branch production-deploy, found ${branch || '(detached)'}`);

  const status = output('git', ['status', '--porcelain']);
  assert(!status, 'working tree is not clean; commit or stash changes before production deployment');

  if (!skipPull) {
    run('git', ['fetch', 'origin']);
    run('git', ['pull', '--ff-only', 'origin', 'production-deploy']);
  }

  run('node', ['--version']);
  run('npm', ['--version']);
  run('npx', ['wrangler', '--version']);
  run('npx', ['wrangler', 'whoami']);

  run('node', ['scripts/verify-dynamic-runtime.mjs']);
  run('npx', ['wrangler', 'deploy', '--config', 'wrangler.jsonc', '--dry-run']);

  if (!execute) {
    console.log('\nDRY-RUN PASS. No production change was made.');
    console.log('Run with --execute to perform the live deployment.');
    process.exit(0);
  }

  console.log('\nPRODUCTION EXECUTION AUTHORIZED BY EXPLICIT --execute FLAG.');
  run('npx', ['wrangler', 'deploy', '--config', 'wrangler.jsonc']);

  run('node', ['scripts/live-probes.mjs'], {
    env: { ...process.env, LIVE_BASE_URL: liveBase, LIVE_PROBE_PATHS: probePaths },
  });

  console.log('\nPRODUCTION DEPLOYMENT + LIVE PROBES: PASS');
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  console.error('Production deployment stopped fail-closed. No bypass flags are supported.');
  process.exit(1);
}
