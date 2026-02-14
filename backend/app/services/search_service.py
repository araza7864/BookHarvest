from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.book import Book


class SearchService:
    @staticmethod
    async def search_books(
        db: AsyncSession,
        q: str | None = None,
        age_range: str | None = None,
        category: str | None = None,
        status: str | None = "available",
        skip: int = 0,
        limit: int = 50,
    ) -> list[Book]:
        stmt = select(Book)
        conditions = []
        if status:
            conditions.append(Book.status == status)
        if q and q.strip():
            pattern = f"%{q.strip()}%"
            conditions.append(
                or_(
                    Book.title.ilike(pattern),
                    Book.author.ilike(pattern),
                    Book.description.ilike(pattern),
                    Book.isbn.ilike(pattern),
                    Book.category.ilike(pattern),
                )
            )
        if age_range:
            conditions.append(Book.age_range.ilike(f"%{age_range}%"))
        if category:
            conditions.append(Book.category.ilike(f"%{category}%"))
        if conditions:
            stmt = stmt.where(and_(*conditions))
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())
