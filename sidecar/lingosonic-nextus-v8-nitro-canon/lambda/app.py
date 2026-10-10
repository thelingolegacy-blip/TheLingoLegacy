import json
import os
import uuid
from datetime import datetime, timezone

import boto3

sqs = boto3.client("sqs")
dynamodb = boto3.resource("dynamodb")
QUEUE_URL = os.environ["QUEUE_URL"]
TABLE_NAME = os.environ["TABLE_NAME"]
table = dynamodb.Table(TABLE_NAME)


def response(status, body):
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json", "cache-control": "no-store"},
        "body": json.dumps(body),
    }


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "/")

    if method == "GET" and path.endswith("/health"):
        return response(200, {"status": "ok", "service": "lingosonic-sidecar"})

    if method != "POST" or not path.endswith("/jobs"):
        return response(404, {"error": "not_found"})

    try:
        raw = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            return response(400, {"error": "base64_body_not_supported"})
        payload = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return response(400, {"error": "invalid_json"})

    if not isinstance(payload, dict):
        return response(400, {"error": "json_object_required"})

    # Deliberately accept only a small, non-sensitive task label. Do not use this
    # endpoint as an arbitrary command runner or accept credentials in payloads.
    task = payload.get("task")
    if not isinstance(task, str) or not task.strip() or len(task) > 120:
        return response(400, {"error": "task_must_be_1_to_120_characters"})

    job_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    record = {
        "jobId": job_id,
        "status": "QUEUED",
        "task": task.strip(),
        "createdAt": created_at,
    }

    try:
        table.put_item(Item=record, ConditionExpression="attribute_not_exists(jobId)")
        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({"jobId": job_id, "task": task.strip()}),
            MessageAttributes={"schema": {"DataType": "String", "StringValue": "lingo.job.v1"}},
        )
    except Exception:
        # Do not expose internal AWS exception text to callers; CloudWatch captures
        # the exception context. A reconciliation worker can repair partial writes.
        print(json.dumps({"event": "job_enqueue_failed", "jobId": job_id}))
        return response(503, {"error": "job_enqueue_unavailable", "jobId": job_id})

    print(json.dumps({"event": "job_queued", "jobId": job_id, "requestId": getattr(context, "aws_request_id", None)}))
    return response(202, {"jobId": job_id, "status": "QUEUED", "createdAt": created_at})
