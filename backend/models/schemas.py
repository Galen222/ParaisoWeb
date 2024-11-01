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

# Esquemas para la tabla charcuteria
class CharcuteriaBase(BaseModel):
    idioma: str
    nombre: str
    descripcion: str
    imagen_url: str
    categoria: str

class CharcuteriaCreate(CharcuteriaBase):
    pass  # Este esquema puede usarse para crear registros nuevos

class Charcuteria(CharcuteriaBase):
    id_producto: int
    fecha: datetime

    class Config:
        orm_mode = True

# Esquemas para la tabla blog
class BlogBase(BaseModel):
    idioma: str
    titulo: str
    contenido: str
    autor: str
    imagen_url: str
    imagen_url_2: Optional[str] = None  # Este campo es opcional

class BlogCreate(BlogBase):
    pass  # Este esquema puede usarse para crear registros nuevos

class Blog(BlogBase):
    id_noticia: int
    fecha_publicacion: datetime
    fecha_actualizacion: datetime

    class Config:
        orm_mode = True
