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
