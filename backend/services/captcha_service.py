"""Verificación servidor a servidor del CAPTCHA del formulario de contacto."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import HTTPException
import requests

from ..core.config import settings

logger = logging.getLogger(__name__)

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
MAX_RECAPTCHA_TOKEN_LENGTH = 4096


class CaptchaService:
    """Valida tokens reCAPTCHA v2 sin exponer la clave privada al navegador."""

    async def verify(self, token: str, client_ip: str | None = None) -> None:
        """Rechaza tokens ausentes, inválidos, reutilizados o emitidos para otro host."""
        normalized_token = token.strip()
        if not normalized_token or len(normalized_token) > MAX_RECAPTCHA_TOKEN_LENGTH:
            raise HTTPException(status_code=400, detail="Verificación CAPTCHA no válida")

        secret_key = settings.RECAPTCHA_SECRET_KEY.strip()
        if not secret_key or secret_key == "cambiar_por_clave_secreta_de_recaptcha":
            logger.error("RECAPTCHA_SECRET_KEY no está configurada")
            raise HTTPException(
                status_code=503,
                detail="Servicio CAPTCHA temporalmente no disponible",
            )

        payload = {"secret": secret_key, "response": normalized_token}
        if client_ip and client_ip != "unknown":
            payload["remoteip"] = client_ip

        try:
            response = await asyncio.to_thread(
                requests.post,
                RECAPTCHA_VERIFY_URL,
                data=payload,
                timeout=settings.RECAPTCHA_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            result: Any = response.json()
        except (requests.RequestException, ValueError, TypeError):
            logger.exception("No se pudo verificar el CAPTCHA con Google")
            raise HTTPException(
                status_code=503,
                detail="Servicio CAPTCHA temporalmente no disponible",
            ) from None

        if not isinstance(result, dict):
            logger.error("reCAPTCHA devolvió una respuesta con formato no válido")
            raise HTTPException(
                status_code=503,
                detail="Servicio CAPTCHA temporalmente no disponible",
            )

        hostname = str(result.get("hostname", "")).strip().lower().rstrip(".")
        if result.get("success") is True and hostname in settings.recaptcha_allowed_hostnames:
            return

        error_codes = result.get("error-codes")
        safe_error_codes = [str(code)[:80] for code in error_codes[:10]] if isinstance(error_codes, list) else []
        logger.warning(
            "Formulario rechazado por CAPTCHA | hostname=%s | errores=%s",
            hostname or "ausente",
            ",".join(safe_error_codes) or "sin_detalle",
        )
        raise HTTPException(status_code=400, detail="Verificación CAPTCHA no válida")
