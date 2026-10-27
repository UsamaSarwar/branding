export type SafeArea = {
  width: number;
  height: number;
};

export type CoverPlatform = {
  id: string;
  name: string;
  kind: "cover";
  width: number;
  height: number;
  /**
   * Official always-visible zone (YouTube). Cover copy is designed for the
   * mobile band; this is used when the platform publishes an explicit safe area.
   */
  safeArea?: SafeArea;
  /**
   * Profile chrome. Cover art is composed for `mobile` first — desktop/tablet
   * must show at least that band so the same export stays safe automatically.
   */
  avatar?: {
    shape: "circle" | "squircle";
    desktop: AvatarLayout;
    mobile: AvatarLayout;
  };
};

export type AvatarLayout = {
  /** Avatar diameter as a fraction of the rendered cover width */
  sizeRatio: number;
  /** Left inset as a fraction of cover width */
  leftRatio: number;
  /** How much of the avatar hangs below the cover (0–1). 0.5 = half below. */
  hangBelow: number;
  /**
   * Mobile design crop: top of the visible band (0–1 of cover height).
   * Desktop should keep this band on-screen (usually show more, not less).
   */
  coverCropTop?: number;
  /** Visible cover height ratio (defaults to 1 = full art) */
  coverVisibleRatio?: number;
  /**
   * Horizontal crop (YouTube): left of the visible band (0–1 of cover width).
   * Desktop channel page shows the full-width strip; mobile/tablet center-crop.
   */
  coverCropLeft?: number;
  /** Visible cover width ratio (defaults to 1 = full art) */
  coverVisibleWidthRatio?: number;
  /** Profile chrome under the banner */
  chrome?: "linkedin" | "x" | "facebook" | "youtube";
};

/**
 * YouTube channel art (2560×1440). Same file on all devices; crops differ:
 * - TV: full 2560×1440
 * - Desktop: 2560×423 center strip
 * - Tablet: 1855×423 center
 * - Mobile: 1546×423 center (text/logo safe area)
 * @see https://support.google.com/youtube/answer/10456525
 */
export const YOUTUBE_ART = {
  width: 2560,
  height: 1440,
  bandH: 423,
  desktopW: 2560,
  tabletW: 1855,
  mobileW: 1546,
} as const;

export type DpPlatform = {
  id: string;
  name: string;
  kind: "dp";
  size: number;
};

export type Platform = CoverPlatform | DpPlatform;

/** Desktop shows the full cover; mobile design band is always a subset. */
function desktopContainsMobile(): Pick<
  AvatarLayout,
  "coverCropTop" | "coverVisibleRatio"
> {
  return {
    coverCropTop: 0,
    coverVisibleRatio: 1,
  };
}

export const COVER_PLATFORMS: CoverPlatform[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    kind: "cover",
    width: 1584,
    height: 396,
    avatar: {
      shape: "circle",
      // Mobile = design source of truth (full cover so QR stays complete)
      mobile: {
        sizeRatio: 0.22,
        leftRatio: 0.04,
        hangBelow: 0.55,
        coverCropTop: 0,
        coverVisibleRatio: 1,
        chrome: "linkedin",
      },
      desktop: {
        sizeRatio: 0.152,
        leftRatio: 0.024,
        hangBelow: 0.48,
        chrome: "linkedin",
        ...desktopContainsMobile(),
      },
    },
  },
  {
    id: "x",
    name: "X / Twitter",
    kind: "cover",
    width: 1500,
    height: 500,
    avatar: {
      shape: "circle",
      mobile: {
        sizeRatio: 0.18,
        leftRatio: 0.03,
        hangBelow: 0.52,
        coverCropTop: 0.06,
        coverVisibleRatio: 0.86,
        chrome: "x",
      },
      desktop: {
        sizeRatio: 0.133,
        leftRatio: 0.016,
        hangBelow: 0.55,
        chrome: "x",
        ...desktopContainsMobile(),
      },
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    kind: "cover",
    width: 820,
    height: 312,
    avatar: {
      shape: "circle",
      mobile: {
        sizeRatio: 0.22,
        leftRatio: 0.035,
        hangBelow: 0.48,
        coverCropTop: 0.02,
        coverVisibleRatio: 0.92,
        chrome: "facebook",
      },
      desktop: {
        sizeRatio: 0.205,
        leftRatio: 0.028,
        hangBelow: 0.38,
        chrome: "facebook",
        ...desktopContainsMobile(),
      },
    },
  },
  {
    id: "youtube",
    name: "YouTube",
    kind: "cover",
    width: YOUTUBE_ART.width,
    height: YOUTUBE_ART.height,
    // Always-visible text/logo zone (mobile crop) — keep copy inside this
    safeArea: {
      width: YOUTUBE_ART.mobileW,
      height: YOUTUBE_ART.bandH,
    },
    avatar: {
      shape: "circle",
      mobile: {
        sizeRatio: 0.15,
        leftRatio: 0.04,
        hangBelow: 1,
        coverCropTop:
          (YOUTUBE_ART.height - YOUTUBE_ART.bandH) / 2 / YOUTUBE_ART.height,
        coverVisibleRatio: YOUTUBE_ART.bandH / YOUTUBE_ART.height,
        coverCropLeft:
          (YOUTUBE_ART.width - YOUTUBE_ART.mobileW) / 2 / YOUTUBE_ART.width,
        coverVisibleWidthRatio: YOUTUBE_ART.mobileW / YOUTUBE_ART.width,
        chrome: "youtube",
      },
      desktop: {
        sizeRatio: 0.1,
        leftRatio: 0.02,
        hangBelow: 1,
        // Desktop channel page: full-width center strip (2560×423)
        coverCropTop:
          (YOUTUBE_ART.height - YOUTUBE_ART.bandH) / 2 / YOUTUBE_ART.height,
        coverVisibleRatio: YOUTUBE_ART.bandH / YOUTUBE_ART.height,
        coverCropLeft: 0,
        coverVisibleWidthRatio: 1,
        chrome: "youtube",
      },
    },
  },
];

export const DP_PLATFORMS: DpPlatform[] = [
  { id: "linkedin-dp", name: "LinkedIn DP", kind: "dp", size: 400 },
  { id: "x-dp", name: "X DP", kind: "dp", size: 400 },
  { id: "facebook-dp", name: "Facebook DP", kind: "dp", size: 180 },
  { id: "instagram-dp", name: "Instagram DP", kind: "dp", size: 320 },
];

export const ALL_PLATFORMS: Platform[] = [...COVER_PLATFORMS, ...DP_PLATFORMS];
