# 后台 Markdown 编辑器改进 · 第一期设计

## 目标

在现有 `/admin` 编辑器（左栏 Markdown 源码、右栏安全预览、确认后发布）的基础上改进写作体验，不新建编辑器，不改变登录、安全预览和发布机制。

## 分期路线

| 期 | 内容 | 状态 |
| --- | --- | --- |
| 第一期 | 拼音短链、正文不重复显示标题、桌面分栏滚动同步 | 本文设计，已确认 |
| 第二期 | 图片上传：粘贴或拖入图片，上传到服务器并插入站内地址 | 待设计（需确定格式、大小上限、存储目录与备份方式） |
| 第三期 | 文章管理：服务器草稿、修改和下线后台发布的文章 | 待设计（需把“只能新增”的存储改为可修改，确定改地址、下线与恢复的规则） |

仓库里的 MDX 文章始终通过 Git 管理，不纳入后台修改范围。

## 第一期设计

### 一、拼音短链

试用中发现：粘贴的文章默认短链是 `pasted-<UUID>`，不手动修改就会得到 `/blog/pasted-7007…93a7` 这样的地址。原因是编辑器给粘贴内容生成了 `pasted-<UUID>.md` 占位文件名，服务端再用文件名生成短链。

- 优先级：frontmatter 中的 `slug` → 导入文件名本身已是合法短链时沿用 → 由标题生成。
- 由标题生成：汉字转无声调拼音（ü 写作 v），英文和数字保留并转小写，其余字符作分隔，用单个连字符连接；不超过 60 字符，优先在连字符处截断，60 字符内没有连字符时直接截到 60；结果为空时回退为现有的 `article-<16 位哈希>`。
- 粘贴内容没有 frontmatter 标题和一级标题时，标题取正文第一段前 30 个字符，再据此生成短链。
- 自动生成的短链与已有文章重名时依次加 `-2`、`-3`；frontmatter、文件名或手动填写的短链不自动改名，重名时仍由发布接口拒绝并提示。
- 拼音转换使用 `pinyin-pro`（MIT），只在服务端模块中引用。
- 短链输入框下方显示发布后的完整地址。

示例：标题“为什么管理者要远离微管理” → `/blog/wei-shen-me-guan-li-zhe-yao-yuan-li-wei-guan-li`。

### 二、正文不重复显示标题

编辑器提示用 `# 标题` 开头，而文章详情页本身已渲染文章标题，正文中的一级标题会再显示一次。仓库中 38 篇 MDX 的正文都没有一级标题。

- 在 `renderMarkdown`（预览与公开页共用）中处理：正文第一个内容块是一级标题时不渲染；其余一级标题渲染为二级标题，并进入目录。
- 存储的原文不变，发布指纹和幂等记录不受影响；仓库 MDX 的渲染流程不变。

### 三、桌面分栏滚动同步

现状：编辑框固定高度、在框内滚动，预览区撑长页面，长文写作时两侧对不上。

- 仅在“分栏”视图且为桌面宽度时生效：两栏等高（约一屏，最小 480px），各自滚动，工具栏保持可见。
- 渲染器返回每个标题的元素 id 及其在原文中的行号（含 frontmatter 偏移）；前端用隐藏镜像元素测量标题在编辑框中的位置，与预览中对应标题对齐，标题之间线性插值；没有标题时整体按比例。
- 双向同步，防止互相触发；内容、预览或宽度变化后重新测量。
- 工具栏新增“同步滚动”开关，默认开启，偏好存本机。窄屏的编辑/预览切换视图不做同步。
- 不引入新的前端依赖。

### 验收标准

- `npm run type-check`、`npm run lint`、`npm test`、`npm run build`、`npm run test:integration` 全部通过。
- 粘贴中文标题的文章得到拼音短链；粘贴以 `# 导入文章` 开头的正文，短链为 `dao-ru-wen-zhang`。
- 预览和公开详情页都只出现一次文章标题（公开页只有一个 `<h1`）。
- 桌面分栏下长文两侧按标题对齐滚动，关闭开关后不再联动；手机宽度下编辑/预览切换正常。

