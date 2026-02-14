"""Optional: Auto-categorize books via ISBN lookup. Uses Open Library API (no key required)."""
import httpx
from typing import Optional


class ISBNService:
    @staticmethod
    async def lookup(isbn: str) -> Optional[dict]:
        """Fetch book metadata from Open Library by ISBN. Returns title, author, categories if found."""
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(
                    f"https://openlibrary.org/isbn/{isbn.strip()}.json",
                    timeout=5.0,
                )
                if r.status_code != 200:
                    return None
                data = r.json()
                title = data.get("title")
                authors = data.get("authors", [])
                author_name = None
                if authors:
                    author_ref = authors[0].get("key") if isinstance(authors[0], dict) else authors[0]
                    if author_ref:
                        ar = await client.get(f"https://openlibrary.org{author_ref}.json", timeout=5.0)
                        if ar.status_code == 200:
                            author_name = ar.json().get("name")
                subjects = data.get("subjects", [])[:3]
                category = ", ".join(subjects) if subjects else None
                return {
                    "title": title,
                    "author": author_name,
                    "category": category,
                    "description": data.get("description") or None,
                }
        except Exception:
            return None
