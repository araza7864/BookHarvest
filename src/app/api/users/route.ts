import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "school" },
      include: { school: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        approved: u.approved,
        school: u.school,
        createdAt: u.createdAt,
      }))
    );
  } catch (e) {
    console.error("Users API error:", e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
