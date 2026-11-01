"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { HeadingAnchor } from "@/lib/publishing-types";
import { mapScrollPosition, type ScrollAnchor } from "@/lib/scroll-sync";

const MIRRORED_STYLES = [
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontFamily", "fontSize", "fontWeight", "fontStyle",
  "fontVariantLigatures", "letterSpacing", "lineHeight", "tabSize", "textIndent", "textTransform", "wordSpacing",
  "wordBreak", "overflowWrap", "whiteSpace"
] as const;

/** Offsets of 1-based source lines inside a textarea, measured on a hidden copy of its text. */
function measureEditorLines(textarea: HTMLTextAreaElement, lines: number[]) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  for (const property of MIRRORED_STYLES) mirror.style[property] = style[property];
  Object.assign(mirror.style, {
    position: "absolute", top: "0", left: "-10000px", visibility: "hidden", overflow: "hidden",
    height: "auto", boxSizing: "border-box", borderWidth: "0", width: `${textarea.clientWidth}px`
  });
  const wanted = new Set(lines);
  const markers = new Map<number, HTMLSpanElement>();
  textarea.value.split("\n").forEach((text, index) => {
    if (wanted.has(index + 1)) {
      const marker = document.createElement("span");
      markers.set(index + 1, marker);
      mirror.append(marker);
    }
    mirror.append(document.createTextNode(`${text}\n`));
  });
  document.body.append(mirror);
  const offsets = new Map<number, number>();
  for (const [line, marker] of markers) offsets.set(line, marker.offsetTop);
  mirror.remove();
  return offsets;
}

function measurePreviewHeadings(container: HTMLElement, ids: string[]) {
  const top = container.getBoundingClientRect().top - container.scrollTop;
  const offsets = new Map<string, number>();
  for (const id of ids) {
    const heading = container.querySelector(`#${CSS.escape(id)}`);
    if (heading) offsets.set(id, heading.getBoundingClientRect().top - top);
  }
  return offsets;
}

function measureAnchors(textarea: HTMLTextAreaElement, preview: HTMLElement, anchors: HeadingAnchor[]): ScrollAnchor[] {
  const lines = measureEditorLines(textarea, anchors.map((anchor) => anchor.line));
  const headings = measurePreviewHeadings(preview, anchors.map((anchor) => anchor.id));
  return anchors.flatMap(({ id, line }) => {
    const from = lines.get(line);
    const to = headings.get(id);
    return from === undefined || to === undefined ? [] : [{ from, to }];
  });
}

/**
 * Keeps the Markdown textarea and the preview pane on the same section while
 * enabled. Headings are paired by their source line and rendered id.
 */
export function useScrollSync(editorRef: RefObject<HTMLTextAreaElement>, previewRef: RefObject<HTMLElement>, anchors: HeadingAnchor[], enabled: boolean, contentKey: string) {
  const pairs = useRef<ScrollAnchor[]>([]);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!enabled || !editor || !preview) return;
    let leader: "editor" | "preview" | null = null;
    let frame = 0;
    let measureTimer = 0;
    let releaseTimer = 0;
    const measure = () => { pairs.current = measureAnchors(editor, preview, anchors); };
    const scheduleMeasure = () => { window.clearTimeout(measureTimer); measureTimer = window.setTimeout(measure, 120); };
    const follow = (source: "editor" | "preview") => () => {
      // The pane we just scrolled programmatically must not lead in turn.
      if (leader !== null && leader !== source) return;
      leader = source;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const from = source === "editor" ? editor : preview;
        const to = source === "editor" ? preview : editor;
        const mapping = source === "editor" ? pairs.current : pairs.current.map(({ from: start, to: end }) => ({ from: end, to: start }));
        to.scrollTop = mapScrollPosition(from.scrollTop, mapping, from.scrollHeight - from.clientHeight, to.scrollHeight - to.clientHeight);
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(() => { leader = null; }, 120);
      });
    };
    const followEditor = follow("editor");
    const followPreview = follow("preview");
    measure();
    followEditor();
    const resize = new ResizeObserver(scheduleMeasure);
    resize.observe(editor);
    resize.observe(preview);
    if (preview.firstElementChild) resize.observe(preview.firstElementChild);
    editor.addEventListener("scroll", followEditor, { passive: true });
    preview.addEventListener("scroll", followPreview, { passive: true });
    return () => {
      resize.disconnect();
      editor.removeEventListener("scroll", followEditor);
      preview.removeEventListener("scroll", followPreview);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(measureTimer);
      window.clearTimeout(releaseTimer);
    };
  }, [editorRef, previewRef, anchors, enabled, contentKey]);
}
