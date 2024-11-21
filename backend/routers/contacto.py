# backend/app/routers/contacto.py

"""
routers/contacto.py

Router para manejar el formulario de contacto.

Este módulo define el endpoint para:
- Enviar el formulario de contacto con datos básicos y un archivo adjunto opcional.

Dependencias:
- FastAPI: Para definir el endpoint y manejar solicitudes.
- Pydantic: Para validar el correo electrónico proporcionado.
- Servicios: Implementación de lógica en `ContactoService`.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import EmailStr
from ..dependencies import verify_token
from ..services.contacto_service import ContactoService

# Inicializa el router para el formulario de contacto
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

    Este endpoint procesa los datos del formulario de contacto, incluidos el
    nombre, la razón del contacto, el mensaje y un archivo adjunto opcional.

    Args:
        name (str): Nombre del remitente.
        reason (str): Razón del contacto (por ejemplo, "Información", "Error").
        email (EmailStr): Correo electrónico válido del remitente.
        message (str): Mensaje enviado por el remitente.
        file (UploadFile, optional): Archivo adjunto enviado con el formulario.
        token_verification (None): Verificación del token proporcionado en la solicitud.

    Raises:
        HTTPException:
            - 500: Si ocurre un error interno durante el procesamiento del formulario.

    Returns:
        dict: Mensaje de confirmación indicando que el formulario fue enviado correctamente.
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
