import type { CSSProperties } from "react";
import type { ThemeMode } from "./types";

export type PlatformChrome = "linkedin" | "x" | "facebook" | "youtube" | "instagram";

export type ChromeTone = {
  bg: string;
  border: string;
  fg: string;
  muted: string;
  faint: string;
  line: string;
  ring: string;
  btn: string;
  btnFg: string;
  btnSecondary: string;
  btnSecondaryFg: string;
  accent: string;
};

/** Surface used by cover art + DP so they match platform chrome. */
export type PlatformSurface = {
  bg: string;
  fg: string;
  muted: string;
  faint: string;
  line: string;
  border: string;
};

export function chromeTone(
  theme: ThemeMode,
  platform: PlatformChrome,
): ChromeTone {
  const dark = theme === "dark";

  if (platform === "linkedin") {
    return dark
      ? {
          bg: "#1b1f23",
          border: "#38434f",
          fg: "#f3f2ef",
          muted: "#c5c6c8",
          faint: "#a0a1a3",
          line: "#38434f",
          ring: "#1b1f23",
          btn: "#70b5f9",
          btnFg: "#1b1f23",
          btnSecondary: "transparent",
          btnSecondaryFg: "#70b5f9",
          accent: "#70b5f9",
        }
      : {
          bg: "#ffffff",
          border: "#e0e0e0",
          fg: "#191919",
          muted: "#000000e6",
          faint: "#00000099",
          line: "#e0e0e0",
          ring: "#ffffff",
          btn: "#0a66c2",
          btnFg: "#ffffff",
          btnSecondary: "transparent",
          btnSecondaryFg: "#0a66c2",
          accent: "#0a66c2",
        };
  }

  if (platform === "facebook") {
    return dark
      ? {
          bg: "#242526",
          border: "#3e4042",
          fg: "#e4e6eb",
          muted: "#b0b3b8",
          faint: "#b0b3b8",
          line: "#3e4042",
          ring: "#242526",
          btn: "#0866ff",
          btnFg: "#ffffff",
          btnSecondary: "#3a3b3c",
          btnSecondaryFg: "#e4e6eb",
          accent: "#0866ff",
        }
      : {
          bg: "#ffffff",
          border: "#ccd0d5",
          fg: "#1c1e21",
          muted: "#65676b",
          faint: "#65676b",
          line: "#ccd0d5",
          ring: "#ffffff",
          btn: "#0866ff",
          btnFg: "#ffffff",
          btnSecondary: "#e4e6eb",
          btnSecondaryFg: "#050505",
          accent: "#0866ff",
        };
  }

  if (platform === "x") {
    return dark
      ? {
          bg: "#000000",
          border: "#2f3336",
          fg: "#e7e9ea",
          muted: "#e7e9ea",
          faint: "#71767b",
          line: "#2f3336",
          ring: "#000000",
          btn: "#eff3f4",
          btnFg: "#0f1419",
          btnSecondary: "#eff3f4",
          btnSecondaryFg: "#0f1419",
          accent: "#1d9bf0",
        }
      : {
          bg: "#ffffff",
          border: "#eff3f4",
          fg: "#0f1419",
          muted: "#0f1419",
          faint: "#536471",
          line: "#eff3f4",
          ring: "#ffffff",
          btn: "#0f1419",
          btnFg: "#ffffff",
          btnSecondary: "#0f1419",
          btnSecondaryFg: "#ffffff",
          accent: "#1d9bf0",
        };
  }

  if (platform === "instagram") {
    return dark
      ? {
          bg: "#000000",
          border: "#262626",
          fg: "#f5f5f5",
          muted: "#a8a8a8",
          faint: "#737373",
          line: "#262626",
          ring: "#000000",
          btn: "#0095f6",
          btnFg: "#ffffff",
          btnSecondary: "#262626",
          btnSecondaryFg: "#f5f5f5",
          accent: "#0095f6",
        }
      : {
          bg: "#ffffff",
          border: "#dbdbdb",
          fg: "#262626",
          muted: "#8e8e8e",
          faint: "#8e8e8e",
          line: "#dbdbdb",
          ring: "#ffffff",
          btn: "#0095f6",
          btnFg: "#ffffff",
          btnSecondary: "#efefef",
          btnSecondaryFg: "#262626",
          accent: "#0095f6",
        };
  }

  // youtube
  return dark
    ? {
        bg: "#0f0f0f",
        border: "#272727",
        fg: "#ffffff",
        muted: "#aaaaaa",
        faint: "#717171",
        line: "#272727",
        ring: "#0f0f0f",
        btn: "#ffffff",
        btnFg: "#0f0f0f",
        btnSecondary: "#ffffff",
        btnSecondaryFg: "#0f0f0f",
        accent: "#ffffff",
      }
    : {
        bg: "#ffffff",
        border: "#e5e5e5",
        fg: "#0f0f0f",
        muted: "#606060",
        faint: "#606060",
        line: "#e5e5e5",
        ring: "#ffffff",
        btn: "#0f0f0f",
        btnFg: "#ffffff",
        btnSecondary: "#0f0f0f",
        btnSecondaryFg: "#ffffff",
        accent: "#0f0f0f",
      };
}

