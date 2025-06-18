'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { University } from '@/lib/constants/universities';

const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
): number => {
  const get = () => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return defaultValue;
    return (
      values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue
    );
  };

  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    setValue(get());

    const handler = () => setValue(get());
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () =>
      queries.forEach(q =>
        matchMedia(q).removeEventListener('change', handler)
      );
  }, [queries]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = globalThis.Image
            ? new globalThis.Image()
            : document.createElement('img');
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

interface UniversityMasonryItem extends University {
  id: string;
  bannerPath: string;
  height: number;
}

interface UniversityMasonryProps {
  universities: University[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  startAnimation?: boolean;
}

const UniversityMasonry: React.FC<UniversityMasonryProps> = ({
  universities,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.1,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 1.05,
  blurToFocus = true,
  colorShiftOnHover = false,
  startAnimation = true,
}) => {
  // Responsive columns: 2 on mobile, 4 on desktop
  const columns = useMedia(
    ['(min-width: 1024px)'], // lg and up - 4 columns
    [4],
    2 // mobile - 1 column
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);

  // Convert universities to masonry items with banner paths
  const items: UniversityMasonryItem[] = useMemo(
    () =>
      universities.map(university => {
        // Always use banner images for consistency
        const imagePath = `/images/universities/${university.name}-banner.png`;

        return {
          ...university,
          id: university.name,
          bannerPath: imagePath,
          height: 200, // Fixed height for banner images
        };
      }),
    [universities]
  );

  const getInitialPosition = (item: any) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[
        Math.floor(Math.random() * dirs.length)
      ] as typeof animateFrom;
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map(i => i.bannerPath)).then(() =>
      setImagesReady(true)
    );
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    const gap = 16; // 16px gap between items

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = (columnWidth + gap) * col;
      const itemWidth = columnWidth - gap;
      // Responsive height: smaller on mobile for better proportions
      const height = columns === 2 ? 120 : 140; // Mobile: 120px, Desktop: 140px
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: itemWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !startAnimation) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' }),
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger,
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto',
        });
      }
    });

    hasMounted.current = true;
  }, [
    grid,
    imagesReady,
    startAnimation,
    stagger,
    animateFrom,
    blurToFocus,
    duration,
    ease,
  ]);

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  // Calculate container height based on grid
  const containerHeight = useMemo(() => {
    if (grid.length === 0) return 'auto';
    const maxHeight = Math.max(...grid.map(item => item.y + item.h));
    return maxHeight + 32; // Add some padding
  }, [grid]);

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto"
      style={{ height: containerHeight }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute cursor-pointer"
          style={{
            willChange: 'transform, width, height, opacity',
            opacity: startAnimation && hasMounted.current ? 1 : 0,
          }}
          onClick={() =>
            window.open(item.website, '_blank', 'noopener,noreferrer')
          }
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          <div className="relative w-full h-full overflow-hidden rounded-lg bg-[#ced4da] border-2 border-darkNavy flex items-center justify-center ">
            <Image
              src={item.bannerPath}
              alt={item.displayName}
              width={200}
              height={80}
              className="object-contain max-w-full max-h-full text-pgi-light-blue"
              style={{
                objectPosition: 'center',
                maxWidth: '90%',
                maxHeight: '100%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UniversityMasonry;
