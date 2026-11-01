#!/usr/bin/env node

// Exercise the production Next handler with real Node request/response objects.
// The Duplex transport stays entirely in memory: no server ever calls listen().
import { IncomingMessage, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID, scrypt } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");
const origin = "http://127.0.0.1:31479";
const worker = process.argv.includes("--restart-worker");
let stage = "初始化";

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function report(message) {
  if (!worker) process.stdout.write(`PASS ${message}\n`);
}

function status(response, expected, label) {
  ensure(response.status === expected, `${label}：预期 ${expected}，实际 ${response.status}`);
}

function json(response, label) {
  try { return JSON.parse(response.body); }
  catch { throw new Error(`${label}：响应不是有效 JSON`); }
}

function timeout(promise, milliseconds, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}超时`)), milliseconds); })
  ]).finally(() => clearTimeout(timer));
}

async function startApp() {
  const { default: next } = await import("next");
  const app = next({ dev: false, dir: projectRoot, hostname: "127.0.0.1", port: 31479, quiet: true });
  await timeout(app.prepare(), 30000, "生产 Next 初始化");
  const handler = app.getRequestHandler();

  async function request(url, { method = "GET", headers = {}, body = null } = {}) {
    const bytes = body === null ? null : Buffer.isBuffer(body) ? body : Buffer.from(body);
    const output = [];
    let capturedBytes = 0;
    function capture(chunk, encoding) {
      const value = Buffer.from(chunk, typeof encoding === "string" ? encoding : undefined);
      capturedBytes += value.length;
      ensure(capturedBytes <= 32 * 1024 * 1024, "响应超过验收内存上限");
      output.push(value);
    }
    const socket = new Duplex({
      readableHighWaterMark: 16 * 1024 * 1024,
      writableHighWaterMark: 16 * 1024 * 1024,
      read() {},
      write(_chunk, _encoding, callback) { queueMicrotask(callback); }
    });
    socket.remoteAddress = "127.0.0.1";
    socket.remotePort = 31480;
    socket.localAddress = "127.0.0.1";
    socket.localPort = 31479;
    socket.setTimeout = () => socket;
    socket.setNoDelay = () => socket;
    socket.setKeepAlive = () => socket;
    const req = new IncomingMessage(socket);
    Object.assign(req, {
      method, url,
      headers: {
        host: "127.0.0.1:31479",
        "accept-encoding": "identity",
        connection: "close",
        ...(bytes ? { "content-length": String(bytes.length) } : {}),
        ...Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]))
      },
      httpVersion: "1.1", httpVersionMajor: 1, httpVersionMinor: 1,
      complete: true
    });
    req.rawHeaders = Object.entries(req.headers).flat();
    if (bytes) req.push(bytes);
    req.push(null);

    const res = new ServerResponse(req);
    res.assignSocket(socket);
    // A real HTTP server forwards socket backpressure events to its response.
    // assignSocket() alone does not install that connection-level wiring.
    socket.on("drain", () => { if (res.writableNeedDrain) res.emit("drain"); });
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    res.write = (chunk, encoding, callback) => {
      if (chunk !== undefined && chunk !== null) capture(chunk, encoding);
      return originalWrite(chunk, encoding, callback);
    };
    res.end = (chunk, encoding, callback) => {
      if (chunk !== undefined && chunk !== null && typeof chunk !== "function") capture(chunk, encoding);
      return originalEnd(chunk, encoding, callback);
    };
    let responseFinished = false;
    let handlerFinished = false;
    const finished = new Promise((resolve, reject) => {
      res.once("finish", () => { responseFinished = true; resolve(); });
      res.once("error", reject);
      req.once("error", reject);
      socket.once("error", reject);
    });
    try {
      await timeout(Promise.all([finished, Promise.resolve().then(() => handler(req, res)).then(() => { handlerFinished = true; })]), 25000, `${method} ${url}`)
        .catch((error) => { throw new Error(`${error.message}（响应结束=${responseFinished}，处理器结束=${handlerFinished}，正文=${capturedBytes} 字节）`); });
      return { status: res.statusCode, headers: res.getHeaders(), body: Buffer.concat(output).toString("utf8") };
    } finally {
      res.detachSocket(socket);
      socket.destroy();
    }
  }

  return {
    request,
    async close() {
      // NextCustomServer.prepare() owns this renderer, rather than its inherited
      // lazy server field. Closing it avoids initializing another server.
      await (app.renderServer ?? app).close();
    }
  };
}

function multipart(content, filename = "article.md") {
  const boundary = `publishing-integration-${randomBytes(12).toString("hex")}`;
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: text/markdown\r\n\r\n`),
      Buffer.isBuffer(content) ? content : Buffer.from(content),
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])
  };
}

