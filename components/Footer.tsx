import { Logo } from "@/components/Logo";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

const footerContacts = [
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "GitHub", value: siteConfig.githubName, href: siteConfig.github, external: true },
  { label: "知乎", value: siteConfig.zhihuName, href: siteConfig.zhihu, external: true },
  { label: "小红书", value: siteConfig.xiaohongshuName, href: siteConfig.xiaohongshu, external: true }
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo text={siteConfig.siteName} gradientId="logo-signal-footer" markClassName="h-8 w-8" textClassName="text-sm" />
          <p className="mt-3 max-w-xl text-sm leading-7 text-secondary">
            {siteConfig.siteDescription}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">内容</p>
          <div className="mt-3 grid gap-2 text-[13px] leading-6 text-secondary sm:text-sm">
            <Link href="/blog" className="hover:text-accent">
              全部文章
            </Link>
            <Link href="/archive" className="hover:text-accent">
              文章归档
            </Link>
            <Link href="/categories" className="hover:text-accent">
              分类索引
            </Link>
            <Link href="/tags" className="hover:text-accent">
              标签索引
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">联系</p>
          <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-[13px] leading-6 text-secondary min-[430px]:grid-cols-2 sm:grid-cols-1 sm:text-sm">
            {footerContacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noreferrer" : undefined}
                className="min-w-0 break-words hover:text-accent"
              >
                {contact.label}：{contact.value}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-8 text-xs text-muted sm:px-6">
        <span>© {new Date().getFullYear()} {siteConfig.author}</span>
      </div>
    </footer>
  );
}
