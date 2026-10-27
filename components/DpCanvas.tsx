"use client";

import { palette } from "@/lib/design";
import {
    platformDpGridBackground,
    platformSurface,
    type PlatformChrome,
    type PlatformSurface,
} from "@/lib/platformTheme";
import type { ThemeMode } from "@/lib/types";
import { forwardRef } from "react";

type Props = {
  dpPath: string | null;
  size: number;
  theme: ThemeMode;
  displaySize?: number;
  className?: string;
  shape?: "circle" | "squircle" | "square";
  /** Match DP wash to a platform chrome surface */
  chrome?: PlatformChrome;
  surface?: PlatformSurface;
  /** Square export without border / chrome (grid bg still applied for brand kit) */
  exportMode?: boolean;
  /** Tap avatar to reframe */
  onClick?: () => void;
};

const DpCanvas = forwardRef<HTMLDivElement, Props>(function DpCanvas(
  {
    dpPath,
    size,
    theme,
    displaySize,
    className,
    shape = "circle",
    chrome,
    surface: surfaceProp,
    exportMode = false,
    onClick,
  },
  ref,
) {
  const fallback = palette(theme);
  const surface =
    surfaceProp ??
    (chrome ? platformSurface(theme, chrome) : null);
  const colors = surface ?? {
    bg: fallback.bg,
    fg: fallback.fg,
    muted: fallback.muted,
    faint: fallback.faint,
    line: fallback.line,
    border: fallback.border,
  };

  const shown = displaySize ?? size;
  const radius =
    exportMode || shape === "square"
      ? "0"
      : shape === "circle"
        ? "50%"
        : "22%";

  const grid = platformDpGridBackground(colors, theme, chrome);
  const clickable = Boolean(onClick && dpPath && !exportMode);

  return (
    <div
      ref={ref}
      data-dp-export
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      title={clickable ? "Tap to reframe photo" : undefined}
      className={className}
      style={{
        width: shown,
        height: shown,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
        border: exportMode ? "none" : `1px solid ${colors.border}`,
        cursor: clickable ? "pointer" : undefined,
        ...grid,
      }}
    >
      {dpPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dpPath}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            position: "relative",
            zIndex: 1,
            filter:
              "drop-shadow(0 1px 2px rgba(0,0,0,0.12)) drop-shadow(0 8px 18px rgba(0,0,0,0.14))",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "grid",
            placeItems: "center",
            color: colors.muted,
            fontSize: Math.max(9, shown * 0.06),
            fontFamily: "var(--font-geist-mono), monospace",
            textAlign: "center",
            padding: 12,
          }}
        >
          Transparent PNG
        </div>
      )}
    </div>
  );
});

export default DpCanvas;
