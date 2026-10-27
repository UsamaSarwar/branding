import type { AvatarLayout, CoverPlatform } from "@/lib/platforms";
import { YOUTUBE_ART } from "@/lib/platforms";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export const PREVIEW_DEVICES: {
  id: PreviewDevice;
  label: string;
  /** Realistic viewport width for branding preview */
  width: number;
}[] = [
  { id: "desktop", label: "Desktop", width: 1120 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "mobile", label: "Mobile", width: 390 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Tablet/desktop chrome is derived from mobile. Visible crop is always a
 * superset of the mobile design band so cover copy stays fully on-screen.
 */
export function layoutForPreview(
  avatar: NonNullable<CoverPlatform["avatar"]>,
  device: PreviewDevice,
): { frame: "desktop" | "tablet" | "mobile"; layout: AvatarLayout } {
  if (device === "mobile") {
    return { frame: "mobile", layout: avatar.mobile };
  }
  if (device === "desktop") {
    return { frame: "desktop", layout: avatar.desktop };
  }

  const d = avatar.desktop;
  const m = avatar.mobile;
  const chrome = m.chrome ?? d.chrome;

  // YouTube tablet: documented 1855×423 center crop of the channel art
  if (chrome === "youtube") {
    return {
      frame: "tablet",
      layout: {
        sizeRatio: lerp(d.sizeRatio, m.sizeRatio, 0.4),
        leftRatio: lerp(d.leftRatio, m.leftRatio, 0.4),
        hangBelow: 1,
        coverCropTop: m.coverCropTop,
        coverVisibleRatio: m.coverVisibleRatio,
        coverCropLeft:
          (YOUTUBE_ART.width - YOUTUBE_ART.tabletW) / 2 / YOUTUBE_ART.width,
        coverVisibleWidthRatio: YOUTUBE_ART.tabletW / YOUTUBE_ART.width,
        chrome: "youtube",
      },
    };
  }

  const t = 0.4;
  const mTop = m.coverCropTop ?? 0;
  const mBottom = mTop + (m.coverVisibleRatio ?? 1);
  const dTop = d.coverCropTop ?? 0;
  const dBottom = dTop + (d.coverVisibleRatio ?? 1);

  // Superset of mobile + desktop bands (never crop away mobile-safe content)
  const tabTop = Math.min(mTop, dTop, lerp(dTop, mTop, t));
  const tabBottom = Math.max(mBottom, dBottom, lerp(dBottom, mBottom, t));

  return {
    frame: "tablet",
    layout: {
      sizeRatio: lerp(d.sizeRatio, m.sizeRatio, t),
      leftRatio: lerp(d.leftRatio, m.leftRatio, t),
      hangBelow: lerp(d.hangBelow, m.hangBelow, t),
      coverCropTop: tabTop,
      coverVisibleRatio: Math.min(1, tabBottom - tabTop),
      coverCropLeft: lerp(d.coverCropLeft ?? 0, m.coverCropLeft ?? 0, t),
      coverVisibleWidthRatio: lerp(
        d.coverVisibleWidthRatio ?? 1,
        m.coverVisibleWidthRatio ?? 1,
        t,
      ),
      chrome,
    },
  };
}
