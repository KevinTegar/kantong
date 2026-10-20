import { useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

export interface AccordionItem {
  id: string;
  title: string;
  meta?: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

function AccordionRow({
  item,
  open,
  onToggle,
}: {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const isFirstRun = useRef(true);

  useGSAP(() => {
    const instant = isFirstRun.current || prefersReducedMotion();
    isFirstRun.current = false;

    gsap.to(contentRef.current, {
      height: open ? 'auto' : 0,
      autoAlpha: open ? 1 : 0,
      duration: instant ? 0 : 0.45,
      ease: 'power3.inOut',
      overwrite: true,
    });
    gsap.to(iconRef.current, {
      rotation: open ? 180 : 0,
      duration: instant ? 0 : 0.35,
      ease: 'power2.out',
      overwrite: true,
    });
  }, { dependencies: [open] });

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
      >
        <span className="text-sm font-medium text-dark-800">{item.title}</span>
        <span className="flex items-center gap-2 text-dark-400">
          {item.meta}
          <span ref={iconRef} className="inline-flex">
            <ChevronDown className="h-4 w-4" />
          </span>
        </span>
      </button>
      <div ref={contentRef} className="overflow-hidden" style={{ height: 0 }}>
        <div className="pb-4">{item.content}</div>
      </div>
    </div>
  );
}

export default function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className="divide-y divide-dark-100">
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
