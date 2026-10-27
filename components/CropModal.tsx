"use client";

import { getCroppedImage } from "@/lib/cropImage";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
};

export default function CropModal({ imageSrc, onCancel, onComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onComplete(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-800 bg-neutral-950 shadow-2xl sm:rounded-xl">
        <div className="border-b border-neutral-800 px-4 py-3">
          <h2 className="text-sm font-medium tracking-tight text-neutral-100">
            Reframe profile photo
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Drag to reposition · zoom to reframe · exports as 1:1
          </p>
        </div>
        <div className="relative h-[50vh] min-h-56 bg-neutral-900 sm:h-72">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="space-y-3 border-t border-neutral-800 px-4 py-3">
          <label className="flex items-center gap-3 text-xs text-neutral-400">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-neutral-200"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleApply}
              className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Apply crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
