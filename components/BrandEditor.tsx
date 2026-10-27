"use client";

import * as React from "react";
import { toast } from "sonner";

import AppNav, { EditBrandNavButton } from "@/components/AppNav";
import ContactQrForm from "@/components/ContactQrForm";
import CropModal from "@/components/CropModal";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { isSquareImage } from "@/lib/cropImage";
import type { PreviewDevice } from "@/lib/preview";
import type { BrandData, ThemeMode } from "@/lib/types";
import { uploadDp } from "@/lib/uploadDp";

type Props = {
  data: BrandData;
  onChange: (data: BrandData) => void;
  onUploaded: (data: BrandData) => void;
  exporting: boolean;
  previewDevice: PreviewDevice;
  onPreviewDeviceChange: (device: PreviewDevice) => void;
  onExportCovers: () => void;
  onExportAll: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
};

const inputClass =
  "w-full min-w-0 rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring sm:py-1.5";

const textareaClass = `${inputClass} min-h-[4.5rem] resize-y leading-snug`;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-border pb-5">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BrandEditor({
  data,
  onChange,
  onUploaded,
  exporting,
  previewDevice,
  onPreviewDeviceChange,
  onExportCovers,
  onExportAll,
  saveStatus,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const lastToast = React.useRef<string>("");

  React.useEffect(() => {
    if (saveStatus === "saved" && lastToast.current !== "saved") {
      lastToast.current = "saved";
      toast.success("Brand saved", { description: "Updated data/db.json" });
    } else if (saveStatus === "error" && lastToast.current !== "error") {
      lastToast.current = "error";
      toast.error("Save failed", { description: "Could not write local JSON" });
    } else if (saveStatus === "saving") {
      lastToast.current = "saving";
    } else if (saveStatus === "idle") {
      lastToast.current = "idle";
    }
  }, [saveStatus]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", data.theme === "dark");
  }, [data.theme]);

  function patch(partial: Partial<BrandData>) {
    onChange({ ...data, ...partial });
  }

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setUploading(true);
    try {
      const square = await isSquareImage(url);
      if (square) {
        const next = await uploadDp(file, "both");
        onUploaded(next);
        toast.success("Photo uploaded");
        URL.revokeObjectURL(url);
      } else {
        // Keep full original for reframing; crop modal writes the 1:1 DP
        const next = await uploadDp(file, "original");
        onUploaded(next);
        setCropSrc(url);
      }
    } catch {
      toast.error("Upload failed");
      URL.revokeObjectURL(url);
    } finally {
      setUploading(false);
    }
  }

  async function applyCrop(blob: Blob) {
    setUploading(true);
    try {
      const next = await uploadDp(blob, "crop");
      onUploaded(next);
      toast.success("Photo framed");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <AppNav
        saveStatus={saveStatus}
        exporting={exporting}
        theme={data.theme}
        previewDevice={previewDevice}
        onPreviewDeviceChange={onPreviewDeviceChange}
        onToggleTheme={() =>
          patch({ theme: data.theme === "dark" ? "light" : "dark" })
        }
        onExportCovers={() => {
          onExportCovers();
          toast.message("Exporting covers…");
        }}
        onExportAll={() => {
          onExportAll();
          toast.message("Exporting brand kit…");
        }}
        editBrandButton={
          <EditBrandNavButton type="button" onClick={() => setOpen(true)} />
        }
      />

      <Drawer
        open={open}
        onOpenChange={setOpen}
        showSwipeHandle={isMobile}
        swipeDirection={isMobile ? "down" : "right"}
      >
        {open ? (
        <DrawerContent className="flex max-h-[92dvh] flex-col data-[swipe-direction=right]:max-w-md data-[swipe-direction=right]:sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Brand editor</DrawerTitle>
            <DrawerDescription>
              Cover copy, contact QR, profile photo, and export. Changes save to{" "}
              <span className="font-mono">data/db.json</span>.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 scroll-fade">
            <Section title="Cover copy">
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Eyebrow
                </span>
                <input
                  className={inputClass}
                  value={data.eyebrow}
                  onChange={(e) => patch({ eyebrow: e.target.value })}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Title
                </span>
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={data.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Subtitle
                </span>
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={data.subtitle}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Theme
                </span>
                <select
                  className={inputClass}
                  value={data.theme}
                  onChange={(e) =>
                    patch({ theme: e.target.value as ThemeMode })
                  }
                >
                  <option value="dark">Dark mono</option>
                  <option value="light">Light mono</option>
                </select>
              </label>
            </Section>

            <Section title="Contact QR (vCard)">
              <ContactQrForm
                contact={data.contact}
                onChange={(contact) => patch({ contact })}
              />
            </Section>

            <Section title="Profile photo">
              <p className="text-xs text-muted-foreground">
                Prefer a PNG with transparent background. Non-1:1 images open a
                crop helper.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading
                  ? "Uploading…"
                  : data.dpPath
                    ? "Replace photo"
                    : "Attach photo"}
              </Button>
              {data.dpPath ? (
                <button
                  type="button"
                  onClick={() =>
                    patch({ dpPath: null, dpOriginalPath: null })
                  }
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove photo
                </button>
              ) : null}
            </Section>

            <Section title="Export">
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={exporting}
                  onClick={() => {
                    onExportCovers();
                    toast.message("Exporting covers…");
                  }}
                >
                  Export all covers (ZIP)
                </Button>
                <Button
                  type="button"
                  disabled={exporting}
                  onClick={() => {
                    onExportAll();
                    toast.message("Exporting brand kit…");
                  }}
                >
                  Export covers + DP (ZIP)
                </Button>
              </div>
            </Section>
          </div>

          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" className="h-[34px]" />}>
              Done
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
        ) : null}
      </Drawer>

      {cropSrc ? (
        <CropModal
          imageSrc={cropSrc}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={async (blob) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            await applyCrop(blob);
          }}
        />
      ) : null}
    </>
  );
}
