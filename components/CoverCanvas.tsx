"use client";

import { coverContentBox } from "@/lib/coverLayout";
import {
    chromeFromPlatformId,
    platformGridBackground,
    platformSurface,
} from "@/lib/platformTheme";
import type { CoverPlatform } from "@/lib/platforms";
import type { BrandData } from "@/lib/types";
import { forwardRef } from "react";
import AutoFitText from "./AutoFitText";
import ModernQr from "./ModernQr";

type Props = {
  data: BrandData;
  width: number;
  height: number;
  /** When set, content is laid out in a DP-safe, crop-safe box for this platform. */
  platform?: CoverPlatform;
  className?: string;
  /** Visual display width; height follows aspect. Defaults to width prop for export. */
  displayWidth?: number;
};

const CoverCanvas = forwardRef<HTMLDivElement, Props>(function CoverCanvas(
  { data, width, height, platform, className, displayWidth },
  ref,
) {
  const chrome = platform
    ? (platform.avatar?.desktop.chrome ??
      platform.avatar?.mobile.chrome ??
      chromeFromPlatformId(platform.id))
    : chromeFromPlatformId("linkedin");
  const surface = platformSurface(data.theme, chrome);
  const isLinkedIn = chrome === "linkedin";
  const isYoutube = chrome === "youtube";

  const shownW = displayWidth ?? width;
  const scale = shownW / width;
  const shownH = height * scale;
  // Mockup preview scales the canvas down — thicken strokes so ~1px remains on screen.
  // Export always uses solid surface.bg + 1px native grid (see exportZip onclone).
  const isPreview = displayWidth != null && Math.abs(displayWidth - width) > 0.5;
  const grid = platformGridBackground(surface, data.theme, "cover", chrome, {
    strokePx: isPreview ? Math.max(1, Math.round(1 / scale)) : 1,
  });

  const box = platform
    ? coverContentBox(platform)
    : {
        left: 0,
        top: 0,
        width,
        height,
        textMaxBottom: null as number | null,
      };

  const contentW = box.width;
  const contentH = box.height;
  const contentLeft = box.left;
  const contentTop = box.top;

  // Tighter pad on short LinkedIn so QR/text claim more of the mobile-safe band
  const padX = Math.max(isLinkedIn ? 18 : 24, contentW * (isLinkedIn ? 0.022 : 0.03));
  const padY = Math.max(isLinkedIn ? 12 : 16, contentH * (isLinkedIn ? 0.04 : 0.055));

  // Text: DP-clear zone only — autofit expands to fill this safe height
  const clearTextH =
    box.textMaxBottom != null
      ? box.textMaxBottom - contentTop - padY
      : contentH - padY * 2;
  const textColMaxH = Math.max(56, Math.min(clearTextH, contentH - padY * 2));

  // QR: nearly full mobile-safe band height (right side has no DP), inset so it never clips.
  // YouTube: slightly smaller QR so the copy column can grow proportionally.
  const qrMaxH = contentH - padY * 2;
  const qrWidthCap = contentW * (isLinkedIn ? 0.3 : isYoutube ? 0.18 : 0.26);
  const qrSize = Math.round(
    Math.max(
      72,
      Math.min(qrMaxH * (isYoutube ? 0.78 : 0.92), qrWidthCap),
    ),
  );

  // Type hierarchy from safe-area height. YouTube: larger stack to fill the band.
  const eyebrowMax = Math.max(
    11,
    Math.min(isYoutube ? 42 : 20, textColMaxH * (isYoutube ? 0.11 : 0.12)),
  );
  const titleMax = Math.max(
    22,
    Math.min(
      isLinkedIn ? 52 : isYoutube ? 72 : 72,
      textColMaxH * (isLinkedIn ? 0.48 : isYoutube ? 0.42 : 0.44),
    ),
  );
  const subtitleMax = Math.max(
    12,
    Math.min(isYoutube ? 40 : 24, textColMaxH * (isYoutube ? 0.12 : 0.14)),
  );
  const titleLines = textColMaxH < 160 ? 2 : 3;
  const eyebrowHShare = isYoutube ? 0.18 : 0.16;
  const titleHShare = data.subtitle
    ? isYoutube
      ? 0.58
      : 0.62
    : isYoutube
      ? 0.78
      : 0.78;
  const subtitleHShare = isYoutube ? 0.28 : 0.28;
  const stackGap = Math.max(isYoutube ? 10 : 5, textColMaxH * (isYoutube ? 0.03 : 0.04));
  const textGap = contentW * (isYoutube ? 0.02 : 0.028);

  return (
    <div
      className={className}
      style={{
        width: shownW,
        height: shownH,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={ref}
        data-cover-export
        data-cover-theme={data.theme}
        data-cover-chrome={chrome}
        data-cover-surface-bg={surface.bg}
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          color: surface.fg,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          // Solid platform surface + grid (never transparent — required for PNG export)
          ...grid,
        }}
      >
        {/* Full mobile-safe band — QR can use entire height */}
        <div
          style={{
            position: "absolute",
            left: contentLeft,
            top: contentTop,
            width: contentW,
            height: contentH,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: `${padY}px ${padX}px`,
            gap: textGap,
            boxSizing: "border-box",
          }}
        >
          {/* Copy stays in the DP-clear safe area and autofits to that height */}
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              maxWidth: `calc(100% - ${qrSize + textGap}px)`,
              height: textColMaxH,
              maxHeight: textColMaxH,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {data.eyebrow ? (
              <AutoFitText
                text={data.eyebrow}
                maxFontSize={eyebrowMax}
                minFontSize={Math.max(10, eyebrowMax * 0.65)}
                maxLines={1}
                maxHeight={textColMaxH * eyebrowHShare}
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: surface.fg,
                  opacity: 0.7,
                  marginBottom: stackGap,
                  fontWeight: 500,
                }}
              />
            ) : null}
            <AutoFitText
              as="h1"
              text={data.title || "Untitled"}
              maxFontSize={titleMax}
              minFontSize={Math.max(16, titleMax * 0.45)}
              maxLines={titleLines}
              maxHeight={textColMaxH * titleHShare}
              style={{
                margin: 0,
                fontWeight: 650,
                letterSpacing: "-0.03em",
                lineHeight: 1.16,
                color: surface.fg,
              }}
            />
            {data.subtitle ? (
              <AutoFitText
                as="p"
                text={data.subtitle}
                maxFontSize={subtitleMax}
                minFontSize={Math.max(11, subtitleMax * 0.6)}
                maxLines={2}
                maxHeight={textColMaxH * subtitleHShare}
                style={{
                  margin: `${stackGap}px 0 0`,
                  color: surface.fg,
                  opacity: 0.72,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.32,
                  fontWeight: 450,
                }}
              />
            ) : null}
          </div>

          {/* QR fills the mobile-safe band height — fully visible on phones */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              height: qrMaxH,
              width: qrSize,
              alignSelf: "stretch",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: qrSize * 1.2,
                height: qrSize * 1.2,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${surface.bg} 45%, transparent 72%)`,
                pointerEvents: "none",
              }}
            />
            <ModernQr
              contact={data.contact}
              theme={data.theme}
              size={qrSize}
              blend
              fg={surface.fg}
              bg={surface.bg}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CoverCanvas;
