import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path = "") {
  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalizedPath}`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export function formatMonth(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(date));
}

export function createMetadata({
  title,
  description,
  path = "/",
  type = "website",
  publishedTime,
  tags
}: {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
} = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.siteName}`
    : siteConfig.siteName;
  const pageDescription = description ?? siteConfig.siteDescription;
  const url = absoluteUrl(path);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: url
    },
    keywords: [...siteConfig.keywords, ...(tags ?? [])],
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: siteConfig.siteName,
      locale: "zh_CN",
      type,
      publishedTime,
      authors: [siteConfig.author],
      tags
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription
    }
  };
}