function authHeaders(cookie, extra = {}) {
  return { origin, "sec-fetch-site": "same-origin", ...(cookie ? { cookie } : {}), ...extra };
}

async function sendJson(app, route, body, cookie, extra = {}) {
  return app.request(route, {
    method: "POST", headers: authHeaders(cookie, { "content-type": "application/json", ...extra }),
    body: JSON.stringify(body)
  });
}

async function upload(app, content, filename, cookie) {
  const form = multipart(content, filename);
  return app.request("/api/admin/import", {
    method: "POST", headers: authHeaders(cookie, { "content-type": form.contentType }), body: form.body
  });
}

async function verifyPublic(app, input) {
  const { metadata, marker } = input;
  const detail = await app.request(`/blog/${metadata.slug}`);
  status(detail, 200, "公开详情");
  ensure(detail.body.includes(marker), "详情缺少新文章正文");
  ensure(!detail.body.includes("<script data-publishing-probe>"), "文章正文中存在可执行脚本");
  ensure(!detail.body.includes("<script data-publishing-title>"), "文章标题突破 HTML 边界");
  ensure(!/href=["']javascript:/i.test(detail.body), "文章保留了危险链接协议");
  const ld = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/.exec(detail.body);
  ensure(ld, "详情缺少 Article JSON-LD");
  ensure(JSON.parse(ld[1]).headline === metadata.title, "文章标题 JSON-LD 转义后不可还原");
  ensure(!ld[1].includes("<"), "JSON-LD 中的标题未安全转义");

  const search = await app.request(`/api/search?q=${encodeURIComponent(marker)}`);
  status(search, 200, "发布后搜索");
  const results = json(search, "发布后搜索");
  ensure(results.posts.some((post) => post.slug === metadata.slug), "搜索未出现刚发布的文章");
  ensure(results.posts.every((post) => !("searchText" in post)), "搜索泄露了完整正文索引");
  ensure(search.headers["cache-control"]?.includes("no-store"), "搜索响应仍可能缓存旧索引");

  for (const route of ["/", "/blog", "/archive", `/categories/${encodeURIComponent(metadata.category)}`, `/tags/${encodeURIComponent(metadata.tags[0])}`]) {
    const response = await app.request(route);
    status(response, 200, `发布后 ${route}`);
    ensure(response.body.includes(metadata.slug), `发布后页面缺少新文章：${route}`);
  }
  for (const [route, label] of [["/categories", metadata.category], ["/tags", metadata.tags[0]]]) {
    const response = await app.request(route);
    status(response, 200, route);
    ensure(response.body.includes(label), `索引页缺少新增条目：${route}`);
  }
  const sitemap = await app.request("/sitemap.xml");
  status(sitemap, 200, "发布后 sitemap");
  ensure(sitemap.body.includes(`/blog/${metadata.slug}`), "sitemap 缺少新文章");
  ensure(!sitemap.body.includes("/admin"), "sitemap 包含后台入口");
  ensure(globalThis.__publishingIntegrationExecuted === undefined, "Markdown 中的 MDX 表达式在服务端执行");
}

async function verifyRestart(payload) {
  process.chdir(payload.runtimeDirectory);
  const app = await startApp();
  try {
    await verifyPublic(app, payload);
    const retry = await sendJson(app, "/api/admin/publish", {
      metadata: payload.metadata, content: payload.content, requestId: payload.requestId
    }, payload.cookie);
    status(retry, 200, "重启后重试");
    ensure(json(retry, "重启后重试").created === false, "重启后重试重复创建了文章");
  } finally {
    await app.close();
  }
}

async function restartWorker(payload) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, "--restart-worker"], {
      cwd: payload.runtimeDirectory, env: { ...process.env }, stdio: ["pipe", "ignore", "ignore", "ipc"]
    });
    let outcome;
    const timer = setTimeout(() => { child.kill(); reject(new Error("独立进程重启验收超时")); }, 60000);
    child.on("message", (message) => { outcome = message; });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 || !outcome?.ok) reject(new Error(outcome?.error || "独立进程重启验收失败"));
      else resolve();
    });
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify(payload));
  });
}

