import { Mail, Send } from "lucide-react";
import type { Post } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { RecommendedArticles } from "@/components/RecommendedArticles";

type ArticleConversionProps = {
  recommendedPosts: Post[];
};

export function ArticleConversion({ recommendedPosts }: ArticleConversionProps) {
  return (
    <section className="rounded-md border border-border bg-surface-elevated p-5" aria-label="交流和推荐文章">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Connect</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-primary">
            持续跟踪通信仿真、AI 辅助研发与技术管理
          </h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            如果你也关注系统仿真、AI for RAN、研发效能和团队管理，欢迎通过邮件交流具体问题和实践经验。
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent hover:text-white"
            >
              <Mail className="h-4 w-4" />
              邮件交流
            </a>
          </div>

          <div className="mt-5 rounded-md border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <Send className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-sm leading-7 text-secondary">
                也欢迎围绕仿真平台、AI Coding 落地、技术团队管理等主题交流具体问题和实践经验。
              </p>
            </div>
          </div>
        </div>

        <RecommendedArticles posts={recommendedPosts} />
      </div>
    </section>
  );
}
