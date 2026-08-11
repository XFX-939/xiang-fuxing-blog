import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MobileNav } from "@/components/MobileNav";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UIVersionSwitch } from "@/components/UIVersionSwitch";
import { navItems } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#171816]/20 bg-[#f3eee4] text-[#171816] dark:border-white/15 dark:bg-[#0d141b] dark:text-[#f3eee4]">
      <div className="mx-auto flex h-[4.25rem] max-w-[90rem] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="返回首页"
          className="group inline-flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f15a29] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3eee4] dark:focus-visible:ring-offset-[#0d141b]"
        >
          <span className="h-8 w-[3px] bg-[#f15a29] transition-transform duration-300 group-hover:scale-y-75" aria-hidden="true" />
          <span className="grid leading-none">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-[#2d5d7f] dark:text-[#8db4cc]">
              Signal Field Notes
            </span>
            <span className="mt-1.5 text-[15px] font-bold tracking-[0.12em]">向福星</span>
          </span>
        </Link>

        <nav className="hidden h-full min-w-0 flex-1 items-stretch justify-center xl:flex" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <GlobalSearch className="hidden w-[clamp(13rem,20vw,19rem)] lg:block" />
          <UIVersionSwitch active="signal" className="hidden xl:inline-flex" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
