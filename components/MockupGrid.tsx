"use client";

import { COVER_PLATFORMS, DP_PLATFORMS } from "@/lib/platforms";
import {
    layoutForPreview,
    PREVIEW_DEVICES,
    type PreviewDevice,
} from "@/lib/preview";
import type { BrandData } from "@/lib/types";
import { createRef, useMemo, type RefObject } from "react";
import DeviceMockup from "./DeviceMockup";
import DpCanvas from "./DpCanvas";

export type CoverRefMap = Record<string, RefObject<HTMLDivElement | null>>;

type Props = {
  data: BrandData;
  coverRefs: CoverRefMap;
  dpMasterRef: RefObject<HTMLDivElement | null>;
  previewDevice: PreviewDevice;
  onDpClick?: () => void;
};

export function useExportRefs() {
  const coverRefs = useMemo(() => {
    const map: CoverRefMap = {};
    for (const p of COVER_PLATFORMS) {
      map[p.id] = createRef<HTMLDivElement>();
    }
    return map;
  }, []);
  const dpMasterRef = useMemo(() => createRef<HTMLDivElement>(), []);
  return { coverRefs, dpMasterRef };
}

export default function MockupGrid({
  data,
  coverRefs,
  dpMasterRef,
  previewDevice,
  onDpClick,
}: Props) {
  const previewWidth =
    PREVIEW_DEVICES.find((d) => d.id === previewDevice)?.width ?? 1120;

  return (
    <div className="space-y-6 p-4 pb-8 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="space-y-8 sm:space-y-10">
        {COVER_PLATFORMS.map((platform) => {
          const avatar = platform.avatar;
          if (!avatar) return null;

          const { frame, layout } = layoutForPreview(avatar, previewDevice);

          return (
            <div key={platform.id} className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-medium text-foreground">
                  {platform.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {platform.width}×{platform.height}
                  {" · mobile-safe"}
                  {` · ${previewWidth}px preview`}
                </p>
              </div>

              <div
                className="mx-auto w-full min-w-0"
                style={{ maxWidth: previewWidth }}
              >
                <DeviceMockup
                  platform={platform}
                  data={data}
                  frame={frame}
                  layout={layout}
                  coverRef={coverRefs[platform.id]}
                  attachCoverRef
                  onDpClick={onDpClick}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4 border-t border-border pt-6 sm:pt-8">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Instagram DP
        </h2>
        <p className="text-xs text-muted-foreground">Tap the photo to reframe</p>
        <div className="flex flex-wrap gap-6">
          {DP_PLATFORMS.filter((p) => p.id === "instagram-dp").map(
            (platform) => (
              <div key={platform.id} className="space-y-2">
                <p className="font-mono text-[10px] text-neutral-600">
                  {platform.size}×{platform.size}
                </p>
                <DpCanvas
                  dpPath={data.dpPath}
                  size={platform.size}
                  theme={data.theme}
                  chrome="instagram"
                  displaySize={Math.min(140, platform.size)}
                  shape="squircle"
                  onClick={onDpClick}
                />
              </div>
            ),
          )}
        </div>
      </section>

      <div className="pointer-events-none absolute -left-[9999px] top-0 opacity-0">
        <DpCanvas
          ref={dpMasterRef}
          dpPath={data.dpPath}
          size={800}
          theme={data.theme}
          displaySize={800}
          shape="square"
          exportMode
        />
      </div>
    </div>
  );
}
