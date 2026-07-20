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

from pydantic import ValidationError
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from ..dependencies import verify_token
from ..services.contacto_service import ContactoService
from ..services.captcha_service import CaptchaService
from ..services.file_service import FileService
from ..models.schemas import ContactForm
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
    file: UploadFile | None = File(None)
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
        # Los datos básicos y la presencia del adjunto obligatorio se validan antes
        # de consumir un token CAPTCHA de un solo uso. La validación definitiva del
        # contenido del archivo permanece después del CAPTCHA para no procesar bytes
        # enviados por clientes automatizados sin verificar.
        try:
            contact_form = ContactForm(
                name=name,
                reason=reason,
                email=email,
                message=message,
            )
        except ValidationError as error:
            invalid_fields = sorted(
                {str(item["loc"][0]) for item in error.errors() if item.get("loc")}
            )
            logger.warning(
                "Formulario de contacto rechazado antes de CAPTCHA | campos=%s",
                ",".join(invalid_fields) or "desconocidos",
            )
            raise HTTPException(
                status_code=400,
                detail="Datos del formulario no válidos",
            ) from None

        if contact_form.reason in {"factura", "curriculum"} and file is None:
            raise HTTPException(
                status_code=400,
                detail="Error: Se requiere adjuntar un archivo debido al motivo seleccionado",
            )

        # El nombre, la extensión y el tamaño conocido no requieren leer bytes del
        # adjunto. Rechazarlos aquí evita consumir un CAPTCHA de un solo uso para una
        # petición que necesariamente fallaría después.
        if file is not None:
            FileService.validate_file_metadata(file)

        client_ip = resolve_client_host(request, settings.trusted_proxy_ips, logger)
        await CaptchaService().verify(captcha_token, client_ip)
        contacto_service = ContactoService()
        await contacto_service.process_contact_form(
            name=contact_form.name,
            reason=contact_form.reason,
            email=contact_form.email,
            message=contact_form.message,
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
