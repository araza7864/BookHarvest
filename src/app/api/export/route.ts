import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { format, packingList, orderInfo } = await req.json();
    if (!packingList || !Array.isArray(packingList)) {
      return NextResponse.json(
        { error: "packingList array required" },
        { status: 400 }
      );
    }

    if (format === "csv") {
      const headers = "Title,Author,Quantity,Grade,Boxes\n";
      const rows = packingList
        .map(
          (p: { title: string; author?: string; quantity: number; grade?: number; boxes?: number }) =>
            `"${(p.title || "").replace(/"/g, '""')}","${(p.author || "").replace(/"/g, '""')}",${p.quantity},${p.grade ?? ""},${p.boxes ?? Math.ceil(p.quantity / 40)}`
        )
        .join("\n");
      const csv = headers + rows;
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="packing-list-${orderInfo?.id ?? "export"}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Book Harvest - Packing List", 20, 20);
      if (orderInfo?.schoolName) {
        doc.setFontSize(12);
        doc.text(orderInfo.schoolName, 20, 28);
      }
      doc.setFontSize(10);
      let y = 40;
      doc.text("Title", 20, y);
      doc.text("Author", 80, y);
      doc.text("Qty", 130, y);
      doc.text("Boxes", 150, y);
      y += 6;
      for (const p of packingList as { title: string; author?: string; quantity: number; boxes?: number }[]) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text((p.title || "").substring(0, 45), 20, y);
        doc.text((p.author || "").substring(0, 30), 80, y);
        doc.text(String(p.quantity), 130, y);
        doc.text(String(p.boxes ?? Math.ceil(p.quantity / 40)), 150, y);
        y += 6;
      }
      const pdfBuffer = doc.output("arraybuffer");
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="packing-list-${orderInfo?.id ?? "export"}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: "Format must be csv or pdf" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
