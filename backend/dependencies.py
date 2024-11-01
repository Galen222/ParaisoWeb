# backend/dependencies.py

from .database import async_session

async def get_db():
    async with async_session() as session:
        yield session