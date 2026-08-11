import { cn } from "@/lib/utils";

type LogoProps = {
  showText?: boolean;
  text?: string;
  gradientId?: string;
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function Logo({
  showText = true,
  text = "向福星",
  gradientId = "logo-signal",
  className,
  markClassName,
  textClassName
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center border border-primary bg-primary text-bg",
          markClassName
        )}
      >
        <svg viewBox="0 0 36 36" role="img" className="h-full w-full" aria-label="向福星标识">
          <defs>
            <linearGradient id={gradientId} x1="7" y1="7" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffb090" />
              <stop offset="1" stopColor="#e35d32" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" fill="transparent" />
          <path
            d="M7 12.5h5l2.2-4 4.2 19 3.2-12 2.2 5H29"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.1"
          />
          <circle cx="7" cy="12.5" r="1.35" fill="#ffb090" />
          <circle cx="29" cy="20.5" r="1.35" fill="#e35d32" />
        </svg>
      </span>
      {showText ? (
        <span className={cn("font-display font-semibold tracking-[-0.02em] text-primary", textClassName)}>
          {text}
        </span>
      ) : null}
    </span>
  );
}
