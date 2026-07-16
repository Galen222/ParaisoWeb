"""Pruebas de desempate estable en los listados públicos."""

import unittest

from sqlalchemy.dialects import mysql

from backend.models import models
from backend.services.blog_service import BlogService
from backend.services.charcuteria_service import CharcuteriaService


class _CapturingSession:
    def __init__(self) -> None:
        self.statement = None

    async def execute(self, statement):
        self.statement = statement

        class _Result:
            @staticmethod
            def scalars():
                class _Scalars:
                    @staticmethod
                    def all():
                        return []

                    @staticmethod
                    def first():
                        return None

                return _Scalars()

        return _Result()


class ServiceResultOrderingTests(unittest.IsolatedAsyncioTestCase):
    async def test_blog_uses_id_as_date_tiebreaker(self) -> None:
        session = _CapturingSession()
        await BlogService(session).get_all_posts("es")

        sql = str(session.statement.compile(dialect=mysql.dialect()))
        self.assertIn("blog.id_noticia DESC", sql)


    async def test_blog_slug_resolution_is_limited_and_deterministic(self) -> None:
        session = _CapturingSession()
        post = await BlogService(session).get_post_by_slug("articulo", "es")

        sql = str(
            session.statement.compile(
                dialect=mysql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIsNone(post)
        self.assertIn("blog.id_noticia ASC", sql)
        self.assertIn("LIMIT 1", sql)

    async def test_charcuteria_uses_id_as_name_tiebreaker(self) -> None:
        session = _CapturingSession()
        await CharcuteriaService(session).get_all_products("es")

        sql = str(session.statement.compile(dialect=mysql.dialect()))
        self.assertIn("charcuteria.id_producto ASC", sql)


if __name__ == "__main__":
    unittest.main()
