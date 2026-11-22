#!/usr/bin/env node
import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const registry = read("config/registry/lingo-master-registry.v1.json");
const graph = read("config/registry/lingo-dependency-graph.v1.json");
const routes = read("config/registry/cloudflare-route-inventory.v1.json");

const errors = [];
const productNames = registry.productGroups.flatMap((group) => group.products);
if (!Array.isArray(registry.productInventory)) errors.push("productInventory must be an array");
if (registry.productInventory?.length !== productNames.length) errors.push("flat product inventory count must equal product group product count");
const flat = new Set((registry.productInventory || []).map((item) => item.product));
for (const name of productNames) if (!flat.has(name)) errors.push(`missing flat product inventory entry: ${name}`);

const nodeIds = new Set(graph.nodes.map((node) => node.id));
for (const node of graph.nodes) {
  for (const dep of node.dependsOn || []) {
    if (!nodeIds.has(dep)) errors.push(`dependency ${node.id} references missing node ${dep}`);
  }
}
const visiting = new Set();
const visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`dependency cycle detected at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  const node = graph.nodes.find((item) => item.id === id);
  for (const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id);
  visited.add(id);
}
for (const id of nodeIds) visit(id);

const routePatterns = (routes.routes || []).map((route) => route.pattern);
if (new Set(routePatterns).size !== routePatterns.length) errors.push("duplicate Cloudflare route patterns detected");
if (registry.liveObservations?.cloudflare?.routeCount !== routes.routes?.length) errors.push("registry live route count does not match route inventory");
if (errors.length) {
  console.error("MASTER_REGISTRY_VALIDATION=FAIL");
  for (const error of errors) console.error("-", error);
  process.exit(1);
}
console.log("MASTER_REGISTRY_VALIDATION=PASS");
console.log(`PRODUCT_GROUPS=${registry.productGroups.length}`);
console.log(`PRODUCTS=${productNames.length}`);
console.log(`DEPENDENCY_NODES=${graph.nodes.length}`);
console.log(`CLOUDFLARE_ROUTES=${routePatterns.length}`);
