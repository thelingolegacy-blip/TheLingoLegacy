import fs from 'node:fs';
import { validateMatrix } from './platform-surface-os-validator-lib.mjs';

const matrix = JSON.parse(fs.readFileSync('config/platform-surface-os-matrix.json', 'utf8'));
const failures = validateMatrix(matrix);
const result = {
  check: 'platform-surface-os-matrix-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  platform_count: matrix.platforms?.length || 0,
  shared_service_count: matrix.shared_services?.length || 0,
  enterprise_division_count: matrix.enterprise_divisions?.length || 0,
  product_surface_count: matrix.product_surfaces?.length || 0,
  failures
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
