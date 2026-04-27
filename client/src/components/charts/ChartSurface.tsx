import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ChartSurfaceProps {
  children: ReactNode;
  className?: string;
}

export default function ChartSurface({ children, className = '' }: ChartSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setIsReady(width > 0 && height > 0);
    };

    updateSize();

    const frameId = window.requestAnimationFrame(updateSize);
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isReady ? children : null}
    </div>
  );
}
