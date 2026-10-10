# Backup and restore runbook

This is a target operating procedure, not proof that backups are currently configured or tested.

## Data inventory
- DynamoDB job-status table: enable point-in-time recovery (included in baseline template).
- S3 evidence bucket: enable versioning (included in baseline template); public access blocked and server-side encryption enabled.
- SQS queue: messages are transient processing state; DLQ is for failed-message diagnosis, not a backup.
- CloudFormation template and app source: versioned in Git; keep a separate exported release bundle for disaster recovery.
- RDS and Kafka/MSK: not provisioned by baseline. If introduced, define engine-native backup, retention, replication, and restore-test plans before launch.

## Minimum recovery targets
Set actual RPO/RTO with the owner before production. Initial development target proposal only:
- Source/config RPO: last accepted Git commit; preserve commit SHA and release bundle.
- DynamoDB RPO: PITR window configured by AWS; verify actual retention in account.
- S3 RPO: version history; define lifecycle/retention and cross-account copy only after data classification.
- Development RTO: 1 business day target, subject to account access and restore-test results.

## Procedure
1. Identify incident scope and declare a change freeze for the affected sidecar stack.
2. Record stack name, AWS account ID, region, current template SHA, latest accepted commit, and incident time.
3. Preserve relevant CloudWatch logs and SQS DLQ message metadata; redact sensitive payloads.
4. Restore DynamoDB to a new table name using point-in-time recovery. Never overwrite the active table during initial recovery.
5. Restore S3 objects by version ID or recover the separately stored release bundle. Keep the bucket private.
6. Deploy the reviewed template to an isolated recovery stack; do not point DNS at it.
7. Verify health endpoint, IAM authorization, enqueue path, DynamoDB record, queue message, log correlation, and error alarm.
8. Compare checksums and record the evidence manifest.
9. Obtain owner acceptance before switching any consumers or aliases.
10. Preserve the original stack until the recovery is accepted and rollback is no longer required.

## Required evidence
- Incident and recovery IDs
- AWS account/region and stack IDs
- Template and application commit SHA
- Backup timestamp and restore-point timestamp
- DynamoDB table restore status
- S3 object/version IDs and SHA-256
- API smoke test and IAM authorization result
- Queue/DLQ counts before and after test
- CloudWatch log links and alarm state
- Restore operator and independent reviewer
- Final acceptance or explicit HOLD

Never report a backup as valid solely because versioning or PITR is enabled. A successful restore test is required.
