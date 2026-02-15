import { NextRequest, NextResponse } from "next/server";
import { matchBooksToGrades } from "@/lib/engine";

export async function POST(req: NextRequest) {
  try {
    const { gradeCounts } = await req.json();
    if (!Array.isArray(gradeCounts) || gradeCounts.length === 0) {
      return NextResponse.json(
        { error: "gradeCounts array required" },
        { status: 400 }
      );
    }

    const valid = gradeCounts.every(
      (g: unknown) =>
        typeof g === "object" &&
        g !== null &&
        "grade" in g &&
        "count" in g &&
        typeof (g as { grade: number; count: number }).grade === "number" &&
        typeof (g as { grade: number; count: number }).count === "number"
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Each item needs grade and count" },
        { status: 400 }
      );
    }

    const matches = await matchBooksToGrades(
      gradeCounts as { grade: number; count: number }[],
      { balanceFictionNonfiction: true, preferDiversity: true }
    );
    return NextResponse.json({ matches });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}
