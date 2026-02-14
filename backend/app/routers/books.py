from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.services.book_service import BookService
from app.services.search_service import SearchService
from app.services.isbn_service import ISBNService
from app.dependencies import get_current_user_optional, RequireAdmin
from app.models.user import User
from app.models.book import Book

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookResponse])
async def list_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    books = await BookService.get_all(db, skip=skip, limit=limit, status=status)
    return [BookResponse.model_validate(b) for b in books]


@router.get("/search", response_model=list[BookResponse])
async def search_books(
    q: str | None = Query(None),
    age: str | None = Query(None, alias="age_range"),
    category: str | None = Query(None),
    status: str | None = Query("available"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    books = await SearchService.search_books(
        db, q=q, age_range=age, category=category, status=status, skip=skip, limit=limit
    )
    return [BookResponse.model_validate(b) for b in books]


@router.get("/lookup-isbn/{isbn}")
async def lookup_isbn(
    isbn: str,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    """Auto-categorize: fetch book metadata by ISBN (Open Library)."""
    result = await ISBNService.lookup(isbn)
    if not result:
        return {"found": False}
    return {"found": True, "data": result}


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):
    book = await BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return BookResponse.model_validate(book)


@router.post("", response_model=BookResponse)
async def create_book(
    data: BookCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    book = await BookService.create(db, data)
    return BookResponse.model_validate(book)


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    data: BookUpdate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    book = await BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    book = await BookService.update(db, book, data)
    return BookResponse.model_validate(book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(RequireAdmin),
):
    book = await BookService.get_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    await BookService.delete(db, book)
