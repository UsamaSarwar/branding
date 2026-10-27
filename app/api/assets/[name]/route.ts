import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { ASSETS_DIR } from "@/lib/paths";

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const filePath = path.join(ASSETS_DIR, name);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(name).toLowerCase();
    const type =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "image/png";
    return new NextResponse(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
