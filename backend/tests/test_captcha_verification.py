"""Verificación obligatoria y acotada del CAPTCHA del formulario de contacto."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from io import BytesIO
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException, Request, UploadFile
import requests

from backend.routers import contacto as contacto_router
from backend.services.captcha_service import CaptchaService, RECAPTCHA_VERIFY_URL
from backend.services.file_service import FileService


class CaptchaVerificationTests(unittest.IsolatedAsyncioTestCase):
    async def test_token_valido_para_host_autorizado_se_acepta_y_envia_la_ip(self) -> None:
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "success": True,
            "hostname": "www.paraisodeljamon.com",
        }

        with (
            patch("backend.services.captcha_service.settings.RECAPTCHA_SECRET_KEY", "clave-secreta"),
            patch(
                "backend.services.captcha_service.settings.RECAPTCHA_ALLOWED_HOSTNAMES",
                "paraisodeljamon.com,www.paraisodeljamon.com",
            ),
            patch("backend.services.captcha_service.settings.RECAPTCHA_TIMEOUT_SECONDS", 4.5),
            patch("backend.services.captcha_service.requests.post", return_value=response) as post,
        ):
            await CaptchaService().verify(" token-valido ", "203.0.113.10")

        post.assert_called_once_with(
            RECAPTCHA_VERIFY_URL,
            data={
                "secret": "clave-secreta",
                "response": "token-valido",
                "remoteip": "203.0.113.10",
            },
            timeout=4.5,
        )

    async def test_host_no_autorizado_rechaza_el_formulario(self) -> None:
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "success": True,
            "hostname": "sitio-ajeno.example",
        }

        with (
            patch("backend.services.captcha_service.settings.RECAPTCHA_SECRET_KEY", "clave-secreta"),
            patch(
                "backend.services.captcha_service.settings.RECAPTCHA_ALLOWED_HOSTNAMES",
                "paraisodeljamon.com,www.paraisodeljamon.com",
            ),
            patch("backend.services.captcha_service.requests.post", return_value=response),
            self.assertRaises(HTTPException) as context,
        ):
            await CaptchaService().verify("token-valido")

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "Verificación CAPTCHA no válida")

    async def test_token_vacio_o_con_longitud_bruta_excesiva_se_rechaza_sin_consultar_google(self) -> None:
        with patch("backend.services.captcha_service.requests.post") as post:
            for token in ("", "   ", "x" * 4097, f"token-valido{' ' * 4090}"):
                with self.subTest(token_length=len(token)), self.assertRaises(HTTPException) as context:
                    await CaptchaService().verify(token)
                self.assertEqual(context.exception.status_code, 400)

        post.assert_not_called()

    async def test_error_de_red_o_clave_sin_configurar_no_permite_enviar(self) -> None:
        with (
            patch("backend.services.captcha_service.settings.RECAPTCHA_SECRET_KEY", ""),
            patch("backend.services.captcha_service.requests.post") as post,
            self.assertRaises(HTTPException) as missing_secret,
        ):
            await CaptchaService().verify("token")

        self.assertEqual(missing_secret.exception.status_code, 503)
        post.assert_not_called()

        with (
            patch("backend.services.captcha_service.settings.RECAPTCHA_SECRET_KEY", "clave-secreta"),
            patch(
                "backend.services.captcha_service.requests.post",
                side_effect=requests.Timeout("timeout controlado"),
            ),
            self.assertRaises(HTTPException) as network_error,
        ):
            await CaptchaService().verify("token")

        self.assertEqual(network_error.exception.status_code, 503)


class ContactCaptchaIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def test_el_endpoint_verifica_captcha_antes_de_procesar_el_correo(self) -> None:
        events: list[str] = []

        async def verify_captcha(token: str, client_ip: str | None = None) -> None:
            self.assertEqual(token, "captcha-valido")
            self.assertEqual(client_ip, "203.0.113.25")
            events.append("captcha")

        async def process_contact_form(**data: object) -> None:
            self.assertEqual(data["email"], "ana@example.com")
            events.append("correo")

        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [],
                "client": ("203.0.113.25", 43210),
            }
        )

        with (
            patch.object(
                contacto_router.CaptchaService,
                "verify",
                new=AsyncMock(side_effect=verify_captcha),
            ),
            patch.object(
                contacto_router.ContactoService,
                "process_contact_form",
                new=AsyncMock(side_effect=process_contact_form),
            ),
        ):
            result = await contacto_router.contacto(
                request=request,
                token_verification=None,
                name="Ana Pérez",
                reason="informacion",
                email="ana@example.com",
                message="Consulta válida",
                captcha_token="captcha-valido",
                file=None,
            )

        self.assertEqual(result, {"message": "Formulario enviado correctamente"})
        self.assertEqual(events, ["captcha", "correo"])

    async def test_datos_invalidos_se_rechazan_antes_de_consumir_el_captcha(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [],
                "client": ("203.0.113.25", 43210),
            }
        )

        with (
            patch.object(contacto_router.CaptchaService, "verify", new=AsyncMock()) as verify,
            patch.object(
                contacto_router.ContactoService,
                "process_contact_form",
                new=AsyncMock(),
            ) as process,
            self.assertRaises(HTTPException) as context,
        ):
            await contacto_router.contacto(
                request=request,
                token_verification=None,
                name="   ",
                reason="informacion",
                email="ana@example.com",
                message="Consulta válida",
                captcha_token="captcha-valido",
                file=None,
            )

        self.assertEqual(context.exception.status_code, 400)
        verify.assert_not_awaited()
        process.assert_not_awaited()

    async def test_metadatos_imposibles_del_adjunto_se_rechazan_antes_del_captcha(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [],
                "client": ("203.0.113.25", 43210),
            }
        )
        cases = (
            (UploadFile(file=BytesIO(b"%PDF-1.7\n"), size=9, filename="carpeta/factura.pdf"), 400),
            (UploadFile(file=BytesIO(b"texto"), size=5, filename="documento.txt"), 400),
            (UploadFile(file=BytesIO(b""), size=0, filename="documento.pdf"), 400),
            (
                UploadFile(
                    file=BytesIO(b"%PDF-1.7\n"),
                    size=FileService.MAX_FILE_SIZE + 1,
                    filename="documento.pdf",
                ),
                413,
            ),
        )

        for upload, expected_status in cases:
            with self.subTest(filename=upload.filename, size=upload.size):
                with (
                    patch.object(contacto_router.CaptchaService, "verify", new=AsyncMock()) as verify,
                    patch.object(
                        contacto_router.ContactoService,
                        "process_contact_form",
                        new=AsyncMock(),
                    ) as process,
                    self.assertRaises(HTTPException) as context,
                ):
                    await contacto_router.contacto(
                        request=request,
                        token_verification=None,
                        name="Ana Pérez",
                        reason="informacion",
                        email="ana@example.com",
                        message="Consulta válida",
                        captcha_token="captcha-valido",
                        file=upload,
                    )

                self.assertEqual(context.exception.status_code, expected_status)
                verify.assert_not_awaited()
                process.assert_not_awaited()

    async def test_adjunto_obligatorio_ausente_se_rechaza_antes_del_captcha(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/contacto",
                "headers": [],
                "client": ("203.0.113.25", 43210),
            }
        )

        with (
            patch.object(contacto_router.CaptchaService, "verify", new=AsyncMock()) as verify,
            patch.object(
                contacto_router.ContactoService,
                "process_contact_form",
                new=AsyncMock(),
            ) as process,
            self.assertRaises(HTTPException) as context,
        ):
            await contacto_router.contacto(
                request=request,
                token_verification=None,
                name="Ana Pérez",
                reason=" factura ",
                email="ana@example.com",
                message="Necesito una copia",
                captcha_token="captcha-valido",
                file=None,
            )

        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("adjuntar un archivo", context.exception.detail)
        verify.assert_not_awaited()
        process.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
