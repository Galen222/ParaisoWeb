# backend/services/contacto_service.py

"""
services/contacto_service.py

Servicio para manejar la lógica de negocio relacionada con el formulario de contacto.

Este módulo gestiona:
- Validación de los datos del formulario de contacto.
- Procesamiento opcional de archivos adjuntos.
- Envío de correos electrónicos asociados al formulario.

Dependencias:
- FastAPI: Para manejo de excepciones y archivos.
- Pydantic: Para validación de datos del formulario.
- Servicios auxiliares: `FileService` y `EmailService`.
"""

import logging

from aiosmtplib.errors import SMTPException
from fastapi import UploadFile, HTTPException
from typing import Optional
from pydantic import ValidationError
from .file_service import FileService
from .email_service import EmailService
from ..models.schemas import ContactForm

logger = logging.getLogger(__name__)


class ContactoService:
    """
    Servicio para manejar la lógica del formulario de contacto.

    Este servicio encapsula la lógica de validación, procesamiento de archivos
    y envío de correos electrónicos, facilitando la reutilización y el mantenimiento.
    """

    def __init__(self):
        """
        Inicializa el servicio con dependencias para manejo de archivos y correos.
        """
        self.file_service = FileService()
        self.email_service = EmailService()

    async def process_contact_form(
        self,
        name: str,
        reason: str,
        email: str,
        message: str,
        file: Optional[UploadFile] = None
    ) -> None:
        """
        Procesa el envío del formulario de contacto.

        Este método valida los datos del formulario, procesa un archivo adjunto
        si está presente, y envía un correo con los datos proporcionados.

        Args:
            name (str): Nombre del remitente.
            reason (str): Motivo del contacto.
            email (str): Dirección de correo electrónico del remitente.
            message (str): Mensaje proporcionado en el formulario.
            file (Optional[UploadFile]): Archivo adjunto opcional.

        Raises:
            HTTPException:
                - 400: Si los datos del formulario son inválidos.
                - 400: Si el archivo es requerido y no se proporciona.
                - 503: Si el servicio SMTP no está disponible temporalmente.
                - 500: Si ocurre otro error durante el procesamiento del archivo o del correo.
        """
        # Validar datos del formulario
        try:
            contact_form = ContactForm(name=name, reason=reason, email=email, message=message)
        except ValidationError as error:
            invalid_fields = sorted({str(item["loc"][0]) for item in error.errors() if item.get("loc")})
            logger.warning(
                "Formulario de contacto rechazado por validación | campos=%s",
                ",".join(invalid_fields) or "desconocidos",
            )
            raise HTTPException(
                status_code=400,
                detail="Datos del formulario no válidos",
            ) from None

        name = contact_form.name
        reason = contact_form.reason
        email = contact_form.email
        message = contact_form.message

        # Validar requerimiento de archivo según el motivo
        if reason in ['factura', 'curriculum'] and not file:
            raise HTTPException(
                status_code=400,
                detail="Error: Se requiere adjuntar un archivo debido al motivo seleccionado"
            )

        # Procesar archivo si existe
        validated_content_type: Optional[str] = None
        if file:
            file_info = await self.file_service.validate_and_process_file(file)
            content_type = file_info.get('content_type') if file_info else None
            if isinstance(content_type, str):
                validated_content_type = content_type

        # Enviar email
        try:
            await self.email_service.send_contact_email(
                name=name,
                reason=reason,
                email=str(email),
                message=message,
                file=file,
                validated_content_type=validated_content_type
            )
        except (SMTPException, OSError, TimeoutError):
            # Una indisponibilidad de SMTP es temporal y no debe presentarse como un fallo
            # interno permanente de la aplicación. El detalle técnico ya queda en los logs
            # del servicio de correo.
            raise HTTPException(
                status_code=503,
                detail="Servicio de correo temporalmente no disponible",
            ) from None
