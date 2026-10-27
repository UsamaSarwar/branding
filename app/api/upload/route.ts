import { ASSETS_DIR, DATA_DIR, DB_PATH } from "@/lib/paths";
import { defaultBrandData, type BrandData } from "@/lib/types";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

type UploadMode = "original" | "crop" | "both";

export async function POST(request: Request) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const mode = (String(form.get("mode") || "both") as UploadMode);
    const buffer = Buffer.from(await file.arrayBuffer());

    const dpFile = path.join(ASSETS_DIR, "dp.png");
    const originalFile = path.join(ASSETS_DIR, "dp-original.png");

    if (mode === "original" || mode === "both") {
      await fs.writeFile(originalFile, buffer);
    }
    if (mode === "crop" || mode === "both") {
      await fs.writeFile(dpFile, buffer);
    }
    // Until crop is applied, show the original as the working DP
    if (mode === "original") {
      await fs.writeFile(dpFile, buffer);
    }

    let data: BrandData = defaultBrandData();
    try {
      const raw = await fs.readFile(DB_PATH, "utf8");
      data = { ...defaultBrandData(), ...JSON.parse(raw) };
    } catch {
      // seed below
    }

    data = {
      ...data,
      dpPath: "/api/assets/dp.png",
      dpOriginalPath: "/api/assets/dp-original.png",
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({
      dpPath: data.dpPath,
      dpOriginalPath: data.dpOriginalPath,
      data,
    });
  } catch (error) {
    console.error("POST /api/upload", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
