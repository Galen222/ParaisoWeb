# backend/core/email_utils.py

"""
Módulo de utilidades para el envío de correos electrónicos.
Utiliza `aiosmtplib` para enviar correos de manera asíncrona.
"""

import aiosmtplib
from email.message import EmailMessage
from fastapi import UploadFile
from .config import settings
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
    Envía un correo electrónico con los detalles del formulario de contacto.

    Args:
        name (str): Nombre del remitente.
        reason (str): Motivo del contacto.
        email (str): Correo electrónico del remitente.
        message (str): Mensaje enviado.
        file (UploadFile, optional): Archivo adjunto enviado. Por defecto es None.

    Raises:
        Exception: Si ocurre un error al enviar el correo electrónico.
    """
    # Creación del objeto EmailMessage
    msg = EmailMessage()
    msg['Subject'] = f'Nuevo mensaje de {name}'  # Asunto del correo
    msg['From'] = email                          # Remitente del correo
    msg['To'] = 'info@paraisodeljamon.com'        # Destinatario del correo
    msg.set_content(f"Motivo: {reason}\n\nMensaje:\n{message}")  # Contenido del correo

    # Si se adjunta un archivo, se añade al correo
    if file:
        file_content = await file.read()  # Lectura asíncrona del contenido del archivo
        file_name = file.filename          # Nombre del archivo
        maintype, subtype = file.content_type.split('/')  # Tipo de contenido del archivo
        msg.add_attachment(
            file_content,
            maintype=maintype,
            subtype=subtype,
            filename=file_name
        )

    # Configuración del servidor SMTP utilizando las variables de entorno
    smtp_server = settings.SMTP_SERVER
    smtp_port = settings.SMTP_PORT
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD

    try:
        # Envío asíncrono del correo electrónico utilizando aiosmtplib
        await aiosmtplib.send(
            msg,
            hostname=smtp_server,
            port=smtp_port,
            start_tls=True,             # Inicia una conexión TLS
            username=smtp_username,     # Nombre de usuario para autenticación
            password=smtp_password,     # Contraseña para autenticación
        )
        logger.info(f"Correo electrónico enviado exitosamente desde {email}.")

    except Exception as e:
        # Registro del error en el logger
        logger.error(f"Error al enviar el correo electrónico: {e}")
        # Impresión del error en la consola (puede eliminarse en producción)
        print(f"Error al enviar el correo electrónico: {e}")
        # Propagación de la excepción para que pueda ser manejada por el llamador
        raise