export function platformSurface(
  theme: ThemeMode,
  platform: PlatformChrome,
): PlatformSurface {
  const tone = chromeTone(theme, platform);
  return {
    bg: tone.bg,
    fg: tone.fg,
    muted: tone.muted,
    faint: tone.faint,
    line: tone.line,
    border: tone.border,
  };
}

export function chromeFromPlatformId(id: string): PlatformChrome {
  if (id.startsWith("linkedin")) return "linkedin";
  if (id.startsWith("facebook")) return "facebook";
  if (id === "x" || id.startsWith("x-")) return "x";
  if (id.startsWith("youtube")) return "youtube";
  if (id.startsWith("instagram")) return "instagram";
  return "linkedin";
}

/** Grid wash that sits on a platform chrome surface. */
export function platformGridBackground(
  surface: PlatformSurface,
  theme: ThemeMode,
  cellSize: "cover" | "avatar" | number = "cover",
  chrome?: PlatformChrome,
  opts?: { strokePx?: number },
): CSSProperties {
  // Facebook quieter, YouTube slightly above mid (not dominant), others mid.
  const alpha =
    chrome === "facebook"
      ? theme === "dark"
        ? 0.14
        : 0.1
      : chrome === "youtube"
        ? theme === "dark"
          ? 0.2
          : 0.12
        : theme === "dark"
          ? 0.26
          : 0.16;
  const stroke = Math.max(1, opts?.strokePx ?? 1);
  const line =
    theme === "dark"
      ? `rgba(255,255,255,${alpha})`
      : `rgba(0,0,0,${alpha})`;
  const size =
    typeof cellSize === "number"
      ? cellSize
      : cellSize === "avatar"
        ? 10
        : chrome === "youtube"
          ? 52
          : 48;

  // Strong at center-top, fade downward. YouTube safe band sits mid-canvas (~38%).
  const fadeTop = chrome === "youtube" ? "40%" : "8%";
  const fadeBottom = chrome === "facebook" ? 90 : 92;
  const fadeRadial = chrome === "facebook" ? 70 : chrome === "youtube" ? 72 : 72;
  // -3px so the first horizontal line isn’t flush with the banner edge
  const gridPos = "0 -3px";

  return {
    backgroundColor: surface.bg,
    backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${surface.bg} ${fadeBottom}%),
      radial-gradient(ellipse 90% 70% at 50% ${fadeTop}, transparent 0%, ${surface.bg} ${fadeRadial}%),
      linear-gradient(${line} ${stroke}px, transparent ${stroke}px),
      linear-gradient(90deg, ${line} ${stroke}px, transparent ${stroke}px)
    `,
    backgroundSize: `100% 100%, 100% 100%, ${size}px ${size}px, ${size}px ${size}px`,
    backgroundPosition: `0 0, 0 0, ${gridPos}, ${gridPos}`,
  };
}

/**
 * DP backdrop: soft portrait light — key glow behind the face, cool rim at the
 * edges, gentle floor wash. No rings/grid so the cutout stays the focus.
 */
export function platformDpGridBackground(
  surface: PlatformSurface,
  theme: ThemeMode,
  chrome?: PlatformChrome,
): CSSProperties {
  const dark = theme === "dark";
  const quiet = chrome === "facebook";
  const bold = chrome === "youtube";

  const key =
    dark
      ? quiet
        ? "rgba(255,255,255,0.07)"
        : bold
          ? "rgba(255,255,255,0.14)"
          : "rgba(255,255,255,0.1)"
      : quiet
        ? "rgba(255,255,255,0.85)"
        : bold
          ? "rgba(255,255,255,1)"
          : "rgba(255,255,255,0.92)";

  const rim = dark
    ? quiet
      ? "rgba(0,0,0,0.35)"
      : bold
        ? "rgba(0,0,0,0.55)"
        : "rgba(0,0,0,0.45)"
    : quiet
      ? "rgba(0,0,0,0.04)"
      : bold
        ? "rgba(0,0,0,0.08)"
        : "rgba(0,0,0,0.06)";

  const floor = dark
    ? "rgba(255,255,255,0.04)"
    : "rgba(0,0,0,0.03)";

  return {
    backgroundColor: surface.bg,
    backgroundRepeat: "no-repeat",
    backgroundImage: `
      radial-gradient(ellipse 78% 62% at 50% 38%, ${key} 0%, transparent 58%),
      radial-gradient(ellipse 95% 80% at 50% 50%, transparent 42%, ${rim} 100%),
      radial-gradient(ellipse 70% 36% at 50% 88%, ${floor} 0%, transparent 70%),
      linear-gradient(180deg, ${surface.bg} 0%, ${surface.bg} 100%)
    `,
    backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%",
    backgroundPosition: "0 0, 0 0, 0 0, 0 0",
  };
}