async function main() {
  const originalDirectory = process.cwd();
  await fs.access(path.join(projectRoot, ".next", "BUILD_ID")).catch(() => { throw new Error("缺少生产构建，请先运行 npm run build"); });
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "blog-production-integration-"));
  const runtimeDirectory = path.join(scratch, "runtime");
  const contentDirectory = path.join(scratch, "articles");
  let app;
  try {
    await fs.mkdir(path.join(runtimeDirectory, "content"), { recursive: true });
    await fs.cp(path.join(projectRoot, "content", "blog"), path.join(runtimeDirectory, "content", "blog"), { recursive: true });
    const id = randomBytes(8).toString("hex");
    const marker = `publishingintegration${id}`;
    const draftSlug = `integration-draft-${id}`;
    const unpublishedSlug = `integration-unpublished-${id}`;
    await fs.writeFile(path.join(runtimeDirectory, "content", "blog", `${draftSlug}.mdx`), `---\ntitle: "Integration draft"\ndescription: "Draft fixture"\ndate: "2099-01-01"\ncategory: "未分类"\ntags: []\ndraft: true\n---\n\n${draftSlug}\n`);
    const password = randomBytes(24).toString("base64url");
    const salt = randomBytes(16);
    const key = await new Promise((resolve, reject) => {
      scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derived) => error ? reject(error) : resolve(derived));
    });
    // Set every publishing variable before importing Next; real .env.local
    // values never decide credentials or storage paths for this verification.
    Object.assign(process.env, {
      NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
      BLOG_ADMIN_PASSWORD_HASH: `scrypt$${salt.toString("hex")}$${key.toString("hex")}`,
      BLOG_ADMIN_SESSION_SECRET: randomBytes(48).toString("base64url"),
      BLOG_ADMIN_ORIGIN: origin,
      BLOG_CONTENT_DIR: contentDirectory,
      LIKES_STORE_PATH: path.join(scratch, "likes.json")
    });
    process.chdir(runtimeDirectory);
    app = await startApp();
    report("生产 Next 初始化，全程使用内存传输且未监听端口");

    stage = "管理员入口与鉴权";
    const admin = await app.request("/admin");
    status(admin, 200, "管理员入口");
    ensure(/<input\b[^>]*type=["']password["'][^>]*>/i.test(admin.body) && /noindex/.test(admin.body), "管理员入口缺少登录或禁止索引设置");
    const invalidLogin = await sendJson(app, "/api/admin/login", { password: "not-the-fixture-password" });
    status(invalidLogin, 401, "错误口令");
    const login = await sendJson(app, "/api/admin/login", { password });
    status(login, 200, "管理员登录");
    const setCookie = login.headers["set-cookie"];
    const cookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie)?.split(";", 1)[0];
    ensure(cookie?.startsWith("blog_admin_session="), "登录没有签发会话 Cookie");
    ensure(/httponly/i.test(String(setCookie)) && /samesite=strict/i.test(String(setCookie)), "会话 Cookie 缺少安全属性");
    const signedAdmin = await app.request("/admin", { headers: { cookie } });
    status(signedAdmin, 200, "已登录后台");
    const initialEditor = /<textarea\b[^>]*(?:name=["'](?:content|source)["']|id=["']article-content["'])[^>]*>/i.exec(signedAdmin.body);
    ensure(initialEditor, "初始后台没有直接可输入的 Markdown 文本框，仍需要先上传文件");
    ensure(!/\s(?:disabled|hidden)(?:\s|=|>)/i.test(initialEditor[0]) && !/aria-hidden=["']true["']/i.test(initialEditor[0]), "初始 Markdown 文本框不可编辑或被隐藏");
    for (const name of ["title", "description", "date", "category", "tags", "slug"]) {
      ensure(new RegExp(`<(?:input|textarea)\\b[^>]*name=["']${name}["'][^>]*>`, "i").test(signedAdmin.body), `初始后台未展示文章信息字段：${name}`);
    }
    report("管理员登录、错误口令、Cookie、禁止索引及默认 Markdown 编辑器与文章信息");

    const metadata = {
      title: `验收 ${id} </script><script data-publishing-title>globalThis.__publishingIntegrationExecuted=1</script>`,
      description: "验证导入、预览、发布、公开索引和持久化。",
      date: "2099-01-01", category: `验收分类 100% ${id}`, tags: [`验收标签 50% ${id}`],
      featured: true, slug: `integration-publish-${id}`
    };
    const content = `# 导入文章\n\n${marker}\n\n## 阅读结构\n\n{(() => { globalThis.__publishingIntegrationExecuted = 1; return "EXECUTED"; })()}\n\n<script data-publishing-probe>globalThis.__publishingIntegrationExecuted=1</script>\n\n[危险链接](javascript:alert(1))\n\n![本地图片](./missing-image.png)\n\n| 项目 | 结果 |\n| --- | --- |\n| Markdown | 正常 |\n\n$$x^2 + y^2 = z^2$$\n\n\`\`\`js\nconst answer = 42;\n\`\`\`\n`;
    let publication = { metadata, content, requestId: randomUUID() };

    stage = "导入和预览权限";
    status(await sendJson(app, "/api/admin/compose", { source: content }), 401, "未登录粘贴 Markdown");
    status(await upload(app, "# No login\n\ncontent", "no-login.md"), 401, "未登录导入");
    status(await sendJson(app, "/api/admin/preview", publication), 401, "未登录预览");
    status(await sendJson(app, "/api/admin/publish", publication), 401, "未登录发布");
    status(await sendJson(app, "/api/admin/preview", publication, cookie, { origin: "https://untrusted.invalid" }), 403, "跨来源预览");
    status(await sendJson(app, "/api/admin/compose", { source: content }, cookie, { origin: "https://untrusted.invalid" }), 403, "跨来源粘贴 Markdown");
    ensure(!(await fs.readdir(contentDirectory).catch(() => [])).some((name) => name.endsWith(".md")), "未授权请求创建了文章");
    report("未登录与跨来源请求均被拒绝，且未创建文章");

    stage = "直接粘贴 Markdown 与自动识别";
    const plainCompose = await sendJson(app, "/api/admin/compose", { source: content }, cookie);
    status(plainCompose, 200, "无文件粘贴 Markdown");
    const plainArticle = json(plainCompose, "无文件粘贴 Markdown");
    ensure(plainArticle.content === content, "粘贴识别改写了原始正文");
    ensure(plainArticle.metadata.title === "导入文章" && plainArticle.metadata.description === marker, "粘贴未自动识别标题或摘要");
    ensure(plainArticle.metadata.category === "未分类" && plainArticle.metadata.featured === false, "粘贴缺省文章信息不正确");
    ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plainArticle.metadata.slug), "未提供文件名时没有生成有效文章地址");
    ensure(plainArticle.warnings.some((warning) => warning.includes("missing-image")), "粘贴未提示相对图片");
    ensure(plainArticle.html.includes("<table>") && plainArticle.html.includes("katex") && plainArticle.html.includes("data-rehype-pretty-code"), "粘贴预览缺少表格、数学或代码高亮");
    ensure(plainArticle.toc.some((item) => item.text === "阅读结构"), "粘贴没有返回阅读目录");
    ensure(!plainArticle.html.includes("<script") && !/href=["']javascript:/i.test(plainArticle.html), "粘贴预览保留了危险 HTML 或 URL");
    ensure(plainCompose.headers["cache-control"]?.includes("no-store"), "粘贴响应允许缓存草稿");

    const source = [
      "---", `title: ${JSON.stringify(metadata.title)}`, `description: ${JSON.stringify(metadata.description)}`,
      `date: ${JSON.stringify(metadata.date)}`, `category: ${JSON.stringify(metadata.category)}`,
      `tags: ${JSON.stringify(metadata.tags)}`, `featured: ${metadata.featured}`, `slug: ${metadata.slug}`, "---", content
    ].join("\n");
    const composed = await sendJson(app, "/api/admin/compose", { source, filename: `${metadata.slug}.md` }, cookie);
    status(composed, 200, "识别粘贴的 frontmatter");
    const composedArticle = json(composed, "识别粘贴的 frontmatter");
    ensure(isDeepStrictEqual(composedArticle.metadata, metadata), "粘贴没有保留有效 frontmatter 元信息");
    ensure(composedArticle.content === content, "粘贴未正确剥离 frontmatter 或改写了正文");
    publication = { metadata: composedArticle.metadata, content: composedArticle.content, requestId: publication.requestId };
    ensure(!(await fs.readdir(contentDirectory).catch(() => [])).some((name) => name.endsWith(".md")), "粘贴或预览在确认发布前写入了公开文章");
    ensure(globalThis.__publishingIntegrationExecuted === undefined, "粘贴识别执行了 Markdown 中的表达式");
    report("纯 JSON 粘贴自动识别元信息并返回安全预览，无文件、无公开写入；主发布流程使用 compose 返回内容");

    stage = "JSON 安全预览";
    const preview = await sendJson(app, "/api/admin/preview", publication, cookie);
    status(preview, 200, "文章预览");
    const rendered = json(preview, "文章预览");
    ensure(rendered.html.includes("<table>") && rendered.html.includes("katex") && rendered.html.includes("data-rehype-pretty-code"), "预览缺少表格、数学或代码高亮");
    ensure(rendered.toc.some((item) => item.text === "阅读结构"), "预览没有生成目录");
    ensure(!rendered.html.includes("<script") && !/href=["']javascript:/i.test(rendered.html), "预览保留了危险 HTML 或 URL");
    ensure(globalThis.__publishingIntegrationExecuted === undefined, "导入或预览执行了 MDX 表达式");
    report("粘贴内容通过统一 JSON 安全预览，表格、数学、代码与目录正常");

    stage = "非法输入";
    status(await sendJson(app, "/api/admin/compose", { source: "" }, cookie), 400, "空粘贴正文");
    status(await sendJson(app, "/api/admin/compose", { source: { text: content } }, cookie), 400, "非文本粘贴正文");
    status(await sendJson(app, "/api/admin/compose", { source: "---\ntitle: [\n---\n\n正文" }, cookie), 400, "粘贴无效 YAML");
    status(await sendJson(app, "/api/admin/compose", { source: "---js\n({title: process.exit()})\n---\n正文" }, cookie), 400, "粘贴可执行 frontmatter");
    status(await sendJson(app, "/api/admin/compose", { source: "x".repeat(2 * 1024 * 1024 + 1) }, cookie), 413, "粘贴超过正文大小限制");
    status(await sendJson(app, "/api/admin/preview", { ...publication, metadata: { ...metadata, date: "2026-02-30" } }, cookie), 400, "不存在的日期");
    status(await sendJson(app, "/api/admin/publish", { ...publication, metadata: { ...metadata, slug: "../outside" } }, cookie), 400, "危险文章路径");
    report("空白或非法粘贴、YAML、日期、路径及超大正文均被拒绝");

    stage = "草稿与发布前状态";
    const draftSource = `---\ntitle: "尚未发布"\nslug: ${unpublishedSlug}\ndraft: true\n---\n\n${unpublishedSlug}`;
    const draftCompose = await sendJson(app, "/api/admin/compose", { source: draftSource, filename: "draft.md" }, cookie);
    status(draftCompose, 200, "编辑草稿");
    ensure(json(draftCompose, "编辑草稿").warnings.some((warning) => warning.includes("草稿")), "粘贴草稿没有明确提示");
    for (const slug of [draftSlug, unpublishedSlug, metadata.slug]) status(await app.request(`/blog/${slug}`), 404, "发布前不可直接访问");
    for (const route of [`/categories/${encodeURIComponent(metadata.category)}`, `/tags/${encodeURIComponent(metadata.tags[0])}`]) status(await app.request(route), 404, "发布前不存在的新分类或标签");
    for (const route of ["/", "/blog", "/archive", "/categories", "/tags", "/sitemap.xml"]) {
      const before = await app.request(route);
      status(before, 200, "发布前预热");
      ensure(!before.body.includes(metadata.slug) && !before.body.includes(draftSlug) && !before.body.includes(unpublishedSlug), "发布前页面暴露了测试文章或草稿");
    }
    const beforeSearch = json(await app.request(`/api/search?q=${marker}`), "发布前搜索");
    ensure(beforeSearch.total === 0, "发布前搜索出现未发布文章");
    const draftSearch = json(await app.request(`/api/search?q=${draftSlug}`), "草稿搜索");
    ensure(draftSearch.total === 0, "草稿被全文搜索收录");
    report("粘贴和预览不会公开，仓库草稿返回 404；已预热列表、搜索、sitemap 及新地址");

    stage = "发布与即时公开";
    const published = await sendJson(app, "/api/admin/publish", publication, cookie);
    status(published, 201, "首次发布");
    const publishedArticle = json(published, "首次发布");
    ensure(publishedArticle.created === true && publishedArticle.url === `/blog/${metadata.slug}`, "首次发布结果不正确");
    await verifyPublic(app, { metadata, marker });
    const stored = await fs.readFile(path.join(contentDirectory, `${metadata.slug}.md`), "utf8");
    ensure(stored.endsWith(content), "持久化正文与导入原文不一致");
    report("新详情、首页、博客、分类、标签、归档、搜索及 sitemap 立即更新");
    report("公开页安全渲染 Markdown，恶意标题 JSON-LD 可还原且不突破脚本边界");

    stage = "原文件导入回归";
    // The complete compose -> preview -> publish path above intentionally runs
    // before any authenticated multipart upload, proving no file is required.
    const imported = await upload(app, content, `${metadata.slug}.md`, cookie);
    status(imported, 200, "导入 Markdown");
    const importedArticle = json(imported, "导入 Markdown");
    ensure(importedArticle.metadata.title === "导入文章" && importedArticle.metadata.category === "未分类", "无 frontmatter 时的默认信息不正确");
    ensure(importedArticle.metadata.description === marker, "摘要未从正文首段提取");
    ensure(importedArticle.content === content, "导入过程改写了正文");
    ensure(importedArticle.warnings.some((warning) => warning.includes("missing-image")), "相对图片缺少提示");
    const draftImport = await upload(app, draftSource, "draft.md", cookie);
    status(draftImport, 200, "导入草稿");
    ensure(json(draftImport, "导入草稿").warnings.some((warning) => warning.includes("草稿")), "导入草稿没有明确提示");
    status(await app.request(`/blog/${unpublishedSlug}`), 404, "导入草稿仍不公开");
    ensure(json(await app.request(`/api/search?q=${unpublishedSlug}`), "导入草稿搜索").total === 0, "文件导入的草稿进入了搜索");
    report("无文件主流程完成后，已有文件导入、正文保留和草稿提醒仍正常且不公开");

    stage = "导入日期规则";
    const validDateImport = await upload(app, '---\ndate: "2025-12-15"\n---\n\n# 原日期\n\n保留有效日期。', "valid-date.md", cookie);
    status(validDateImport, 200, "导入有效日期");
    ensure(json(validDateImport, "导入有效日期").metadata.date === "2025-12-15", "导入未优先保留有效日期");
    const shanghaiDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const allowedDates = new Set([shanghaiDate()]);
    const invalidDateImport = await upload(app, '---\ndate: "2026-02-30"\n---\n\n# 回退日期\n\n使用当天日期。', "invalid-date.md", cookie);
    allowedDates.add(shanghaiDate());
    status(invalidDateImport, 200, "导入无效日期回退");
    const dateFallback = json(invalidDateImport, "导入无效日期回退");
    ensure(allowedDates.has(dateFallback.metadata.date), "无效日期未回退为上海当天");
    ensure(dateFallback.warnings.some((warning) => warning.includes("日期")), "导入日期回退缺少提醒");
    report("导入保留有效日期，无效日期回退上海当天并提醒");

    stage = "非法文件导入";
    status(await upload(app, Buffer.from([0xff, 0xfe, 0x80]), "invalid.md", cookie), 400, "无效 UTF-8");
    status(await upload(app, "# MDX", "invalid.mdx", cookie), 415, "错误文件类型");
    status(await upload(app, "---\ntitle: [\n---\n\n正文", "invalid.md", cookie), 400, "无效 YAML");
    status(await upload(app, Buffer.alloc(2 * 1024 * 1024 + 1, 0x61), "oversized.md", cookie), 413, "超过文件大小限制");
    report("非法编码、扩展名、YAML 和超大文件导入均被拒绝");

    stage = "重试、冲突与旧文章";
    const retry = await sendJson(app, "/api/admin/publish", publication, cookie);
    status(retry, 200, "同请求重试");
    ensure(json(retry, "同请求重试").created === false, "重试重复创建了文章");
    status(await sendJson(app, "/api/admin/publish", { ...publication, requestId: randomUUID() }, cookie), 409, "同名文章防覆盖");
    status(await sendJson(app, "/api/admin/publish", { ...publication, content: "另一篇正文" }, cookie), 409, "同请求不同内容");
    const legacyFile = "understanding-system-simulation.mdx";
    const legacyPath = path.join(runtimeDirectory, "content", "blog", legacyFile);
    const legacyBefore = await fs.readFile(legacyPath, "utf8");
    status(await sendJson(app, "/api/admin/publish", { ...publication, metadata: { ...metadata, slug: legacyFile.slice(0, -4) }, requestId: randomUUID() }, cookie), 409, "旧 MDX 同名防覆盖");
    ensure(await fs.readFile(legacyPath, "utf8") === legacyBefore, "旧 MDX 被发布流程改写");
    const legacyPage = await app.request(`/blog/${legacyFile.slice(0, -4)}`);
    status(legacyPage, 200, "旧 MDX 详情");
    ensure(legacyPage.body.includes("一文读懂系统仿真"), "旧 MDX 详情未正常渲染");
    const publicFiles = (await fs.readdir(contentDirectory)).filter((file) => file.endsWith(".md"));
    ensure(publicFiles.length === 1 && publicFiles[0] === `${metadata.slug}.md`, "重试或失败请求产生了额外文章");
    ensure(await fs.readFile(path.join(contentDirectory, `${metadata.slug}.md`), "utf8") === stored, "冲突请求改写了原文章");
    report("发布重试幂等，同名与旧 MDX 不覆盖，失败请求无额外公开文件");

    stage = "独立进程重启";
    await app.close();
    app = null;
    await restartWorker({ runtimeDirectory, metadata, marker, content, requestId: publication.requestId, cookie });
    report("独立 Next 进程冷启动后文章仍公开，同一发布请求仍可安全重试");
    stage = "模拟 release 切换与回滚";
    const nextReleaseDirectory = path.join(scratch, "releases", "next-release");
    await fs.mkdir(path.dirname(nextReleaseDirectory), { recursive: true });
    await fs.cp(runtimeDirectory, nextReleaseDirectory, { recursive: true });
    await restartWorker({ runtimeDirectory: nextReleaseDirectory, metadata, marker, content, requestId: publication.requestId, cookie });
    await restartWorker({ runtimeDirectory, metadata, marker, content, requestId: publication.requestId, cookie });
    report("模拟 release 工作目录切换与回滚后，共享文章仍可访问且重试不重复");
    report("全部生产集成验收完成");
  } finally {
    if (app) await app.close().catch(() => {});
    process.chdir(originalDirectory);
    await fs.rm(scratch, { recursive: true, force: true });
  }
}

try {
  if (worker) {
    let input = "";
    for await (const chunk of process.stdin) input += chunk;
    await verifyRestart(JSON.parse(input));
    process.send?.({ ok: true });
    process.disconnect?.();
  } else {
    await main();
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "验收未完成";
  if (worker) {
    process.send?.({ ok: false, error: message });
    process.disconnect?.();
  } else {
    process.stderr.write(`FAIL ${stage}：${message}\n`);
  }
  process.exitCode = 1;
}
