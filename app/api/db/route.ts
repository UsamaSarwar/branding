import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { ASSETS_DIR, DATA_DIR, DB_PATH } from "@/lib/paths";
import { defaultBrandData, type BrandData } from "@/lib/types";

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultBrandData(), null, 2), "utf8");
  }
}

export async function GET() {
  try {
    await ensureDataFiles();
    const raw = await fs.readFile(DB_PATH, "utf8");
    const data = JSON.parse(raw) as BrandData;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/db", error);
    return NextResponse.json(defaultBrandData());
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDataFiles();
    const body = (await request.json()) as BrandData;
    const next: BrandData = {
      ...defaultBrandData(),
      ...body,
      contact: {
        ...defaultBrandData().contact,
        ...body.contact,
      },
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(DB_PATH, JSON.stringify(next, null, 2), "utf8");
    return NextResponse.json(next);
  } catch (error) {
    console.error("PUT /api/db", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
