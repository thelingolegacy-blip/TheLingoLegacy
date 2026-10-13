// Explicit dry-run product-class allowlist. Unknown and regulated classes fail closed.
const ALLOWED_SANDBOX_PRODUCT_CLASSES = new Set([
  "custom_apparel",
  "approved_private_label_products",
  "approved_accessories",
]);

export function isAllowedProductClass(value) {
  if (typeof value !== "string") return false;
  return ALLOWED_SANDBOX_PRODUCT_CLASSES.has(value.trim().toLowerCase());
}
