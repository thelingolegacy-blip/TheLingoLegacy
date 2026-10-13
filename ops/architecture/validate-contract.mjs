#!/usr/bin/env node
import fs from "node:fs";

const path = new URL("./platform-contract.json", import.meta.url);
const c = JSON.parse(fs.readFileSync(path, "utf8"));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(c.contractVersion === "1.0.0", "contractVersion must be 1.0.0");
assert(c.source?.repository === "thelingolegacy-blip/TheLingoLegacy", "canonical source repository mismatch");
assert(c.production?.failClosed === true, "production fail-closed must remain true");
assert(c.production?.mutationFreeze === true, "production mutation freeze must remain active");
assert(c.production?.lastKnownGoodProtected === true, "LKG must remain protected");
assert(c.production?.promotionAuthorized === false, "promotion must not be pre-authorized");
assert(c.production?.activationAuthorized === false, "activation must not be pre-authorized");
assert(Array.isArray(c.production?.requiredGateOrder) && c.production.requiredGateOrder.join(",") === "G00,G01,G02,G03,G04,G05,G06,G07,G08,G09,G10,G11", "gate order must be complete and canonical");
assert(c.runtime?.authorityDrift === true, "observed Worker-name drift must remain explicit until independently reconciled");
assert(c.runtime?.publicReachability === "UNVERIFIED", "unverified public reachability must not be represented as passed");
assert(c.ci?.runner?.status === "BLOCKED", "G02 must remain blocked until real assignment and evidence exist");
assert(c.ci?.runner?.requiresAssignedJob === true, "runner assignment evidence requirement missing");
assert(c.ci?.runner?.requiresInstantiatedSteps === true, "runner step evidence requirement missing");
assert(c.ci?.runner?.requiresRetrievableLogs === true, "runner log evidence requirement missing");
assert(c.services?.googleAiStudio?.enabled === false, "Google AI integration must default off");
assert(c.services?.googleAiStudio?.secretValueCommitted === false, "provider secret must never be committed");
assert(c.services?.googleAiStudio?.clientSideKeyExposureAllowed === false, "client-side provider key exposure must be prohibited");
assert(c.services?.googleAiStudio?.autonomousActionsAllowed === false, "AI autonomous actions must remain prohibited");
assert(c.services?.firebase?.productionWritesAllowedDuringReconstruction === false, "Firebase production writes must remain prohibited");
assert(c.services?.appdeploy?.productionPromotionAllowed === false, "AppDeploy staging must not promote to production");
assert(c.release?.lkgMayChangeOnlyAfterG00ThroughG11Pass === true, "LKG seal gate is missing");
assert(Array.isArray(c.release?.requiredEvidence) && c.release.requiredEvidence.includes("artifact_sha256") && c.release.requiredEvidence.includes("independent_verifier"), "required evidence fields missing");

if (errors.length) {
  console.error("PLATFORM_CONTRACT=FAIL");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}
console.log("PLATFORM_CONTRACT=PASS");
console.log("MODE=STATIC_CONTRACT_VALIDATION_ONLY");
console.log("G02=BLOCKED");
console.log("PRODUCTION_PROMOTION=BLOCKED");
console.log("ACTIVATION=BLOCKED");
console.log("LKG=PROTECTED");
