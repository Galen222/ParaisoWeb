# app/routers/contact.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..models.schemas import ContactForm
from ..core.email_utils import send_contact_email
from pydantic import EmailStr

router = APIRouter()

@router.post("/contact")
async def contact(
    name: str = Form(...),
    reason: str = Form(...),
    email: EmailStr = Form(...),
    message: str = Form(...),
    file: UploadFile = File(None)
):
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
        await send_contact_email(name, reason, email, message, file)
    except Exception:
        raise HTTPException(status_code=500, detail="Error al enviar el correo electrónico")

    return {"message": "Formulario enviado correctamente"}
