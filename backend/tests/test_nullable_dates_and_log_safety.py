"""Pruebas de contratos de fechas antiguas y seguridad de entradas de contacto."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Configura variables de prueba.

import unittest
from datetime import datetime
from io import BytesIO

from fastapi import UploadFile
from pydantic import ValidationError

from backend.models import models
from backend.models.schemas import Blog, Charcuteria, ContactForm
from backend.services.file_service import file_log_context


class NullableLegacyDateContractTests(unittest.TestCase):
    """Los registros antiguos con fechas opcionales deben poder serializarse."""

    def test_blog_admite_fecha_actualizacion_nula(self) -> None:
        post = Blog.model_validate(
            {
                "id_noticia": 1,
                "idioma": "es",
                "slug": "articulo-prueba",
                "titulo": "Artículo",
                "contenido": "Contenido",
                "autor": "Autor",
                "imagen_url": "articulo.jpg",
                "imagen_url_2": None,
                "fecha_publicacion": datetime(2024, 1, 2, 12, 0, 0),
                "fecha_actualizacion": None,
            }
        )

        self.assertIsNone(post.fecha_actualizacion)

    def test_modelo_orm_blog_no_reintroduce_not_null_en_fecha_actualizacion(self) -> None:
        self.assertTrue(models.Blog.__table__.c.fecha_actualizacion.nullable)

    def test_charcuteria_admite_fecha_nula(self) -> None:
        product = Charcuteria.model_validate(
            {
                "id_producto": 1,
                "idioma": "es",
                "nombre": "Jamón",
                "empresa": None,
                "descripcion": "Producto de prueba",
                "imagen_url": "jamon.jpg",
                "categoria": "Jamones",
                "fecha": None,
            }
        )

        self.assertIsNone(product.fecha)


class ContactNameContentTests(unittest.TestCase):
    def test_rechaza_nombres_formados_solo_por_separadores(self) -> None:
        with self.assertRaises(ValidationError):
            ContactForm(
                name="--- ’ ʼ",
                reason="informacion",
                email="test@example.com",
                message="Mensaje de prueba",
            )

    def test_conserva_nombres_reales_con_separadores(self) -> None:
        contact = ContactForm(
            name="Ana-María O’Connor",
            reason="informacion",
            email="ana@example.com",
            message="Mensaje de prueba",
        )

        self.assertEqual(contact.name, "Ana-María O’Connor")

    def test_rechaza_caracteres_no_permitidos_en_el_nombre(self) -> None:
        with self.assertRaises(ValidationError):
            ContactForm(
                name="Ana_123",
                reason="informacion",
                email="ana@example.com",
                message="Mensaje de prueba",
            )

    def test_rechaza_motivos_no_permitidos(self) -> None:
        with self.assertRaises(ValidationError):
            ContactForm(
                name="Ana",
                reason="motivo-inventado",
                email="ana@example.com",
                message="Mensaje de prueba",
            )


class AttachmentLogContextTests(unittest.TestCase):
    def test_nombre_de_adjunto_no_puede_inyectar_lineas_en_logs(self) -> None:
        upload = UploadFile(
            file=BytesIO(b"contenido"),
            filename="factura.pdf\nERROR-LOG: mensaje falso",
        )

        context = file_log_context(upload)

        self.assertEqual(context, "extensión=no válida")
        self.assertNotIn("\n", context)
        self.assertNotIn("mensaje falso", context)

    def test_conserva_una_extension_legitima_en_logs(self) -> None:
        upload = UploadFile(file=BytesIO(b"contenido"), filename="documento.PDF")

        self.assertEqual(file_log_context(upload), "extensión=.pdf")


if __name__ == "__main__":
    unittest.main()