### 非目标

- 图片上传、服务器草稿、修改或下线已发布文章（分别在第二、三期）。
- 手机切换编辑/预览时保持阅读位置。
- 更换为 CodeMirror 等编辑器组件。

## 交给编码工具的 Prompt

把下面整段复制给编码工具（如 Claude Code），在本仓库根目录执行。

````text
你在 xiang-fuxing-blog 仓库（Next.js 14 App Router + TypeScript + Tailwind）里工作。站点已有后台 Markdown 编辑器 /admin：粘贴或编写 Markdown → POST /api/admin/compose 自动识别文章信息并返回安全预览 → POST /api/admin/publish 写入 BLOG_CONTENT_DIR。请在不改变现有安全边界和发布语义的前提下，完成下面三项改进（第一期）。

【先阅读】
- docs/markdown-publishing.md：功能说明与安全约束
- docs/superpowers/specs/2026-11-01-admin-editor-phase1-design.md：本期设计
- lib/markdown.ts：importMarkdown（识别文章信息、makeSlug）、renderMarkdown（安全渲染，预览与公开页共用）
- app/api/admin/compose/route.ts、app/api/admin/preview/route.ts、app/api/admin/import/route.ts
- components/admin/AdminWorkspace.tsx（粘贴内容会带着 pasted-<UUID>.md 占位文件名请求 compose，见约第 142、188、247 行，这是难看短链的来源）、components/admin/MarkdownEditor.tsx、lib/markdown-editor.ts
- lib/published-storage.ts、lib/posts.ts、lib/site.ts
- 测试：tests/*.test.ts、scripts/verify-publishing.mjs

【一、拼音短链】
1. 短链按以下优先级生成：
   a. 原稿 frontmatter 有 slug：原样使用（仍经过 validateArticleMetadata 校验）。
   b. 导入的 .md 文件名主干本身是合法短链（匹配 ^[a-z0-9]+(?:-[a-z0-9]+)*$，如 soc-architecture-basics.md）：沿用。粘贴内容没有真实文件名，不适用此条。
   c. 否则由标题生成：汉字转无声调拼音（ü 写作 v），英文和数字保留并转小写，其余字符视为分隔，用单个连字符连接并去掉首尾连字符；超过 60 字符时在不超过 60 的最后一个连字符处截断；60 字符内没有连字符时直接截到 60 个字符，截断后不得以连字符结尾。
   d. 结果为空（如标题全是表情符号）时，回退为现有的 article-<16 位哈希>。
2. 粘贴内容既没有 frontmatter 标题也没有一级标题时，标题取正文第一段前 30 个字符（按 Unicode 字符计，空白折叠为单个空格），再按 c 生成短链。导入文件在没有标题时保持现有行为（用文件名主干作标题）。任何情况下都不应再出现 pasted-<UUID> 或 pasted-article 形式的标题或短链。
3. 拼音转换使用 pinyin-pro，只能在 server-only 模块中引用，不得进入浏览器端 bundle。把短链生成写成独立的纯函数模块（例如 lib/slug.ts），便于单元测试。
4. 重名处理：仅对按 c/d 自动生成的短链，若仓库 content/blog/<slug>.mdx（包括草稿）或持久目录中 <slug>.md 已存在，依次尝试 -2、-3……直到可用。frontmatter 或文件名给出的短链、用户在编辑器中手动修改过的短链都不自动改名，重名时仍由发布接口返回现有的 409 提示。
5. 编辑器：粘贴内容请求 compose 时不再发送占位文件名；导入文件时照常发送原文件名。浏览器里已存在的本机草稿（filename 为 pasted-<UUID>.md）恢复后必须能继续编辑和发布，且不能再把这个占位名当作标题或短链来源。用户手动修改过的字段始终优先（保持 mergeComposedMetadata 的语义）。
6. 短链输入框下方显示发布后的完整地址，如 xiangfuxing.tech/blog/<slug>（域名取 lib/site.ts 的 siteUrl）。

【二、正文不重复显示文章标题】
1. 在 renderMarkdown 中处理（预览和公开页共用）：正文第一个内容块如果是一级标题，不渲染；正文其余一级标题渲染为二级标题并进入目录（目录仍只收录 h2/h3）。
2. 只改变渲染结果，不改变存储的原文；发布指纹、幂等记录和返回的 content 字段保持原样。
3. 仓库 MDX 走 compileMDX，不要改动。

【三、桌面分栏滚动同步】
1. 仅在“分栏”视图且宽度达到 lg 断点时生效：编辑区与预览区等高（视口高度减去页头和编辑卡片头部，最小 480px），各自内部滚动；工具栏和视图切换始终可见。
2. 锚点数据：renderMarkdown 额外返回每个渲染出的标题的元素 id 及其在正文中的起始行号（取自 mdast position）。compose 接口把行号换算为编辑框原文（包含 frontmatter）的行号，在响应中以新增字段返回（例如 anchors: { id: string; line: number }[]）；preview 接口同样返回。只新增字段，不修改已有字段。
3. 前端：用与 textarea 样式一致的隐藏镜像元素测量各锚点行在编辑框中的像素位置，预览中按 id 取对应标题元素的位置；两侧各补充起点 (0, 0) 和终点（最大滚动位置），锚点之间线性插值；没有标题时按整体比例同步。把“给定一侧的滚动位置，计算另一侧位置”写成纯函数并单元测试。
4. 双向同步：滚动任一侧，另一侧跟随；用标记加 requestAnimationFrame 防止互相触发；内容变化、预览更新、窗口或栏宽变化后（防抖）重新测量。
5. 工具栏新增“同步滚动”开关，默认开启，偏好存入 localStorage。窄屏下的编辑/预览切换视图不做同步。
6. 不引入新的前端依赖。

【约束】
- 现有安全措施一律不放宽：禁用原始 HTML、链接与图片协议限制、管理员会话与 Origin 校验、no-store 响应头、2 MiB 限制。
- API 只增不改：已有字段、状态码和错误文案保持兼容。
- 不修改 content/blog/ 下已有的文章。
- 同步更新 docs/markdown-publishing.md 中“中文文件名会得到稳定的 ASCII 短链”的描述。

【测试】
- 新增单元测试：
  · 短链：纯中文、中英混合（如“5G 系统仿真入门”）、含标点、超长截断到 60 字符以内且不以连字符结尾、空结果回退 article-<哈希>、重名依次加 -2/-3、frontmatter 和合法文件名优先、粘贴无标题时取首段前 30 个字符。
  · 渲染：首个一级标题被移除；中间的一级标题变为二级标题并出现在目录；返回的锚点 id 与 HTML 中的 id 一一对应，行号正确（含 frontmatter 偏移）。
  · 滚动映射纯函数：锚点之间插值、两端边界、无锚点时按比例、锚点位置非单调时不抛错。
- 受影响的旧断言改为新规则下的期望，不要删除用例：tests/markdown.test.ts 中“中文文件名得到 article-<哈希>”、tests/compose.test.ts 中 pasted-article、tests/markdown-editor.test.ts 中依赖 pasted-* 占位名的用例。
- scripts/verify-publishing.mjs 补充：粘贴以“# 导入文章”开头的正文后短链为 dao-ru-wen-zhang；发布后公开详情页 HTML 中只有一个 <h1。

【完成标准】
1. 依次运行并全部通过：npm run type-check、npm run lint、npm test、npm run build、npm run test:integration。
2. 启动 npm run dev 后在浏览器检查（.env.local 已有仅限 localhost 的测试管理员配置，口令在文件注释中）：粘贴中文标题文章得到拼音短链；预览和公开页不重复显示标题；长文在分栏模式下两侧按标题对齐滚动，关闭开关后不再联动；手机宽度下编辑/预览切换正常。
3. 在新分支上提交，不要推送，也不要部署。
4. 最后用中文汇报：改了哪些文件、各项检查结果、未完成或有疑问的地方。
````
