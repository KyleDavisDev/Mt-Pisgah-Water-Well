"use client";

import { useState, useEffect } from "react";
import { theme } from "../../theme/styled-components";

interface MediaQueryProps {
  min?: number;
  max?: number;
}

export const useMediaQuery = (range: MediaQueryProps) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let mediaQueryString: string;

    const { min, max } = range;

    if (min !== undefined && max !== undefined) {
      // Between two values
      mediaQueryString = `(min-width: ${min}px) and (max-width: ${max === Infinity ? 99999 : max}px)`;
    } else if (min !== undefined) {
      // From min to infinity
      mediaQueryString = `(min-width: ${min}px)`;
    } else if (max !== undefined) {
      // From 0 to max
      mediaQueryString = `(max-width: ${max}px)`;
    } else {
      // Fallback
      mediaQueryString = "(min-width: 99999px)";
    }

    const media = window.matchMedia(mediaQueryString);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [range]);

  return matches;
};

const extractPixelsRobust = (str: string) => {
  const match = str.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const isDesktopHook = () => useMediaQuery({ min: extractPixelsRobust(theme.mdToLg), max: Infinity });
export const isTabletHook = () =>
  useMediaQuery({ min: extractPixelsRobust(theme.smToMd), max: extractPixelsRobust(theme.mdToLg) });
export const isMobileHook = () => useMediaQuery({ min: 0, max: extractPixelsRobust(theme.smToMd) });
