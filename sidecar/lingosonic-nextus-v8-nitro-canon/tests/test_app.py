import importlib.util
import json
import os
import pathlib
import sys
import types
import unittest
from unittest.mock import Mock

ROOT = pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault("QUEUE_URL", "https://sqs.invalid/test-queue")
os.environ.setdefault("TABLE_NAME", "test-table")

# The handler's production dependencies are AWS SDK clients. Stub only the
# module construction so these unit tests run without credentials or AWS access.
fake_boto3 = types.ModuleType("boto3")
fake_boto3.client = lambda *_args, **_kwargs: Mock()
fake_boto3.resource = lambda *_args, **_kwargs: Mock()
sys.modules.setdefault("boto3", fake_boto3)

spec = importlib.util.spec_from_file_location("sidecar_lambda_app", ROOT / "lambda" / "app.py")
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


class HandlerTests(unittest.TestCase):
    def setUp(self):
        app.sqs = Mock()
        app.table = Mock()
        self.context = types.SimpleNamespace(aws_request_id="unit-test-request")

    def invoke(self, method, path, body=None):
        return app.handler(
            {
                "requestContext": {"http": {"method": method}},
                "rawPath": path,
                "body": body,
                "isBase64Encoded": False,
            },
            self.context,
        )

    def test_health_route(self):
        result = self.invoke("GET", "/health")
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(json.loads(result["body"])["status"], "ok")
        app.table.put_item.assert_not_called()
        app.sqs.send_message.assert_not_called()

    def test_unknown_route_is_404(self):
        result = self.invoke("GET", "/unknown")
        self.assertEqual(result["statusCode"], 404)

    def test_invalid_json_is_400(self):
        result = self.invoke("POST", "/jobs", "{")
        self.assertEqual(result["statusCode"], 400)
        app.table.put_item.assert_not_called()
        app.sqs.send_message.assert_not_called()

    def test_task_validation_is_400(self):
        result = self.invoke("POST", "/jobs", json.dumps({"task": " "}))
        self.assertEqual(result["statusCode"], 400)
        app.table.put_item.assert_not_called()
        app.sqs.send_message.assert_not_called()

    def test_valid_job_is_persisted_and_queued(self):
        result = self.invoke("POST", "/jobs", json.dumps({"task": "build-preview"}))
        self.assertEqual(result["statusCode"], 202)
        response = json.loads(result["body"])
        self.assertEqual(response["status"], "QUEUED")
        self.assertTrue(response["jobId"])
        app.table.put_item.assert_called_once()
        app.sqs.send_message.assert_called_once()
        message = json.loads(app.sqs.send_message.call_args.kwargs["MessageBody"])
        self.assertEqual(message["jobId"], response["jobId"])
        self.assertEqual(message["task"], "build-preview")


    def test_sqs_failure_returns_503_without_leaking_exception(self):
        app.sqs.send_message.side_effect = RuntimeError("internal-aws-detail")
        result = self.invoke("POST", "/jobs", json.dumps({"task": "build-preview"}))
        self.assertEqual(result["statusCode"], 503)
        body = json.loads(result["body"])
        self.assertEqual(body["error"], "job_enqueue_unavailable")
        self.assertNotIn("internal-aws-detail", result["body"])
        app.table.put_item.assert_called_once()
        app.sqs.send_message.assert_called_once()

    def test_base64_body_is_rejected(self):
        result = app.handler(
            {
                "requestContext": {"http": {"method": "POST"}},
                "rawPath": "/jobs",
                "body": "eyJ0YXNrIjoiYnVpbGQifQ==",
                "isBase64Encoded": True,
            },
            self.context,
        )
        self.assertEqual(result["statusCode"], 400)
        self.assertEqual(json.loads(result["body"])["error"], "base64_body_not_supported")
        app.table.put_item.assert_not_called()
        app.sqs.send_message.assert_not_called()

if __name__ == "__main__":
    unittest.main()
