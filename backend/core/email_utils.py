# backend/core/email_utils.py

"""
core/email_utils.py

Módulo para enviar correos electrónicos desde el backend utilizando el cliente
`aiosmtplib`. Contiene métodos para manejar la lógica de envío de correos.

Este archivo requiere el archivo `email_templates.py` para generar las
plantillas HTML de los correos electrónicos.

Dependencias:
- aiosmtplib
- fastapi.UploadFile
- email.message.EmailMessage
- core.config.settings
"""

import aiosmtplib
from email.message import EmailMessage
from fastapi import UploadFile
from .config import settings
from .email_templates import contacto_email_template
import logging

# Configuración del logger para este módulo
logger = logging.getLogger(__name__)

async def send_contacto_email(
    name: str,
    reason: str,
    email: str,
    message: str,
    file: UploadFile = None
):
    """
    Envía un correo electrónico utilizando los datos del formulario de contacto.

    Args:
        name (str): Nombre del remitente.
        reason (str): Motivo del contacto.
        email (str): Dirección de correo del remitente.
        message (str): Mensaje del remitente.
        file (UploadFile, optional): Archivo adjunto enviado. Por defecto es None.

    Raises:
        Exception: Si ocurre un error al enviar el correo electrónico.

    Example:
        >>> await send_contacto_email(
        >>>     name="Juan Pérez",
        >>>     reason="Consulta general",
        >>>     email="juan.perez@example.com",
        >>>     message="Hola, tengo una duda sobre su servicio.",
        >>>     file=None
        >>> )
    """
    # Creación del objeto EmailMessage
    msg = EmailMessage()
    msg['Subject'] = f'Nuevo mensaje de {name}'  # Asunto del correo
    msg['From'] = email  # Remitente del correo

    # Asignar destinatarios en función del motivo del contacto
    if reason == "error":
        msg['To'] = 'galendos@gmail.com'
    else:
        msg['To'] = 'info@paraisodeljamon.com'

    # Generar el contenido alternativo en texto plano
    contenido = (
        f"Este es un correo electrónico enviado desde el sitio web por el formulario de contacto.\n\n"
        f"Nombre: {name}\n\n"
        f"Correo Electrónico: {email}\n\n"
        f"Motivo: {reason}\n\n"
        f"Mensaje:\n{message}"
    )
    msg.set_content(contenido)

    # Generar el contenido del correo en formato HTML
    html_content = contacto_email_template(name, email, reason, message)
    msg.add_alternative(html_content, subtype="html")  # Adjuntar contenido HTML

    # Adjuntar archivo si se proporciona
    if file:
        file_content = await file.read()
        file_name = file.filename
        maintype, subtype = file.content_type.split('/')
        msg.add_attachment(
            file_content,
            maintype=maintype,
            subtype=subtype,
            filename=file_name
        )

    # Configuración del servidor SMTP
    smtp_server = settings.SMTP_SERVER
    smtp_port = settings.SMTP_PORT
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD

    try:
        # Enviar el correo electrónico de forma asíncrona
        await aiosmtplib.send(
            msg,
            hostname=smtp_server,
            port=smtp_port,
            start_tls=True,
            username=smtp_username,
            password=smtp_password,
        )
        logger.info(f"Correo electrónico enviado exitosamente desde {email}.")
    except Exception as e:
        logger.error(f"Error al enviar el correo electrónico: {e}")
        raise
