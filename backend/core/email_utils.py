# app/core/email_utils.py
import smtplib
from email.message import EmailMessage
from fastapi import UploadFile
from .config import settings

async def send_contact_email(
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
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
    except Exception as e:
        print(f"Error al enviar el correo electrónico: {e}")
        raise
