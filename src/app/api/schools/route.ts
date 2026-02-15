import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: { select: { orders: true } },
      },
    });
    return NextResponse.json(
      schools.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        state: s.state,
        region: s.region,
        lat: s.lat,
        lng: s.lng,
        orderCount: s._count.orders,
      }))
    );
  } catch (e) {
    console.error("Schools API error:", e);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}
