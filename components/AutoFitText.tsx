"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";

type Props = {
  text: string;
  maxFontSize: number;
  minFontSize?: number;
  as?: ElementType;
  maxLines?: number;
  /** Optional height budget (e.g. safe-area slice) — type grows to fill it. */
  maxHeight?: number;
  style?: CSSProperties;
  className?: string;
};

/**
 * Picks the largest font that fits width + line budget (+ optional height budget).
 */
export default function AutoFitText({
  text,
  maxFontSize,
  minFontSize = 10,
  as: Tag = "div",
  maxLines = 2,
  maxHeight,
  style,
  className,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const parent = el.parentElement;
      if (!parent) return;

      const available = parent.clientWidth;
      if (available <= 0) return;

      const heightBudget =
        maxHeight != null && maxHeight > 0
          ? maxHeight
          : parent.clientHeight > 0
            ? parent.clientHeight
            : null;

      el.style.display = "block";
      el.style.setProperty("-webkit-line-clamp", "unset");
      el.style.setProperty("-webkit-box-orient", "unset");
      el.style.overflow = "visible";
      el.style.whiteSpace = maxLines === 1 ? "nowrap" : "normal";
      el.style.width = `${available}px`;

      let low = minFontSize;
      let high = Math.ceil(maxFontSize);
      let best = minFontSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = `${mid}px`;

        const computed = getComputedStyle(el);
        const lineHeightPx = parseFloat(computed.lineHeight) || mid * 1.15;
        const lineCap = lineHeightPx * maxLines + 2;
        const heightCap =
          heightBudget != null ? Math.min(lineCap, heightBudget + 1) : lineCap;

        const tooWide = el.scrollWidth > available + 1;
        const tooTall = el.scrollHeight > heightCap;

        if (!tooWide && !tooTall) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFontSize(best);
      el.style.fontSize = `${best}px`;
      el.style.width = "";
      el.style.whiteSpace = "";
      el.style.display = "-webkit-box";
      el.style.setProperty("-webkit-line-clamp", String(maxLines));
      el.style.setProperty("-webkit-box-orient", "vertical");
      el.style.overflow = "hidden";
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [text, maxFontSize, minFontSize, maxLines, maxHeight]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...style,
        fontSize,
        maxWidth: "100%",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical" as const,
        wordBreak: "break-word",
      }}
    >
      {text}
    </Tag>
  );
}
