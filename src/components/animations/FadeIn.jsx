import { useState, useEffect, useRef } from 'react';

const FadeIn = ({ children, delay = 0, className = "", direction = "up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 opacity-100';
    if (direction === 'up') return 'translate-y-20 opacity-0';
    if (direction === 'left') return '-translate-x-20 opacity-0';
    if (direction === 'right') return 'translate-x-20 opacity-0';
    return 'translate-y-20 opacity-0';
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${getTransform()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
