# backend/services/contacto_service.py

"""
services/contacto_service.py

Servicio para manejar la lógica de negocio relacionada con el formulario de contacto.
"""

from fastapi import UploadFile, HTTPException
from typing import Optional
from pydantic import EmailStr
from .file_service import FileService
from .email_service import EmailService
from ..models.schemas import ContactForm

class ContactoService:
    def __init__(self):
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
        
        Args:
            name (str): Nombre del remitente.
            reason (str): Motivo del contacto.
            email (EmailStr): Email del remitente.
            message (str): Mensaje del formulario.
            file (Optional[UploadFile]): Archivo adjunto opcional.
            
        Raises:
            HTTPException: Si hay errores en la validación o procesamiento.
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
