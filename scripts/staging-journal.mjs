#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.env.STAGING_EVIDENCE_ROOT || '.';
const file = path.join(root, '.lkg_journal.json');
const next = JSON.parse(process.argv[2] || '{}');
let current = {};
if (fs.existsSync(file)) current = JSON.parse(fs.readFileSync(file, 'utf8'));
const merged = { ...current, ...next };
const tmp = file + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(merged, null, 2) + '\n', { mode: 0o600 });
const fd = fs.openSync(tmp, 'r'); fs.fsyncSync(fd); fs.closeSync(fd);
fs.renameSync(tmp, file);
const dir = fs.openSync(root, 'r'); fs.fsyncSync(dir); fs.closeSync(dir);
