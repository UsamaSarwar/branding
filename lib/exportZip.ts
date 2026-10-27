import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { COVER_PLATFORMS } from "./platforms";
import {
    platformGridBackground,
    platformSurface,
    type PlatformChrome,
} from "./platformTheme";
import type { ThemeMode } from "./types";

function applyCoverExportBackground(el: HTMLElement) {
  const theme = el.getAttribute("data-cover-theme") as ThemeMode | null;
  const chrome = el.getAttribute("data-cover-chrome") as PlatformChrome | null;
  const fallbackBg = el.getAttribute("data-cover-surface-bg");

  if (theme && chrome) {
    const surface = platformSurface(theme, chrome);
    const grid = platformGridBackground(surface, theme, "cover", chrome);
    el.style.backgroundColor = String(grid.backgroundColor ?? surface.bg);
    el.style.backgroundImage = String(grid.backgroundImage ?? "");
    el.style.backgroundSize = String(grid.backgroundSize ?? "");
    el.style.backgroundPosition = String(grid.backgroundPosition ?? "");
    el.style.backgroundRepeat = "repeat";
    return;
  }

  if (fallbackBg) {
    el.style.backgroundColor = fallbackBg;
  }
}

async function nodeToPng(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  // pixelRatio 1 at the platform’s official upload size = sharp 1:1 PNG.
  // Higher ratios produce oversized files that platforms typically downscale.
  return toPng(node, {
    width,
    height,
    pixelRatio: 1,
    quality: 1,
    cacheBust: true,
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
      width: `${width}px`,
      height: `${height}px`,
      left: "0",
      top: "0",
      margin: "0",
    },
    onclone: (_doc, cloned) => {
      if (!(cloned instanceof HTMLElement)) return;
      applyCoverExportBackground(cloned);
      cloned.style.transform = "scale(1)";
      cloned.style.transformOrigin = "top left";
      cloned.style.width = `${width}px`;
      cloned.style.height = `${height}px`;
    },
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

export async function exportBrandZip(options: {
  coverNodes: Record<string, HTMLElement | null>;
  dpNode?: HTMLElement | null;
  includeDp: boolean;
  filename: string;
}) {
  const zip = new JSZip();
  const covers = zip.folder("covers");
  if (!covers) throw new Error("ZIP failed");

  for (const platform of COVER_PLATFORMS) {
    const node = options.coverNodes[platform.id];
    if (!node) continue;
    const { width, height } = platform;
    const dataUrl = await nodeToPng(node, width, height);
    covers.file(
      `${platform.id}-cover-${width}x${height}.png`,
      dataUrlToBlob(dataUrl),
    );
  }

  if (options.includeDp && options.dpNode) {
    const dataUrl = await nodeToPng(options.dpNode, 800, 800);
    zip.file("dp.png", dataUrlToBlob(dataUrl));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, options.filename);
}
