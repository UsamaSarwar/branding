import qrcode from "qrcode-generator";

/** Build an SVG QR whose modules read as horizontal line bars. */
export function buildHorizontalLineQrSvg(opts: {
  data: string;
  size: number;
  color: string;
  background?: string;
  margin?: number;
  /** Bar thickness as a fraction of cell size (0–1). */
  strokeRatio?: number;
}): string {
  const {
    data,
    size,
    color,
    background = "transparent",
    margin = Math.max(4, Math.round(size * 0.04)),
    strokeRatio = 0.52,
  } = opts;

  const qr = qrcode(0, "M");
  qr.addData(data, "Byte");
  qr.make();

  const n = qr.getModuleCount();
  const cell = (size - margin * 2) / n;
  const barH = cell * strokeRatio;
  const radius = barH / 2;
  const vPad = (cell - barH) / 2;

  const rects: string[] = [];

  for (let row = 0; row < n; row++) {
    let col = 0;
    while (col < n) {
      if (!qr.isDark(row, col)) {
        col += 1;
        continue;
      }
      let end = col + 1;
      while (end < n && qr.isDark(row, end)) end += 1;

      const x = margin + col * cell;
      const y = margin + row * cell + vPad;
      const w = (end - col) * cell;
      rects.push(
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${barH.toFixed(2)}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" />`,
      );
      col = end;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">${
    background !== "transparent"
      ? `<rect width="${size}" height="${size}" fill="${background}"/>`
      : ""
  }<g fill="${color}">${rects.join("")}</g></svg>`;
}
