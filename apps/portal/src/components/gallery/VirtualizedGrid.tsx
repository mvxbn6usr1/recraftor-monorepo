import React, { useMemo, useState } from 'react';
import { cn, calculateGridDimensions } from '@/lib/utils';
import { useResizeObserver } from '../../hooks/use-resize-observer';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemHeight: number;
  itemWidth: number;
  gap: number;
  className?: string;
  overscan?: number;
}

interface VisibleItem<T> {
  key: number;
  item: T;
  style: React.CSSProperties;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight,
  itemWidth,
  gap,
  className,
  overscan = 5
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const { ref, dimensions } = useResizeObserver<HTMLDivElement>({ debounceMs: 100 });

  const {
    visibleItems,
    gridStyles,
    containerStyles
  } = useMemo(() => {
    if (!dimensions) {
      return {
        visibleItems: [] as VisibleItem<T>[],
        gridStyles: {} as React.CSSProperties,
        containerStyles: {} as React.CSSProperties
      };
    }

    const { width, height } = dimensions;
    const { columns } = calculateGridDimensions(
      width,
      height,
      itemWidth,
      itemHeight,
      gap
    );

    const totalRows = Math.ceil(items.length / columns);
    const totalHeight = totalRows * (itemHeight + gap) - gap;

    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + height) / (itemHeight + gap)) + overscan
    );

    const visibleItems: VisibleItem<T>[] = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index >= items.length) break;

        const item = items[index];
        const top = row * (itemHeight + gap);
        const left = col * (itemWidth + gap);

        visibleItems.push({
          key: index,
          item,
          style: {
            position: 'absolute',
            top,
            left,
            width: itemWidth,
            height: itemHeight
          }
        });
      }
    }

    return {
      visibleItems,
      gridStyles: {
        position: 'relative',
        width: '100%',
        height: totalHeight,
        margin: '0 auto'
      } as React.CSSProperties,
      containerStyles: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto'
      } as React.CSSProperties
    };
  }, [dimensions, items, itemWidth, itemHeight, gap, scrollTop, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={ref}
      className={cn('virtualized-grid-container', className)}
      style={containerStyles}
      onScroll={handleScroll}
    >
      <div className="virtualized-grid" style={gridStyles}>
        {visibleItems.map(({ key, item, style }) => (
          <div key={key} style={style}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
} 