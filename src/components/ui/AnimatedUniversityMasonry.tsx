'use client';

import React, { useState, useRef, useEffect } from 'react';
import UniversityMasonry from './UniversityMasonry';
import { University } from '@/lib/constants/universities';

interface AnimatedUniversityMasonryProps {
  universities: University[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  threshold?: number;
}

const AnimatedUniversityMasonry: React.FC<AnimatedUniversityMasonryProps> = ({
  universities,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.1,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 1.05,
  blurToFocus = true,
  colorShiftOnHover = false,
  threshold = 0.2,
}) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          // Once animation is triggered, we can disconnect the observer
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, isInView]);

  return (
    <div ref={containerRef}>
      <UniversityMasonry
        universities={universities}
        ease={ease}
        duration={duration}
        stagger={stagger}
        animateFrom={animateFrom}
        scaleOnHover={scaleOnHover}
        hoverScale={hoverScale}
        blurToFocus={blurToFocus}
        colorShiftOnHover={colorShiftOnHover}
        startAnimation={isInView}
      />
    </div>
  );
};

export default AnimatedUniversityMasonry;
