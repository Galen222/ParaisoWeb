# backend/services/email_service.py

"""
services/email_service.py

Servicio para manejar el envío de correos electrónicos.
"""

import aiosmtplib
from email.message import EmailMessage
from fastapi import UploadFile
from typing import Optional
from ..core.config import settings
from ..core.email_templates import contacto_email_template
from .file_service import FileService

class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.file_service = FileService()

    async def send_contact_email(
        self,
        name: str,
        reason: str,
        email: str,
        message: str,
        file: Optional[UploadFile] = None
    ) -> None:
        """
        Envía un correo electrónico del formulario de contacto.
        
        Args:
            name (str): Nombre del remitente.
            reason (str): Motivo del contacto.
            email (str): Email del remitente.
            message (str): Mensaje del correo.
            file (Optional[UploadFile]): Archivo adjunto opcional.
            
        Raises:
            Exception: Si hay errores en el envío del correo.
        """
        msg = EmailMessage()
        msg['Subject'] = f'Nuevo mensaje de {name}'
        msg['From'] = email
        msg['To'] = 'galendos@gmail.com' if reason == "error" else 'info@paraisodeljamon.com'

        # Contenido en texto plano
        contenido = (
            f"Este es un correo electrónico enviado desde el sitio web por el formulario de contacto.\n\n"
            f"Nombre: {name}\n\n"
            f"Correo Electrónico: {email}\n\n"
            f"Motivo: {reason}\n\n"
            f"Mensaje:\n{message}"
        )
        msg.set_content(contenido)

        # Contenido HTML
        html_content = contacto_email_template(name, email, reason, message)
        msg.add_alternative(html_content, subtype="html")

        # Procesar archivo adjunto
        if file:
            file_content = await file.read()
            maintype, subtype = file.content_type.split('/')
            msg.add_attachment(
                file_content,
                maintype=maintype,
                subtype=subtype,
                filename=file.filename
            )

        # Enviar correo
        await aiosmtplib.send(
            msg,
            hostname=self.smtp_server,
            port=self.smtp_port,
            start_tls=True,
            username=self.smtp_username,
            password=self.smtp_password,
        )