# 向福星的个人博客

一个面向无线通信、系统仿真、AI辅助研发与技术管理的个人知识沉淀站点。整体风格偏专业、克制、阅读友好，适合作为长期维护的技术博客与个人品牌主页。

## 技术栈

- Next.js 14 App Router
- React + TypeScript
- Tailwind CSS
- MDX：`next-mdx-remote/rsc`
- 代码高亮：`rehype-pretty-code`
- 数学公式：KaTeX
- Markdown 扩展：GFM、表格、引用、代码块
- 本地文章搜索、分类、标签、归档
- 全文搜索、分类详情页、标签详情页
- sitemap、robots
- 深色模式：`next-themes`

## 本地运行

```bash
npm install
npm run dev
```

开发服务器默认运行在：

```bash
http://localhost:3000
```

构建检查：

```bash
npm run build
npm run type-check
```

## 如何新增文章

在 `content/blog` 下新增一个 `.mdx` 文件，文件名会作为文章 URL 的 slug。

示例：

```mdx
---
title: "一文读懂系统仿真"
description: "从无线通信研发视角解释系统仿真的价值、建模方法和应用场景。"
date: "2026-04-27"
category: "系统仿真"
tags: ["无线通信", "系统仿真", "5G", "数字孪生"]
featured: true
draft: false
---

## 文章小标题

正文内容。
```

字段说明：

- `title`：文章标题
- `description`：文章摘要，用于列表页与 SEO
- `date`：发布时间
- `category`：文章分类
- `tags`：文章标签
- `featured`：是否展示在精选文章区域
- `draft`：是否为草稿，`true` 时不会展示

## 如何修改个人信息

站点基础信息集中在 `lib/site.ts`：

- 站点名称、描述、URL
- 作者名
- 邮箱、GitHub、知乎、小红书、抖音、微信
- 导航菜单
- 默认分类

项目数据集中在 `lib/projects.ts`，可替换为真实项目、论文、专利、演讲或内部实践复盘。

## 如何部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目并选择该仓库。
3. Framework Preset 选择 Next.js。
4. Build Command 使用 `npm run build`。
5. 部署前把 `lib/site.ts` 中的 `siteUrl` 改成真实域名。

sitemap 地址：

```text
/sitemap.xml
```

## 目录结构

```text
app/                 Next.js App Router 页面与 SEO 路由
components/          复用组件，如 Header、ArticleCard、TOC
content/blog/        MDX 博客文章
lib/                 站点配置、文章读取、项目数据、工具函数
styles/              全局样式与 MDX 排版样式
public/              静态资源目录
```

## 已实现页面

- `/` 首页
- `/about` 关于我
- `/blog` 博客列表、搜索、分类和标签筛选
- `/blog/[slug]` 博客详情
- `/projects` 项目展示
- `/methodology` 方法论
- `/archive` 文章归档
- `/categories` 分类索引
- `/categories/[category]` 分类文章列表
- `/tags` 标签索引
- `/tags/[tag]` 标签文章列表
