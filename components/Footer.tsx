import { Logo } from "@/components/Logo";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

const footerContacts = [
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "GitHub", value: siteConfig.githubName, href: siteConfig.github, external: true },
  { label: "知乎", value: siteConfig.zhihuName, href: siteConfig.zhihu, external: true },
  { label: "小红书", value: siteConfig.xiaohongshuName, href: siteConfig.xiaohongshu, external: true },
  { label: "抖音", value: siteConfig.douyinName, href: siteConfig.douyin, external: true }
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/70 dark:border-ink-800 dark:bg-ink-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo text={siteConfig.siteName} gradientId="logo-signal-footer" markClassName="h-8 w-8" textClassName="text-sm" />
          <p className="mt-3 max-w-xl text-sm leading-7 text-ink-600 dark:text-ink-300">
            {siteConfig.siteDescription}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-950 dark:text-white">内容</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-600 dark:text-ink-300">
            <Link href="/blog" className="hover:text-signal-700 dark:hover:text-signal-300">
              全部文章
            </Link>
            <Link href="/archive" className="hover:text-signal-700 dark:hover:text-signal-300">
              文章归档
            </Link>
            <Link href="/categories" className="hover:text-signal-700 dark:hover:text-signal-300">
              分类索引
            </Link>
            <Link href="/tags" className="hover:text-signal-700 dark:hover:text-signal-300">
              标签索引
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-950 dark:text-white">联系</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-600 dark:text-ink-300">
            {footerContacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noreferrer" : undefined}
                className="hover:text-signal-700 dark:hover:text-signal-300"
              >
                {contact.label}：{contact.value}
              </a>
            ))}
            <span>微信：{siteConfig.wechat}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 text-xs text-ink-500 sm:px-6 dark:text-ink-400">
        <span>© {new Date().getFullYear()} {siteConfig.author}</span>
      </div>
    </footer>
  );
}
