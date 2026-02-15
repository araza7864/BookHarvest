/**
 * AI Book Recommendation Engine
 * Weighted scoring: genre balance, diversity, theme, reading level
 */

import { prisma } from "./db";

export interface RecommendationScore {
  bookId: string;
  score: number;
  reasons: string[];
}

/**
 * Simple weighted scoring - no ML, rule-based
 * Balance: fiction vs nonfiction, diversity, themes, reading level spread
 */
export async function scoreBooksForGrade(
  grade: number,
  existingSelection: { genre?: string; theme?: string; diversity?: string }[] = []
): Promise<RecommendationScore[]> {
  const books = await prisma.book.findMany({
    where: {
      stock: { gt: 0 },
      gradeMin: { lte: grade },
      gradeMax: { gte: grade },
    },
  });

  const genreCounts: Record<string, number> = {};
  const themeCounts: Record<string, number> = {};
  for (const s of existingSelection) {
    if (s.genre) genreCounts[s.genre] = (genreCounts[s.genre] ?? 0) + 1;
    if (s.theme) themeCounts[s.theme] = (themeCounts[s.theme] ?? 0) + 1;
  }

  const scores: RecommendationScore[] = books.map((book) => {
    let score = 50; // Base
    const reasons: string[] = [];

    // Prefer underrepresented genres
    const genre = (book.genre || "other").toLowerCase();
    const genreCount = genreCounts[genre] ?? 0;
    if (genreCount === 0) {
      score += 15;
      reasons.push(`Adds ${genre} variety`);
    }

    // Prefer underrepresented themes
    const theme = (book.theme || "general").toLowerCase();
    const themeCount = themeCounts[theme] ?? 0;
    if (themeCount === 0) {
      score += 10;
      reasons.push(`Theme: ${theme}`);
    }

    // Diversity bonus
    if (book.diversity && book.diversity.length > 0) {
      score += 12;
      reasons.push("Diverse representation");
    }

    // Fiction/nonfiction balance - prefer what's less selected
    const fictionSelected = existingSelection.filter((s) =>
      (s.genre || "").toLowerCase().includes("fiction")
    ).length;
    const nonfictionSelected = existingSelection.filter((s) =>
      (s.genre || "").toLowerCase().includes("nonfiction")
    ).length;
    const isFiction = genre.includes("fiction");
    if (isFiction && fictionSelected <= nonfictionSelected) {
      score += 8;
      reasons.push("Fiction balance");
    } else if (!isFiction && nonfictionSelected <= fictionSelected) {
      score += 8;
      reasons.push("Nonfiction balance");
    }

    return { bookId: book.id, score, reasons };
  });

  return scores.sort((a, b) => b.score - a.score);
}
