// Isolated preview entrypoint. Reuse the canonical Worker runtime and serve
// this branch's static assets through a separately named workers.dev Worker.
// This file intentionally declares no custom-domain routes.
import worker from '../../worker.js';

export default worker;
