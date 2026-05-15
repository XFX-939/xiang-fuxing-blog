import { NextResponse } from "next/server";
import { getAllPosts, toPostListItem } from "@/lib/posts";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
  const terms = query.split(/\s+/).filter(Boolean);

  const posts = getAllPosts().filter((post) => {
    if (category && post.category !== category) {
      return false;
    }

    if (tag && !post.tags.includes(tag)) {
      return false;
    }

    if (terms.length === 0) {
      return true;
    }

    const haystack = [post.title, post.description, post.category, post.searchText, ...post.tags]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });

  const results = posts.map(toPostListItem);

  return NextResponse.json(
    {
      posts: limit ? results.slice(0, limit) : results,
      total: results.length
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
    }
  );
}
