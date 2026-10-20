import { useEffect, useRef, type ReactNode } from 'react';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  className?: string;
}

export default function Modal({ children, onClose, labelledBy, className = 'max-w-md' }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
    gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: 32, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: EASE_OUT }
    );
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div ref={backdropRef} className="absolute inset-0 bg-dark-900/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-4xl border border-white bg-[#fbf9f4] shadow-elevated ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
