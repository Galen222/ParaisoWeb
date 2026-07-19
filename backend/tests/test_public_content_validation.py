"""Pruebas de tolerancia a filas públicas dañadas en blog y charcutería."""

from datetime import datetime, timezone
from urllib.parse import quote
import unittest

from pydantic import ValidationError

from backend.models import models
from backend.models.schemas import (
    Blog as BlogSchema,
    Charcuteria as CharcuteriaSchema,
    _is_safe_public_asset_path,
)
from backend.services.blog_service import BlogService
from backend.services.charcuteria_service import CharcuteriaService


class _ScalarRows:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)


class _Result:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return _ScalarRows(self._rows)

    def scalar_one_or_none(self):
        if not self._rows:
            return None
        if len(self._rows) != 1:
            raise AssertionError("La prueba esperaba como máximo una fila")
        return self._rows[0]


class _Session:
    def __init__(self, rows):
        self._rows = rows
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        return _Result(self._rows)


def _blog(post_id: int, **overrides):
    values = {
        "id_noticia": post_id,
        "idioma": "es",
        "slug": f"articulo-{post_id}",
        "titulo": "Artículo válido",
        "contenido": "Contenido válido",
        "autor": "Autor válido",
        "imagen_url": "articulo.jpg",
        "imagen_url_2": None,
        "fecha_publicacion": datetime(2026, 1, post_id, tzinfo=timezone.utc),
        "fecha_actualizacion": None,
    }
    values.update(overrides)
    return models.Blog(**values)


def _product(product_id: int, **overrides):
    values = {
        "id_producto": product_id,
        "idioma": "es",
        "nombre": "Jamón válido",
        "empresa": None,
        "descripcion": "Descripción válida",
        "imagen_url": "jamon.jpg",
        "categoria": "Jamones",
        "fecha": datetime(2026, 1, product_id, tzinfo=timezone.utc),
    }
    values.update(overrides)
    return models.Charcuteria(**values)


class PublicContentValidationTests(unittest.IsolatedAsyncioTestCase):

    def test_rutas_publicas_rechazan_delimitadores_url_codificados(self) -> None:
        self.assertFalse(_is_safe_public_asset_path("foto%3Fversion.png"))
        self.assertFalse(_is_safe_public_asset_path("foto%2523ancla.png"))
        self.assertTrue(_is_safe_public_asset_path("carpeta/imagen-normal.png"))

    def test_rutas_publicas_rechazan_separadores_unicode_directos_y_codificados(self) -> None:
        for separator in ("\u2028", "\u2029"):
            with self.subTest(separator=repr(separator)):
                self.assertFalse(_is_safe_public_asset_path(f"carpeta/imagen{separator}.png"))
                self.assertFalse(
                    _is_safe_public_asset_path(
                        f"carpeta/imagen{quote(separator, safe='')}.png"
                    )
                )


    def test_blog_rechaza_controles_e_identificadores_bidi_en_textos_publicos(self) -> None:
        for field_name, unsafe_value in (
            ("titulo", "\u202eTítulo invertido"),
            ("titulo", "Título\u200boculto"),
            ("autor", "Autor\x00oculto"),
            ("contenido", "\u200b"),
        ):
            with self.subTest(field=field_name), self.assertRaises(ValidationError):
                BlogSchema.model_validate(_blog(1, **{field_name: unsafe_value}))

    def test_charcuteria_rechaza_controles_e_identificadores_bidi(self) -> None:
        for field_name, unsafe_value in (
            ("nombre", "\u202eProducto invertido"),
            ("nombre", "Producto\ufeffoculto"),
            ("categoria", "Categoría\x00oculta"),
            ("descripcion", "\u200b"),
            ("empresa", "\u2066Empresa"),
        ):
            with self.subTest(field=field_name), self.assertRaises(ValidationError):
                CharcuteriaSchema.model_validate(_product(1, **{field_name: unsafe_value}))

    def test_textos_multilinea_conservan_saltos_y_emoji_compuesto(self) -> None:
        content = "Primera línea\n\tFamilia 👨‍👩‍👧‍👦"
        post = BlogSchema.model_validate(_blog(1, contenido=content))
        product = CharcuteriaSchema.model_validate(_product(1, descripcion=content))

        self.assertEqual(post.contenido, content)
        self.assertEqual(product.descripcion, content)

    async def test_blog_list_conserva_filas_validas_si_otra_esta_danada(self) -> None:
        valid_post = _blog(1)
        invalid_post = _blog(2, titulo="   ")

        with self.assertLogs("backend.services.blog_service", level="WARNING"):
            posts = await BlogService(_Session([valid_post, invalid_post])).get_all_posts("es")

        self.assertEqual([post.id_noticia for post in posts], [1])

    async def test_charcuteria_conserva_productos_validos_si_otro_esta_danado(self) -> None:
        valid_product = _product(1)
        invalid_product = _product(2, imagen_url="../fuera.jpg")

        with self.assertLogs("backend.services.charcuteria_service", level="WARNING"):
            products = await CharcuteriaService(
                _Session([valid_product, invalid_product])
            ).get_all_products("es")

        self.assertEqual([product.id_producto for product in products], [1])

    async def test_slug_ignora_una_coincidencia_danada_y_devuelve_la_siguiente_valida(self) -> None:
        invalid_post = _blog(1, slug="articulo", imagen_url="https://example.com/a.jpg")
        valid_post = _blog(2, slug="articulo")

        with self.assertLogs("backend.services.blog_service", level="WARNING"):
            post = await BlogService(_Session([invalid_post, valid_post])).get_post_by_slug(
                "articulo",
                "es",
            )

        self.assertIsNotNone(post)
        self.assertEqual(post.id_noticia, 2)

    async def test_busqueda_por_id_no_propaga_una_fila_publica_danada(self) -> None:
        invalid_post = _blog(1, imagen_url="../fuera.jpg")

        with self.assertLogs("backend.services.blog_service", level="WARNING"):
            post = await BlogService(_Session([invalid_post])).get_post_by_id(1, "es")

        self.assertIsNone(post)


if __name__ == "__main__":
    unittest.main()
