"use client";

import { palette } from "@/lib/design";
import { buildHorizontalLineQrSvg } from "@/lib/horizontalQr";
import type { ContactInfo, ThemeMode } from "@/lib/types";
import { buildVCard, hasContactContent } from "@/lib/vcard";

type Props = {
  contact: ContactInfo;
  theme: ThemeMode;
  size?: number;
  className?: string;
  /** Theme-colored modules on a transparent field (no card chrome). */
  blend?: boolean;
  /** Override module / field colors (e.g. platform surface). */
  fg?: string;
  bg?: string;
};

export default function ModernQr({
  contact,
  theme,
  size = 128,
  className,
  blend = false,
  fg: fgProp,
  bg: bgProp,
}: Props) {
  const colors = palette(theme);
  const fg = fgProp ?? (blend ? colors.fg : colors.qrFg);
  const bg = bgProp ?? (blend ? "transparent" : colors.qrBg);
  const margin = blend ? Math.max(4, Math.round(size * 0.04)) : 8;

  const svg = hasContactContent(contact)
    ? buildHorizontalLineQrSvg({
        data: buildVCard(contact),
        size,
        color: fg,
        background: blend && !bgProp ? "transparent" : bg,
        margin,
      })
    : null;

  if (!svg) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: blend ? 0 : 16,
          background: blend ? "transparent" : colors.qrBg,
          border: blend
            ? `1px dashed ${colors.line}`
            : `1px solid ${colors.border}`,
          display: "grid",
          placeItems: "center",
          color: colors.muted,
          fontSize: 10,
          fontFamily: "var(--font-geist-mono), monospace",
          textAlign: "center",
          padding: 8,
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        Add contact to generate QR
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: blend ? 0 : 16,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
