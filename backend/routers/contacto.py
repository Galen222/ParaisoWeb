# backend/app/routers/contacto.py

"""
routers/contacto.py

Router para manejar el formulario de contacto.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import EmailStr
from ..dependencies import verify_token
from ..services.contacto_service import ContactoService

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
    try:
        contacto_service = ContactoService()
        await contacto_service.process_contact_form(
            name=name,
            reason=reason,
            email=email,
            message=message,
            file=file
        )
        return {"message": "Formulario enviado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))