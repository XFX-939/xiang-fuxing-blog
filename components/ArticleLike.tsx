"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type ArticleLikeProps = {
  slug: string;
  title: string;
};

type LikeResponse = {
  slug: string;
  count: number;
};

export function ArticleLike({ slug, title }: ArticleLikeProps) {
  const storageKey = useMemo(() => `xiang-fuxing-blog-liked:${slug}`, [slug]);
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    setLiked(window.localStorage.getItem(storageKey) === "1");

    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store"
    })
      .then((response) => response.json() as Promise<LikeResponse>)
      .then((data) => {
        if (active) {
          setCount(data.count ?? 0);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug, storageKey]);

  async function handleLike() {
    if (liked || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        throw new Error("Failed to like article.");
      }

      const data = (await response.json()) as LikeResponse;
      setCount(data.count ?? count + 1);
      setLiked(true);
      window.localStorage.setItem(storageKey, "1");
    } catch (error) {
      setCount((value) => Math.max(0, value));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-md border border-border bg-surface-elevated p-5 text-center" aria-label="文章点赞">
      <p className="text-sm leading-7 text-secondary">
        如果这篇文章对你有帮助，可以给它点个赞。
      </p>
      <button
        type="button"
        onClick={handleLike}
        disabled={liked || submitting}
        aria-label={`点赞文章：${title}`}
        className={cn(
          "mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition",
          "hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft",
          liked && "border-accent bg-accent-soft text-accent",
          submitting && "cursor-wait opacity-75"
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        <span>{liked ? "已点赞" : submitting ? "点赞中" : "点赞"}</span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
          {loading ? "..." : count}
        </span>
      </button>
    </section>
  );
}
