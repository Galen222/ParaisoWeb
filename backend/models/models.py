# backend/models/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, func, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import ENVIRONMENT

Base = declarative_base()

# Seleccionar la tabla según el entorno
TABLE_NAME = "charcuteria" if ENVIRONMENT == "production" else "charcuteria-local"
#TABLE_NAME = "charcuteria"
class Charcuteria(Base):
    # __tablename__ = 'charcuteria'
    __tablename__ = TABLE_NAME

    id_producto = Column(Integer, index=True)
    idioma = Column(String(5), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    imagen_url = Column(String(255), nullable=False)
    categoria = Column(String(50), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    
    # Definimos la clave primaria compuesta con id_producto y idioma
    __table_args__ = (
        PrimaryKeyConstraint('id_producto', 'idioma', name="pk_id_producto_idioma"),
    )