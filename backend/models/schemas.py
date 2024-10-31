# app/models/schemas.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class ContactForm(BaseModel):
    name: str
    reason: str
    email: EmailStr
    message: str

    @validator('name')
    def name_validator(cls, v):
        if not all(char.isalpha() or char.isspace() for char in v):
            raise ValueError('El nombre solo debe contener letras y espacios')
        return v
    
class CharcuteriaBase(BaseModel):
    nombre: str
    descripcion: str
    imagen_url: Optional[str] = None
    categoria: Optional[str] = None

class CharcuteriaCreate(CharcuteriaBase):
    pass

class Charcuteria(CharcuteriaBase):
    id_producto: int
    fecha: datetime

    class Config:
        orm_mode = True
