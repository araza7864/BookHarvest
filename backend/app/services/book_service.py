from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate


class BookService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
    ) -> list[Book]:
        q = select(Book).offset(skip).limit(limit)
        if status:
            q = q.where(Book.status == status)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, book_id: int) -> Book | None:
        result = await db.execute(select(Book).where(Book.id == book_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: BookCreate) -> Book:
        book = Book(**data.model_dump())
        db.add(book)
        await db.flush()
        await db.refresh(book)
        return book

    @staticmethod
    async def update(db: AsyncSession, book: Book, data: BookUpdate) -> Book:
        update_data = data.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(book, k, v)
        await db.flush()
        await db.refresh(book)
        return book

    @staticmethod
    async def delete(db: AsyncSession, book: Book) -> None:
        await db.delete(book)
        await db.flush()
