import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to detect when an element scrolls into the viewport.
 * @param {Object} options IntersectionObserver options
 * @returns [ref, isVisible]
 */
export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback if IntersectionObserver is unsupported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.once !== false) {
          observer.unobserve(element);
        }
      } else if (options.once === false) {
        setIsVisible(false);
      }
    }, {
      threshold: options.threshold || 0.15,
      rootMargin: options.rootMargin || '0px 0px -40px 0px',
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isVisible];
};

/**
 * ScrollReveal Wrapper Component for declarative scroll animations.
 */
export const ScrollReveal = ({
  children,
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in'
  delay = 0,
  duration = 700,
  threshold = 0.12,
  className = '',
  as: Component = 'div',
  ...rest
}) => {
  const [ref, isVisible] = useScrollReveal({ threshold });

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-down':
        return 'reveal-fade-down';
      case 'fade-left':
        return 'reveal-fade-left';
      case 'fade-right':
        return 'reveal-fade-right';
      case 'zoom-in':
        return 'reveal-zoom-in';
      case 'fade-up':
      default:
        return 'reveal-fade-up';
    }
  };

  const style = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <Component
      ref={ref}
      style={style}
      className={`reveal-init ${getAnimationClass()} ${isVisible ? 'revealed' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
