/**
 * Smart Book Matching Engine
 * Matches books by grade level, ensures age-appropriate selection
 * with diversity and genre balancing
 */

import { prisma } from "./db";

export interface GradeCount {
  grade: number;
  count: number;
}

export interface BookMatch {
  bookId: string;
  title: string;
  author: string | null;
  grade: number;
  quantity: number;
  genre?: string;
  theme?: string;
}

export interface PackingItem {
  bookId: string;
  title: string;
  author: string | null;
  quantity: number;
  grade: number;
  boxes: number;
}

const BUNDLE_SIZES = [40, 80];

/**
 * Round quantity to nearest bundle size (40 or 80)
 * Optimizes to minimize leftover
 */
export function roundToBundleSize(count: number, bundleSize: number = 40): number {
  if (count <= 0) return 0;
  const bundles = Math.ceil(count / bundleSize);
  return bundles * bundleSize;
}

/**
 * Calculate optimal bundle count - minimize leftover
 */
export function optimizeBundleQuantity(
  needed: number,
  bundleSize: number = 40
): { quantity: number; bundles: number; leftover: number } {
  if (needed <= 0) return { quantity: 0, bundles: 0, leftover: 0 };
  const bundles = Math.ceil(needed / bundleSize);
  const quantity = bundles * bundleSize;
  return { quantity, bundles, leftover: quantity - needed };
}

/**
 * Smart Book Matching - matches books to grades with diversity optimization
 */
export async function matchBooksToGrades(
  gradeCounts: GradeCount[],
  options?: {
    preferDiversity?: boolean;
    balanceFictionNonfiction?: boolean;
    maxBooksPerGrade?: number;
  }
): Promise<BookMatch[]> {
  const matches: BookMatch[] = [];
  const usedBookIds = new Set<string>();
  const fictionCount: Record<number, number> = {};
  const nonfictionCount: Record<number, number> = {};

  for (const { grade, count } of gradeCounts) {
    fictionCount[grade] = 0;
    nonfictionCount[grade] = 0;
  }

  const totalStudents = gradeCounts.reduce((s, g) => s + g.count, 0);
  const booksPerStudent = 3; // Target: 3 books per student
  const totalBooksNeeded = totalStudents * booksPerStudent;

  // Get all in-stock books, ordered for diversity
  const books = await prisma.book.findMany({
    where: { stock: { gt: 0 } },
    orderBy: [{ genre: "asc" }, { theme: "asc" }],
  });

  if (books.length === 0) return matches;

  // Distribute books across grades - even distribution
  let booksAssigned = 0;
  const maxPerGrade = options?.maxBooksPerGrade ?? 5;
  const gradeOrder = gradeCounts
    .sort((a, b) => b.count - a.count)
    .map((g) => g.grade);

  for (const grade of gradeOrder) {
    const gradeCount = gradeCounts.find((g) => g.grade === grade)?.count ?? 0;
    const targetForGrade = Math.ceil((gradeCount / totalStudents) * totalBooksNeeded);
    let assignedForGrade = 0;

    const eligibleBooks = books.filter(
      (b) =>
        grade >= b.gradeMin &&
        grade <= b.gradeMax &&
        !usedBookIds.has(b.id) &&
        b.stock > 0
    );

    for (const book of eligibleBooks) {
      if (assignedForGrade >= targetForGrade || assignedForGrade >= maxPerGrade) break;
      if (booksAssigned >= totalBooksNeeded) break;

      // Diversity: balance fiction/nonfiction
      const isFiction = (book.genre || "").toLowerCase().includes("fiction");
      const currentFic = fictionCount[grade] ?? 0;
      const currentNon = nonfictionCount[grade] ?? 0;
      if (options?.balanceFictionNonfiction !== false) {
        if (isFiction && currentFic > currentNon) continue;
        if (!isFiction && currentNon > currentFic) continue;
      }

      const studentsInGrade = gradeCounts.find((g) => g.grade === grade)?.count ?? 0;
      const copiesNeeded = Math.ceil(studentsInGrade / maxPerGrade) || 1;
      const { quantity } = optimizeBundleQuantity(copiesNeeded, book.bundleSize);

      if (quantity > 0 && quantity <= book.stock) {
        matches.push({
          bookId: book.id,
          title: book.title,
          author: book.author,
          grade,
          quantity,
          genre: book.genre ?? undefined,
          theme: book.theme ?? undefined,
        });
        usedBookIds.add(book.id);
        if (isFiction) fictionCount[grade]++;
        else nonfictionCount[grade]++;
        assignedForGrade++;
        booksAssigned += quantity;
      }
    }
  }

  return matches;
}

/**
 * Bundle Optimization - minimize leftover, balance across grades
 */
export function optimizeBundles(matches: BookMatch[], books: { id: string; bundleSize: number }[]) {
  return matches.map((m) => {
    const book = books.find((b) => b.id === m.bookId);
    const bundleSize = book?.bundleSize ?? 40;
    const { quantity, bundles } = optimizeBundleQuantity(m.quantity, bundleSize);
    return { ...m, quantity, bundles };
  });
}

/**
 * Generate packing list structure
 */
export function generatePackingList(
  matches: BookMatch[],
  gradeCounts: GradeCount[]
): PackingItem[] {
  const byBook = new Map<string, PackingItem>();

  for (const m of matches) {
    const existing = byBook.get(m.bookId);
    const boxes = Math.ceil(m.quantity / 40);
    if (existing) {
      existing.quantity += m.quantity;
      existing.boxes = Math.ceil(existing.quantity / 40);
    } else {
      byBook.set(m.bookId, {
        bookId: m.bookId,
        title: m.title,
        author: m.author,
        quantity: m.quantity,
        grade: m.grade,
        boxes,
      });
    }
  }

  return Array.from(byBook.values());
}
