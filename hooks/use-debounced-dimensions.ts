import { useState, useEffect, useCallback, RefObject } from 'react';
import { useDebounce } from './use-debounce';

interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: RefObject<HTMLElement>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { offsetWidth, offsetHeight } = ref.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [ref]);

  const debouncedUpdateDimensions = useDebounce(updateDimensions, 100);

  useEffect(() => {
    updateDimensions(); // Initial call

    const resizeObserver = new ResizeObserver(debouncedUpdateDimensions);

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, debouncedUpdateDimensions, updateDimensions]);

  return dimensions;
}
