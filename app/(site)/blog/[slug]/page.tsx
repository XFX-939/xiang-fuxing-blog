import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ArticleConversion } from "@/components/ArticleConversion";
import { ArticleBackToTop } from "@/components/ArticleBackToTop";
import { ArticleLike } from "@/components/ArticleLike";
import { ArticleShare } from "@/components/ArticleShare";
import { CodeBlockCopyButtons } from "@/components/CodeBlockCopyButtons";
import { mdxComponents } from "@/components/MDXComponents";
import { MobileFloatingTOC } from "@/components/MobileFloatingTOC";
import { ReadingProgressBar } from "@/components/classic/ReadingProgressBar";
import { TagList } from "@/components/classic/TagList";
import { TOC } from "@/components/classic/TOC";
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRecommendedPosts } from "@/lib/posts";
import { absoluteUrl, createMetadata, formatDate } from "@/lib/utils";

type BlogDetailProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug
  }));
}

export function generateMetadata({ params }: BlogDetailProps): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return createMetadata({
      title: "文章不存在",
      description: "文章不存在或已被移除。"
    });
  }

  return createMetadata({
    title: post.title,
    description: post.description,
    path: post.url,
    type: "article",
    publishedTime: post.date,
    tags: post.tags
  });
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { newer, older } = getAdjacentPosts(post.slug);
  const recommendedPosts = getRecommendedPosts(post, 3);
  const articleUrl = absoluteUrl(post.url);
  const openingSections = post.toc.filter((item) => item.depth === 2).slice(0, 4);
  const { content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeKatex,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor-heading"]
              }
            }
          ],
          [
            rehypePrettyCode,
            {
              theme: {
                dark: "github-dark",
                light: "github-light"
              },
              keepBackground: false,
              defaultLang: {
                block: "text",
                inline: "text"
              }
            }
          ]
        ]
      }
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { "@type": "Person", name: "向福星" },
            mainEntityOfPage: articleUrl,
            image: absoluteUrl("/images/xiang-fuxing-profile.jpg")
          })
        }}
      />
      <ReadingProgressBar />
      <MobileFloatingTOC items={post.toc} />
      <ArticleBackToTop />
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6 sm:py-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-accent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回博客列表
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,720px)_260px] lg:items-start lg:justify-between">
          <article
            data-reading-surface
            className="mx-auto w-full max-w-[42.5rem] min-w-0 lg:mx-0 lg:max-w-none"
          >
            <header className="border-b border-border pb-8">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="font-medium text-accent">{post.category}</span>
                <span>·</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>向福星</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h1 className="mt-4 text-[32px] font-semibold leading-[1.22] tracking-[-0.02em] text-primary sm:text-4xl sm:tracking-normal">
                {post.title}
              </h1>
              <p className="mt-4 text-[15px] leading-8 text-secondary sm:text-base sm:leading-9">{post.description}</p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TagList tags={post.tags} maxVisible={5} getHref={(tag) => `/tags/${encodeURIComponent(tag)}`} />
                <ArticleShare url={articleUrl} title={post.title} className="w-full sm:w-auto" />
              </div>
            </header>

            <aside
              className="article-overview mt-6 border-l-2 border-accent bg-accent-soft px-4 py-4 sm:px-5 sm:py-5"
              aria-labelledby="article-overview-title"
            >
              <h2 id="article-overview-title" className="text-base font-semibold text-primary">
                本文要点
              </h2>
              <p className="mt-2 text-sm leading-7 text-secondary">{post.description}</p>
              {openingSections.length > 0 ? (
                <div className="mt-4 border-t border-border/70 pt-3">
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted">阅读结构</p>
                  <ol className="mt-2 grid gap-1.5 text-sm leading-6 text-secondary sm:grid-cols-2 sm:gap-x-5">
                    {openingSections.map((item, index) => (
                      <li key={item.id}>
                        <a className="inline-flex min-h-11 items-center gap-2 py-2 font-medium text-accent underline-offset-4 hover:underline" href={`#${item.id}`}>
                          <span className="font-mono text-xs text-muted" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </aside>

            <div className="article-content prose prose-slate mt-8 max-w-none dark:prose-invert">
              {content}
            </div>
            <CodeBlockCopyButtons />
            <ArticleLike slug={post.slug} title={post.title} />

            <div className="mt-12">
              <ArticleConversion recommendedPosts={recommendedPosts} />
            </div>

            <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="上一篇和下一篇文章">
              {older ? (
                <Link href={older.url} className="rounded-md border border-border bg-surface p-4 transition hover:border-accent">
                  <span className="text-xs text-muted">上一篇</span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-primary">{older.title}</span>
                </Link>
              ) : <div />}
              {newer ? (
                <Link href={newer.url} className="rounded-md border border-border bg-surface p-4 text-right transition hover:border-accent">
                  <span className="text-xs text-muted">下一篇</span>
                  <span className="mt-2 flex items-center justify-end gap-2 text-sm font-semibold leading-6 text-primary">
                    {newer.title}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="hidden self-start lg:sticky lg:top-32 lg:block lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <TOC items={post.toc} />
          </aside>
        </div>
      </div>
    </>
  );
}
