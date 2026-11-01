import "server-only";

import { createHash } from "node:crypto";
import { pinyin } from "pinyin-pro";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_SLUGS = new Set(["constructor", "prototype", "__proto__"]);
export const MAX_AUTOMATIC_SLUG_LENGTH = 60;
// CJK Unified Ideographs, Extension A and Compatibility Ideographs.
const HAN_RUN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g;

function asciiWords(text: string): string[] {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function truncate(slug: string): string {
  if (slug.length <= MAX_AUTOMATIC_SLUG_LENGTH) return slug;
  const boundary = slug.lastIndexOf("-", MAX_AUTOMATIC_SLUG_LENGTH);
  return (boundary > 0 ? slug.slice(0, boundary) : slug.slice(0, MAX_AUTOMATIC_SLUG_LENGTH)).replace(/-+$/, "");
}

/** Readable URL words: Chinese becomes toneless pinyin (ü as v); Latin letters and digits are kept. */
export function slugFromTitle(title: string): string {
  const words: string[] = [];
  let cursor = 0;
  for (const match of title.matchAll(HAN_RUN)) {
    const start = match.index ?? 0;
    words.push(...asciiWords(title.slice(cursor, start)));
    // Whole runs keep phrase context, so polyphonic characters read naturally.
    for (const syllable of pinyin(match[0], { toneType: "none", type: "array" })) {
      words.push(...asciiWords(syllable.replace(/ü/g, "v")));
    }
    cursor = start + match[0].length;
  }
  words.push(...asciiWords(title.slice(cursor)));
  return truncate(words.join("-"));
}

export function fallbackSlug(seed: string): string {
  return `article-${createHash("sha256").update(seed.normalize("NFKC").trim()).digest("hex").slice(0, 16)}`;
}

export function isUsableSlug(value: string): boolean {
  return value.length <= 120 && SLUG_PATTERN.test(value) && !RESERVED_SLUGS.has(value);
}

export function automaticSlug(title: string): string {
  const generated = slugFromTitle(title);
  return generated && isUsableSlug(generated) ? generated : fallbackSlug(title);
}

/** The first free URL among base, base-2, base-3 …; base itself if none is free. */
export function availableSlug(base: string, isTaken: (slug: string) => boolean): string {
  if (!isTaken(base)) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!isTaken(candidate)) return candidate;
  }
  return base;
}
