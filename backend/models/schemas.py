# app/models/schemas.py
from pydantic import BaseModel, EmailStr, validator

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
