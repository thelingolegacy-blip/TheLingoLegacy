-- LINGO Direct D1 schema. Apply only to a non-production database during validation.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS fulfillment_webhook_events (
  webhook_id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  order_id TEXT,
  processing_state TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_state IN ('received','validated','queued','ignored','failed')),
  failure_code TEXT
);

CREATE TABLE IF NOT EXISTS fulfillment_suppliers (
  supplier_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  adapter_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disabled'
    CHECK (status IN ('disabled','sandbox','approved','suspended')),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS fulfillment_sku_routes (
  sku TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES fulfillment_suppliers(supplier_id),
  product_class TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disabled'
    CHECK (status IN ('disabled','sandbox','approved','blocked')),
  policy_version TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS fulfillment_orders (
  id TEXT PRIMARY KEY,
  shopify_order_id TEXT NOT NULL,
  shopify_order_name TEXT,
  supplier_id TEXT NOT NULL REFERENCES fulfillment_suppliers(supplier_id),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','submitting','accepted','in_production','shipped','delivered','exception','cancelled')),
  supplier_order_id TEXT,
  tracking_company TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  last_error_code TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(shopify_order_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS fulfillment_order_items (
  fulfillment_order_id TEXT NOT NULL REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  product_class TEXT NOT NULL,
  PRIMARY KEY (fulfillment_order_id, sku)
);

CREATE TABLE IF NOT EXISTS fulfillment_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correlation_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('pass','blocked','retry','fail')),
  safe_details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_orders_status_updated
  ON fulfillment_orders(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_fulfillment_audit_correlation
  ON fulfillment_audit_events(correlation_id, created_at);
