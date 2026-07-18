# backend/app/routers/contacto.py

"""
routers/contacto.py

Router para manejar el formulario de contacto.

Este módulo define el endpoint para:
- Enviar el formulario de contacto con datos básicos y un archivo adjunto opcional.

Dependencias:
- FastAPI: Para definir el endpoint y manejar solicitudes.
- Pydantic: Para validar el correo electrónico proporcionado.
- Servicios: Implementación de lógica en `ContactoService`.
"""

import logging

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from ..dependencies import verify_token
from ..services.contacto_service import ContactoService
from ..services.captcha_service import CaptchaService
from ..core.client_ip import resolve_client_host
from ..core.config import settings

# Inicializa el router para el formulario de contacto
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/contacto")
async def contacto(
    request: Request,
    token_verification: None = Depends(verify_token),  # Verifica el token temporal
    name: str = Form(...),
    reason: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    captcha_token: str = Form(...),
    file: UploadFile = File(None)
):
    """
    Endpoint para enviar el formulario de contacto.

    Este endpoint procesa los datos del formulario de contacto, incluidos el
    nombre, la razón del contacto, el mensaje y un archivo adjunto opcional.

    Args:
        request (Request): Solicitud utilizada para resolver la IP real de forma segura.
        token_verification (None): Verificación del token proporcionado.
        name (str): Nombre del remitente.
        reason (str): Razón del contacto (por ejemplo, "Información", "Error").
        email (str): Correo electrónico que será validado por el esquema del formulario.
        message (str): Mensaje enviado por el remitente.
        captcha_token (str): Token reCAPTCHA que debe verificarse una sola vez.
        file (UploadFile, optional): Archivo adjunto enviado con el formulario.

    Raises:
        HTTPException:
            - 401: Si no se proporciona token.
            - 400: Si la verificación CAPTCHA no es válida.
            - 403: Si el token proporcionado es inválido.
            - 503: Si CAPTCHA o correo no están disponibles temporalmente.
            - 500: Si ocurre un error interno durante el procesamiento del formulario.

    Returns:
        dict: Mensaje de confirmación indicando que el formulario fue enviado correctamente.
    """
    try:
        client_ip = resolve_client_host(request, settings.trusted_proxy_ips, logger)
        await CaptchaService().verify(captcha_token, client_ip)
        contacto_service = ContactoService()
        await contacto_service.process_contact_form(
            name=name,
            reason=reason,
            email=email,
            message=message,
            file=file
        )
        return {"message": "Formulario enviado correctamente"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error inesperado al procesar el formulario de contacto")
        raise HTTPException(
            status_code=500,
            detail="Error interno al procesar el formulario"
        ) from None
