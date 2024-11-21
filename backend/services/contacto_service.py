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

from fastapi import UploadFile, HTTPException
from typing import Optional
from pydantic import EmailStr
from .file_service import FileService
from .email_service import EmailService
from ..models.schemas import ContactForm

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
        email: EmailStr,
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
            email (EmailStr): Dirección de correo electrónico del remitente.
            message (str): Mensaje proporcionado en el formulario.
            file (Optional[UploadFile]): Archivo adjunto opcional.

        Raises:
            HTTPException:
                - 400: Si los datos del formulario son inválidos.
                - 400: Si el archivo es requerido y no se proporciona.
                - 500: Si ocurre un error durante el procesamiento del archivo o el envío del correo.
        """
        # Validar datos del formulario
        try:
            ContactForm(name=name, reason=reason, email=email, message=message)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Validar requerimiento de archivo según el motivo
        if reason in ['invoice', 'curriculum'] and not file:
            raise HTTPException(
                status_code=400,
                detail="Error: Se requiere adjuntar un archivo debido al motivo seleccionado"
            )

        # Procesar archivo si existe
        if file:
            await self.file_service.validate_and_process_file(file)

        # Enviar email
        await self.email_service.send_contact_email(
            name=name,
            reason=reason,
            email=str(email),
            message=message,
            file=file
        )
