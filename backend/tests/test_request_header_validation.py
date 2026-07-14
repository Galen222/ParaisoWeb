import unittest

from backend.middleware.request_size import RequestSizeLimitMiddleware, RequestSizeRule
from backend.tests import _environment  # noqa: F401


class RequestFramingHeaderTests(unittest.IsolatedAsyncioTestCase):
    async def test_duplicate_content_length_is_rejected_before_body_read(self) -> None:
        app_called = False
        receive_called = False
        sent_messages = []

        async def app(scope, receive, send):
            nonlocal app_called
            app_called = True

        middleware = RequestSizeLimitMiddleware(
            app,
            [RequestSizeRule(method="POST", path="/contacto", max_bytes=100)],
        )

        async def receive():
            nonlocal receive_called
            receive_called = True
            return {"type": "http.request", "body": b"abc", "more_body": False}

        async def send(message):
            sent_messages.append(message)

        await middleware(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [
                    (b"content-length", b"3"),
                    (b"Content-Length", b"3"),
                ],
            },
            receive,
            send,
        )

        self.assertFalse(app_called)
        self.assertFalse(receive_called)
        self.assertEqual(sent_messages[0]["status"], 400)
        self.assertIn(b"Content-Length duplicada", sent_messages[1]["body"])

    async def test_content_length_and_transfer_encoding_are_rejected_together(self) -> None:
        app_called = False
        receive_called = False
        sent_messages = []

        async def app(scope, receive, send):
            nonlocal app_called
            app_called = True

        middleware = RequestSizeLimitMiddleware(
            app,
            [RequestSizeRule(method="POST", path="/contacto", max_bytes=100)],
        )

        async def receive():
            nonlocal receive_called
            receive_called = True
            return {"type": "http.request", "body": b"abc", "more_body": False}

        async def send(message):
            sent_messages.append(message)

        await middleware(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [
                    (b"content-length", b"3"),
                    (b"transfer-encoding", b"chunked"),
                ],
            },
            receive,
            send,
        )

        self.assertFalse(app_called)
        self.assertFalse(receive_called)
        self.assertEqual(sent_messages[0]["status"], 400)
        self.assertIn(b"Transfer-Encoding", sent_messages[1]["body"])


if __name__ == "__main__":
    unittest.main()
