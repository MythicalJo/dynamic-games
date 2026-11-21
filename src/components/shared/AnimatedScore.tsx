import { useEffect, useRef, useState } from 'react';

interface AnimatedScoreProps {
  value: number;
  className?: string;
}

export function AnimatedScore({ value, className }: AnimatedScoreProps) {
  const [displayed, setDisplayed] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    const start = currentRef.current;
    const end = value;
    if (start === end) return;

    const duration = 520;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + (end - start) * eased);
      currentRef.current = next;
      setDisplayed(next);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = end;
        setDisplayed(end);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {displayed.toLocaleString()}
    </span>
  );
}
