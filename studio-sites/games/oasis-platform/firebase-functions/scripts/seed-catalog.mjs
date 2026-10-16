import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const file = fileURLToPath(new URL("../catalog-seed.json", import.meta.url));
const items = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(items) || items.some(x => !x.id || !Number.isSafeInteger(x.price) || x.price < 0 || x.cashValue !== false)) {
  throw new Error("Catalog seed failed schema/safety validation.");
}
for (let offset = 0; offset < items.length; offset += 400) {
  const batch = db.batch();
  for (const item of items.slice(offset, offset + 400)) {
    const { id, ...data } = item;
    batch.set(db.collection("oasisCatalog").doc(id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  }
  await batch.commit();
}
console.log(`Seeded ${items.length} virtual-only catalog items. No player balances were created or changed.`);
