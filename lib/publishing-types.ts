export type ArticleMetadata = {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  slug: string;
};

export type ImportedMarkdown = {
  content: string;
  metadata: ArticleMetadata;
  warnings: string[];
};

/** A rendered heading and the 1-based source line it came from. */
export type HeadingAnchor = { id: string; line: number };
