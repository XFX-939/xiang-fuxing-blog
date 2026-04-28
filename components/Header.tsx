import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navItems } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/86 backdrop-blur-xl dark:border-ink-800/80 dark:bg-ink-950/82">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-950">
          <Logo text="向福星" gradientId="logo-signal-header" textClassName="hidden sm:inline" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
