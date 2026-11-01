/** Matching scroll offsets in two panes, such as one heading's position in each. */
export type ScrollAnchor = { from: number; to: number };

/**
 * Maps a scroll offset from one pane to the other. Anchor pairs align exactly,
 * offsets between them are interpolated, and both pane ends always align.
 */
export function mapScrollPosition(position: number, anchors: readonly ScrollAnchor[], fromMax: number, toMax: number): number {
  if (!(fromMax > 0) || !(toMax > 0)) return 0;
  const points: ScrollAnchor[] = [{ from: 0, to: 0 }];
  // Filter before sorting: comparisons with NaN would leave the order undefined.
  const candidates = anchors.filter((anchor) => Number.isFinite(anchor.from) && Number.isFinite(anchor.to))
    .sort((a, b) => a.from - b.from || a.to - b.to);
  for (const anchor of candidates) {
    const last = points[points.length - 1];
    // Keep the mapping monotonic and inside both panes.
    if (anchor.from <= last.from || anchor.to < last.to || anchor.from >= fromMax || anchor.to > toMax) continue;
    points.push(anchor);
  }
  points.push({ from: fromMax, to: toMax });
  const clamped = Math.min(Math.max(position, 0), fromMax);
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    if (clamped <= end.from) {
      const span = end.from - start.from;
      const ratio = span > 0 ? (clamped - start.from) / span : 0;
      return Math.min(Math.max(start.to + ratio * (end.to - start.to), 0), toMax);
    }
  }
  return toMax;
}
