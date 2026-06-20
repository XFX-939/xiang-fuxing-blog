# 《为什么华为总能干一行成一行》发布设计

## 目标

将用户提供的文章以忠实原稿的方式发布到个人博客，并部署到 `xiangfuxing.tech` 的既有 Ubuntu 生产环境。

## 内容设计

- 标题：为什么华为总能干一行成一行
- URL：`/blog/why-huawei-succeeds-across-industries`
- 发布日期：2026-06-20
- 分类：技术管理
- 标签：华为、IPD、组织能力、产品管理、技术管理
- 状态：公开发布，不设为首页精选
- 编辑边界：保留原文观点、章节和叙事节奏，只补齐 frontmatter，并做必要的 MDX 排版处理。

## 实现与验证

文章写入 `content/blog/why-huawei-succeeds-across-industries.mdx`。先运行类型检查和生产构建，确认新路由可生成；再把完整站点复制到 Ubuntu 的新 release 目录，在服务器构建完成后切换 `current` 软链接并重启 `xiang-fuxing-blog.service`。上线后检查服务状态、活动 release、文章 URL 的 HTTP 状态及标题和关键正文。

## 非目标

- 不改动网站组件、导航、主题或分类体系。
- 不新增封面图。
- 不对文中历史数据做事实核查或添加外部引用。
