import Link from "next/link";
import { Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function AuthorCard() {
  return (
    <section className="rounded-md border border-border bg-surface-elevated p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{siteConfig.author}</p>
          <p className="mt-2 text-sm leading-7 text-secondary">
            无线通信算法工程师，关注系统仿真、AI for RAN、研发效能和技术团队管理。
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent"
        >
          <Mail className="h-4 w-4" />
          了解作者
        </Link>
      </div>
    </section>
  );
}
