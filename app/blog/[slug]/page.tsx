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
import { AuthorCard } from "@/components/AuthorCard";
import { CodeBlockCopyButtons } from "@/components/CodeBlockCopyButtons";
import { mdxComponents } from "@/components/MDXComponents";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { Tag } from "@/components/Tag";
import { TOC } from "@/components/TOC";
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRecommendedPosts } from "@/lib/posts";
import { createMetadata, formatDate } from "@/lib/utils";

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
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6 sm:py-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition hover:text-signal-700 dark:text-ink-300 dark:hover:text-signal-300">
          <ArrowLeft className="h-4 w-4" />
          返回博客列表
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,720px)_260px] lg:items-start lg:justify-between">
          <article className="mx-auto max-w-[42.5rem] min-w-0 lg:mx-0 lg:max-w-none">
            <header className="border-b border-ink-200 pb-8 dark:border-ink-800">
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
                <span className="font-medium text-signal-700 dark:text-signal-300">{post.category}</span>
                <span>·</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-ink-950 sm:text-4xl dark:text-white">
                {post.title}
              </h1>
              <p className="mt-4 text-base leading-9 text-ink-600 dark:text-ink-300">{post.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </header>

            <div className="mt-8 lg:hidden">
              <TOC items={post.toc} compact />
            </div>

            <div className="article-content prose prose-slate mt-8 max-w-none dark:prose-invert">
              {content}
            </div>
            <CodeBlockCopyButtons />

            <div className="mt-12">
              <ArticleConversion recommendedPosts={recommendedPosts} />
            </div>

            <div className="mt-8">
              <AuthorCard />
            </div>

            <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="上一篇和下一篇文章">
              {older ? (
                <Link href={older.url} className="rounded-md border border-ink-200 bg-white p-4 transition hover:border-signal-300 dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700">
                  <span className="text-xs text-ink-500 dark:text-ink-400">上一篇</span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-ink-900 dark:text-white">{older.title}</span>
                </Link>
              ) : <div />}
              {newer ? (
                <Link href={newer.url} className="rounded-md border border-ink-200 bg-white p-4 text-right transition hover:border-signal-300 dark:border-ink-800 dark:bg-ink-950 dark:hover:border-signal-700">
                  <span className="text-xs text-ink-500 dark:text-ink-400">下一篇</span>
                  <span className="mt-2 flex items-center justify-end gap-2 text-sm font-semibold leading-6 text-ink-900 dark:text-white">
                    {newer.title}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="hidden lg:block">
            <TOC items={post.toc} />
          </aside>
        </div>
      </div>
    </>
  );
}
