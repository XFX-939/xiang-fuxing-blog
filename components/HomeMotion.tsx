"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeMotion({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = container.current;
      if (!root) {
        return;
      }

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
        reveals.forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true
              }
            }
          );
        });

        const words = gsap.utils.toArray<HTMLElement>("[data-scrub-word]", root);
        if (words.length > 0) {
          gsap.fromTo(
            words,
            { opacity: 0.13 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: {
                trigger: words[0].parentElement,
                start: "top 74%",
                end: "bottom 48%",
                scrub: 0.65
              }
            }
          );
        }

        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", root);
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { scale: 0.94, y: 54, rotate: index % 2 === 0 ? -0.7 : 0.7 },
            {
              scale: 1,
              y: 0,
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                end: "top 58%",
                scrub: 0.5
              }
            }
          );
        });
      });

      return () => media.revert();
    },
    { scope: container }
  );

  return <div ref={container}>{children}</div>;
}
