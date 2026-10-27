"use client";

import { Button } from "@/components/ui/button";
import { PREVIEW_DEVICES, type PreviewDevice } from "@/lib/preview";
import type { ThemeMode } from "@/lib/types";
import { cn } from "cn";
import {
    Download,
    Images,
    Monitor,
    Moon,
    Smartphone,
    Sun,
    Tablet,
    UserRound,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

const PREVIEW_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

type Props = {
  saveStatus: "idle" | "saving" | "saved" | "error";
  exporting: boolean;
  theme: ThemeMode;
  previewDevice: PreviewDevice;
  onPreviewDeviceChange: (device: PreviewDevice) => void;
  onToggleTheme: () => void;
  onExportCovers: () => void;
  onExportAll: () => void;
  editBrandButton: ReactNode;
};

export default function AppNav({
  saveStatus,
  exporting,
  theme,
  previewDevice,
  onPreviewDeviceChange,
  onToggleTheme,
  onExportCovers,
  onExportAll,
  editBrandButton,
}: Props) {
  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Error"
          : "Local JSON";

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 supports-backdrop-filter:bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Social Brand Designer
          </p>
          <p className="truncate text-sm font-medium tracking-tight text-foreground">
            Live mockups
          </p>
        </div>

        <nav
          aria-label="Tools"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          <span className="mr-1 hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:inline">
            {statusLabel}
          </span>

          <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

          <div
            role="group"
            aria-label="Preview device"
            className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
          >
            {PREVIEW_DEVICES.map((device) => {
              const Icon = PREVIEW_ICONS[device.id];
              const active = previewDevice === device.id;
              return (
                <button
                  key={device.id}
                  type="button"
                  title={`${device.label} (${device.width}px)`}
                  aria-label={`${device.label} preview`}
                  aria-pressed={active}
                  onClick={() => onPreviewDeviceChange(device.id)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[0.8rem] font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{device.label}</span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light" : "Switch to dark"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={onExportCovers}
            title="Export all covers"
          >
            <Images />
            <span className="hidden sm:inline">Covers</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={onExportAll}
            title="Export covers + DP"
          >
            <Download />
            <span className="hidden sm:inline">Brand kit</span>
          </Button>

          <div className="mx-0.5 h-5 w-px bg-border" />

          {editBrandButton}
        </nav>
      </div>
    </header>
  );
}

export function EditBrandNavButton({
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button variant="default" size="sm" {...props}>
      <UserRound />
      Edit brand
    </Button>
  );
}
