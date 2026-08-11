import { siteConfig } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const footerContacts = [
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "GitHub", value: siteConfig.githubName, href: siteConfig.github, external: true },
  { label: "知乎", value: siteConfig.zhihuName, href: siteConfig.zhihu, external: true },
  { label: "小红书", value: siteConfig.xiaohongshuName, href: siteConfig.xiaohongshu, external: true }
];

export function Footer() {
  return (
    <footer className="border-t-4 border-[#f15a29] bg-[#171816] text-[#f3eee4]">
      <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(12rem,0.65fr)_minmax(16rem,0.85fr)] lg:gap-10 xl:gap-16">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8db4cc]">
              XFX · Signal Field Notes
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.25] tracking-[-0.035em] text-[#f7f1e7] sm:text-4xl lg:text-[2.75rem]">
              把复杂问题，写成可验证的系统判断。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#aaa9a2] sm:text-base">
              {siteConfig.siteDescription}
            </p>
            <Link
              href="/collaboration"
              className="group mt-8 inline-flex items-center gap-4 border-b border-[#f15a29] pb-2 text-sm font-bold text-[#f7f1e7] transition-colors hover:text-[#ff8a63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7043] focus-visible:ring-offset-4 focus-visible:ring-offset-[#171816]"
            >
              发起一次交流
              <ArrowUpRight className="h-4 w-4 text-[#ff7043] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-3 border-b border-white/20 pb-3">
              <span className="h-0.5 w-6 bg-[#f15a29]" aria-hidden="true" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8db4cc]">内容索引</p>
            </div>
            <div className="grid text-sm font-semibold text-[#c8c5bb]">
              {[
                ["/blog", "全部文章"],
                ["/archive", "文章归档"],
                ["/collaboration", "合作交流"],
                ["/categories", "分类索引"],
                ["/tags", "标签索引"]
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="border-b border-white/15 py-3 transition-colors hover:border-[#f15a29] hover:pl-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff7043]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 border-b border-white/20 pb-3">
              <span className="h-0.5 w-6 bg-[#f15a29]" aria-hidden="true" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8db4cc]">联系与关注</p>
            </div>
            <div className="grid text-sm text-[#c8c5bb]">
              {footerContacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.external ? "_blank" : undefined}
                  rel={contact.external ? "noreferrer" : undefined}
                  className="group grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] gap-3 border-b border-white/15 py-3 transition-colors hover:border-[#f15a29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff7043]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7898ad] group-hover:text-[#ff8a63]">
                    {contact.label}
                  </span>
                  <span className="min-w-0 break-words text-right group-hover:text-white">{contact.value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/20 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[#767a78] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.author}</span>
          <span>Independent research · Continuous notes</span>
        </div>
      </div>
    </footer>
  );
}
