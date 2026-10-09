"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId || typeof window === "undefined") return;
    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        const fn = fbq as typeof fbq & { callMethod?: (...values: unknown[]) => void; queue?: unknown[][]; push?: (...values: unknown[]) => void; loaded?: boolean; version?: string };
        if (fn.callMethod) fn.callMethod(...args);
        else { fn.queue = fn.queue || []; fn.queue.push(args); }
      } as typeof window.fbq & { queue?: unknown[][]; push?: (...values: unknown[]) => void; loaded?: boolean; version?: string };
      fbq.queue = []; fbq.loaded = true; fbq.version = "2.0"; fbq.push = fbq;
      window.fbq = fbq;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }
    window.fbq?.("init", pixelId);
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
