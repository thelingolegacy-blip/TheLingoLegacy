import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

type Principal = { uid: string; roles: string[] };

function principal(request: any): Principal {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign-in is required.");
  const roles = Array.isArray(request.auth?.token?.roles)
    ? request.auth.token.roles.filter((role: unknown): role is string => typeof role === "string")
    : [];
  return { uid, roles };
}

function requireRole(request: any, allowed: string[]): Principal {
  const actor = principal(request);
  if (!allowed.some((role) => actor.roles.includes(role))) {
    throw new HttpsError("permission-denied", "The required Studio Control Center role is missing.");
  }
  return actor;
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{3,64}$/.test(value);
}

export const createStudioTask = onCall(async (request) => {
  const actor = requireRole(request, ["studio_operator", "studio_admin"]);
  const title = request.data?.title;
  const scope = request.data?.scope;
  if (typeof title !== "string" || title.trim().length < 4 || title.length > 160) {
    throw new HttpsError("invalid-argument", "A task title between 4 and 160 characters is required.");
  }
  const allowedScopes = ["askLINGO", "LINGOarts", "Cloudflare", "Firebase", "AppDeploy", "cross-stack"];
  if (typeof scope !== "string" || !allowedScopes.includes(scope)) {
    throw new HttpsError("invalid-argument", "A supported integration scope is required.");
  }

  const ref = db.collection("studioTasks").doc();
  await ref.create({
    title: title.trim(),
    scope,
    environment: "staging",
    state: "requested",
    executionStarted: false,
    createdBy: actor.uid,
    createdAt: FieldValue.serverTimestamp()
  });
  return { taskId: ref.id, state: "requested", executionStarted: false };
});

export const recordStudioEvidence = onCall(async (request) => {
  const actor = requireRole(request, ["evidence_verifier", "studio_admin"]);
  const { gateId, sourceRunUrl, artifactSha256, independentReviewerUid, summary } = request.data || {};
  if (!validId(gateId)) throw new HttpsError("invalid-argument", "A valid gateId is required.");
  if (typeof sourceRunUrl !== "string" ||
      !/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/[0-9]+(?:\/attempts\/[0-9]+)?$/.test(sourceRunUrl)) {
    throw new HttpsError("invalid-argument", "A retrievable GitHub Actions run URL is required.");
  }
  if (typeof artifactSha256 !== "string" || !/^[a-f0-9]{64}$/i.test(artifactSha256)) {
    throw new HttpsError("invalid-argument", "A SHA-256 artifact digest is required.");
  }
  if (typeof independentReviewerUid !== "string" ||
      independentReviewerUid.length < 6 ||
      independentReviewerUid === actor.uid) {
    throw new HttpsError("failed-precondition", "Independent review must be performed by a different principal.");
  }
  if (typeof summary !== "string" || summary.trim().length < 10 || summary.length > 1000) {
    throw new HttpsError("invalid-argument", "A concise evidence summary is required.");
  }

  const ref = db.collection("studioEvidence").doc();
  await ref.create({
    gateId,
    environment: "staging",
    state: "submitted-for-independent-review",
    sourceRunUrl,
    artifactSha256: artifactSha256.toLowerCase(),
    submittedByUid: actor.uid,
    independentReviewerUid,
    summary: summary.trim(),
    createdAt: FieldValue.serverTimestamp()
  });
  return { evidenceId: ref.id, state: "submitted-for-independent-review" };
});

export const reviewStudioEvidence = onCall(async (request) => {
  const actor = requireRole(request, ["independent_reviewer", "studio_admin"]);
  const evidenceId = request.data?.evidenceId;
  const result = request.data?.result;
  if (!validId(evidenceId) || typeof result !== "string" ||
      !["verified", "rejected"].includes(result)) {
    throw new HttpsError("invalid-argument", "A valid evidenceId and review result are required.");
  }

  const evidenceRef = db.collection("studioEvidence").doc(evidenceId);
  const evidenceSnap = await evidenceRef.get();
  if (!evidenceSnap.exists) throw new HttpsError("not-found", "Evidence record not found.");
  const evidence = evidenceSnap.data()!;
  if (evidence.independentReviewerUid !== actor.uid || evidence.submittedByUid === actor.uid) {
    throw new HttpsError("permission-denied", "Only the assigned independent reviewer may review this evidence.");
  }

  const reviewRef = db.collection("studioEvidenceReviews").doc(evidenceId);
  await reviewRef.create({
    evidenceId,
    gateId: evidence.gateId,
    result,
    reviewerUid: actor.uid,
    reviewedAt: FieldValue.serverTimestamp()
  });
  return { evidenceId, result };
});

export const acceptStudioGate = onCall(async (request) => {
  const actor = requireRole(request, ["release_approver", "studio_admin"]);
  const gateId = request.data?.gateId;
  const evidenceIds = request.data?.evidenceIds;
  if (!validId(gateId) || !Array.isArray(evidenceIds) ||
      evidenceIds.length < 1 || evidenceIds.length > 10 ||
      !evidenceIds.every(validId)) {
    throw new HttpsError("invalid-argument", "A gateId and 1–10 evidence IDs are required.");
  }

  const evidenceSnapshots = await Promise.all(
    evidenceIds.map((id: string) => db.collection("studioEvidence").doc(id).get())
  );
  const reviewSnapshots = await Promise.all(
    evidenceIds.map((id: string) => db.collection("studioEvidenceReviews").doc(id).get())
  );
  const complete = evidenceSnapshots.every((snapshot) => snapshot.exists) &&
    reviewSnapshots.every((snapshot) => snapshot.exists) &&
    evidenceSnapshots.every((snapshot, index) => {
      const item = snapshot.data();
      const review = reviewSnapshots[index].data();
      return item?.gateId === gateId &&
        item?.environment === "staging" &&
        typeof item?.sourceRunUrl === "string" &&
        /^[a-f0-9]{64}$/i.test(String(item?.artifactSha256 || "")) &&
        item?.submittedByUid !== actor.uid &&
        item?.independentReviewerUid === review?.reviewerUid &&
        review?.result === "verified" &&
        review?.gateId === gateId &&
        review?.reviewerUid !== item?.submittedByUid &&
        review?.reviewerUid !== actor.uid;
    });

  if (!complete) {
    throw new HttpsError("failed-precondition", "Required independently verified evidence is incomplete.");
  }

  const decision = db.collection("studioGateDecisions").doc(gateId);
  await decision.create({
    gateId,
    environment: "staging",
    state: "accepted",
    evidenceIds,
    acceptedByUid: actor.uid,
    acceptedAt: FieldValue.serverTimestamp(),
    promotionAuthorized: false
  });
  return { gateId, state: "accepted", promotionAuthorized: false };
});
