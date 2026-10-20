# YunfeiSHU's Blog

基于 [Fuwari](https://github.com/saicaca/fuwari) 的个人技术博客与开发者作品集。

- 线上地址：<https://YunfeiSHU.github.io/>（已部署）
- GitHub：<https://github.com/YunfeiSHU>
- 技术栈：Astro 5、TypeScript、Tailwind CSS 3、Svelte 5、Pagefind、Expressive Code
- 保留 Fuwari 的 MIT 许可证与 Footer 署名

## 功能

- Markdown 文章、草稿、标签、分类、归档、RSS、sitemap
- Pagefind 全文搜索（中文索引）
- 明暗主题与主题色
- 文章目录、KaTeX、代码高亮、图片放大
- Projects 作品集（仅展示最近更新的两个真实项目）
- Giscus 评论组件（默认关闭，需填入公开配置）

## 本地开发

要求 Node.js 20+、pnpm 9.14.4。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 <http://localhost:4321>。

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm check` | Astro/Svelte/TypeScript 诊断 |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm exec biome ci ./src` | 代码质量检查 |
| `pnpm build` | 构建并生成 Pagefind 索引到 `dist/` |
| `pnpm verify` | 构建产物完整性检查（需先 build） |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm new-post <filename>` | 新建文章 |

## 写文章

文章放在 `src/content/posts/`，frontmatter 示例：

```yaml
---
title: "文章标题"
published: 2026-10-20
description: "摘要"
image: ""
tags: ["Go", "并发"]
category: "Go 后端"
draft: false
lang: zh_CN
---
```

`draft: true` 的文章不会进入构建、RSS、sitemap 或 Pagefind 索引。

## 项目数据

项目数据在 `src/data/projects.ts`，只维护真实存在的仓库：

- `media-community-backend`：音视频社区后端
- `ai-assistant`：个人智能 Agent 平台

`/projects/` 页面与首页“精选项目”都读取该文件；没有真实数据时不要添加占位项目。

## Giscus 评论

在 `src/config.ts` 的 `giscusConfig` 中填入公开配置：

```ts
giscusConfig = {
  enable: true,
  repo: "YunfeiSHU/YunfeiSHU.github.io",
  repoId: "...",
  category: "Announcements",
  categoryId: "...",
  mapping: "pathname",
  ...
}
```

需要仓库公开、开启 Discussions，并完成 Giscus App 授权。只放公开 ID，不要提交 token。未配置时评论区隐藏。

## 部署

使用 GitHub Actions + GitHub Pages，见 [docs/deployment.md](docs/deployment.md)。构建产物在 `dist/`，`astro.config.mjs` 支持 `SITE_URL`/`BASE_PATH` 环境变量。

## 目录

```text
src/
  components/     布局、卡片、搜索、归档、评论
  content/posts/  Markdown 文章
  data/projects.ts
  layouts/
  pages/
  styles/
  config.ts
```

## 文档

- [实施计划](docs/implementation-plan.md)
- [架构](docs/architecture.md)
- [配置](docs/configuration.md)
- [测试](docs/testing.md)
- [部署](docs/deployment.md)

## License

本项目基于 Fuwari，遵循 MIT License；文章内容默认采用 CC BY-NC-SA 4.0（可在 `src/config.ts` 调整）。原始 Fuwari 许可证与版权声明保留在 [LICENSE](LICENSE)。
