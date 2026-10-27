import type { CSSProperties } from "react";
import type { ThemeMode } from "./types";

export const palette = (theme: ThemeMode) =>
  theme === "dark"
    ? {
        bg: "#0a0a0a",
        fg: "#fafafa",
        muted: "#a1a1a1",
        faint: "#525252",
        line: "rgba(255,255,255,0.08)",
        qrBg: "#ffffff",
        qrFg: "#0a0a0a",
        panel: "#111111",
        border: "#262626",
        input: "#171717",
      }
    : {
        bg: "#fafafa",
        fg: "#0a0a0a",
        muted: "#737373",
        faint: "#a3a3a3",
        line: "rgba(0,0,0,0.08)",
        qrBg: "#ffffff",
        qrFg: "#0a0a0a",
        panel: "#ffffff",
        border: "#e5e5e5",
        input: "#f5f5f5",
      };

/** CSS for faded grid: strong at center-top, fading downward */
export function gridBackground(
  theme: ThemeMode,
  /** Cover uses a large cell; avatars use a tight cell */
  cellSize: "cover" | "avatar" | number = "cover",
): CSSProperties {
  const colors = palette(theme);
  const line = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
  const size =
    typeof cellSize === "number"
      ? cellSize
      : cellSize === "avatar"
        ? 10
        : 52;
  return {
    backgroundColor: colors.bg,
    backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${colors.bg} 92%),
      radial-gradient(ellipse 90% 70% at 50% 8%, transparent 0%, ${colors.bg} 72%),
      linear-gradient(${line} 1px, transparent 1px),
      linear-gradient(90deg, ${line} 1px, transparent 1px)
    `,
    backgroundSize: `100% 100%, 100% 100%, ${size}px ${size}px, ${size}px ${size}px`,
    backgroundPosition: "0 0, 0 0, center top, center top",
  };
}
