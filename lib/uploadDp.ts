import type { BrandData } from "./types";

export type UploadMode = "original" | "crop" | "both";

export async function uploadDp(
  blob: Blob,
  mode: UploadMode,
): Promise<BrandData> {
  const form = new FormData();
  form.append("file", blob, mode === "original" ? "dp-original.png" : "dp.png");
  form.append("mode", mode);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error("upload failed");
  const json = (await res.json()) as { data: BrandData };
  const t = Date.now();
  return {
    ...json.data,
    dpPath: json.data.dpPath ? `${json.data.dpPath.split("?")[0]}?t=${t}` : null,
    dpOriginalPath: json.data.dpOriginalPath
      ? `${json.data.dpOriginalPath.split("?")[0]}?t=${t}`
      : null,
  };
}
