import { useEffect, useState } from 'react';

export const useIntersection = (elements: HTMLElement[], rootMargin: string) => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observerOptions = {
      root: null,
      rootMargin,
      threshold: 0.1
    };

    elements.forEach(element => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          setVisibleElements(prev => {
            const next = new Set(prev);
            const category = element.id;
            if (entry.isIntersecting) {
              next.add(category);
            } else {
              next.delete(category);
            }
            return next;
          });
        });
      }, observerOptions);

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [elements, rootMargin]);

  return visibleElements;
};