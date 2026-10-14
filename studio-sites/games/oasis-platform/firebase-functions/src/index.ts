import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();
const db = getFirestore();

type PurchaseRequest = { itemId?: unknown; idempotencyKey?: unknown };
type PurchaseResult = { ok: true; replayed: boolean; balance?: number; itemId: string };

export const purchaseOasisItem = onCall<PurchaseRequest>(async (request): Promise<PurchaseResult> => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in to use a synchronized inventory.");
  const itemId = request.data?.itemId;
  const idempotencyKey = request.data?.idempotencyKey;
  if (typeof itemId !== "string" || !/^[a-z0-9-]{1,64}$/.test(itemId)) {
    throw new HttpsError("invalid-argument", "A valid itemId is required.");
  }
  if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9_-]{12,100}$/.test(idempotencyKey)) {
    throw new HttpsError("invalid-argument", "A valid idempotencyKey is required.");
  }

  const walletRef = db.doc(`players/${uid}/wallets/demo`);
  const catalogRef = db.doc(`oasisCatalog/${itemId}`);
  const inventoryRef = db.doc(`players/${uid}/inventory/${itemId}`);
  // Hashing should be used if a client idempotency key is retained in a public ledger.
  const ledgerRef = db.doc(`players/${uid}/ledger/${idempotencyKey}`);
  let result: PurchaseResult | undefined;

  await db.runTransaction(async tx => {
    const prior = await tx.get(ledgerRef);
    if (prior.exists) {
      const data = prior.data()!;
      if (data.itemId !== itemId || data.reasonCode !== "STORE_PURCHASE") {
        throw new HttpsError("already-exists", "Idempotency key was already used for a different operation.");
      }
      result = { ok: true, replayed: true, itemId, balance: Number(data.balanceAfter) };
      return;
    }

    const [catalogSnap, walletSnap, inventorySnap] = await Promise.all([
      tx.get(catalogRef), tx.get(walletRef), tx.get(inventoryRef)
    ]);
    if (!catalogSnap.exists || catalogSnap.get("active") !== true) {
      throw new HttpsError("not-found", "This catalog item is unavailable.");
    }
    if (inventorySnap.exists) throw new HttpsError("already-exists", "This item is already owned.");
    const price = catalogSnap.get("price");
    const balance = walletSnap.exists ? walletSnap.get("balance") : 0;
    if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(balance) || balance < 0) {
      throw new HttpsError("failed-precondition", "Wallet or catalog data is invalid.");
    }
    if (balance < price) throw new HttpsError("failed-precondition", "INSUFFICIENT_FUNDS");
    const balanceAfter = balance - price;
    tx.set(walletRef, { balance: balanceAfter, currency: "DOUGH", cashValue: false, version: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(inventoryRef, { itemId, quantity: 1, equippedSlot: null, grantedBy: "STORE_PURCHASE", createdAt: FieldValue.serverTimestamp() });
    tx.create(ledgerRef, { itemId, delta: -price, reasonCode: "STORE_PURCHASE", currency: "DOUGH", cashValue: false, idempotencyKey, balanceAfter, createdAt: FieldValue.serverTimestamp() });
    result = { ok: true, replayed: false, balance: balanceAfter, itemId };
  });

  if (!result) throw new HttpsError("internal", "Purchase transaction did not return a result.");
  return result;
});
