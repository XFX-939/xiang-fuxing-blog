# Markdown 编辑与直接发布

新版后台默认提供可直接输入和粘贴的 Markdown 编辑器，文件导入作为辅助入口。日常发布只需访问 `/admin`，粘贴或编写正文，检查自动识别的信息与预览，再确认发布；不需要先创建或上传文件。

本轮编辑器改动需要部署新版代码并重启服务后才会出现在网站上，本地改动不会自动更新线上。这份说明不代表新版已经上线。首次启用还需配置下述环境变量；配置完成后，日常发文不需要重新构建、SSH 或重启。

## 管理员使用

1. 打开网站 `/admin`，输入管理员口令。
2. 登录后即可在 Markdown 文本框中粘贴或编写文章，文章信息也会直接展示。工具栏用于插入常见 Markdown 语法。
3. 后台自动识别标题、摘要、日期、分类、标签和文章地址；可粘贴包含 YAML frontmatter 的原稿。缺省或无效日期使用上海当天并按需提醒，信息可以继续修改。文章地址默认由标题生成：中文转为拼音，英文转为小写加连字符，最长 60 字符；手动改标题后地址随之更新，与已有文章重名时自动加 `-2`、`-3` 并提醒确认；清空地址即恢复自动生成。
4. 输入后自动更新安全预览，更新过程不阻断继续编辑。宽屏编辑区与预览并排；确认最新预览完成后再发布。预览与前台使用同一个 Markdown 渲染器。宽屏分栏时编辑区与预览按标题同步滚动，可在工具栏关闭“同步滚动”。正文开头的一级标题不会在文章页重复显示，其余一级标题按二级标题展示。
5. 如果存在相对图片、HTML 或原稿草稿标记等提醒，先检查并确认，再点“确认发布”。
6. 成功后点“查看公开文章”。同一请求重试会返回同一文章；地址重名会提示修改，不会覆盖旧文。

需要导入已有文件时仍可使用辅助导入入口，接受最大 2 MiB 的 UTF-8 `.md`。文件名本身是合法短链（如 `my-article.md`）时沿用文件名，否则按标题生成拼音短链，可在发布前修改。粘贴和导入都会保留正文，不会用 AI 改写原稿。

浏览器允许本地存储时，可以恢复当前浏览器保存的未发布草稿。它不等于服务器草稿，也不在设备之间同步；在共用设备上应留意本地内容。重要原稿请另行保存。

当前只提供新文章发布，不包含在线修改/删除已发布文章、多用户、审核、定时发布或图片管理。HTTPS 外链及已有站内绝对路径图片可以展示；本地相对路径图片不会上传到服务器。

## 编辑与发布接口

编辑器通过 `POST /api/admin/compose` 发送 JSON：`{ source, filename?, title? }`，`source` 为完整 Markdown 文本；`filename` 只在导入文件时提供；`title` 是编辑器中手动修改的标题，只用于生成自动地址。接口返回 `{ content, metadata, warnings, html, toc, anchors }`，用于自动识别信息和安全预览，`anchors` 为各标题在原文中的行号，用于同步滚动；这一步不会写入公开文章。

用户确认后，编辑器再将识别后的正文、信息和幂等请求标识发送到 `/api/admin/publish`。从粘贴到发布不需要 multipart 请求或本地文件。`/api/admin/import` 保留用于已有 `.md` 文件，`/api/admin/preview` 用于已有信息的预览更新；这些接口都要求管理员会话及正确 Origin。

## 环境变量

| 变量 | 用途 |
| --- | --- |
| `BLOG_ADMIN_ORIGIN` | 后台实际访问源，精确到协议、域名和端口，例如 `https://xiangfuxing.tech`；不含路径、查询或 fragment。 |
| `BLOG_ADMIN_PASSWORD_HASH` | 由哈希脚本生成的 `scrypt$盐$派生值`。不设置明文密码。 |
| `BLOG_ADMIN_SESSION_SECRET` | 随机值，至少 32 字符。 |
| `BLOG_CONTENT_DIR` | 文章持久目录；生产必须为代码、`releases` 和 `current` 之外的绝对路径。 |

生产配置缺失时后台发布接口关闭；没有配置文章目录时，原有仓库文章仍可阅读。本地开发默认保存到已被 Git 忽略的 `.local-data/blog`。

生成口令哈希（Bash；密码不进入命令行参数或历史）：

```bash
read -rsp '管理员口令（至少12字符）: ' blog_admin_password
printf '\n'
printf '%s' "$blog_admin_password" | npm run --silent admin:hash
unset blog_admin_password
```

生成会话密钥：

```bash
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
```

**Next.js 的 `.env.local` 会展开 `$`，即使值在单引号中。** 将哈希写入 `.env.local` 时，每个 `$` 都必须写成 `\$`，例如：

```dotenv
BLOG_ADMIN_PASSWORD_HASH='scrypt\$盐\$派生值'
```

