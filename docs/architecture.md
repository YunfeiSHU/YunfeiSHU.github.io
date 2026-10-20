# 架构说明

## 技术栈

| 层 | 选型 |
|---|---|
| 静态站点 | Astro 5（`output: static`） |
| 样式 | Tailwind CSS 3 + Stylus/CSS 变量 |
| 交互 | Svelte 5（搜索、归档、主题、评论） |
| 搜索 | Pagefind 1.4（构建后生成索引） |
| 代码高亮 | Expressive Code |
| 页面过渡 | Swup |
| 数学/图片 | KaTeX、PhotoSwipe、Sharp |
| 部署 | GitHub Actions + GitHub Pages |

## 页面与路由

| 路由 | 文件 | 说明 |
|---|---|---|
| `/`、`/2/` | `src/pages/[...page].astro` | 首页个人介绍、精选项目、文章分页 |
| `/posts/<slug>/` | `src/pages/posts/[...slug].astro` | 文章详情、TOC、License、评论占位 |
| `/projects/` | `src/pages/projects.astro` | 两个最近更新项目 |
| `/archive/` | `src/pages/archive.astro` | 归档 + 标签/分类筛选 |
| `/about/` | `src/pages/about.astro` | 渲染 `src/content/spec/about.md` |
| `/rss.xml` | `src/pages/rss.xml.ts` | 全文 RSS |
| `/robots.txt` | `src/pages/robots.txt.ts` | robots + sitemap |
| `/404` | `src/pages/404.astro` | 品牌化 404，`noindex` |

## 数据流

1. `src/content/posts/` 的 Markdown 由 Astro Content Collections 读取，schema 在 `src/content/config.ts`。
2. `src/utils/content-utils.ts` 过滤草稿（生产环境）、排序、生成标签/分类计数。
3. 首页/文章页通过 `PostPage`、`PostCard`、`PostMeta` 渲染。
4. `pnpm build` 先生成 `dist/`，再由 Pagefind 扫描 `dist/**/*.html` 生成 `dist/pagefind/`。
5. 搜索由 `Navbar.astro` 动态加载 Pagefind，`Search.svelte` 负责 UI；语言由 `siteConfig.lang` 显式传入。
6. 归档由 `ArchivePanel.svelte` 读取 URL 查询参数，在客户端筛选并按年分组；筛选变化使用 `history.replaceState` 同步 URL。

## 主题

- 颜色由 `--hue` 驱动，定义在 `src/styles/variables.styl`。
- `Layout.astro` 在 head 内联脚本中恢复 `localStorage` 的 theme/hue，避免闪烁。
- `LightDarkSwitch.svelte` 切换 light/dark/auto；`DisplaySettings.svelte` 调整 hue。
- Expressive Code 通过 `data-theme` 同步代码主题。

## 搜索

- 索引语言：`zh-cn`（站点主语言 `zh_CN`）。
- `Navbar.astro` 调用 `pagefind.options({ language: pagefindLanguage, excerptLength: 20 })`，保证中文查询使用正确索引。
- 文章正文、标题、摘要、标签、分类会进入索引；标签/分类通过正文末尾的 `sr-only` 元数据补足（不改变视觉布局）。
- 草稿不构建，因此不会进入索引。

## 评论

- `Comments.svelte` 使用 Giscus 官方脚本，按 `pathname` 映射 discussion。
- 默认 `giscusConfig.enable = false`，无配置时评论区完全不渲染。
- 主题变化通过 `MutationObserver` + `postMessage` 同步到 Giscus iframe。
- 评论是外部服务，失败不会影响文章正文。

## 部署

- `deploy.yml`：check/type-check/build → 上传 `dist` → `actions/deploy-pages`。
- 目标仓库：`YunfeiSHU/YunfeiSHU.github.io`，用户站点根路径 `/`。
- 旧 Hugo 的构建分支 `doc` 与源分支 `main` 保留；新站推送到 `main` 并通过 Pages Actions 部署。详见 `deployment.md`。
