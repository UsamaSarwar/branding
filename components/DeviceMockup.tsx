"use client";

import type { AvatarLayout, CoverPlatform } from "@/lib/platforms";
import { YOUTUBE_ART } from "@/lib/platforms";
import {
    chromeFromPlatformId,
    chromeTone,
    type ChromeTone,
    type PlatformChrome,
} from "@/lib/platformTheme";
import { layoutForPreview, type PreviewDevice } from "@/lib/preview";
import type { BrandData } from "@/lib/types";
import { useEffect, useRef, useState, type RefObject } from "react";
import CoverCanvas from "./CoverCanvas";
import DpCanvas from "./DpCanvas";

function isPartialBand(layout: AvatarLayout) {
  const top = layout.coverCropTop ?? 0;
  const ratio = layout.coverVisibleRatio ?? 1;
  const left = layout.coverCropLeft ?? 0;
  const widthRatio = layout.coverVisibleWidthRatio ?? 1;
  return (
    top > 0.005 ||
    ratio < 0.995 ||
    left > 0.005 ||
    widthRatio < 0.995
  );
}

/** Dotted crop guides on desktop so tablet/mobile safe bands are visible. */
function CoverSafeAreaGuides({
  coverH,
  coverW,
  mobile,
  tablet,
  dark,
  youtubeWidthGuides,
}: {
  coverH: number;
  coverW: number;
  mobile: AvatarLayout;
  tablet: AvatarLayout;
  dark: boolean;
  /** YouTube: vertical width crops on the full-width desktop strip */
  youtubeWidthGuides?: boolean;
}) {
  const bands: {
    id: "tablet" | "mobile";
    layout: AvatarLayout;
    color: string;
    labelColor: string;
  }[] = [
    {
      id: "tablet",
      layout: tablet,
      color: dark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.32)",
      labelColor: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
    },
    {
      id: "mobile",
      layout: mobile,
      color: dark ? "rgba(125,211,252,0.75)" : "rgba(3,105,161,0.7)",
      labelColor: dark ? "rgba(186,230,253,0.9)" : "rgba(3,105,161,0.85)",
    },
  ];

  if (youtubeWidthGuides) {
    const bandTop =
      ((YOUTUBE_ART.height - YOUTUBE_ART.bandH) / 2 / YOUTUBE_ART.height) *
      coverH;
    const bandH = (YOUTUBE_ART.bandH / YOUTUBE_ART.height) * coverH;
    return (
      <>
        {bands.map(({ id, color, labelColor }) => {
          const wPx =
            id === "mobile"
              ? (YOUTUBE_ART.mobileW / YOUTUBE_ART.width) * coverW
              : (YOUTUBE_ART.tabletW / YOUTUBE_ART.width) * coverW;
          const left = (coverW - wPx) / 2;
          return (
            <div
              key={id}
              aria-hidden
              style={{
                position: "absolute",
                left,
                top: bandTop,
                width: Math.max(2, wPx),
                height: Math.max(2, bandH),
                boxSizing: "border-box",
                border: `1.5px dotted ${color}`,
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  right: 5,
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: labelColor,
                  background: dark
                    ? "rgba(0,0,0,0.45)"
                    : "rgba(255,255,255,0.72)",
                  padding: "1px 5px",
                  lineHeight: 1.4,
                }}
              >
                {id}
              </span>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {bands.map(({ id, layout, color, labelColor }) => {
        if (!isPartialBand(layout)) return null;
        const top = (layout.coverCropTop ?? 0) * coverH;
        const height = (layout.coverVisibleRatio ?? 1) * coverH;
        const left = (layout.coverCropLeft ?? 0) * coverW;
        const width =
          (layout.coverVisibleWidthRatio ?? 1) * coverW;
        return (
          <div
            key={id}
            aria-hidden
            style={{
              position: "absolute",
              left,
              top,
              width: Math.max(2, width),
              height: Math.max(2, height),
              boxSizing: "border-box",
              border: `1.5px dotted ${color}`,
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                right: 5,
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: labelColor,
                background: dark
                  ? "rgba(0,0,0,0.45)"
                  : "rgba(255,255,255,0.72)",
                padding: "1px 5px",
                lineHeight: 1.4,
              }}
            >
              {id}
            </span>
          </div>
        );
      })}
    </>
  );
}

type Props = {
  platform: CoverPlatform;
  data: BrandData;
  frame: PreviewDevice;
  layout: AvatarLayout;
  coverRef?: RefObject<HTMLDivElement | null>;
  attachCoverRef?: boolean;
  onDpClick?: () => void;
};

function handleFromContact(data: BrandData): string {
  const site = data.contact.website.trim();
  if (site) {
    try {
      const host = new URL(
        site.startsWith("http") ? site : `https://${site}`,
      ).hostname.replace(/^www\./, "");
      const leaf = host.split(".")[0];
      if (leaf) return leaf.toLowerCase();
    } catch {
      /* fall through */
    }
  }
  return (
    data.contact.fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "username"
  );
}

export default function DeviceMockup({
  platform,
  data,
  frame,
  layout,
  coverRef,
  attachCoverRef,
  onDpClick,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [coverDisplayWidth, setCoverDisplayWidth] = useState(
    frame === "mobile" ? 390 : frame === "tablet" ? 768 : 720,
  );

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const measure = () => {
      const available = Math.floor(el.clientWidth);
      if (available <= 0) return;
      setCoverDisplayWidth(available);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chrome: PlatformChrome =
    layout.chrome ?? chromeFromPlatformId(platform.id);
  const isYoutube = chrome === "youtube";
  const tone = chromeTone(data.theme, chrome);
  const dark = data.theme === "dark";

  const bannerInset = isYoutube
    ? frame === "mobile"
      ? 10
      : frame === "tablet"
        ? 14
        : 16
    : 0;
  const bannerWidth = Math.max(120, coverDisplayWidth - bannerInset * 2);
  // Horizontal crop (YouTube): scale so the visible width fills the banner
  const visibleWidthRatio = layout.coverVisibleWidthRatio ?? 1;
  const cropLeft = layout.coverCropLeft ?? 0;
  const fullDisplayW = bannerWidth / Math.max(0.05, visibleWidthRatio);
  const coverH = (fullDisplayW / platform.width) * platform.height;
  const visibleRatio = layout.coverVisibleRatio ?? 1;
  const cropTop = layout.coverCropTop ?? 0;
  const visibleH = coverH * visibleRatio;
  const dpSize = coverDisplayWidth * layout.sizeRatio;
  const hang = dpSize * layout.hangBelow;
  const ring = dark ? 3 : 4;
  const avatarTop = isYoutube
    ? bannerInset + visibleH + (frame === "mobile" ? 12 : 16)
    : visibleH - dpSize * (1 - layout.hangBelow);
  const left = coverDisplayWidth * layout.leftRatio;

  const displayName = data.contact.fullName || "Your Name";
  const displayTitle = data.contact.title.trim();
  const displayTagline = data.contact.tagline.trim();
  const handle = handleFromContact(data);
  const org = data.contact.organization.trim();

  const profilePadTop = isYoutube
    ? 0
    : hang + (chrome === "x" ? 10 : chrome === "facebook" ? 14 : 12);
  const profilePadBottom = frame === "mobile" ? 16 : 20;
  const profileMinH = isYoutube
    ? dpSize + (frame === "mobile" ? 28 : 36)
    : Math.max(profilePadTop + 72, hang + 88);

  const tabletLayout = platform.avatar
    ? layoutForPreview(platform.avatar, "tablet").layout
    : null;
  const showSafeGuides =
    frame === "desktop" &&
    Boolean(platform.avatar) &&
    Boolean(tabletLayout) &&
    (isPartialBand(platform.avatar!.mobile) || isPartialBand(tabletLayout!));

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {frame}
        </p>
        {showSafeGuides ? (
          <p className="font-mono text-[9px] tracking-[0.08em] text-muted-foreground">
            <span className="text-sky-700 dark:text-sky-300">···· mobile</span>
            <span className="mx-2 opacity-40">·</span>
            <span>···· tablet</span>
            <span className="ml-2 opacity-70">safe areas</span>
          </p>
        ) : null}
      </div>
      <div
        ref={shellRef}
        className="mx-auto w-full overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]"
        style={{
          borderRadius: frame === "mobile" ? 12 : frame === "tablet" ? 10 : 8,
          border: `1px solid ${tone.border}`,
          background: tone.bg,
        }}
      >
        <div className="relative" style={{ background: tone.bg }}>
          <div
            className="relative overflow-hidden"
            style={{
              height: visibleH,
              width: bannerWidth,
              borderRadius: isYoutube ? (frame === "mobile" ? 10 : 12) : 0,
              margin: isYoutube ? `${bannerInset}px ${bannerInset}px 0` : 0,
            }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                top: -coverH * cropTop,
                left: -fullDisplayW * cropLeft,
                width: fullDisplayW,
              }}
            >
              <CoverCanvas
                ref={attachCoverRef ? coverRef : undefined}
                data={data}
                width={platform.width}
                height={platform.height}
                platform={platform}
                displayWidth={fullDisplayW}
              />
              {showSafeGuides && platform.avatar && tabletLayout ? (
                <CoverSafeAreaGuides
                  coverH={coverH}
                  coverW={fullDisplayW}
                  mobile={platform.avatar.mobile}
                  tablet={tabletLayout}
                  dark={dark}
                  youtubeWidthGuides={isYoutube}
                />
              ) : null}
            </div>
          </div>

          <div
            className="absolute z-10"
            style={{
              left: isYoutube ? bannerInset + 2 : left,
              top: avatarTop,
              width: dpSize,
              height: dpSize,
            }}
          >
            <div
              style={{
                padding: ring,
                borderRadius:
                  platform.avatar?.shape === "squircle" ? "22%" : "50%",
                background: tone.ring,
                boxShadow: dark ? "none" : "0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              <DpCanvas
                dpPath={data.dpPath}
                size={Math.round(dpSize)}
                theme={data.theme}
                chrome={chrome}
                displaySize={Math.max(24, dpSize - ring * 2)}
                shape={platform.avatar?.shape ?? "circle"}
                onClick={onDpClick}
              />
            </div>
          </div>

          <div
            style={{
              minHeight: profileMinH,
              paddingTop: isYoutube ? bannerInset + 12 : profilePadTop,
              paddingBottom: profilePadBottom,
              paddingLeft: frame === "mobile" ? 12 : 16,
              paddingRight: frame === "mobile" ? 12 : 16,
            }}
          >
            {chrome === "linkedin" ? (
              <LinkedInChrome
                name={displayName}
                title={displayTitle}
                tagline={displayTagline}
                org={org}
                left={left}
                dpSize={dpSize}
                frame={frame}
                tone={tone}
              />
            ) : null}
            {chrome === "x" ? (
              <XChrome
                name={displayName}
                handle={handle}
                tagline={displayTagline || displayTitle}
                left={left}
                dpSize={dpSize}
                frame={frame}
                tone={tone}
              />
            ) : null}
            {chrome === "facebook" ? (
              <FacebookChrome
                name={displayName}
                tagline={displayTagline || displayTitle}
                left={left}
                dpSize={dpSize}
                frame={frame}
                tone={tone}
              />
            ) : null}
            {chrome === "youtube" ? (
              <YouTubeChrome
                name={displayName}
                handle={handle}
                title={displayTitle}
                tagline={displayTagline}
                dpSize={dpSize}
                bannerInset={bannerInset}
                frame={frame}
                tone={tone}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInChrome({
  name,
  title,
  tagline,
  org,
  left,
  dpSize,
  frame,
  tone,
}: {
  name: string;
  title: string;
  tagline: string;
  org: string;
  left: number;
  dpSize: number;
  frame: PreviewDevice;
  tone: ChromeTone;
}) {
  const compact = frame === "mobile";
  return (
    <div className="relative">
      <div
        className="flex justify-end gap-2"
        style={{ minHeight: compact ? 28 : 32 }}
      >
        <span
          className="inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] font-semibold"
          style={{ borderColor: tone.accent, color: tone.btnSecondaryFg }}
        >
          Message
        </span>
        <span
          className="inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold"
          style={{ background: tone.btn, color: tone.btnFg }}
        >
          Connect
        </span>
      </div>
      <div
        style={{
          marginTop: compact ? 8 : 10,
          paddingLeft: Math.max(0, left - (compact ? 12 : 16)),
          maxWidth: "100%",
        }}
      >
        <p
          className="truncate font-semibold tracking-tight"
          style={{
            fontSize: compact ? 18 : 22,
            lineHeight: 1.2,
            color: tone.fg,
          }}
        >
          {name}
        </p>
        {(tagline || title) && (
          <p
            className="mt-1 line-clamp-2"
            style={{
              fontSize: compact ? 13 : 14,
              lineHeight: 1.35,
              color: tone.muted,
            }}
          >
            {tagline || title}
          </p>
        )}
        {title && tagline ? (
          <p className="mt-0.5 truncate text-[12px]" style={{ color: tone.faint }}>
            {title}
            {org ? ` · ${org}` : ""}
          </p>
        ) : org ? (
          <p className="mt-0.5 truncate text-[12px]" style={{ color: tone.faint }}>
            {org}
          </p>
        ) : null}
        <p className="mt-1 truncate text-[12px]" style={{ color: tone.faint }}>
          Contact info · 500+ connections
        </p>
      </div>
      <div
        className="mt-4 flex gap-4 text-[13px] font-semibold"
        style={{
          borderBottom: `1px solid ${tone.line}`,
          marginLeft: compact ? -12 : -16,
          marginRight: compact ? -12 : -16,
          paddingLeft: compact ? 12 : 16,
        }}
      >
        {["Posts", "About", "Services", "More"].map((tab, i) => (
          <span
            key={tab}
            className="pb-2.5"
            style={
              i === 0
                ? {
                    color: tone.fg,
                    boxShadow: `inset 0 -2px 0 ${tone.fg}`,
                  }
                : { color: tone.faint }
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="sr-only" style={{ width: dpSize }} />
    </div>
  );
}

function XChrome({
  name,
  handle,
  tagline,
  left,
  dpSize,
  frame,
  tone,
}: {
  name: string;
  handle: string;
  tagline: string;
  left: number;
  dpSize: number;
  frame: PreviewDevice;
  tone: ChromeTone;
}) {
  const compact = frame === "mobile";
  return (
    <div>
      <div
        className="flex justify-end"
        style={{ minHeight: Math.max(36, dpSize * 0.22) }}
      >
        <span
          className="inline-flex h-8 items-center rounded-full px-4 text-[13px] font-bold"
          style={{ background: tone.btn, color: tone.btnFg }}
        >
          Follow
        </span>
      </div>
      <div style={{ paddingLeft: Math.max(0, left - (compact ? 12 : 16)) }}>
        <p
          className="truncate font-extrabold tracking-tight"
          style={{
            fontSize: compact ? 17 : 19,
            lineHeight: 1.2,
            color: tone.fg,
          }}
        >
          {name}
        </p>
        <p className="mt-0.5 truncate text-[14px]" style={{ color: tone.faint }}>
          @{handle}
        </p>
        {tagline ? (
          <p
            className="mt-2 line-clamp-2"
            style={{ fontSize: 14, lineHeight: 1.4, color: tone.muted }}
          >
            {tagline}
          </p>
        ) : null}
        <div className="mt-2.5 flex gap-3 text-[13px]" style={{ color: tone.faint }}>
          <span>
            <span className="font-bold" style={{ color: tone.fg }}>
              128
            </span>{" "}
            Following
          </span>
          <span>
            <span className="font-bold" style={{ color: tone.fg }}>
              1.2K
            </span>{" "}
            Followers
          </span>
        </div>
      </div>
      <div
        className="mt-3 flex justify-between text-[14px] font-medium"
        style={{
          borderBottom: `1px solid ${tone.line}`,
          color: tone.faint,
          marginLeft: compact ? -12 : -16,
          marginRight: compact ? -12 : -16,
        }}
      >
        {["Posts", "Replies", "Media", "Likes"].map((tab, i) => (
          <span
            key={tab}
            className="flex-1 py-3 text-center"
            style={
              i === 0
                ? {
                    color: tone.fg,
                    boxShadow: `inset 0 -2px 0 ${tone.accent}`,
                  }
                : undefined
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="sr-only" style={{ width: dpSize }} />
    </div>
  );
}

function FacebookChrome({
  name,
  tagline,
  left,
  dpSize,
  frame,
  tone,
}: {
  name: string;
  tagline: string;
  left: number;
  dpSize: number;
  frame: PreviewDevice;
  tone: ChromeTone;
}) {
  const compact = frame === "mobile";

  const tabs = (pad: number) => (
    <div
      className="mt-4 flex gap-1 pt-1 text-[14px] font-semibold"
      style={{
        borderTop: `1px solid ${tone.line}`,
        color: tone.faint,
        marginLeft: -pad,
        marginRight: -pad,
        paddingLeft: pad === 16 ? 8 : 4,
      }}
    >
      {(compact
        ? ["Posts", "About", "Friends", "More"]
        : ["Posts", "About", "Friends", "Photos", "More"]
      ).map((tab, i) => (
        <span
          key={tab}
          className="rounded-md px-3 py-2.5"
          style={
            i === 0
              ? {
                  color: tone.accent,
                  boxShadow: `inset 0 -3px 0 ${tone.accent}`,
                }
              : undefined
          }
        >
          {tab}
        </span>
      ))}
    </div>
  );

  if (!compact && frame === "desktop") {
    return (
      <div>
        <div
          className="flex items-end justify-between gap-3"
          style={{
            paddingLeft: left + dpSize + 8 - 16,
            minHeight: Math.max(0, dpSize * 0.55),
          }}
        >
          <div className="min-w-0 flex-1 pb-1">
            <p
              className="truncate font-bold tracking-tight"
              style={{ fontSize: 28, lineHeight: 1.15, color: tone.fg }}
            >
              {name}
            </p>
            {tagline ? (
              <p className="mt-1 truncate text-[14px]" style={{ color: tone.muted }}>
                {tagline}
              </p>
            ) : (
              <p className="mt-1 text-[14px]" style={{ color: tone.muted }}>
                <span className="font-semibold" style={{ color: tone.fg }}>
                  842
                </span>{" "}
                friends
              </p>
            )}
          </div>
          <div className="mb-1 flex shrink-0 gap-2">
            <span
              className="inline-flex h-9 items-center rounded-md px-3 text-[14px] font-semibold"
              style={{ background: tone.btn, color: tone.btnFg }}
            >
              Add friend
            </span>
            <span
              className="inline-flex h-9 items-center rounded-md px-3 text-[14px] font-semibold"
              style={{
                background: tone.btnSecondary,
                color: tone.btnSecondaryFg,
              }}
            >
              Message
            </span>
          </div>
        </div>
        {tabs(16)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-2" style={{ minHeight: 28 }} />
      <div style={{ paddingLeft: Math.max(0, left - 12) }}>
        <p
          className="truncate font-bold tracking-tight"
          style={{ fontSize: 22, lineHeight: 1.2, color: tone.fg }}
        >
          {name}
        </p>
        {tagline ? (
          <p
            className="mt-1 line-clamp-2 text-[13px]"
            style={{ color: tone.muted }}
          >
            {tagline}
          </p>
        ) : null}
        <p className="mt-1 text-[13px]" style={{ color: tone.muted }}>
          <span className="font-semibold" style={{ color: tone.fg }}>
            842
          </span>{" "}
          friends
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <span
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md text-[14px] font-semibold"
          style={{ background: tone.btn, color: tone.btnFg }}
        >
          Add friend
        </span>
        <span
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md text-[14px] font-semibold"
          style={{
            background: tone.btnSecondary,
            color: tone.btnSecondaryFg,
          }}
        >
          Message
        </span>
      </div>
      {tabs(12)}
    </div>
  );
}

function YouTubeChrome({
  name,
  handle,
  title,
  tagline,
  dpSize,
  bannerInset,
  frame,
  tone,
}: {
  name: string;
  handle: string;
  title: string;
  tagline: string;
  dpSize: number;
  bannerInset: number;
  frame: PreviewDevice;
  tone: ChromeTone;
}) {
  const compact = frame === "mobile";
  return (
    <div
      className="flex items-start justify-between gap-3"
      style={{
        paddingLeft: dpSize + (compact ? 10 : 14),
        minHeight: dpSize,
        marginLeft: bannerInset - (compact ? 12 : 16),
      }}
    >
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className="truncate font-bold tracking-tight"
          style={{
            fontSize: compact ? 18 : 22,
            lineHeight: 1.2,
            color: tone.fg,
          }}
        >
          {name}
        </p>
        <p className="mt-1 truncate text-[13px]" style={{ color: tone.muted }}>
          @{handle}
          <span style={{ color: tone.faint }}>
            {" "}
            · 12.4K subscribers · 86 videos
          </span>
        </p>
        {(tagline || title) && (
          <p className="mt-1.5 line-clamp-1 text-[13px]" style={{ color: tone.muted }}>
            {tagline || title}
            <span className="ml-1 font-medium" style={{ color: tone.fg }}>
              …more
            </span>
          </p>
        )}
      </div>
      <span
        className="mt-1 shrink-0 rounded-full font-medium"
        style={{
          background: tone.btn,
          color: tone.btnFg,
          padding: compact ? "6px 12px" : "8px 14px",
          fontSize: compact ? 12 : 13,
        }}
      >
        Subscribe
      </span>
    </div>
  );
}
