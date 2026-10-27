import type { AvatarLayout, CoverPlatform, SafeArea } from "@/lib/platforms";

export type CoverContentBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Left text column must stay above this Y (mobile DP hang). Null = full box height. */
  textMaxBottom: number | null;
};

/**
 * Mobile-first content box.
 *
 * Design against the mobile visible band + mobile DP clearance. Tablet and
 * desktop show equal or more of the cover, so the same art stays safe there
 * automatically — no separate desktop layout pass.
 */
export function coverContentBox(platform: CoverPlatform): CoverContentBox {
  const w = platform.width;
  const h = platform.height;
  const mobile = platform.avatar?.mobile;

  let left = 0;
  let top = 0;
  let right = w;
  let bottom = h;
  let textMaxBottom: number | null = null;

  // YouTube: keep copy inside the official always-visible safe area
  // (1546×423 centered) so it survives mobile/tablet/desktop crops.
  if (platform.safeArea) {
    const sa = platform.safeArea;
    left = (w - sa.width) / 2;
    top = (h - sa.height) / 2;
    right = left + sa.width;
    bottom = top + sa.height;
  }

  if (!mobile) {
    return finalize(left, top, right, bottom, textMaxBottom, w, h);
  }

  const band = visibleBand(mobile, h);
  // Anchor content to the mobile-visible window
  top = Math.max(top, band.top);
  bottom = Math.min(bottom, band.bottom);

  if (!platform.safeArea) {
    // Light horizontal inset so copy isn't edge-clipped on narrow phones
    const sideInset = Math.max(0, mobile.leftRatio * w * 0.25);
    left = Math.max(left, sideInset);
    right = Math.min(right, w - sideInset);
  }

  if (mobile.chrome !== "youtube") {
    const dpSize = mobile.sizeRatio * w;
    const overlap = dpSize * (1 - mobile.hangBelow);
    const gap = Math.max(20, h * 0.055);
    textMaxBottom = band.bottom - overlap - gap;
  }

  return finalize(left, top, right, bottom, textMaxBottom, w, h);
}

/** Mobile visible band in cover pixels — the design safe area. */
export function mobileSafeBand(platform: CoverPlatform): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const box = coverContentBox(platform);
  return {
    left: box.left,
    top: box.top,
    right: box.left + box.width,
    bottom: box.top + box.height,
  };
}

function visibleBand(layout: AvatarLayout, coverH: number) {
  const cropTop = layout.coverCropTop ?? 0;
  const visibleRatio = layout.coverVisibleRatio ?? 1;
  return {
    top: cropTop * coverH,
    bottom: (cropTop + visibleRatio) * coverH,
  };
}

function finalize(
  left: number,
  top: number,
  right: number,
  bottom: number,
  textMaxBottom: number | null,
  w: number,
  h: number,
): CoverContentBox {
  const minW = Math.max(160, w * 0.4);
  const crushFloor = Math.max(72, h * 0.2);
  if (bottom - top < crushFloor) {
    const target = Math.max(96, h * 0.36);
    bottom = Math.min(h, top + target);
    if (bottom - top < crushFloor) {
      top = Math.max(0, bottom - target);
    }
  }

  if (right - left < minW) {
    left = Math.max(0, (w - minW) / 2);
    right = Math.min(w, left + minW);
  }

  const boxTop = Math.round(top);
  const boxHeight = Math.round(Math.max(1, bottom - top));
  let textLimit: number | null = null;
  if (textMaxBottom != null) {
    // Never push text below the mobile DP clearance
    textLimit = Math.round(
      Math.min(textMaxBottom, boxTop + boxHeight),
    );
  }

  return {
    left: Math.round(left),
    top: boxTop,
    width: Math.round(Math.max(1, right - left)),
    height: boxHeight,
    textMaxBottom: textLimit,
  };
}

/** Safe-area shaped box for APIs that still expect SafeArea. */
export function contentBoxAsSafeArea(box: CoverContentBox): SafeArea {
  return { width: box.width, height: box.height };
}
