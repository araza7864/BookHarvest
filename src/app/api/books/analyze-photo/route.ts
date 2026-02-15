import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const GENRES = ["children", "fiction", "nonfiction"];
const THEMES = ["STEM", "adventure", "humor", "friendship", "nature", "culture", "empathy", "history", "family", "school", "animals", "fun", "bedtime", "community", "creativity"];

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured. Add it to .env to use AI categorization." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { imageBase64 } = body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "imageBase64 required (base64-encoded image)" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: key });
    const imageUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `You analyze book cover/back photos. Extract:
1. title - exact title from cover
2. author - author name if visible
3. description - blurb/summary from back cover if visible, otherwise brief inferred summary
4. genre - ONE of: ${GENRES.join(", ")}. Use title + description keywords (e.g. picture book, fairy tale → children; novel, story → fiction; biography, facts, history → nonfiction)
5. theme - ONE of: ${THEMES.join(", ")}. Pick the best match from the themes list based on content.
6. gradeMin, gradeMax - suggested grade range 1-12 based on content (e.g. picture book 1-3, middle grade 4-6, YA 7-12)

Respond with ONLY valid JSON, no markdown: {"title":"","author":"","description":"","genre":"","theme":"","gradeMin":1,"gradeMax":3}`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "{}";
    let parsed: Record<string, unknown>;
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 }
      );
    }

    const suggested = {
      title: String(parsed.title || "").trim() || undefined,
      author: String(parsed.author || "").trim() || undefined,
      description: String(parsed.description || "").trim() || undefined,
      genre: GENRES.includes(String(parsed.genre || "")) ? String(parsed.genre) : undefined,
      theme: String(parsed.theme || "").trim() || undefined,
      gradeMin: Math.min(12, Math.max(1, Number(parsed.gradeMin) || 1)),
      gradeMax: Math.min(12, Math.max(1, Number(parsed.gradeMax) || 3)),
    };

    return NextResponse.json(suggested);
  } catch (e) {
    console.error("Analyze photo error:", e);
    const msg = e instanceof Error ? e.message : "Failed to analyze photo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
