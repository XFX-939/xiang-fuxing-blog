import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { topicHubs } from "@/lib/topics";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/blog", "/projects", "/collaboration", "/methodology", "/archive", "/categories", "/tags"].map((route) => ({
    url: absoluteUrl(route),
    lastModified: undefined
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.date)
  }));

  const tagRoutes = getAllTags().map((tag) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(tag.name)}`),
    lastModified: undefined
  }));

  const categoryRoutes = getAllCategories().map((category) => ({
    url: absoluteUrl(`/categories/${encodeURIComponent(category.name)}`),
    lastModified: undefined
  }));

  const topicRoutes = topicHubs.map((topic) => ({
    url: absoluteUrl(topic.href),
    lastModified: undefined
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes, ...categoryRoutes, ...topicRoutes].map((item) => ({
    ...item,
    changeFrequency: "weekly",
    priority: item.url === siteConfig.siteUrl ? 1 : 0.7
  }));
}
