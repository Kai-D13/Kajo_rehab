import { MutableRefObject, useLayoutEffect, useState } from "react";

export function useRealHeight(
  element: MutableRefObject<HTMLDivElement | null>,
  defaultValue?: number
) {
  const [height, setHeight] = useState(defaultValue ?? 0);
  useLayoutEffect(() => {
    if (element.current && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [{ contentRect }] = entries;
        setHeight(contentRect.height);
      });
      ro.observe(element.current);
      return () => ro.disconnect();
    }
    return () => {};
  }, [element.current]);

  if (typeof ResizeObserver === "undefined") {
    return -1;
  }
  return height;
}

export function useRouteHandle() {
  // Fallback implementation for Zalo Mini App
  try {
    // In production, this would get the current route info
    const pathname = window.location.pathname;
    const handle = {
      title: 'KajoTai Clinic',
      back: pathname !== '/',
      scrollRestoration: 0,
      noScroll: false,
      profile: false
    };
    
    return [handle, { handle }, []] as const;
  } catch (error) {
    console.warn('useRouteHandle fallback:', error);
    return [{}, {}, []] as const;
  }
}
