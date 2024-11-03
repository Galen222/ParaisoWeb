# backend/models/models.py

"""
Módulo de modelos de la base de datos.
Define las estructuras de las tablas 'charcuteria' y 'blog' utilizando SQLAlchemy ORM.
Las tablas varían según el entorno (producción o local).
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, func, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import ENVIRONMENT

# Creación de la clase base para los modelos
Base = declarative_base()

# -----------------------------
# Configuración de los nombres de tablas según el entorno
# -----------------------------
# Dependiendo del valor de la variable de entorno 'ENVIRONMENT', se seleccionan nombres de tablas diferentes.
# Esto permite tener tablas separadas para desarrollo local y producción, evitando conflictos y facilitando pruebas.
TABLE_NAME_CHARCUTERIA = "charcuteria" if ENVIRONMENT == "production" else "charcuteria-local"
TABLE_NAME_BLOG = "blog" if ENVIRONMENT == "production" else "blog-local"

# Las siguientes líneas están comentadas y representan los nombres de tablas fijas.
# Se utilizan para referencia o en caso de que desees mantener nombres de tablas constantes.
# TABLE_NAME_CHARCUTERIA = "charcuteria"
# TABLE_NAME_BLOG = "blog"

# -----------------------------
# Definición del modelo para la tabla 'charcuteria'
# -----------------------------
class Charcuteria(Base):
    """
    Modelo ORM para la tabla de productos de charcutería.
    La tabla varía su nombre según el entorno (producción o local).
    """
    __tablename__ = TABLE_NAME_CHARCUTERIA  # Nombre de la tabla según el entorno configurado

    # Definición de las columnas de la tabla
    id_producto = Column(Integer, index=True)       # Identificador único del producto
    idioma = Column(String(5), nullable=False)      # Idioma del producto (e.g., 'es', 'en')
    nombre = Column(String(100), nullable=False)    # Nombre del producto
    descripcion = Column(Text, nullable=False)      # Descripción detallada del producto
    imagen_url = Column(String(255), nullable=False)  # URL de la imagen del producto
    categoria = Column(String(50), nullable=False)  # Categoría del producto (e.g., 'embutidos', 'quesos')
    fecha = Column(DateTime(timezone=True), server_default=func.now())  # Fecha de creación del registro

    # -----------------------------
    # Definición de la clave primaria compuesta
    # -----------------------------
    # La clave primaria está compuesta por 'id_producto' e 'idioma', asegurando la unicidad del registro
    __table_args__ = (
        PrimaryKeyConstraint('id_producto', 'idioma', name="pk_id_producto_idioma"),
    )

# -----------------------------
# Definición del modelo para la tabla 'blog'
# -----------------------------
class Blog(Base):
    """
    Modelo ORM para la tabla de publicaciones de blog.
    La tabla varía su nombre según el entorno configurado (producción o local).
    """
    __tablename__ = TABLE_NAME_BLOG  # Nombre de la tabla según el entorno configurado

    # Definición de las columnas de la tabla
    id_noticia = Column(Integer, index=True, nullable=False)       # Identificador único de la noticia
    idioma = Column(String(5), nullable=False)                    # Idioma de la noticia (e.g., 'es', 'en')
    slug = Column(String(150), nullable=False)                    # Slug único para la URL amigable
    titulo = Column(String(150), nullable=False)                  # Título de la noticia
    contenido = Column(Text, nullable=False)                      # Contenido completo de la noticia
    autor = Column(String(150), nullable=False)                    # Autor de la noticia
    imagen_url = Column(String(255), nullable=False)               # URL de la imagen principal de la noticia
    imagen_url_2 = Column(String(255), nullable=True)              # URL de una segunda imagen (opcional)
    fecha_publicacion = Column(DateTime, default=func.now(), nullable=False)  # Fecha de publicación
    fecha_actualizacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)  # Fecha de última actualización

    # -----------------------------
    # Definición de la clave primaria compuesta
    # -----------------------------
    # La clave primaria está compuesta por 'id_noticia' e 'idioma', garantizando la unicidad del registro
    __table_args__ = (
        PrimaryKeyConstraint('id_noticia', 'idioma', name="pk_id_noticia_idioma"),
    )
