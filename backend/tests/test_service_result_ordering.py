"""Pruebas de desempate estable en los listados públicos."""

import unittest
from typing import Any, cast

from sqlalchemy.dialects import mysql
from sqlalchemy.ext.asyncio import AsyncSession

from backend.services.blog_service import BlogService
from backend.services.charcuteria_service import CharcuteriaService


class _CapturingSession:
    def __init__(self) -> None:
        self.statement: Any | None = None

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


def _as_async_session(session: _CapturingSession) -> AsyncSession:
    """Expone el doble mínimo con el contrato esperado por los servicios."""
    return cast(AsyncSession, session)


class ServiceResultOrderingTests(unittest.IsolatedAsyncioTestCase):
    async def test_blog_uses_id_as_date_tiebreaker(self) -> None:
        session = _CapturingSession()
        await BlogService(_as_async_session(session)).get_all_posts("es")

        assert session.statement is not None
        sql = str(session.statement.compile(dialect=mysql.dialect()))
        self.assertIn("blog.id_noticia DESC", sql)


    async def test_blog_slug_resolution_is_ordered_and_deterministic(self) -> None:
        session = _CapturingSession()
        post = await BlogService(_as_async_session(session)).get_post_by_slug("articulo", "es")

        assert session.statement is not None
        sql = str(
            session.statement.compile(
                dialect=mysql.dialect(),
                compile_kwargs={"literal_binds": True},
            )
        )
        self.assertIsNone(post)
        self.assertIn("blog.id_noticia ASC", sql)
        self.assertNotIn("LIMIT", sql)

    async def test_charcuteria_uses_id_as_name_tiebreaker(self) -> None:
        session = _CapturingSession()
        await CharcuteriaService(_as_async_session(session)).get_all_products("es")

        assert session.statement is not None
        sql = str(session.statement.compile(dialect=mysql.dialect()))
        self.assertIn("charcuteria.id_producto ASC", sql)


if __name__ == "__main__":
    unittest.main()
