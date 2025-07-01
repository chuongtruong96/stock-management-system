// Phase 4: Virtual Scrolling Hook for Performance
import { useState, useEffect, useCallback, useMemo } from 'react';

export const useVirtualScroll = ({
  items = [],
  itemHeight = 300,
  containerHeight = 600,
  overscan = 5,
  enabled = true
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!enabled || items.length === 0) {
      return { start: 0, end: items.length };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length, enabled]);

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!enabled) return items;
    
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index,
      style: {
        position: 'absolute',
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight, enabled]);

  // Total height for scrollbar
  const totalHeight = useMemo(() => {
    return enabled ? items.length * itemHeight : 'auto';
  }, [items.length, itemHeight, enabled]);

  // Scroll handler
  const handleScroll = useCallback((event) => {
    if (!enabled) return;
    setScrollTop(event.target.scrollTop);
  }, [enabled]);

  // Ref callback
  const setRef = useCallback((node) => {
    if (node) {
      setContainerRef(node);
      node.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (node) {
        node.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (!containerRef || !enabled) return;
    
    const targetScrollTop = index * itemHeight;
    containerRef.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }, [containerRef, itemHeight, enabled]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (!containerRef) return;
    
    containerRef.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [containerRef]);

  return {
    visibleItems,
    totalHeight,
    setRef,
    scrollToItem,
    scrollToTop,
    visibleRange,
    isVirtualized: enabled
  };
};