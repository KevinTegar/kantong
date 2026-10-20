import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  panelClassName?: string;
  // Below `sm`, pin the panel to both viewport edges instead of the trigger
  fullWidthOnMobile?: boolean;
}

export default function Popover({
  trigger,
  children,
  align = 'right',
  panelClassName = 'w-72',
  fullWidthOnMobile = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useGSAP(() => {
    if (!open || !panelRef.current || prefersReducedMotion()) return;

    gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: -8, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: EASE_OUT }
    );
  }, { dependencies: [open] });

  const anchored = align === 'right' ? 'absolute top-full right-0 origin-top-right' : 'absolute top-full left-0 origin-top-left';
  // `fixed` with `top: auto` keeps its static position (just below the trigger) while spanning the viewport
  const position = fullWidthOnMobile
    ? 'fixed inset-x-4 origin-top sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:origin-top-right'
    : anchored;

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          ref={panelRef}
          className={`z-50 mt-2 max-w-[calc(100vw-2rem)] rounded-3xl border border-white bg-white/95 p-2 shadow-elevated backdrop-blur-xl ${position} ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