systemd 的 `EnvironmentFile` 不做这种变量展开，应使用原始 `scrypt$盐$派生值`，无需反斜杠。两种配置方式不要混淆。`.env.example` 仅含占位符，不能直接用于生产。

## Ubuntu 配置

沿用现有 `releases/<timestamp>` 构建、切换 `current`、重启 `xiang-fuxing-blog.service` 的流程；无需更换部署平台。

1. 为实际 systemd 服务用户创建 `/var/lib/xiang-fuxing-blog/content`，目录权限建议 `0700`，并确保该用户可以读写。可先用 `systemctl show xiang-fuxing-blog.service -p User --value` 确认服务用户。
2. 将四个环境变量放入受保护、独立于 release 的服务环境文件，例如 `/etc/xiang-fuxing-blog/publishing.env`，权限 `0600`。在 systemd override 中引用 `EnvironmentFile=/etc/xiang-fuxing-blog/publishing.env`。
3. 生产源使用 `https://xiangfuxing.tech`；外网 HTTP 配置会关闭后台。本机 HTTP 仅允许 localhost、127.0.0.1 或 ::1。
4. 修改 systemd 配置后执行 `daemon-reload`，按已有发布流程重启一次。后续发文不再重启。
5. HTTPS 反向代理必须保留浏览器 `Origin`，后台接口不得被 CDN 或反代缓存。应用不会通过任意 `X-Forwarded-*` 声明信任来源。
6. 代理上传上限可设为 `3m`，大于应用的 2 MiB 文件限额；可为 `/api/admin/login` 增加可信反代限流。
7. 所有本机 Node worker / release 均必须使用同一个持久目录。目录应位于支持原子硬链接和 fsync 的本机文件系统，不支持对象存储或未经验证的网络文件系统。

部署与回滚不要复制、清空或替换持久目录。回滚到仍支持本功能的 release 后，后台发布的文章继续可见；回滚到本功能实现之前的代码不会删除数据，但旧代码不具备读取这些文章的能力。

## 存储与备份

- 已发布文章是持久目录内的 `<slug>.md`，包含标准 frontmatter、规范化元信息和原样正文，可直接备份和导出。
- `.requests/<UUID>.json` 是不可变幂等记录，先于文章提交。崩溃后可用同一个请求和内容重试，不需要清理全局锁。
- 内容经渲染和序列化校验后写入隐藏临时文件、fsync，再以硬链接原子创建目标；不会覆盖已存在的文章。隐藏文件不进入公开索引。
- 备份**完整目录，包括 `.requests`**；恢复时保留服务用户的所有权和读写权限。正文不进 Git，因此不能用代码仓库代替备份。
- 推荐对该目录做服务器快照或增量备份；需要一致的迁移副本时，暂停发布并复制目录，阅读服务可继续运行。
- 正常运行后若看到损坏文章的服务器日志，可从备份恢复对应文件。单篇损坏会被跳过，不阻塞其他文章。

## 缓存与内容安全

仓库 MDX 继续使用受信任 MDX 编译。后台发布的文章（粘贴或导入）只走普通 Markdown：关闭原始 HTML，表达式和代码均不执行；限制链接和图片协议，KaTeX 不信任 HTML 指令，高亮不执行代码围栏元信息。预览与公开文章使用相同渲染器和目录锚点。文章结构化数据中的 `<` 也被转义。

文章索引按文件列表、inode、时间和大小检查变化，其他 worker 会看到新增文件。内容页面及 sitemap 动态读取，搜索响应不缓存，发布后触发页面缓存失效。与文章无关的页面保留原有静态行为。

管理员会话为 8 小时的签名 HttpOnly、SameSite=Strict Cookie；HTTPS 自动 Secure。修改口令哈希或会话密钥会使旧会话失效。退出清除当前浏览器 Cookie；复制出去的旧令牌在过期或凭据轮换前仍有效。

应用登录预算为每个进程全局 10 次/15 分钟，最多两个并发 scrypt；成功尝试也计入预算，重启会重置计数。多进程的统一防暴力破解需要可信反代限流或额外共享策略。

## 验证

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run test:integration
```

测试只使用临时目录和随机测试凭据，不修改原有文章。集成脚本使用生产构建的真实 Next 请求处理器，在内存中处理 HTTP 请求而不监听端口；先检查已登录后台初始 HTML 已含 Markdown 输入区和文章信息，再验收 JSON 粘贴、自动识别、安全预览及确认发布的无文件流程，并保留原文件导入回归。

公开验收覆盖新文章、分类、标签、搜索、首页、归档、sitemap、权限、安全、独立进程持久化，以及模拟 release 工作目录切换与回滚。初始 HTML 检查不等于浏览器交互测试；桌面双栏、输入不被异步预览阻断、工具栏、本机草稿恢复、真实 HTTPS 代理、服务器权限、备份恢复和真实 release 切换还应在对应环境核验。
