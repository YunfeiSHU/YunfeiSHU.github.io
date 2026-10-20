# 配置说明

## 站点与个人资料

集中维护在 `src/config.ts`：

```ts
siteConfig = {
  title: "YunfeiSHU's Blog",
  subtitle: "记录技术学习与生活思考的地方",
  lang: "zh_CN",
  themeColor: { hue: 250, fixed: false },
  banner: { enable: false, src: "", ... },
  toc: { enable: true, depth: 2 },
  ogImage: "/og-default.png",
}

profileConfig = {
  name: "YuiMon",
  bio: "YuifeiSHU Email : YuiMon05@163.com",
  avatar: "assets/images/avatar.jpg",
  links: [
    { name: "GitHub", ... },
    { name: "Email", ... },
  ],
}

homeConfig = {
  intro: "记录技术学习、项目实践与日常思考。",
  techStack: ["Go", "Java", "MySQL", "Redis", "计算机网络", "AI 应用"],
  featuredProjectSlugs: ["media-community-backend", "ai-assistant"],
}
```

- 头像来自 GitHub 公开头像（实际为 JPEG，已改名为 `avatar.jpg`）。
- `bio` 保留 GitHub 原文；如需更自然的简介，直接改该字段。
- `banner.enable = false`，未提供横幅图片前不启用。
- 导航在 `navBarConfig` 中维护，当前包含首页、归档、项目、关于、GitHub。

## 项目

`src/data/projects.ts` 只维护真实项目：

- `media-community-backend`
- `ai-assistant`

每项包含 `slug/name/summary/stack/features/challenges/repoUrl/category/featured/updated`。`ProjectCard` 的“设计取舍与已知限制”只引用 README 中明确写出的内容。

新增项目时：

1. 确认仓库真实存在、README 有可引用的事实；
2. 在 `projects.ts` 增加数据；
3. 如需首页精选，设置 `featured: true`；
4. 不编造性能数字、上线成果或未实现能力。

## 文章

`src/content/posts/` 下 Markdown，schema 在 `src/content/config.ts`：

- `title`、`published` 必填；
- `updated`、`draft`、`description`、`image`、`tags`、`category`、`lang` 可选；
- 草稿 `draft: true` 不进入构建、RSS、sitemap、搜索；
- 图片相对文章目录（如 `./cover.jpg`）或 `public` 路径（`/images/...`）。

## Giscus

`src/config.ts` 的 `giscusConfig` 默认关闭：

```ts
giscusConfig = {
  enable: false,
  repo: "",
  repoId: "",
  category: "",
  categoryId: "",
  mapping: "pathname",
  term: undefined,
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",
  lang: "zh-CN",
  theme: "preferred_color_scheme",
}
```

启用前提：

1. 仓库公开；
2. 仓库 Settings → General → Features 开启 Discussions；
3. 安装并授权 [Giscus App](https://github.com/apps/giscus)；
4. 在 [giscus.app](https://giscus.app/) 生成 `repoId`、`categoryId`；
5. 填入上述公开字段并把 `enable` 设为 `true`。

只允许公开 ID；**不要**把 GitHub token、私钥或任何 secret 写进客户端配置。

## 部署配置

`astro.config.mjs`：

- `SITE_URL`：默认 `https://YunfeiSHU.github.io/`
- `BASE_PATH`：默认 `/`（用户站点根路径；项目站点可设为 `/repo/`）
- 构建后 `dist/` 由 GitHub Pages Actions 上传。

## 内容占位与真实性

- 目前没有真实文章，`src/content/posts/` 保留了 5 篇 Fuwari 示例文章，尚未删除或改写成个人文章。
- About 只包含 GitHub 资料和最小真实介绍，没有虚构经历。
- Projects 只展示两个真实仓库；`golang_interview`、`Resume`（fork）、旧 Hugo 博客不展示。
- Giscus 未配置真实 ID，评论区默认隐藏。
