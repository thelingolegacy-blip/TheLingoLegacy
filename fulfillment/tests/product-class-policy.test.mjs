import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedProductClass } from "../product-class-policy.mjs";

test("allows only the three explicitly approved sandbox product classes", () => {
  assert.equal(isAllowedProductClass("custom_apparel"), true);
  assert.equal(isAllowedProductClass("approved_private_label_products"), true);
  assert.equal(isAllowedProductClass("approved_accessories"), true);
});

test("normalizes case and surrounding whitespace without widening the allowlist", () => {
  assert.equal(isAllowedProductClass(" CUSTOM_APPAREL "), true);
  assert.equal(isAllowedProductClass("unapproved_accessory"), false);
  assert.equal(isAllowedProductClass("regulated_product"), false);
  assert.equal(isAllowedProductClass(""), false);
  assert.equal(isAllowedProductClass(null), false);
  assert.equal(isAllowedProductClass(undefined), false);
});
