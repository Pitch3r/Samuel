"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures an element's width so SVG charts can draw at their real size and
 * keep 11px labels readable instead of scaling a fixed drawing down.
 */
export function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(Math.max(Math.round(element.clientWidth), 240));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}
