#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, "studio/surface-contracts.json"), "utf8"));
const routes = JSON.parse(fs.readFileSync(path.join(root, "studio/routes.json"), "utf8"));
const featureManifest = JSON.parse(fs.readFileSync(path.join(root, "studio/production-feature-manifest.json"), "utf8"));

const routeEntries = routes.routes || [];
const routeMap = new Map(routeEntries.map(entry => [entry.surface, entry.path]));
const requiredFiles = contract.shared?.requiredFiles || [];

const failures = [];
const checked = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function fail(code, message) {
  failures.push({ code, message });
}

for (const required of requiredFiles) {
  if (!exists(required)) fail("SHARED_FILE_MISSING", required);
}

for (const surface of contract.surfaces || []) {
  const html = read(surface.entrypoint);
  const id = surface.identity;

  const routeRegistered = routeEntries.some(entry => entry.surface === id && entry.path === surface.path);
  const canonicalRouteMatches =
    routeMap.get(id) === surface.path ||
    (id === "lingoarcade" && routeMap.get(id) === "/arcade") ||
    (id === "thats-my-lingo" && routeMap.get(id) === "/game");

  const featureSurfaceMatches = featureManifest.surfaces?.[id] === surface.path;
  const featureRouteRegistered = (featureManifest.routes || []).includes(surface.path);

  const runtimeLinked = !!html && html.includes("studio/runtime/studio-runtime.js");
  const adapterLinked = !!html && html.includes("studio/runtime/studio-surface.js");
  const identityDeclared = !!html && html.includes(`data-lingo-surface="${id}"`);

  checked.push({
    id,
    entrypoint: surface.entrypoint,
    path: surface.path,
    entrypointPresent: !!html,
    runtimeLinked,
    adapterLinked,
    identityDeclared,
    routeRegistered,
    canonicalRouteMatches,
    manifestSurfaceMatches: featureSurfaceMatches,
    manifestRouteRegistered: featureRouteRegistered
  });

  if (!html) fail("ENTRYPOINT_MISSING", `${id}: ${surface.entrypoint}`);
  if (html && !runtimeLinked) fail("RUNTIME_LINK_MISSING", id);
  if (html && !adapterLinked) fail("ADAPTER_LINK_MISSING", id);
  if (html && !identityDeclared) fail("IDENTITY_MISSING", id);
  if (!routeRegistered) fail("ROUTE_MISSING", `${id}: ${surface.path}`);
  if (!canonicalRouteMatches) fail("ROUTE_DRIFT", `${id}: expected ${surface.path}, registry has ${routeMap.get(id) || "none"}`);
  if (!featureSurfaceMatches) fail("MANIFEST_SURFACE_MISMATCH", `${id}: expected ${surface.path}`);
  if (!featureRouteRegistered) fail("MANIFEST_ROUTE_MISSING", `${id}: ${surface.path}`);
}

const result = {
  schema: contract.schema,
  sourceOnly: true,
  production: false,
  checkedAt: new Date().toISOString(),
  requiredFileCount: requiredFiles.length,
  surfaceCount: checked.length,
  passed: failures.length === 0,
  failures,
  surfaces: checked
};

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
if (failures.length) process.exitCode = 1;
