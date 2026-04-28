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
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-950 text-ink-950 shadow-sm ring-1 ring-ink-950/10 dark:ring-white/10",
          markClassName
        )}
      >
        <svg viewBox="0 0 36 36" role="img" className="h-full w-full" aria-label="向福星标识">
          <defs>
            <linearGradient id={gradientId} x1="7" y1="6" x2="30" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff7ad" />
              <stop offset="0.45" stopColor="#ffd84d" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="8" fill="currentColor" />
          <path
            d="M8.8 21c4.7-4.8 13.5-6.2 20-3.1M27.4 19.1c-4.8 4.8-13.5 6.2-20 3.1"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="1.35"
            opacity="0.45"
          />
          <path
            d="M18 6.8 21.2 14.1 29.2 14.8 23.2 20.1 24.9 27.9 18 23.8 11.1 27.9 12.8 20.1 6.8 14.8 14.8 14.1 18 6.8Z"
            fill={`url(#${gradientId})`}
            stroke="#fff2a8"
            strokeLinejoin="round"
            strokeWidth="0.7"
          />
          <path
            d="M16.4 11.6 18 8.1 19.6 11.6"
            fill="none"
            stroke="#fffbe6"
            strokeLinecap="round"
            strokeWidth="1.05"
            opacity="0.95"
          />
          <path
            d="M27.4 10.7c1.1.8 2 1.8 2.6 2.9M6.8 25.1c.9 1 2 1.8 3.4 2.4"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="1.35"
            opacity="0.7"
          />
          <circle cx="29" cy="13.9" r="1.45" fill="#fff7ad" />
          <circle cx="8.7" cy="24.7" r="1.2" fill="#ffd84d" />
        </svg>
      </span>
      {showText ? (
        <span className={cn("font-semibold tracking-normal text-ink-950 dark:text-white", textClassName)}>
          {text}
        </span>
      ) : null}
    </span>
  );
}
