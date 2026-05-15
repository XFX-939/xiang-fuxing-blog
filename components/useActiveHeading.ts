"use client";

import { useEffect, useState } from "react";

type HeadingLike = {
  id: string;
};

export function useActiveHeading(items: HeadingLike[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let frame = 0;
    const ids = items.map((item) => item.id);

    const updateActiveHeading = () => {
      const offset = window.innerHeight < 760 ? 170 : 150;
      const headings = ids
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (headings.length === 0) {
        return;
      }

      let current = headings[0].id;

      for (const heading of headings) {
        const top = heading.getBoundingClientRect().top;

        if (top <= offset) {
          current = heading.id;
        } else {
          break;
        }
      }

      setActiveId((value) => (value === current ? value : current));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [items]);

  return activeId;
}
