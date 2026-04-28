"use client";

import { useEffect } from "react";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CodeBlockCopyButtons() {
  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>(".article-content [data-rehype-pretty-code-figure]")
    );
    const cleanups: Array<() => void> = [];

    for (const figure of figures) {
      if (figure.dataset.copyEnhanced === "true") {
        continue;
      }

      const code = figure.querySelector("pre code");
      if (!code?.textContent) {
        continue;
      }

      figure.dataset.copyEnhanced = "true";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "复制代码");
      button.textContent = "复制";

      const onClick = async () => {
        const text = code.textContent ?? "";
        if (!text) {
          return;
        }

        try {
          await copyText(text);
          button.textContent = "已复制";
          button.dataset.copied = "true";
          window.setTimeout(() => {
            button.textContent = "复制";
            delete button.dataset.copied;
          }, 1600);
        } catch {
          button.textContent = "失败";
          window.setTimeout(() => {
            button.textContent = "复制";
          }, 1600);
        }
      };

      button.addEventListener("click", onClick);
      figure.appendChild(button);
      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        button.remove();
        delete figure.dataset.copyEnhanced;
      });
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []);

  return null;
}
