"use client";

import { BrandEditor } from "@/components/BrandEditor";
import CropModal from "@/components/CropModal";
import MockupGrid, { useExportRefs } from "@/components/MockupGrid";
import { exportBrandZip } from "@/lib/exportZip";
import type { PreviewDevice } from "@/lib/preview";
import { defaultBrandData, type BrandData } from "@/lib/types";
import { uploadDp } from "@/lib/uploadDp";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [data, setData] = useState<BrandData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [exporting, setExporting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [reframeSrc, setReframeSrc] = useState<string | null>(null);
  const { coverRefs, dpMasterRef } = useExportRefs();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/db");
        const json = (await res.json()) as BrandData;
        if (!cancelled) {
          setData({
            ...defaultBrandData(),
            ...json,
            contact: { ...defaultBrandData().contact, ...json.contact },
          });
          setLoaded(true);
          skipNextSave.current = true;
        }
      } catch {
        if (!cancelled) {
          setData(defaultBrandData());
          setLoaded(true);
          skipNextSave.current = true;
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: BrandData) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!loaded || !data) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persist(data);
    }, 450);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, loaded, persist]);

  function handleChange(next: BrandData) {
    setData(next);
  }

  function handleUploaded(next: BrandData) {
    skipNextSave.current = true;
    setData(next);
    setSaveStatus("saved");
  }

  function openReframe() {
    if (!data?.dpPath && !data?.dpOriginalPath) {
      toast.message("Attach a photo first");
      return;
    }
    // Prefer original so reframing isn't locked to the previous crop
    const src = data.dpOriginalPath || data.dpPath;
    if (!src) return;
    setReframeSrc(src.split("?")[0] + `?t=${Date.now()}`);
  }

  async function applyReframe(blob: Blob) {
    try {
      const next = await uploadDp(blob, "crop");
      handleUploaded(next);
      toast.success("Photo reframed");
    } catch {
      toast.error("Could not save reframe");
    } finally {
      setReframeSrc(null);
    }
  }

  async function runExport(includeDp: boolean) {
    setExporting(true);
    try {
      const coverNodes: Record<string, HTMLElement | null> = {};
      for (const [id, ref] of Object.entries(coverRefs)) {
        coverNodes[id] = ref.current;
      }
      await exportBrandZip({
        coverNodes,
        dpNode: dpMasterRef.current,
        includeDp,
        filename: includeDp ? "brand-kit.zip" : "covers.zip",
      });
      toast.success(includeDp ? "Brand kit downloaded" : "Covers downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (!loaded || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Loading brand data…
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <BrandEditor
        data={data}
        onChange={handleChange}
        onUploaded={handleUploaded}
        exporting={exporting}
        previewDevice={previewDevice}
        onPreviewDeviceChange={setPreviewDevice}
        onExportCovers={() => void runExport(false)}
        onExportAll={() => void runExport(true)}
        saveStatus={saveStatus}
      />

      <main className="min-w-0">
        <MockupGrid
          data={data}
          coverRefs={coverRefs}
          dpMasterRef={dpMasterRef}
          previewDevice={previewDevice}
          onDpClick={openReframe}
        />
      </main>

      {reframeSrc ? (
        <CropModal
          imageSrc={reframeSrc}
          onCancel={() => setReframeSrc(null)}
          onComplete={(blob) => void applyReframe(blob)}
        />
      ) : null}
    </div>
  );
}
