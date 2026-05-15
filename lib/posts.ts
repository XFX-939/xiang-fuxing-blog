import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import readingTime from "reading-time";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  draft?: boolean;
};

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export type Post = PostFrontmatter & {
  slug: string;
  readingTime: string;
  minutes: number;
  searchText: string;
  url: string;
};

export type PostListItem = Omit<Post, "searchText">;

export type PostWithContent = Post & {
  content: string;
  toc: TocItem[];
};

let postRecordsCache: PostWithContent[] | null = null;

function getMdxFiles() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .sort();
}

function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  return {
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "未分类"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    featured: Boolean(data.featured),
    draft: Boolean(data.draft)
  };
}

function fileToPost(file: string): PostWithContent {
  const slug = file.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, file);
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContent);
  const frontmatter = normalizeFrontmatter(data);
  const reading = readingTime(content, { wordsPerMinute: 300 });

  return {
    ...frontmatter,
    slug,
    content,
    toc: extractToc(content),
    readingTime: `${Math.max(1, Math.ceil(reading.minutes))} 分钟阅读`,
    minutes: reading.minutes,
    searchText: extractPlainText(content),
    url: `/blog/${slug}`
  };
}

function getPostRecords() {
  if (!postRecordsCache) {
    postRecordsCache = getMdxFiles()
      .map(fileToPost)
      .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  }

  return postRecordsCache;
}

export function toPostListItem(post: Post): PostListItem {
  const { searchText: _searchText, ...item } = post;
  return item;
}

export function getAllPosts(options: { includeDrafts?: boolean } = {}): Post[] {
  return getPostRecords()
    .filter((post) => options.includeDrafts || !post.draft)
    .map(({ content: _content, toc: _toc, ...post }) => post);
}

export function getAllPostListItems(options: { includeDrafts?: boolean } = {}): PostListItem[] {
  return getAllPosts(options).map(toPostListItem);
}

export function getPostBySlug(slug: string): PostWithContent | null {
  const decodedSlug = decodeURIComponent(slug);
  const post = getPostRecords().find((item) => item.slug === decodedSlug);

  if (!post) {
    return null;
  }

  return post.draft ? null : post;
}

export function getFeaturedPosts(limit = 3) {
  return getAllPosts()
    .filter((post) => post.featured)
    .slice(0, limit);
}

export function getLatestPosts(limit = 4) {
  return getAllPosts().slice(0, limit);
}

export function getAllTags() {
  const tagMap = new Map<string, number>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function getAllCategories() {
  const categoryMap = new Map<string, number>();

  for (const post of getAllPosts()) {
    categoryMap.set(post.category, (categoryMap.get(post.category) ?? 0) + 1);
  }

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function getPostsByTag(tag: string) {
  const decodedTag = decodeURIComponent(tag);
  return getAllPosts().filter((post) => post.tags.includes(decodedTag));
}

export function getPostsByCategory(category: string) {
  const decodedCategory = decodeURIComponent(category);
  return getAllPosts().filter((post) => post.category === decodedCategory);
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null
  };
}

export function getRecommendedPosts(currentPost: Post, limit = 3) {
  const currentTags = new Set(currentPost.tags);
  const candidates = getAllPosts().filter((post) => post.slug !== currentPost.slug);

  const scored = candidates
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => currentTags.has(tag)).length;
      const categoryScore = post.category === currentPost.category ? 2 : 0;

      return {
        post,
        score: sharedTags * 3 + categoryScore
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return Number(new Date(b.post.date)) - Number(new Date(a.post.date));
    })
    .map((item) => item.post);

  const recommended = [...scored];

  for (const post of candidates) {
    if (recommended.length >= limit) {
      break;
    }

    if (!recommended.some((item) => item.slug === post.slug)) {
      recommended.push(post);
    }
  }

  return recommended.slice(0, limit);
}

export function getArchiveGroups() {
  const groups = new Map<string, Post[]>();

  for (const post of getAllPosts()) {
    const date = new Date(post.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  return Array.from(groups.entries()).map(([key, posts]) => {
    const [year, month] = key.split("-");
    return {
      key,
      year,
      month,
      label: `${year} 年 ${Number(month)} 月`,
      posts
    };
  });
}

export function extractToc(content: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(content);
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  visit(tree, "heading", (node: any) => {
    if (node.depth < 2 || node.depth > 3) {
      return;
    }

    const text = extractNodeText(node);
    if (!text) {
      return;
    }

    toc.push({
      id: slugger.slug(text),
      text,
      depth: node.depth
    });
  });

  return toc;
}

export function extractPlainText(content: string): string {
  const tree = unified().use(remarkParse).parse(content);
  const parts: string[] = [];

  visit(tree, (node: any) => {
    if (typeof node.value === "string") {
      parts.push(node.value);
    }
  });

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function extractNodeText(node: any): string {
  if (!node) {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  if (Array.isArray(node.children)) {
    return node.children.map(extractNodeText).join("");
  }

  return "";
}
