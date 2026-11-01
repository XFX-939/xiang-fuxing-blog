import assert from "node:assert/strict";
import test from "node:test";
import { automaticSlug, availableSlug, fallbackSlug, isUsableSlug, slugFromTitle } from "../lib/slug";

test("Chinese titles become toneless pinyin words", () => {
  assert.equal(slugFromTitle("为什么管理者要远离微管理"), "wei-shen-me-guan-li-zhe-yao-yuan-li-wei-guan-li");
  assert.equal(slugFromTitle("导入文章"), "dao-ru-wen-zhang");
});

test("Latin words and digits stay lowercase beside pinyin, and ü is written as v", () => {
  assert.equal(slugFromTitle("5G 系统仿真入门"), "5g-xi-tong-fang-zhen-ru-men");
  assert.equal(slugFromTitle("AI Coding：从工具到流程"), "ai-coding-cong-gong-ju-dao-liu-cheng");
  assert.equal(slugFromTitle("Ｗｉｆｉ 与 Café"), "wifi-yu-cafe");
  assert.equal(slugFromTitle("绿色"), "lv-se");
});

test("long titles are cut at a word boundary within 60 characters", () => {
  assert.equal(slugFromTitle("从无线通信研发到海外市场产品能力建设的六年复盘与方法总结"), "cong-wu-xian-tong-xin-yan-fa-dao-hai-wai-shi-chang-chan-pin");
  assert.equal(slugFromTitle("a".repeat(70)), "a".repeat(60));
});

test("titles without usable words fall back to a stable hash", () => {
  assert.equal(slugFromTitle("🎉🎉"), "");
  assert.equal(automaticSlug("🎉🎉"), fallbackSlug("🎉🎉"));
  assert.match(fallbackSlug("🎉🎉"), /^article-[a-f0-9]{16}$/);
  assert.match(automaticSlug("Constructor"), /^article-[a-f0-9]{16}$/);
  assert.equal(automaticSlug("导入文章"), "dao-ru-wen-zhang");
});

test("automatic URLs skip taken names with numeric suffixes", () => {
  const taken = new Set(["dao-ru-wen-zhang", "dao-ru-wen-zhang-2"]);
  assert.equal(availableSlug("dao-ru-wen-zhang", (slug) => taken.has(slug)), "dao-ru-wen-zhang-3");
  assert.equal(availableSlug("xin-wen-zhang", (slug) => taken.has(slug)), "xin-wen-zhang");
});

test("usable slugs follow the existing URL rules", () => {
  assert.ok(isUsableSlug("soc-architecture-basics"));
  for (const value of ["Hello World", "two--hyphens", "-edge", "constructor", "中文", "a".repeat(121)]) {
    assert.equal(isUsableSlug(value), false, value);
  }
});
