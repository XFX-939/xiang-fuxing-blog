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
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { TOC } from "@/components/TOC";
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
      <ReadingProgressBar />
      <MobileFloatingTOC items={post.toc} />
      <ArticleBackToTop />
      <div className="mx-auto max-w-[75rem] px-5 py-9 sm:px-6 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-sm font-semibold text-secondary transition hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          返回文章索引
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,44rem)_14rem] lg:items-start lg:justify-between lg:gap-16">
          <article data-reading-surface className="mx-auto w-full max-w-[44rem] min-w-0 lg:mx-0">
            <header className="border-y border-border border-t-2 border-t-accent py-7 sm:py-9">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-[0.04em] text-muted">
                <Link
                  href={`/categories/${encodeURIComponent(post.category)}`}
                  className="font-semibold text-accent transition hover:opacity-70"
                >
                  {post.category}
                </Link>
                <span aria-hidden="true" className="text-border">━</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true" className="text-border">━</span>
                <span>{post.readingTime}</span>
              </div>
              <h1 className="mt-5 text-[clamp(2.25rem,5.2vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-primary">
                {post.title}
              </h1>
              <p className="mt-5 max-w-[40rem] text-base leading-8 text-secondary sm:text-lg sm:leading-9">{post.description}</p>
              <div className="mt-7 flex flex-col gap-5 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="border-b border-transparent pb-0.5 transition hover:border-accent hover:text-accent"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                <ArticleShare url={articleUrl} title={post.title} className="w-full sm:w-auto" />
              </div>
            </header>

            <div className="article-content prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-[-0.025em] prose-a:text-accent prose-blockquote:border-l-accent prose-h2:border-t prose-h2:border-border prose-h2:pt-9 dark:prose-invert sm:mt-12">
              {content}
            </div>
            <CodeBlockCopyButtons />
            <ArticleLike slug={post.slug} title={post.title} />

            <div className="mt-12">
              <ArticleConversion recommendedPosts={recommendedPosts} />
            </div>

            <nav className="mt-10 grid border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-border" aria-label="上一篇和下一篇文章">
              {older ? (
                <Link href={older.url} className="group border-b border-border px-1 py-5 transition hover:bg-accent-soft/40 sm:border-b-0 sm:px-4 sm:pl-1 sm:pr-6">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    上一篇
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-primary transition group-hover:text-accent">{older.title}</span>
                </Link>
              ) : <div />}
              {newer ? (
                <Link href={newer.url} className="group px-1 py-5 text-right transition hover:bg-accent-soft/40 sm:px-4 sm:pl-6 sm:pr-1">
                  <span className="flex items-center justify-end gap-2 text-xs font-medium text-muted">
                    下一篇
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-primary transition group-hover:text-accent">
                    {newer.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="hidden self-start lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <TOC items={post.toc} />
          </aside>
        </div>
      </div>
    </>
  );
}
