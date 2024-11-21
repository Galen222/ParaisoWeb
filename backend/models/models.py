# backend/models/models.py

"""
models/models.py

Módulo de modelos de la base de datos.
Define las estructuras de las tablas 'charcuteria' y 'blog' utilizando SQLAlchemy ORM.

Este archivo incluye:
- Modelos para las tablas de base de datos.
- Definición de claves primarias, columnas y relaciones.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, func, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base

# Creación de la clase base para los modelos
Base = declarative_base()

TABLE_NAME_CHARCUTERIA = "charcuteria"
TABLE_NAME_BLOG = "blog"

# -----------------------------
# Definición del modelo para la tabla 'charcuteria'
# -----------------------------
class Charcuteria(Base):
    """
    Modelo ORM para la tabla de productos de charcutería.

    Atributos:
        id_producto (int): Identificador único del producto.
        idioma (str): Idioma del producto (e.g., 'es', 'en').
        nombre (str): Nombre del producto.
        empresa (str): Empresa que produce el producto.
        descripcion (str): Descripción detallada del producto.
        imagen_url (str): URL de la imagen representativa del producto.
        categoria (str): Categoría a la que pertenece el producto (e.g., 'embutidos').
        fecha (datetime): Fecha de creación del registro.
    """
    __tablename__ = TABLE_NAME_CHARCUTERIA

    id_producto = Column(Integer, index=True)       # Identificador único del producto
    idioma = Column(String(5), nullable=False)      # Idioma del producto (e.g., 'es', 'en')
    nombre = Column(String(100), nullable=False)    # Nombre del producto
    empresa = Column(String(200), nullable=True)    # Empresa del producto
    descripcion = Column(Text, nullable=False)      # Descripción detallada del producto
    imagen_url = Column(String(255), nullable=False)  # URL de la imagen del producto
    categoria = Column(String(50), nullable=False)  # Categoría del producto (e.g., 'embutidos', 'quesos')
    fecha = Column(DateTime(timezone=True), server_default=func.now())  # Fecha de creación del registro

    __table_args__ = (
        PrimaryKeyConstraint('id_producto', 'idioma', name="pk_id_producto_idioma"),
    )
    """
    Clave primaria compuesta por 'id_producto' e 'idioma', garantizando la unicidad del registro
    para cada combinación de identificador e idioma.
    """

# -----------------------------
# Definición del modelo para la tabla 'blog'
# -----------------------------
class Blog(Base):
    """
    Modelo ORM para la tabla de publicaciones de blog.

    Atributos:
        id_noticia (int): Identificador único de la publicación.
        idioma (str): Idioma de la publicación (e.g., 'es', 'en').
        slug (str): Slug único utilizado en URLs amigables.
        titulo (str): Título de la publicación.
        contenido (str): Contenido completo de la publicación.
        autor (str): Autor de la publicación.
        imagen_url (str): URL de la imagen principal de la publicación.
        imagen_url_2 (str, optional): URL de una segunda imagen asociada.
        fecha_publicacion (datetime): Fecha en que se publicó la noticia.
        fecha_actualizacion (datetime): Fecha de la última actualización de la noticia.
    """
    __tablename__ = TABLE_NAME_BLOG

    id_noticia = Column(Integer, index=True, nullable=False)       # Identificador único de la noticia
    idioma = Column(String(5), nullable=False)                    # Idioma de la noticia (e.g., 'es', 'en')
    slug = Column(String(150), nullable=False)                    # Slug único para la URL amigable
    titulo = Column(String(150), nullable=False)                  # Título de la noticia
    contenido = Column(Text, nullable=False)                      # Contenido completo de la noticia
    autor = Column(String(150), nullable=False)                   # Autor de la noticia
    imagen_url = Column(String(255), nullable=False)              # URL de la imagen principal de la noticia
    imagen_url_2 = Column(String(255), nullable=True)             # URL de una segunda imagen (opcional)
    fecha_publicacion = Column(DateTime, default=func.now(), nullable=False)  # Fecha de publicación
    fecha_actualizacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)  # Fecha de última actualización

    __table_args__ = (
        PrimaryKeyConstraint('id_noticia', 'idioma', name="pk_id_noticia_idioma"),
    )
    """
    Clave primaria compuesta por 'id_noticia' e 'idioma', garantizando la unicidad del registro
    para cada combinación de identificador e idioma.
    """
