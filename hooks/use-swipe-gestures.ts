import { useRef, useEffect, useCallback } from 'react';
import { haptics } from '@/lib/haptics';

export interface SwipeDirection {
  x: number;
  y: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

export interface SwipeCallbacks {
  onSwipeLeft?: (data: SwipeDirection) => void;
  onSwipeRight?: (data: SwipeDirection) => void;
  onSwipeUp?: (data: SwipeDirection) => void;
  onSwipeDown?: (data: SwipeDirection) => void;
  onSwipeStart?: (touch: Touch) => void;
  onSwipeEnd?: (data: SwipeDirection) => void;
}

export interface SwipeOptions {
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  velocityThreshold?: number; // Minimum velocity to trigger swipe (default: 0.3)
  preventDefaultTouchmoveEvent?: boolean; // Prevent default touchmove behavior
  trackMouse?: boolean; // Also track mouse events for desktop testing
  enableHapticFeedback?: boolean; // Enable haptic feedback on swipe
  deltaThreshold?: number; // Minimum delta to start tracking (default: 10px)
}

export function useSwipeGestures(
  callbacks: SwipeCallbacks = {},
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
    enableHapticFeedback = true,
    deltaThreshold = 10,
  } = options;

  const touchRef = useRef<HTMLElement>(null);
  const startTouch = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentTouch = useRef<{ x: number; y: number; time: number } | null>(null);
  const isTracking = useRef(false);

  const calculateSwipeData = useCallback((
    start: { x: number; y: number; time: number },
    end: { x: number; y: number; time: number }
  ): SwipeDirection => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const time = end.time - start.time;
    const velocity = distance / time;

    let direction: SwipeDirection['direction'] = null;

    // Determine primary swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    return {
      x: deltaX,
      y: deltaY,
      direction,
      distance,
      velocity,
    };
  }, [threshold]);

  const handleStart = useCallback((clientX: number, clientY: number, touch?: Touch) => {
    startTouch.current = { x: clientX, y: clientY, time: Date.now() };
    currentTouch.current = { x: clientX, y: clientY, time: Date.now() };
    isTracking.current = false;

    if (callbacks.onSwipeStart && touch) {
      callbacks.onSwipeStart(touch);
    }
  }, [callbacks]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!startTouch.current) return;

    currentTouch.current = { x: clientX, y: clientY, time: Date.now() };

    // Check if we should start tracking (moved enough distance)
    if (!isTracking.current) {
      const deltaX = Math.abs(clientX - startTouch.current.x);
      const deltaY = Math.abs(clientY - startTouch.current.y);

      if (deltaX > deltaThreshold || deltaY > deltaThreshold) {
        isTracking.current = true;
        if (enableHapticFeedback) {
          haptics.selection(); // Light feedback when starting to track
        }
      }
    }
  }, [deltaThreshold, enableHapticFeedback]);

  const handleEnd = useCallback(() => {
    if (!startTouch.current || !currentTouch.current || !isTracking.current) {
      startTouch.current = null;
      currentTouch.current = null;
      isTracking.current = false;
      return;
    }

    const swipeData = calculateSwipeData(startTouch.current, currentTouch.current);

    // Check velocity threshold
    if (swipeData.velocity < velocityThreshold && swipeData.distance < threshold * 1.5) {
      startTouch.current = null;
      currentTouch.current = null;
      isTracking.current = false;
      return;
    }

    // Trigger appropriate callback
    if (swipeData.direction) {
      if (enableHapticFeedback) {
        haptics.light(); // Feedback on successful swipe
      }

      switch (swipeData.direction) {
        case 'left':
          callbacks.onSwipeLeft?.(swipeData);
          break;
        case 'right':
          callbacks.onSwipeRight?.(swipeData);
          break;
        case 'up':
          callbacks.onSwipeUp?.(swipeData);
          break;
        case 'down':
          callbacks.onSwipeDown?.(swipeData);
          break;
      }
    }

    if (callbacks.onSwipeEnd) {
      callbacks.onSwipeEnd(swipeData);
    }

    // Reset
    startTouch.current = null;
    currentTouch.current = null;
    isTracking.current = false;
  }, [calculateSwipeData, velocityThreshold, threshold, enableHapticFeedback, callbacks]);

  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, touch);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (preventDefaultTouchmoveEvent && isTracking.current) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    // Mouse event handlers (for desktop testing)
    const handleMouseDown = (e: MouseEvent) => {
      if (!trackMouse) return;
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackMouse) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      if (!trackMouse) return;
      handleEnd();
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);

      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [handleStart, handleMove, handleEnd, preventDefaultTouchmoveEvent, trackMouse]);

  return touchRef;
}

// Convenience hook for simple directional swipes
export function useSimpleSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options?: SwipeOptions
) {
  return useSwipeGestures({
    onSwipeLeft: onSwipeLeft ? () => onSwipeLeft() : undefined,
    onSwipeRight: onSwipeRight ? () => onSwipeRight() : undefined,
    onSwipeUp: onSwipeUp ? () => onSwipeUp() : undefined,
    onSwipeDown: onSwipeDown ? () => onSwipeDown() : undefined,
  }, options);
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  options: SwipeOptions & { refreshThreshold?: number } = {}
) {
  const { refreshThreshold = 80, ...swipeOptions } = options;

  return useSwipeGestures({
    onSwipeDown: async (data) => {
      if (data.distance > refreshThreshold) {
        if (swipeOptions.enableHapticFeedback !== false) {
          await haptics.success();
        }
        await onRefresh();
      }
    },
  }, {
    threshold: refreshThreshold,
    ...swipeOptions,
  });
}
