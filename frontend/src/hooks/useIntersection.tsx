import { useEffect, useState } from 'react';

export const useIntersection = (elements: HTMLElement[], rootMargin: string) => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const [visibilityPercentages, setVisibilityPercentages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!elements.length) return;
    
    // Create thresholds at 5% increments for smoother animations
    const thresholds = Array.from({ length: 21 }, (_, i) => i * 0.05);
    
    const observerOptions = {
      root: null,
      rootMargin,
      threshold: thresholds
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        const category = element.id;
        
        if (!category) {
          console.warn('Element without ID detected in intersection observer', element);
          return;
        }
        
        // Calculate how visible the element is (as a percentage)
        const visibilityRatio = entry.intersectionRatio;
        
        setVisibilityPercentages(prev => ({
          ...prev,
          [category]: Math.round(visibilityRatio * 100)
        }));
        
        setVisibleElements(prev => {
          const next = new Set(prev);
          if (entry.isIntersecting) {
            next.add(category);
          } else {
            next.delete(category);
          }
          return next;
        });
      });
    }, observerOptions);

    // Add each element to the same observer
    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [elements, rootMargin]);

  return { visibleElements, visibilityPercentages };
};