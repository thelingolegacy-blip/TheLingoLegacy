-- Run in the intended environment after creating the dataset.
-- Replace the placeholders; never run against production without release approval.
CREATE TABLE IF NOT EXISTS `PROJECT_ID.DATASET_ID.events` (
  eventId STRING NOT NULL,
  eventName STRING NOT NULL,
  occurredAt TIMESTAMP NOT NULL,
  product STRING,
  source STRING NOT NULL,
  propertiesJson STRING
)
PARTITION BY DATE(occurredAt)
CLUSTER BY eventName, product
OPTIONS (
  description = "Minimized LINGO product analytics events; no direct user identifiers."
);
