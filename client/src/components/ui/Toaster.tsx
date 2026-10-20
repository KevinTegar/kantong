import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import { useToastStore, type Toast } from '../../store/useToastStore';

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduced = prefersReducedMotion();

    gsap.timeline({ onComplete: () => dismiss(toast.id) })
      .fromTo(
        ref.current,
        { autoAlpha: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }
      )
      .to(ref.current, { autoAlpha: 0, y: reduced ? 0 : 12, duration: 0.3, ease: 'power2.in' }, '+=2.6');
  });

  return (
    <div
      ref={ref}
      role="status"
      className="flex items-center gap-2 rounded-full bg-dark-900 px-4 py-2.5 text-sm text-white shadow-elevated"
    >
      <span className="h-2 w-2 rounded-full bg-primary-400" />
      {toast.message}
    </div>
  );
}

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
