#!/usr/bin/env node
/**
 * Validates the planned LINGO Legacy art registry without treating plans as completed art.
 * Run from repository root:
 *   node studio-sites/art-refresh/validate-registry.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const registryPath = resolve("studio-sites/art-refresh/asset-registry.v0.1.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const errors = [];
const seenGameIds = new Set();
const seenAssetIds = new Set();
const allowedStatuses = new Set([
  "planned", "in-progress", "concept", "needs-review", "approved",
  "integrated", "verified", "blocked", "not-applicable"
]);

if (!Array.isArray(registry.games) || registry.games.length === 0) {
  errors.push("Registry must contain a non-empty games array.");
}

for (const game of registry.games ?? []) {
  if (!game.gameId || !game.title || !game.specPath) {
    errors.push("Every game requires gameId, title, and specPath.");
    continue;
  }
  if (seenGameIds.has(game.gameId)) errors.push(`Duplicate gameId: ${game.gameId}`);
  seenGameIds.add(game.gameId);

  if (!existsSync(resolve(game.specPath))) {
    errors.push(`Missing authoritative game spec for ${game.gameId}: ${game.specPath}`);
  }
  if (!Array.isArray(game.assets) || game.assets.length === 0) {
    errors.push(`No planned assets registered for ${game.gameId}`);
    continue;
  }

  for (const asset of game.assets) {
    if (!asset.assetId || !asset.role) {
      errors.push(`Asset under ${game.gameId} requires assetId and role.`);
      continue;
    }
    if (seenAssetIds.has(asset.assetId)) errors.push(`Duplicate assetId: ${asset.assetId}`);
    seenAssetIds.add(asset.assetId);
    if (!allowedStatuses.has(asset.status)) {
      errors.push(`Invalid status ${asset.status} for ${asset.assetId}`);
    }
    if (asset.path) {
      const assetPath = resolve(asset.path);
      if (!existsSync(assetPath)) {
        errors.push(`Missing registered asset path for ${asset.assetId}: ${asset.path}`);
      } else if (asset.path.endsWith(".svg")) {
        const svg = readFileSync(assetPath, "utf8");
        if (!/<svg\b/.test(svg) || !/<\/svg>\\s*$/.test(svg.trim())) {
          errors.push(`Invalid SVG root/closing tag for ${asset.assetId}: ${asset.path}`);
        }
        if (!/\bviewBox=/.test(svg)) {
          errors.push(`SVG missing viewBox for ${asset.assetId}: ${asset.path}`);
        }
        if (/<script\b/i.test(svg)) {
          errors.push(`SVG contains embedded script for ${asset.assetId}: ${asset.path}`);
        }
      }
    }
    if (["approved", "integrated", "verified"].includes(asset.status)) {
      for (const field of ["path", "format", "width", "height", "altText", "sha256"]) {
        if (asset[field] === null || asset[field] === undefined || asset[field] === "") {
          errors.push(`${asset.assetId} is ${asset.status} but missing required field: ${field}`);
        }
      }
      if (asset.sourceRightsStatus !== "approved") {
        errors.push(`${asset.assetId} is ${asset.status} without approved source/rights status`);
      }
    }
    if (asset.status === "verified" && (!asset.verificationEvidence || asset.verificationEvidence.length === 0)) {
      errors.push(`${asset.assetId} is verified without verification evidence`);
    }
  }
}

if (errors.length) {
  console.error("Art registry validation FAILED:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Art registry structure PASS: ${registry.games.length} games, ${seenAssetIds.size} planned asset records.`);
  console.log("No completion is inferred from planned entries; final statuses require evidence.");
}
