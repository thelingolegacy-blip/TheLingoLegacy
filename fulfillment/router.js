import { isAllowedProductClass } from "./product-class-policy.mjs";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function base64(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function verifyShopifyHmac(rawBody, suppliedHmac, secret) {
  if (!suppliedHmac || !secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, rawBody);
  const expected = base64(signature);
  if (expected.length !== suppliedHmac.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ suppliedHmac.charCodeAt(i);
  return mismatch === 0;
}

function safeShopDomain(value) {
  return String(value || "").trim().toLowerCase();
}

function safeOrderId(value) {
  const id = String(value ?? "").trim();
  return /^\d{1,32}$/.test(id) ? id : "";
}

function safeSku(value) {
  return String(value || "").trim().slice(0, 128);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return response({
        service: "lingo-direct-fulfillment",
        mode: env.FULFILLMENT_MODE || "unconfigured",
        productionEnabled: false,
      });
    }

    if (url.pathname !== "/webhooks/shopify/orders-paid" || request.method !== "POST") {
      return response({ ok: false, error: "not_found" }, 404);
    }

    if (!env.FULFILLMENT_DB || !env.SHOPIFY_WEBHOOK_SECRET || !env.SHOPIFY_EXPECTED_SHOP) {
      return response({ ok: false, error: "fulfillment_not_configured" }, 503);
    }

    const rawBody = await request.arrayBuffer();
    const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
    if (!(await verifyShopifyHmac(rawBody, hmac, env.SHOPIFY_WEBHOOK_SECRET))) {
      return response({ ok: false, error: "invalid_signature" }, 401);
    }

    const topic = (request.headers.get("X-Shopify-Topic") || "").toLowerCase();
    const shopDomain = safeShopDomain(request.headers.get("X-Shopify-Shop-Domain"));
    const webhookId = String(request.headers.get("X-Shopify-Webhook-Id") || "").trim();

    if (topic !== "orders/paid") return response({ ok: false, error: "unsupported_topic" }, 400);
    if (shopDomain !== safeShopDomain(env.SHOPIFY_EXPECTED_SHOP)) {
      return response({ ok: false, error: "shop_not_allowlisted" }, 403);
    }
    if (!webhookId || webhookId.length > 200) {
      return response({ ok: false, error: "missing_webhook_id" }, 400);
    }

    let order;
    try {
      order = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
      return response({ ok: false, error: "invalid_json" }, 400);
    }

    const orderId = safeOrderId(order?.id);
    if (!orderId || !Array.isArray(order?.line_items) || order.line_items.length === 0) {
      return response({ ok: false, error: "invalid_order_shape" }, 400);
    }

    const lineItems = order.line_items.map((item) => ({
      sku: safeSku(item?.sku),
      quantity: Number(item?.quantity),
      productId: String(item?.product_id ?? ""),
    }));

    if (lineItems.some((item) => !item.sku || !Number.isSafeInteger(item.quantity) || item.quantity < 1)) {
      return response({ ok: false, error: "invalid_line_item" }, 422);
    }

    // Persist only minimal routing metadata. Never log or persist the raw body,
    // customer details, email, phone, or shipping address in this intake step.
    const insert = await env.FULFILLMENT_DB.prepare(
      `INSERT OR IGNORE INTO fulfillment_webhook_events
       (webhook_id, topic, shop_domain, order_id, processing_state)
       VALUES (?, ?, ?, ?, 'received')`,
    ).bind(webhookId, topic, shopDomain, orderId).run();

    if (!insert.success) return response({ ok: false, error: "event_persistence_failed" }, 503);

    // D1 reports zero changed rows when INSERT OR IGNORE detects a duplicate.
    if (insert.meta?.changes === 0) {
      return response({ ok: true, duplicate: true, state: "already_received" }, 200);
    }

    const mode = String(env.FULFILLMENT_MODE || "dry_run").toLowerCase();
    if (mode !== "dry_run") {
      // Deliberately fail closed until supplier adapters, SKU policy, test-order
      // evidence, and production authorization have been accepted.
      return response({
        ok: true,
        accepted: true,
        state: "received",
        routing: "blocked_pending_supplier_adapter_approval",
        orderReference: orderId,
        itemCount: lineItems.length,
      }, 202);
    }

    const routeResults = [];
    for (const item of lineItems) {
      const route = await env.FULFILLMENT_DB.prepare(
        `SELECT r.sku, r.supplier_id, r.product_class, r.status AS route_status,
                s.status AS supplier_status, s.adapter_key
         FROM fulfillment_sku_routes r
         JOIN fulfillment_suppliers s ON s.supplier_id = r.supplier_id
         WHERE r.sku = ?`,
      ).bind(item.sku).first();

      const productClassAllowed = Boolean(route && isAllowedProductClass(route.product_class));
      routeResults.push({
        sku: item.sku,
        quantity: item.quantity,
        eligible: Boolean(
          route &&
          productClassAllowed &&
          route.route_status === "sandbox" &&
          route.supplier_status === "sandbox"
        ),
        reason: !route ? "sku_not_mapped" :
          !productClassAllowed ? "product_class_not_allowlisted" :
          route.route_status !== "sandbox" ? "route_not_sandbox_approved" :
          route.supplier_status !== "sandbox" ? "supplier_not_sandbox_approved" : "dry_run_only",
      });
    }

    await env.FULFILLMENT_DB.prepare(
      `UPDATE fulfillment_webhook_events SET processing_state = ?
       WHERE webhook_id = ?`,
    ).bind(routeResults.every((item) => item.eligible) ? "validated" : "ignored", webhookId).run();

    return response({
      ok: true,
      accepted: true,
      state: routeResults.every((item) => item.eligible) ? "validated_dry_run" : "held_for_review",
      productionEnabled: false,
      orderReference: orderId,
      routes: routeResults,
    }, 202);
  },
};
