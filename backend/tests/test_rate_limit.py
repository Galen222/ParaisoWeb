# backend/tests/test_rate_limit.py

"""Pruebas del middleware de limitación de solicitudes."""

import unittest

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from backend.middleware.rate_limit import RateLimitMiddleware, RateLimitRule


class MutableClock:
    """Reloj controlable para probar la expiración sin esperas reales."""

    def __init__(self) -> None:
        self.value = 1000.0

    def __call__(self) -> float:
        return self.value

    def advance(self, seconds: float) -> None:
        self.value += seconds


class RateLimitMiddlewareTests(unittest.TestCase):
    def setUp(self) -> None:
        self.clock = MutableClock()
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="prueba",
                    method="POST",
                    path="/limitado",
                    max_requests=2,
                    window_seconds=10,
                )
            ],
            secret_key="clave-pruebas",
            clock=self.clock,
        )

        @app.post("/limitado")
        async def limitado() -> dict[str, bool]:
            app.state.limited_calls += 1
            return {"ok": True}

        @app.get("/libre")
        async def libre() -> dict[str, bool]:
            return {"ok": True}

        self.app = app
        self.app.state.limited_calls = 0
        self.client = TestClient(app)

    def test_bloquea_al_superar_el_limite_y_envia_retry_after(self) -> None:
        self.assertEqual(self.client.post("/limitado").status_code, 200)
        self.assertEqual(self.client.post("/limitado").status_code, 200)

        blocked_response = self.client.post("/limitado")

        self.assertEqual(blocked_response.status_code, 429)
        self.assertEqual(blocked_response.json()["detail"], "Demasiadas solicitudes. Inténtalo de nuevo más tarde.")
        self.assertEqual(blocked_response.headers["retry-after"], "10")
        self.assertEqual(blocked_response.headers["cache-control"], "no-store")
        self.assertEqual(self.app.state.limited_calls, 2)

    def test_vuelve_a_permitir_solicitudes_al_expirar_la_ventana(self) -> None:
        self.client.post("/limitado")
        self.client.post("/limitado")
        self.clock.advance(10)

        self.assertEqual(self.client.post("/limitado").status_code, 200)

    def test_no_afecta_a_metodos_o_rutas_sin_regla(self) -> None:
        for _ in range(5):
            self.assertEqual(self.client.get("/libre").status_code, 200)

    def test_proxy_confiable_separa_clientes_por_x_forwarded_for(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="proxy",
                    method="GET",
                    path="/proxy",
                    max_requests=1,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            trusted_proxy_ips={"testclient"},
            clock=self.clock,
        )

        @app.get("/proxy")
        async def proxy() -> dict[str, bool]:
            return {"ok": True}

        client = TestClient(app)
        self.assertEqual(client.get("/proxy", headers={"x-forwarded-for": "203.0.113.10"}).status_code, 200)
        self.assertEqual(client.get("/proxy", headers={"x-forwarded-for": "203.0.113.11"}).status_code, 200)
        self.assertEqual(client.get("/proxy", headers={"x-forwarded-for": "203.0.113.10"}).status_code, 429)

    def test_proxy_no_confiable_no_puede_falsear_x_forwarded_for(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="proxy-no-confiable",
                    method="GET",
                    path="/proxy",
                    max_requests=1,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            trusted_proxy_ips=set(),
            clock=self.clock,
        )

        @app.get("/proxy")
        async def proxy() -> dict[str, bool]:
            return {"ok": True}

        client = TestClient(app)
        self.assertEqual(client.get("/proxy", headers={"x-forwarded-for": "203.0.113.10"}).status_code, 200)
        self.assertEqual(client.get("/proxy", headers={"x-forwarded-for": "203.0.113.11"}).status_code, 429)

    def test_proxy_confiable_ignora_ips_antepuestas_por_el_cliente(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="proxy-cadena",
                    method="GET",
                    path="/proxy",
                    max_requests=1,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            trusted_proxy_ips={"testclient"},
            clock=self.clock,
        )

        @app.get("/proxy")
        async def proxy() -> dict[str, bool]:
            return {"ok": True}

        client = TestClient(app)
        first_response = client.get(
            "/proxy",
            headers={"x-forwarded-for": "203.0.113.10, 198.51.100.25"},
        )
        second_response = client.get(
            "/proxy",
            headers={"x-forwarded-for": "203.0.113.11, 198.51.100.25"},
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 429)

    def test_regla_global_y_regla_especifica_se_aplican_a_la_misma_peticion(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="global",
                    method="*",
                    path="*",
                    max_requests=10,
                    window_seconds=60,
                ),
                RateLimitRule(
                    name="detalle",
                    method="GET",
                    path="/api/blog/{slug}",
                    max_requests=1,
                    window_seconds=60,
                ),
            ],
            secret_key="clave-pruebas",
            clock=self.clock,
        )

        @app.get("/api/blog/{slug}")
        async def detalle(slug: str) -> dict[str, str]:
            return {"slug": slug}

        client = TestClient(app)
        self.assertEqual(client.get("/api/blog/primero").status_code, 200)
        self.assertEqual(client.get("/api/blog/segundo").status_code, 429)


    def test_una_peticion_bloqueada_no_consume_parcialmente_otras_reglas(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="global",
                    method="*",
                    path="*",
                    max_requests=3,
                    window_seconds=60,
                ),
                RateLimitRule(
                    name="estricto",
                    method="GET",
                    path="/estricto",
                    max_requests=1,
                    window_seconds=60,
                ),
            ],
            secret_key="clave-pruebas",
            clock=self.clock,
        )

        @app.get("/estricto")
        async def estricto() -> dict[str, bool]:
            return {"ok": True}

        @app.get("/libre")
        async def libre() -> dict[str, bool]:
            return {"ok": True}

        client = TestClient(app)
        self.assertEqual(client.get("/estricto").status_code, 200)
        self.assertEqual(client.get("/estricto").status_code, 429)
        # La petición bloqueada por la regla estricta no debe gastar otro hueco global.
        self.assertEqual(client.get("/libre").status_code, 200)
        self.assertEqual(client.get("/libre").status_code, 200)
        self.assertEqual(client.get("/libre").status_code, 429)

    def test_preflight_cors_tambien_consume_el_limite_global(self) -> None:
        app = FastAPI()
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["https://frontend.example"],
            allow_credentials=True,
            allow_methods=["GET", "OPTIONS"],
            allow_headers=["x-timed-token"],
        )
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="global",
                    method="*",
                    path="*",
                    max_requests=1,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            cors_allowed_origins=["https://frontend.example"],
            cors_allow_credentials=True,
            clock=self.clock,
        )

        @app.get("/api/recurso")
        async def recurso() -> dict[str, bool]:
            return {"ok": True}

        headers = {
            "Origin": "https://frontend.example",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-timed-token",
        }
        client = TestClient(app)
        self.assertEqual(client.options("/api/recurso", headers=headers).status_code, 200)

        blocked = client.options("/api/recurso", headers=headers)
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.headers["access-control-allow-origin"], "https://frontend.example")
        self.assertEqual(blocked.headers["access-control-allow-credentials"], "true")
        self.assertEqual(blocked.headers["access-control-allow-methods"], "GET, POST, OPTIONS")
        self.assertEqual(blocked.headers["access-control-allow-headers"], "Content-Type, x-timed-token")
        self.assertEqual(blocked.headers["access-control-expose-headers"], "Retry-After")
        self.assertIn("Access-Control-Request-Method", blocked.headers["vary"])
        self.assertIn("Access-Control-Request-Headers", blocked.headers["vary"])

    def test_limite_global_cubre_rutas_sin_regla_especifica(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RateLimitMiddleware,
            rules=[
                RateLimitRule(
                    name="global",
                    method="*",
                    path="*",
                    max_requests=2,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            clock=self.clock,
        )

        @app.get("/ruta-nueva")
        async def ruta_nueva() -> dict[str, bool]:
            return {"ok": True}

        client = TestClient(app)
        self.assertEqual(client.get("/ruta-nueva").status_code, 200)
        self.assertEqual(client.get("/ruta-nueva").status_code, 200)
        self.assertEqual(client.get("/ruta-nueva").status_code, 429)


if __name__ == "__main__":
    unittest.main()
