# backend/services/email_service.py

"""
services/email_service.py

Servicio para manejar el envío de correos electrónicos.

Este módulo gestiona:
- La construcción de correos electrónicos con contenido en texto plano y HTML.
- La inclusión de archivos adjuntos opcionales.
- El envío de correos electrónicos utilizando `aiosmtplib`.

Dependencias:
- FastAPI: Para manejar archivos adjuntos.
- aiosmtplib: Cliente SMTP asíncrono para enviar correos electrónicos.
- Servicios auxiliares: `FileService` para procesar archivos adjuntos.
"""

import os

import aiosmtplib
from email.message import EmailMessage
from fastapi import UploadFile
from typing import Optional
from ..core.config import settings
from ..core.email_templates import contacto_email_template
from .file_service import FileService

import logging

# Colores ANSI para mantener estilo del middleware
ANSI_GREEN = "\033[32m"
ANSI_RED = "\033[31m"
ANSI_RESET = "\033[0m"

logger = logging.getLogger("email_service")


def mask_email_for_log(email: str) -> str:
    """Oculta el correo en logs sin impedir la depuración de envíos."""
    local_part, separator, domain = email.rpartition("@")
    if not separator or not local_part or not domain:
        return "***"

    def mask_part(value: str) -> str:
        if len(value) <= 2:
            return "*" * len(value)
        return f"{value[0]}{'*' * (len(value) - 2)}{value[-1]}"

    domain_name, dot, domain_suffix = domain.partition(".")
    masked_domain = mask_part(domain_name)
    if dot:
        masked_domain = f"{masked_domain}.{domain_suffix}"

    return f"{mask_part(local_part)}@{masked_domain}"


def sanitize_attachment_filename(filename: Optional[str]) -> str:
    """Conserva solo un nombre de archivo seguro para la cabecera del adjunto."""
    basename = (filename or "").replace("\\", "/").rsplit("/", 1)[-1]
    sanitized = "".join(character for character in basename if character >= " " and character != "\x7f").strip(" .")
    if not sanitized:
        return "adjunto"

    max_length = 255
    if len(sanitized) <= max_length:
        return sanitized

    stem, extension = os.path.splitext(sanitized)
    safe_extension = extension[:20]
    available_stem_length = max_length - len(safe_extension)
    return f"{stem[:available_stem_length]}{safe_extension}" or "adjunto"

class ColoredFormatter(logging.Formatter):
    def format(self, record):
        message = super().format(record)
        if record.levelno == logging.ERROR:
            return f"{ANSI_RED}ERROR-LOG{ANSI_RESET}: {message}"
        elif record.levelno == logging.INFO:
            return f"{ANSI_GREEN}INFO-LOG{ANSI_RESET}: {message}"
        return message

logger.propagate = False
logger.setLevel(logging.INFO)

if not logger.hasHandlers():
    handler = logging.StreamHandler()
    handler.setFormatter(ColoredFormatter())
    logger.addHandler(handler)


class EmailService:
    """
    Servicio para manejar el envío de correos electrónicos.

    Este servicio encapsula la lógica necesaria para construir y enviar correos
    electrónicos, incluyendo contenido HTML y texto plano, así como archivos adjuntos.
    """

    def __init__(self):
        """
        Inicializa el servicio con las configuraciones SMTP y dependencias necesarias.
        """
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_timeout = settings.SMTP_TIMEOUT_SECONDS
        self.file_service = FileService()

    async def send_contact_email(
        self,
        name: str,
        reason: str,
        email: str,
        message: str,
        file: Optional[UploadFile] = None,
        validated_content_type: Optional[str] = None
    ) -> None:
        """
        Envía un correo electrónico del formulario de contacto.

        Este método construye el correo con contenido en texto plano y HTML,
        y adjunta un archivo si se proporciona. La dirección del destinatario
        se determina en función del motivo del contacto.

        Args:
            name (str): Nombre del remitente.
            reason (str): Motivo del contacto (e.g., "error", "información").
            email (str): Dirección de correo electrónico del remitente.
            message (str): Mensaje incluido en el correo.
            file (Optional[UploadFile]): Archivo adjunto opcional.
            validated_content_type (Optional[str]): Tipo MIME validado por contenido.

        Raises:
            Exception: Si ocurre un error durante el envío del correo.
        """
        msg = EmailMessage()
        msg['Subject'] = f'Nuevo mensaje de {name}'
        msg['From'] = self.smtp_username
        msg['Reply-To'] = email
        
        # Todos los correos solo a galendos@gmail.com
        #msg['To'] = 'galendos@gmail.com'
        
        # Solo correo de error a galendos@gmail.com
        #msg['To'] = 'galendos@gmail.com' if reason == "error" else 'info@paraisodeljamon.com'
        
        # Correo de error a galendos@gmail.com y el resto a los dos correos
        if reason == "error":
            msg['To'] = 'galendos@gmail.com'
        else:
            msg['To'] = 'info@paraisodeljamon.com, galendos@gmail.com'   
        
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
            content_type = validated_content_type or "application/octet-stream"
            
            try:
                maintype, subtype = content_type.split('/')
            except ValueError:
                maintype, subtype = "application", "octet-stream"
                
            msg.add_attachment(
                file_content,
                maintype=maintype,
                subtype=subtype,
                filename=sanitize_attachment_filename(file.filename)
            )

        # Enviar correo
        try:
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_username,
                password=self.smtp_password,
                timeout=self.smtp_timeout,
            )
            logger.info(
                f"{ANSI_GREEN}Correo enviado correctamente | "
                f"motivo={reason} | remitente={mask_email_for_log(email)} | "
                f"destinatario={msg['To']}{ANSI_RESET}"
            )
        except Exception:
            logger.exception(
                f"Error al enviar el correo | motivo={reason} | "
                f"remitente={mask_email_for_log(email)} | destinatario={msg['To']}"
            )
            raise
