import { useState, useEffect } from 'react';

/**
 * Delays the mounting of a component by a specified time, typically
 * used to defer heavy rendering (like Recharts/ThreeJS) until after
 * a page transition animation has completed.
 * 
 * @param {number} delayMs - Time in milliseconds to delay mounting. Default is 400ms (standard transition time).
 * @returns {boolean} - True if the component should be mounted.
 */
export function useDeferredMount(delayMs = 400) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Wait for the transition to finish
    const timer = setTimeout(() => {
      // Use requestAnimationFrame to ensure the browser has painted the transition
      requestAnimationFrame(() => {
        setIsMounted(true);
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return isMounted;
}
