# app/core/email_utils.py
import aiosmtplib
from email.message import EmailMessage
from fastapi import UploadFile
from .config import settings
import logging

logger = logging.getLogger(__name__)

async def send_contacto_email(
    name: str,
    reason: str,
    email: str,
    message: str,
    file: UploadFile = None
):
    msg = EmailMessage()
    msg['Subject'] = f'Nuevo mensaje de {name}'
    msg['From'] = email
    msg['To'] = 'info@paraisodeljamon.com'
    msg.set_content(f"Motivo: {reason}\n\nMensaje:\n{message}")

    if file:
        file_content = await file.read()
        file_name = file.filename
        maintype, subtype = file.content_type.split('/')
        msg.add_attachment(file_content, maintype=maintype, subtype=subtype, filename=file_name)

    # Configura tu servidor SMTP aquí
    smtp_server = settings.SMTP_SERVER
    smtp_port = settings.SMTP_PORT
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD

    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_server,
            port=smtp_port,
            start_tls=True,
            username=smtp_username,
            password=smtp_password,
        )
    except Exception as e:
        logger.error(f"Error al enviar el correo electrónico: {e}")
        print(f"Error al enviar el correo electrónico: {e}")
        raise
