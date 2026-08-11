"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

const principles = [
  {
    title: "先定义系统，再优化局部",
    body: "复杂问题往往不是缺少答案，而是边界、变量和反馈关系还没有被看清。"
  },
  {
    title: "让判断可以被复盘",
    body: "把假设、证据和取舍写下来，经验才会从一次性的直觉变成可迁移的方法。"
  },
  {
    title: "人负责判断，AI 负责加速",
    body: "把检索、草拟和验证交给工具，把目标、边界和最终责任留在人手里。"
  },
  {
    title: "让技术落到真实结果",
    body: "模型、代码和流程只有进入可验证的闭环，才真正成为工程能力。"
  }
];

export function PrincipleCarousel() {
  const [active, setActive] = useState(0);
  const principle = principles[active];

  function move(direction: -1 | 1) {
    setActive((current) => (current + direction + principles.length) % principles.length);
  }

  return (
    <section className="grid overflow-hidden border-y border-border bg-denim text-[#f7f1e7] lg:grid-cols-[0.75fr_1.25fr]">
      <div className="relative min-h-[19rem] overflow-hidden border-b border-white/20 lg:border-b-0 lg:border-r">
        <Image
          src="/images/xiang-fuxing-profile.jpg"
          alt="向福星"
          fill
          sizes="(max-width: 1024px) 100vw, 38vw"
          className="object-cover object-[50%_29%] grayscale-[0.16] contrast-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102d34]/80 via-transparent to-transparent" />
        <p className="absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 sm:bottom-8 sm:left-8">
          Field note by Xiang Fuxing
        </p>
      </div>

      <div className="flex min-h-[24rem] flex-col justify-between p-7 sm:p-10 lg:p-14">
        <div aria-live="polite">
          <p className="font-mono text-xs tracking-[0.16em] text-[#f3a082]">
            {String(active + 1).padStart(2, "0")} / {String(principles.length).padStart(2, "0")}
          </p>
          <blockquote className="mt-8 max-w-3xl font-serif text-[clamp(2rem,4vw,4.25rem)] leading-[1.08] tracking-[-0.035em]">
            {principle.title}
          </blockquote>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">{principle.body}</p>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/20 pt-5">
          <p className="text-sm text-white/60">我反复使用的工作判断</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="上一条判断"
              className="inline-flex h-11 w-11 items-center justify-center border border-white/30 text-white transition hover:border-[#f3a082] hover:text-[#f3a082] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a082]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="下一条判断"
              className="inline-flex h-11 w-11 items-center justify-center border border-white/30 text-white transition hover:border-[#f3a082] hover:text-[#f3a082] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3a082]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
