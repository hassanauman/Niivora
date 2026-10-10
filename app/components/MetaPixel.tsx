"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type MetaPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...values: unknown[]) => void;
  queue?: unknown[][];
  push?: (...values: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId) return;

    if (!window.fbq) {
      const fbq: MetaPixelFunction = (...args: unknown[]) => {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue = fbq.queue || [];
          fbq.queue.push(args);
        }
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = (...args: unknown[]) => fbq(...args);
      window.fbq = fbq;
      window._fbq = fbq;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
