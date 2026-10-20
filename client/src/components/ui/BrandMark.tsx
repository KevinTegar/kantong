interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = 'h-7 w-7' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#181715" />
      <path d="M5 11.5a7 7 0 0 0 14 0z" fill="#f4c63d" />
    </svg>
  );
}
