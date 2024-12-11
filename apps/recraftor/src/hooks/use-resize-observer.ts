import { useEffect, useRef, useState } from 'react';
import { debounce } from '@/lib/utils';

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

interface UseResizeObserverOptions {
  debounceMs?: number;
}

export function useResizeObserver<T extends HTMLElement>(
  options: UseResizeObserverOptions = {}
) {
  const { debounceMs = 0 } = options;
  const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateDimensions = debounceMs > 0
      ? debounce((entries: ResizeObserverEntry[]) => {
          if (!entries[0]) return;
          setDimensions(entries[0].contentRect);
        }, debounceMs)
      : (entries: ResizeObserverEntry[]) => {
          if (!entries[0]) return;
          setDimensions(entries[0].contentRect);
        };

    try {
      observerRef.current = new ResizeObserver(
        updateDimensions as ResizeObserverCallback
      );
      observerRef.current.observe(element);
    } catch (error) {
      console.error('ResizeObserver error:', error);
    }

    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting ResizeObserver:', error);
        }
      }
    };
  }, [debounceMs]);

  return { ref: elementRef, dimensions };
} 