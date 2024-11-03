# backend/app/routers/contacto.py

"""
Router para manejar el formulario de contacto.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from ..models.schemas import ContactForm
from ..core.email_utils import send_contacto_email
from pydantic import EmailStr
from ..dependencies import verify_token  # Importa la dependencia

router = APIRouter()

@router.post("/contacto")
async def contacto(
    name: str = Form(...),
    reason: str = Form(...),
    email: EmailStr = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Endpoint para enviar el formulario de contacto.

    Args:
        name (str): Nombre del remitente.
        reason (str): Razón del contacto.
        email (EmailStr): Correo electrónico del remitente.
        message (str): Mensaje del remitente.
        file (UploadFile, optional): Archivo adjunto.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: En caso de errores en la validación o envío.

    Returns:
        dict: Mensaje de éxito.
    """
    # Validar datos recibidos
    try:
        _ = ContactForm(name=name, reason=reason, email=email, message=message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="Error: Datos inválidos")

    # Validaciones adicionales
    if reason in ['invoice', 'curriculum'] and not file:
        raise HTTPException(status_code=400, detail="Error: Se requiere adjuntar un archivo debido al motivo seleccionado")

    if file:
        if file.content_type not in ['image/jpeg', 'application/pdf']:
            raise HTTPException(status_code=400, detail="Error: El archivo debe ser JPEG o PDF")
        contents = await file.read()
        if len(contents) > 10485760:
            raise HTTPException(status_code=400, detail="Error: El archivo es demasiado grande")
        await file.seek(0)

    # Enviar correo electrónico
    try:
        await send_contacto_email(name, reason, email, message, file)
    except Exception:
        raise HTTPException(status_code=500, detail="Error al enviar el correo electrónico")

    return {"message": "Formulario enviado correctamente"}
