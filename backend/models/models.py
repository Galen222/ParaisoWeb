# backend/models/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import ENVIRONMENT

Base = declarative_base()

# Seleccionar la tabla según el entorno
TABLE_NAME = "charcuteria" if ENVIRONMENT == "production" else "charcuteria-local"
#TABLE_NAME = "charcuteria"
class Charcuteria(Base):
    # __tablename__ = 'charcuteria'
    __tablename__ = TABLE_NAME

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    imagen_url = Column(String(255))
    categoria = Column(String(50))
    fecha = Column(DateTime(timezone=True), server_default=func.now())