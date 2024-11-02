# backend/models/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, func, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import ENVIRONMENT

Base = declarative_base()

# Seleccionar la tabla según el entorno
TABLE_NAME_CHARCUTERIA = "charcuteria" if ENVIRONMENT == "production" else "charcuteria-local"
TABLE_NAME_BLOG = "blog" if ENVIRONMENT == "production" else "blog-local"
#TABLE_NAME_CHARCUTERIA = "charcuteria"
#TABLE_NAME_BLOG = "blog"

# Defino la clase para el modelo de la tabla charcuteria
class Charcuteria(Base):
    __tablename__ = TABLE_NAME_CHARCUTERIA

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
    
# Defino la clase para el modelo de la tabla blog
class Blog(Base):
    __tablename__ = TABLE_NAME_BLOG

    id_noticia = Column(Integer, index=True, nullable=False)
    idioma = Column(String(5), nullable=False)
    slug = Column(String(150), nullable=False)
    titulo = Column(String(150), nullable=False)
    contenido = Column(Text, nullable=False)
    autor = Column(String(150), nullable=False)
    imagen_url = Column(String(255), nullable=False)
    imagen_url_2 = Column(String(255), nullable=True)  # Este campo es opcional
    fecha_publicacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_actualizacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Definimos la clave primaria compuesta con id_noticia e idioma
    __table_args__ = (
        PrimaryKeyConstraint('id_noticia', 'idioma', name="pk_id_noticia_idioma"),
    )