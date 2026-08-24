import { useState, useEffect } from 'react';

export function useDeferredMount(delay = 300) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timer;
    // We defer mounting so that page transition animations run at 60fps
    // without the UI thread being blocked by heavy SVG/WebGL rendering.
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        timer = setTimeout(() => setIsMounted(true), delay);
      }, { timeout: 1000 });
    } else {
      timer = setTimeout(() => setIsMounted(true), delay);
    }
    
    return () => clearTimeout(timer);
  }, [delay]);

  return isMounted;
}
