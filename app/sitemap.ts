import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { topicHubs } from "@/lib/topics";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/blog", "/projects", "/methodology", "/archive", "/categories", "/tags"].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date()
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.date)
  }));

  const tagRoutes = getAllTags().map((tag) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(tag.name)}`),
    lastModified: new Date()
  }));

  const categoryRoutes = getAllCategories().map((category) => ({
    url: absoluteUrl(`/categories/${encodeURIComponent(category.name)}`),
    lastModified: new Date()
  }));

  const topicRoutes = topicHubs.map((topic) => ({
    url: absoluteUrl(topic.href),
    lastModified: new Date()
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes, ...categoryRoutes, ...topicRoutes].map((item) => ({
    ...item,
    changeFrequency: "weekly",
    priority: item.url === siteConfig.siteUrl ? 1 : 0.7
  }));
}
