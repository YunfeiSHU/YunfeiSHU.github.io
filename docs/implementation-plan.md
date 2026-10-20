# 基于 Fuwari 的个人技术博客与作品集 — 实施计划

> 阶段：阶段 0–5 已完成；站点已通过 GitHub Actions + GitHub Pages 部署并完成线上检查。  
> 状态：计划已根据 2026-10-20 的 GitHub 资料和用户确认更新；本文件不把未完成的功能写成已完成。
> 基线源码：`https://github.com/saicaca/fuwari.git`，`main` 分支，commit `6d39b0dec41282e7852e23e032998a5789abee28`（2025-12-12，`chore(deps): bump the patch-updates group ... (#681)`）。  
> 本地环境：Windows，Node.js `v24.16.0`，pnpm `9.14.4`（`packageManager` 固定版本），Git `2.46.0.windows.1`。  
> 重要原则：保留 Fuwari 的 Astro + Tailwind + Svelte + Pagefind 技术栈，不重写已有功能；不编造个人信息、项目、测试结果或部署状态。

---

## 1. 执行摘要

### 1.1 结论

Fuwari 当前版本已经是一个功能完整的静态博客模板，**文章、分页、Markdown 扩展、目录、RSS、sitemap、Pagefind 搜索、标签/分类筛选、明暗主题、响应式布局、页面过渡、图片放大、About 页面**均已存在。项目不需要更换框架，也不需要新造一套文章模型或搜索索引。

真正缺少的是：

1. **Projects 页面与项目数据模型**；
2. **真实个人资料、首页个人展示、About 内容**；
3. **Giscus 评论**；
4. **标签/分类筛选的交互完善**（结果数量、无结果提示、清空筛选、URL 状态同步）；
5. **中文搜索的运行时语言选择**（模板没有中文内容，本轮用临时文章验证了 Pagefind 的 CJK 索引能力，但默认搜索实例会按当前页面语言选择索引）；
6. **404 页面、canonical、OG image 等 SEO 补齐**；
7. **GitHub Pages/Vercel 的实际部署工作流**；
8. **基线质量修复**：`astro check` 2 个类型错误、`type-check` 11 个 `isolatedDeclarations` 错误、样式入口的跨文件 `@apply` 构建竞态。

### 1.2 源码修改概览

**阶段 0**只做了一处**最小构建修复**：`src/styles/markdown.css` 顶部增加 `@import "./main.css";`。
  - 原因：`markdown.css` 第 23 行 `@apply ... link ...` 依赖 `main.css` 的 `.link`，但当前模板把 `src/styles/*` 作为彼此独立的 CSS 入口处理，Tailwind/PostCSS 处理顺序存在竞态；在干净的 pnpm 9 安装上，`pnpm build` 会以 `The 'link' class does not exist` 失败。
  - 证据：修复前多次干净构建失败；修复后连续两次清理 `dist/.astro/node_modules/.vite` 的构建均成功，CSS 总量约 238 KB，`.card-base` 只出现 1 次，没有重复引入。
  - 回滚方式：删除这两行即可回到模板原始状态，但原始状态在干净安装上不能稳定构建。

**阶段 1**在用户确认 GitHub 资料后执行，实际修改见第 16 节：基线类型修复、个人资料/头像/站点 URL/About 最小真实内容。

**阶段 2**按用户确认的“最近更新的两个项目”执行，实际修改见第 17 节：`/projects/`、项目卡片、首页个人介绍与精选项目；`golang_interview`、`Resume`、旧博客不展示。Giscus 与标签/搜索增强仍未开始。

### 1.3 基线检查结果（真实输出摘要）

| 命令 | 结果 | 说明 |
|---|---|---|
| `pnpm install --frozen-lockfile` | 成功 | pnpm 9.14.4；esbuild/sharp/@parcel/watcher/swup 的 postinstall 正常执行 |
| `pnpm check`（`astro check`） | **失败，2 errors** | 模板自身类型错误，详见 9.2 |
| `pnpm type-check` | **失败，11 errors** | `--isolatedDeclarations` 相关，非运行时错误 |
| `pnpm exec biome ci ./src` | 成功 | LF 换行下通过；CRLF 检出时会误报 63 个格式错误 |
| `pnpm build` | **成功（修复后）** | `astro build && pagefind --site dist`；8 个页面、6 个 Pagefind 页面、678 词、1 个语言 `en` |
| `pnpm dev --host 127.0.0.1 --port 4323` | 成功 | 约 8.2 秒 ready，`/` 返回 200 |
| `pnpm preview` + 路由检查 | 成功 | `/`、`/about/`、`/archive/`、`/posts/guide/`、RSS、sitemap、robots、pagefind 均 200；未知路径 404 |
| Pagefind Node 查询 | 成功 | `guide`=1、`astro`=1、`markdown`=4、不存在的中文词=0 |
| 临时中文文章 + Pagefind | 部分成功 | 索引识别 `zh-cn`；显式 `language: "zh-cn"` 后“并发/协程/通道/数据竞争”各命中 1 篇；默认实例按页面语言选索引 |
| Headless Chrome 归档筛选 | 成功 | `?tag=Markdown`=3 篇，`?category=Guides`=1 篇，组合/不存在标签=0 篇；无结果时页面为空白列表 |
| 草稿检查 | 成功 | 构建产物、RSS、sitemap 中均无 `Draft Example`；RSS 5 篇，sitemap 8 个 URL |
| 404/canonical/og:image | **缺失** | 无 `dist/404.html`；首页无 `rel="canonical"`、无 `og:image` |

> 未执行或未能验证的项目会在第 12、13 节明确列出，不把代码阅读当成测试成功。  
> 阶段 1 复测：`pnpm check`、`pnpm type-check`、`biome ci`、`pnpm build` 均通过；详见第 16 节。  
> 阶段 2 复测：构建 9 页面、Pagefind 6 页/711 词；`/projects/` 200；详见第 17 节。

---

## 2. 源码获取与 Git 状态

### 2.1 获取过程

```powershell
git clone --depth 1 https://github.com/saicaca/fuwari.git .fuwari-tmp
# 将 .fuwari-tmp 内容移动到工作区根目录，保留 .git
git fetch --deepen=500 origin main
```

结果：

- 克隆成功，`origin` 为 `https://github.com/saicaca/fuwari.git`，分支 `main`。
- HEAD：`6d39b0dec41282e7852e23e032998a5789abee28`。
- 克隆与 GitHub 的 Git 协议访问正常；阶段 0 首次审查时直接 HTTPS 访问 `raw.githubusercontent.com`、`fuwari.vercel.app`、GitHub API 出现连接关闭/DNS 失败，后续复查 `api.github.com` 与 `YunfeiSHU.github.io` 已可访问，`github.com` HTML 仍超时。因此审查以实际源码、本地构建和本地浏览器测试为准，不把外部页面当运行结果。
- 工作区原本只有一个任务书 Markdown，不是 Git 仓库；获取源码前已确认没有项目文件需要保护。

### 2.2 当前 Git 状态

```text
 M src/styles/markdown.css
?? 项目代码生成规范.md        # 用户提供的任务书，保持未修改
?? docs/implementation-plan.md # 本文件
```

后续阶段开始前仍应执行 `git status --short`，确认没有用户改动被覆盖。

### 2.3 建议的仓库整理（阶段 1 执行）

当前 `.git` 保留的是上游 Fuwari 历史，`origin` 仍指向 `saicaca/fuwari`。建议：

```powershell
git remote rename origin upstream
git remote add origin <用户自己的仓库地址>
```

在用户提供仓库地址前不要推送；不要删除 `LICENSE` 和 Footer 中的 Fuwari 署名。

---

## 3. 项目结构与技术栈

### 3.1 目录概况

```text
.
├─ .github/
│  ├─ workflows/build.yml        # astro check + astro build（无 Pagefind、无部署）
│  ├─ workflows/biome.yml        # biome ci ./src
│  └─ dependabot.yml
├─ docs/                         # 上游 README 的多语言版本
├─ public/favicon/               # 浅色/深色 favicon
├─ scripts/new-post.js           # 新建文章脚本
├─ src/
│  ├─ assets/images/             # demo-avatar.png、demo-banner.png
│  ├─ components/
│  │  ├─ control/                # BackToTop、ButtonLink、ButtonTag、Pagination
│  │  ├─ misc/                   # ImageWrapper、License、Markdown
│  │  ├─ widget/                 # Categories、Tags、Profile、TOC、SideBar、DisplaySettings、NavMenuPanel、WidgetLayout
│  │  ├─ ArchivePanel.svelte     # 归档客户端筛选
│  │  ├─ Search.svelte           # Pagefind 搜索
│  │  ├─ Navbar.astro / Footer.astro / PostCard.astro / PostMeta.astro / PostPage.astro
│  │  ├─ ConfigCarrier.astro     # 把 config hue 暴露给客户端
│  │  └─ GlobalStyles.astro      # 空组件（历史遗留）
│  ├─ config.ts                  # 站点/导航/个人资料/许可证/代码主题配置
│  ├─ content/
│  │  ├─ config.ts               # posts / spec 集合 schema
│  │  ├─ posts/                  # 5 篇已发布示例 + 1 篇 draft
│  │  └─ spec/about.md           # About 页内容
│  ├─ i18n/                      # 10 种语言
│  ├─ layouts/Layout.astro       # HTML head、主题初始化、Swup、PhotoSwipe
│  ├─ layouts/MainGridLayout.astro
│  ├─ pages/
│  │  ├─ [...page].astro         # 首页 + 分页
│  │  ├─ posts/[...slug].astro   # 文章详情
│  │  ├─ about.astro / archive.astro
│  │  ├─ rss.xml.ts / robots.txt.ts
│  │  └─ （无 404、无 projects、无 tags/categories 独立路由）
│  ├─ plugins/                   # remark/rehype 扩展、Expressive Code 插件
│  ├─ styles/                    # main.css、markdown.css、variables.styl、transition.css 等
│  ├─ types/config.ts
│  └─ utils/                     # content/date/setting/url 工具
├─ astro.config.mjs
├─ pagefind.yml
├─ package.json / pnpm-lock.yaml
├─ tailwind.config.cjs / postcss.config.mjs / svelte.config.js / tsconfig.json
├─ biome.json
└─ vercel.json                   # 空对象
```

### 3.2 技术栈与版本（以实际 `package.json` / lockfile 为准）

| 层 | 技术 | 版本/说明 |
|---|---|---|
| 静态站点框架 | Astro | `5.13.10`，output `static` |
| 语言 | TypeScript | `5.9.3` |
| 样式 | Tailwind CSS | `3.4.19`，`darkMode: "class"` |
| 交互组件 | Svelte | `5.39.8`，`@astrojs/svelte 7.2.3` |
| 主题 CSS | Stylus + CSS variables | `src/styles/variables.styl` |
| 搜索 | Pagefind | `1.4.0`，构建后 `pagefind --site dist` |
| 代码高亮 | Expressive Code | `0.41.4`，`github-dark` 主题 |
| 页面过渡 | Swup | `@swup/astro 1.7.0` |
| 数学 | KaTeX | `0.16.27` |
| 图片 | Sharp | `0.34.5`，`astro:assets` |
| 图标 | Astro Icon + Iconify | `astro-icon 1.1.5` |
| 图片放大 | PhotoSwipe | `5.4.4` |
| 格式化/检查 | Biome | `2.2.5` |
| 包管理器 | pnpm | `packageManager: pnpm@9.14.4`，lockfileVersion 9.0 |

> 中文文档 `docs/README.zh-CN.md` 写的是 Node <= 22、pnpm <= 9；主 README 写 Node >= 20、pnpm >= 9。实际在 Node 24.16 + pnpm 9.14.4 下安装和构建成功；CI 矩阵仍是 Node 22/23。阶段 1 应决定统一到 Node 22 LTS，避免版本漂移。

---

## 4. 现状审查

### 4.1 配置与主题机制

- **站点配置集中在 `src/config.ts`**：
  - `siteConfig`：title、subtitle、lang、themeColor.hue/fixed、banner、toc、favicon；
  - `navBarConfig`：Home/Archive/About + GitHub 外链；
  - `profileConfig`：头像、姓名、bio、社交链接；
  - `licenseConfig`：CC BY-NC-SA 4.0；
  - `expressiveCodeConfig`：代码主题。
- **类型在 `src/types/config.ts`**，`SiteConfig` 没有单独的 `description`/`keywords` 字段，页面 description 默认使用 title 或 subtitle。
- **主题色**：`--hue` 驱动整套 OKLCH 色板；`Layout.astro` 在 head 内联脚本中从 `localStorage` 恢复 theme/hue，避免闪烁；`DisplaySettings.svelte` 提供 hue 滑杆；`LightDarkSwitch.svelte` 循环 light/dark/auto，并监听系统主题变化。
- **明暗模式**：`html.dark` + Tailwind `dark:` + `variables.styl` 中 `define(vars)` 的双值机制；Expressive Code 通过 `data-theme` 同步。
- **模板默认**：`hue=250`，`fixed=false`，`banner.enable=false`，`toc.enable=true`（depth 2），`lang="en"`。
- **页面过渡**：Swup 接管 `main` 与 `#toc`，`Layout.astro` 用 `swup.hooks` 处理 TOC、banner、滚动条等；PhotoSwipe 在 `page:view` 后重建。
- **样式入口**：`src/styles/*` 没有被显式 import 到任何组件；实际构建会把它们作为独立 CSS 入口参与打包，导致 `@apply` 跨文件依赖出现顺序竞态（本轮已用 `markdown.css` 的显式 `@import` 修复）。`GlobalStyles.astro` 是空组件，属于历史遗留，不建议继续扩展第二套全局样式机制。

### 4.2 内容模型

`src/content/config.ts` 使用 Astro Content Collections：

```ts
posts: {
  title: string;
  published: date;
  updated?: date;
  draft?: boolean;      // 默认 false
  description?: string; // 默认 ""
  image?: string;       // 默认 ""
  tags?: string[];      // 默认 []
  category?: string | null; // 默认 ""
  lang?: string;        // 默认 ""
  // 内部字段：prevTitle/prevSlug/nextTitle/nextSlug
}
spec: {} // about.md
```

行为：

- `getRawSortedPosts()` 在 `import.meta.env.PROD` 时过滤 `draft !== true`；开发环境会显示草稿（模板有意为之）。
- 文章按 `published` 倒序；自动填充上一篇/下一篇。
- 文章支持 `.md` 和目录 + `index.md`（如 `posts/guide/index.md` + `cover.jpeg`）。
- `lang` 只影响 `<html lang>` 和 JSON-LD 的 `inLanguage`，不会改变站点其他 UI 语言。
- 封面图通过 `ImageWrapper.astro` + `import.meta.glob` 动态加载，本地图片走 `astro:assets` 优化；`public` 图片走 `<img>`。
- 草稿不会进入构建页面、列表、RSS、sitemap、Pagefind；本轮已用 `draft.md` 验证。

### 4.3 页面与布局

| 路由 | 实现 | 说明 |
|---|---|---|
| `/`、`/2/`… | `src/pages/[...page].astro` + `PostPage` + `Pagination` | 首页就是文章列表，`PAGE_SIZE=8`；当前 5 篇，只有 1 页 |
| `/posts/<slug>/` | `src/pages/posts/[...slug].astro` | 文章详情、封面、字数/阅读时间、License、上一篇/下一篇、JSON-LD |
| `/archive/` | `archive.astro` + `ArchivePanel.svelte` | 按年份分组；`client:only="svelte"`，筛选读取 `?tag=`/`?category=`/`?uncategorized=true` |
| `/about/` | `about.astro` + `src/content/spec/about.md` | 已存在，但内容是 Fuwari demo |
| `/rss.xml` | `rss.xml.ts` | 全文 RSS，5 篇已发布文章 |
| `/robots.txt` | `robots.txt.ts` | 禁止 `/_astro/`，声明 sitemap |
| `/404` | 无 | 未知路径返回 Astro 默认 404，无品牌化 404.html |

布局层次：

- `Layout.astro`：`<html>`、head、主题初始化、RSS alternate、Swup/PhotoSwipe 脚本、全局 `<style is:global>`；
- `MainGridLayout.astro`：Navbar、banner、SideBar、main、Footer、TOC、BackToTop；
- `Navbar.astro`：站点名、导航、Search、DisplaySettings、LightDarkSwitch、移动端菜单；
- `SideBar.astro`：Profile + Categories + Tags；
- `PostCard`/`PostPage`/`PostMeta`：列表卡片、元数据、标签/分类链接；
- `Markdown.astro`：`data-pagefind-body`、`prose`/`custom-md`、代码复制；
- `TOC.astro`：自定义元素 + IntersectionObserver。

### 4.4 搜索、标签、分类

**搜索（Pagefind）**

- 构建脚本：`astro build && pagefind --site dist`。
- `pagefind.yml` 排除 KaTeX、`data-pagefind-ignore`、`.search-panel`。
- `Navbar.astro` 在生产环境动态 `import('/pagefind/pagefind.js')`，设置 `window.pagefind` 并派发 `pagefindready`；失败时派发 `pagefindloaderror` 并给空实现。
- `Search.svelte`：桌面/移动两个输入；生产用 `window.pagefind.search`；开发环境返回两条假结果（所以**开发服务器里不能验证真实搜索**）；结果面板只在有结果时显示。
- 当前索引：8 个 HTML 中被 `data-pagefind-body` 选中的 6 个（5 篇文章 + About），678 词，1 个语言 `en`。
- 搜索语言：Pagefind 实例默认按 `<html lang>` 选择索引；在 Node 中无 DOM 时选页数最多的语言（en）。临时中文文章测试证明 `zh-cn` 索引可查，但必须显式选择语言，否则中文查询会落在 en 索引上返回 0。

**标签**

- `getTagList()` 统计所有非草稿文章的标签及数量。
- `SideBar` 的 `Tags.astro` 用 `ButtonTag` 展示标签云；每个标签链接到 `/archive/?tag=<encoded>`。
- 标签数量已统计但未在 UI 显示；没有 `/tags/` 独立页；没有标签筛选 UI 的结果数/清空按钮。

**分类**

- `getCategoryList()` 统计分类及数量，未分类使用 i18n 的“未分类”。
- `Categories.astro` 展示分类 + 数量，链接到 `/archive/?category=<encoded>`。
- 组合筛选：`ArchivePanel` 同时读取 `getAll("tag")` 和 `getAll("category")`，逻辑上支持多标签 + 多分类组合；但没有 UI 让用户组合，只有手动拼 URL 或点单个链接。
- 归档页是 `client:only`：初始 HTML 不包含文章列表（只有序列化的 props 和 island），无 JS/爬虫看不到筛选结果；这是一个已知的 SEO/无 JS 限制。

### 4.5 SEO 与部署

已有：

- `<title>`、meta description、author、`og:site_name/url/title/description/type`、Twitter card、favicon、viewport、generator；
- 文章页 `BlogPosting` JSON-LD（headline/description/keywords/author/datePublished/inLanguage）；
- RSS alternate、RSS 全文、sitemap-index/sitemap-0、robots.txt；
- `trailingSlash: "always"`，`base: "/"`，`site: "https://fuwari.vercel.app/"`（模板占位）；
- 图片优化、`<img>` alt（部分为通用 alt）。

缺失/不足：

- 没有 `rel="canonical"`；
- 没有 `og:image`/`twitter:image`，文章封面不会进入社交卡片；
- 没有 `og:locale`、`article:published_time`/`modified_time`；
- 没有自定义 404 页面；
- 没有 `sitemap` 的 lastmod（可选）；
- 没有部署工作流：`.github/workflows/build.yml` 只做 check/build，不做 deploy；`vercel.json` 为空；README 提到 Vercel/Netlify/GitHub Pages，但没有项目级步骤；
- `site` 和 `base` 未参数化，GitHub Pages 子路径会出问题；
- Footer 仍写 “Powered by Astro & Fuwari”，保留署名是必须的，但版权人仍是 demo 名字。

### 4.6 质量与 CI

- `pnpm check`：**2 个真实类型错误**（见 9.2），CI 的 `astro check` job 在该提交上无法通过（本地复现，未实际运行 GitHub Actions）。
- `pnpm type-check`：11 个 `--isolatedDeclarations` 错误，均为缺少显式类型/返回值注解；这是脚本约束问题，不是运行时错误。
- `pnpm exec biome ci ./src`：LF 换行下通过；Git `core.autocrlf=true` 检出为 CRLF 时会产生 63 个纯格式错误。建议增加 `.gitattributes` 固定 LF。
- 没有单元测试/端到端测试框架；`package.json` 没有 `test` 脚本。
- `.github/workflows/build.yml` 构建 job 只跑 `pnpm astro build`，**没有 Pagefind 索引**；应改为 `pnpm build`。
- `.github/workflows/biome.yml` 使用 `latest` 的 Biome，和本地固定 `2.2.5` 可能漂移；建议用 `pnpm exec biome ci`。
- 依赖整体较新；本轮没有升级任何依赖。

---

## 5. 已有功能清单（以实际源码/构建为准）

| 功能 | 状态 | 证据/说明 |
|---|---|---|
| Astro 静态构建、8 个页面 | ✅ | `pnpm build` 成功；`dist/` 189 个文件 |
| 首页文章列表、分页（8 篇/页） | ✅ | `[...page].astro`、`PostPage`、`Pagination` |
| 文章详情、封面、字数、阅读时间 | ✅ | `posts/[...slug].astro`、`remark-reading-time` |
| 上一篇/下一篇 | ✅ | `content-utils` 自动填充 |
| 文章 Schema（title/published/updated/draft/description/image/tags/category/lang） | ✅ | `src/content/config.ts` |
| 草稿不进公开产物 | ✅ | 构建产物/RSS/sitemap 无 `Draft Example` |
| Markdown/GFM | ✅ | Astro 默认 + 示例文章 |
| Admonitions / GitHub 仓库卡 | ✅ | `remark-github-admonitions-to-directives`、`rehype-components` |
| KaTeX 数学公式 | ✅ | `remark-math`、`rehype-katex` |
| Expressive Code（行号、折叠、复制按钮、语言徽标） | ✅ | `astro.config.mjs`、`src/plugins/expressive-code/*` |
| 文章目录 TOC | ✅ | `TOC.astro`、`toc.depth` |
| 图片优化（Sharp） | ✅ | `astro:assets`、构建输出 webp |
| 图片点击放大（PhotoSwipe） | ✅ | `Layout.astro` 第二段脚本 |
| Pagefind 全文搜索 | ✅（基础） | 6 页索引；英文查询实测命中；无结果数/提示/清空 |
| 开发环境搜索 | ⚠️ | 返回假结果；不能作为真实搜索验收 |
| 标签云 | ✅（基础） | 侧边栏标签 + 链接到 `/archive/?tag=`；无计数展示 |
| 分类列表 + 数量 | ✅（基础） | 侧边栏分类 + 数量 + `/archive/?category=` |
| 标签/分类/未分类筛选 | ✅（基础） | ArchivePanel 读取 query；Headless Chrome 实测 |
| 多标签 + 分类组合 | ⚠️ | 逻辑支持 `getAll` 组合；无 UI、无结果数、无清空、无空态 |
| 归档页按年分组 | ✅ | `ArchivePanel.svelte`；`client:only`，无 SSR 列表 |
| 明暗/跟随系统主题 | ✅ | `LightDarkSwitch.svelte`、`setting-utils` |
| 主题色 hue 自定义 | ✅ | `DisplaySettings.svelte`、`localStorage` |
| 响应式布局 | ✅ | Fuwari 原有；待阶段 5 按 375/768/1024/1440 复测 |
| 页面过渡（Swup） | ✅ | `@swup/astro` |
| About 页面 | ✅（demo 内容） | `/about/` 存在，内容是模板说明 |
| RSS 全文 | ✅ | 5 篇；`rss.xml` |
| Sitemap | ✅ | 8 个 URL；`sitemap-index.xml`/`sitemap-0.xml` |
| robots.txt | ✅ | 禁止 `/_astro/` + sitemap |
| 文章 JSON-LD | ✅（基础） | `BlogPosting`；无 image/dateModified |
| OG/Twitter meta | ⚠️ | title/description/type 有；无 image |
| canonical | ❌ | 未实现 |
| 自定义 404 | ❌ | 只有平台/Astro 默认 404 |
| Projects 作品集 | ❌ | 无页面、无数据、无导航 |
| Giscus 评论 | ❌ | 只有 `I18nKey.comments` 文案，无组件/配置 |
| 首页个人介绍/精选项目/技术方向 | ❌ | 首页只有文章列表 + 侧边栏 Profile |
| 个人资料真实化 | ❌ | 名字、头像、bio、社交链接均为 demo |
| 中文站点/中文 UI | ❌ | `lang="en"`；有 zh_CN 翻译文件但未启用 |
| 部署工作流 | ❌ | 无 deploy；只有 check/build |
| 测试脚本/自动化验收 | ❌ | 无 test；本轮用临时命令验证 |

---

## 6. 待补充功能清单（按优先级）

### P0 — 基线可维护性（阶段 1 首先做）

1. 修复 `astro check` 的 2 个错误：
   - `LightDarkSwitch` 的 `client:only` props 类型；
   - `ArchivePanel` 的 `category: string | null` 与 `Post.category?: string` 不一致。
2. 决定并修复 `pnpm type-check`：
   - 推荐把脚本改为 `tsc --noEmit`（应用项目不需要 `--isolatedDeclarations`），或补齐 11 处显式类型/返回类型；在 `docs/testing.md` 说明选择。
3. 增加 `.gitattributes`（`* text=auto eol=lf`），避免 Windows CRLF 让 Biome 误报；`.gitignore` 增加本地缓存目录（如 `.pnpm-store/`、`.chrome-profile*/`、`tmp-*`）。
4. 保留本轮 `markdown.css` 的 `@import "./main.css";` 修复，并补一条注释说明原因；避免未来把 `src/styles` 当独立入口再次踩坑。
5. CI：`build.yml` 的构建步骤改为 `pnpm build`（包含 Pagefind），check job 在修复后应通过；biome workflow 固定使用项目依赖版本。

### P1 — 个人化配置（阶段 1）

6. `siteConfig`：站点名、描述、`lang: "zh_CN"`、hue（清新柔和蓝，建议 250 左右）、banner、favicon。
7. `profileConfig`：真实姓名/昵称、bio、头像、GitHub、邮箱/联系方式。
8. 导航：加入 Projects；GitHub 外链使用真实地址；移除 demo Twitter/Steam。
9. 个人信息集中管理，导航/Profile/Footer/About 不重复硬编码；未提供的值用明确占位并隐藏无效链接，不编造。
10. 文章示例与标签规范：保留模板文章作为语法参考，但不把它们当个人文章发布；新增 `docs/content-guide.md` 说明 frontmatter、目录、图片、标签/分类命名。
11. 主题色/明暗/移动端回归；`pnpm check`、`pnpm type-check`、`biome ci`、`pnpm build` 全绿。

### P2 — Projects / About / 首页（阶段 2）

12. `src/data/projects.ts` 项目数据模型（独立文件，不硬编码在页面）。
13. `/projects/` 页面 + `ProjectCard` 卡片：名称、简介、技术栈、核心功能、难点与取舍、GitHub、可选 demo。
14. 首页首屏/列表上方增加个人简介、技术方向、GitHub、精选项目、最新文章入口；只在第 1 页显示，保持 Fuwari 卡片语言。
15. About 页：复用现有 `/about/`，更新 `src/content/spec/about.md` 或改为结构化数据；不虚构经历。
16. 导航加入 Projects，首页加入 About 入口。
17. 空数据状态：没有真实项目时显示“资料待补充”，不伪造项目卡片/链接。

### P3 — 标签、分类、搜索增强（阶段 3）

18. 保持 Pagefind，不新增第二套索引；保持现有标签/分类链接与归档筛选。
19. 归档筛选 UI：
    - 结果数量（共 N 篇）；
    - 当前生效的标签/分类 chips；
    - 清空筛选；
    - 无结果提示；
    - URL 查询参数与状态同步（`history.pushState`/`replaceState` + `popstate`）；
    - 标签/分类组合（至少一个标签 + 一个分类；保留多值能力）；
    - 标签/分类计数展示。
20. `Search.svelte`：
    - 结果数量、无结果提示、清空按钮、加载状态、`aria-live`；
    - 移动端占位文案 i18n；
    - Pagefind 语言显式化：按 `siteConfig.lang` 设置 `language`，避免中文查询落到 en 索引；
    - 仍只在生产构建中提供真实搜索。
21. 中文搜索验收：标题、摘要、标签、正文关键词、分类、组合筛选；用实际中文文章测试，记录命令和结果。
22. 如果中文分词/语言需要，才调整 `pagefind.yml`（例如 `force_language`），并记录依据；不盲目改。

### P4 — Giscus（阶段 4）

23. `GiscusConfig` 加进 `src/config.ts`/`src/types/config.ts`；默认 `enable: false`，公开配置为空时隐藏评论区。
24. `Comments` 组件（建议 Svelte，`client:only` 或带生命周期）：
    - 每篇文章按 `pathname` 映射；
    - 不同文章不串评论；
    - 浅色/深色主题同步；
    - Swup 页面切换后重建；
    - 脚本加载失败不影响正文；
    - 不提交任何私密 token。
25. 接入到文章页 License 之后；文章正文、RSS、搜索不受影响。
26. 真实验证前置条件：公开仓库 + Discussions + Giscus App 授权 + 分类/ID；缺少时只能完成代码与文档，并标记“未完成真实评论验证”。

### P5 — 404、SEO、部署、文档、验收（阶段 5）

27. `src/pages/404.astro`：品牌化 404，`noindex`，返回首页/归档链接；确认 `dist/404.html`。
28. `Layout.astro`：canonical、`og:image`/`twitter:image`、`og:locale`、文章发布时间/修改时间、必要的 JSON-LD（WebSite/Person/BlogPosting 的 image/dateModified）。
29. `astro.config.mjs`：`site`/`base` 从环境变量读取，提供 `https://example.com`/`/` 占位；GitHub Pages 子路径可配置。
30. 部署：GitHub Pages workflow（build + upload + deploy）或 Vercel/Netlify 文档；没有真实部署前不声称上线。
31. `README.md` 重写：基于 Fuwari、安装、开发、写文章、加项目、Giscus、构建、部署、许可证署名。
32. `docs/architecture.md`、`docs/configuration.md`、`docs/testing.md`、`docs/deployment.md`。
33. 全面验收：格式、类型、构建、路由、链接、搜索、筛选、主题、响应式、RSS/sitemap/404/SEO、评论（若有真实配置）。

---

## 7. 目标架构与设计决策

### 7.1 保持不变

- Astro 静态站点、Tailwind、Svelte、Pagefind、Expressive Code、Swup、KaTeX、PhotoSwipe、Sharp；
- `src/content/posts` 的文章模型与 Markdown 工作流；
- `Layout`/`MainGridLayout` 的布局与配色变量；
- `src/config.ts` 的集中配置方式；
- Fuwari 的 MIT 许可证与 Footer 署名。

### 7.2 新增但最小化

- **Projects 使用独立数据文件**：`src/data/projects.ts`，不新建 CMS、不新建后端、不引入数据库。
- **Projects 页面复用现有卡片语言**：`card-base`、`btn-regular`、`text-75`、`--primary`，不引入第二套设计系统。
- **About 复用现有 `/about/` 路由和 Markdown 渲染**，不新建第二套页面模型。
- **Giscus 只通过官方 iframe/script**，不自建评论后端，不存评论数据。
- **标签/分类继续走归档 query 参数**，不新建第二套筛选索引；搜索继续由 Pagefind 负责。
- **不新增大型客户端框架**；Svelte 只用于已有交互点（搜索、归档、主题、评论可选）。

### 7.3 需要明确的取舍

1. **归档页是否改为 SSR**  
   现状 `ArchivePanel.svelte` 为 `client:only`，无 JS 时没有列表，SEO 也看不到筛选内容。阶段 3 建议先做最小增强（保留 client:only，增加筛选 UI/空态/计数），因为改成 SSR 需要把 URL 读取移到 `onMount`、处理 Swup 重挂载，改动面较大。若阶段 5 的 SEO 验收要求归档内容可爬取，再单独评估 SSR 改造；不在阶段 3 顺手重写。

2. **中文搜索语言**  
   Pagefind 1.4 的运行时实例按页面 `<html lang>` 选索引；本站主语言设为 `zh_CN` 后，大多数页面会走 `zh-cn` 索引，中文可用。若文章设置 `lang: "en"`，该页搜索会走 en 索引。阶段 3 在 `Search.svelte` 初始化时显式指定 `siteConfig.lang` 对应的 Pagefind 语言，并测试中英文技术词；不为多语言站点引入复杂的多索引合并，除非实际需求出现。

3. **Projects 详情页**  
   阶段 2 只做 `/projects/` 列表 + 卡片；数据模型保留 `slug`，后续可以加 `/projects/[slug]/`，但不在第一阶段强制每项目一个详情页。

4. **个人资料缺失**  
   姓名、邮箱、GitHub、头像、域名、Giscus repo/category/IDs、真实项目列表都未提供。阶段 1/2/4 使用显式占位或空状态，不编造；在用户提供资料前，不把站点称为“已完成个人化”。

---

## 8. 文件级改造清单

> “修改”指在现有文件上改；“新增”指新文件。阶段 0 只实际改了 `markdown.css`，其余是计划。

| 文件 | 动作 | 内容 | 风险/备注 |
|---|---|---|---|
| `src/styles/markdown.css` | 已修改 | 顶部 `@import "./main.css";`，修复跨文件 `@apply link` | 已实测连续干净构建通过；回滚即恢复构建失败 |
| `.gitattributes` | 新增 | `* text=auto eol=lf` | 避免 Windows CRLF/Biome 误报 |
| `.gitignore` | 修改 | 增加 `.pnpm-store/`、`.chrome-profile*/`、`tmp-*` | 本地缓存，不入库 |
| `src/components/LightDarkSwitch.svelte` | 修改 | 增加可选 `class` prop（或等价的有类型 props），根节点应用；修复 `client:only` 类型 | 需在阶段 1 用 `pnpm check` 验证；不要用 `any` 掩盖 |
| `src/components/Navbar.astro` | 修改（如需） | 传递/使用上述 prop；保持布局不变 | 若改 prop 仍不能消除错误，再评估 Astro 类型断言 |
| `src/pages/archive.astro` | 修改 | `PostForList` 的 `category` 改为 `string \| null` 或做映射；传递 tags/categories 计数（如需） | 不改变 URL 约定 |
| `src/components/ArchivePanel.svelte` | 修改 | 类型修正；增加筛选条、计数、chips、清空、无结果、URL 同步 | 保留现有按年分组和 query 语义 |
| `src/components/Search.svelte` | 修改 | 结果数/空态/清空/加载/aria；Pagefind 语言；移动端 i18n | 继续使用 Pagefind，不换成每次加载全量文章 |
| `src/config.ts` | 修改 | 站点名/描述/lang/hue/profile/nav/项目入口/Giscus/首页配置；占位值 | 所有个人信息集中；不重复硬编码 |
| `src/types/config.ts` | 修改 | 增加 `GiscusConfig`、`HomeConfig`、可选 `description`/`ogImage` | 保持向后兼容默认值 |
| `src/constants/link-presets.ts` | 修改 | 增加 `LinkPreset.Projects` 与 `/projects/` | 枚举追加，不影响已有数值 |
| `src/i18n/i18nKey.ts` + `src/i18n/languages/*.ts` | 修改 | 增加 `projects`/筛选/空态等键；10 个语言同步 | `Translation` 是全集映射，漏一个会类型错误 |
| `src/data/projects.ts` | 新增 | `Project` 类型 + 项目数组（可先空/占位） | 不把项目信息写进页面组件 |
| `src/components/ProjectCard.astro` | 新增 | 项目卡片，复用 `card-base`/按钮/标签 | 无真实链接时显示“待补充”，不伪造 |
| `src/pages/projects.astro` | 新增 | `/projects/` 列表、分类分组、空状态 | 不建后端 |
| `src/components/home/HomeIntro.astro` | 新增 | 个人简介、技术方向、GitHub、About 入口 | 保持克制，不做企业官网 |
| `src/components/home/FeaturedProjects.astro` | 新增 | 读取 projects，展示精选 3 个 | 数据为空则隐藏 |
| `src/pages/[...page].astro` | 修改 | 第 1 页渲染 HomeIntro/FeaturedProjects，再渲染 PostPage | 分页页不重复个人介绍 |
| `src/pages/about.astro` | 修改（可选） | 保持现有路由；如需要结构化区块再调整 | 优先只改 `about.md` 内容 |
| `src/content/spec/about.md` | 修改 | 真实个人介绍/方向/经历/联系方式（用户提供） | 不虚构公司/学历/项目 |
| `src/pages/posts/[...slug].astro` | 修改 | 在 License 后渲染 `<Comments>` | 评论失败不影响正文 |
| `src/components/Comments.svelte` | 新增 | Giscus 初始化、主题同步、Swup 重挂载、失败降级 | 只放公开配置；不提交 token |
| `src/pages/404.astro` | 新增 | 品牌化 404 + `noindex` + 返回链接 | 构建后必须有 `dist/404.html` |
| `src/layouts/Layout.astro` | 修改 | canonical、og:image、og:locale、article times、description 来源 | 图片 URL 必须绝对且存在 |
| `astro.config.mjs` | 修改 | `site`/`base` 环境变量化；默认占位 | 不使用编造域名上线 |
| `pagefind.yml` | 修改（按测试） | 仅在中文分词/语言需要时调整 | 先测试再改 |
| `.github/workflows/build.yml` | 修改 | `pnpm build`；Node 22（可加 24）；check 修复后通过 | 让 CI 真正覆盖 Pagefind |
| `.github/workflows/deploy.yml` | 新增 | GitHub Pages build/upload/deploy | 需要仓库/域名信息；未配置不声称上线 |
| `.github/workflows/biome.yml` | 修改（可选） | 使用项目固定 Biome 版本 | 避免 `latest` 漂移 |
| `README.md` | 修改 | 项目说明、命令、文章/项目/Giscus/部署、Fuwari 署名 | 保留 MIT |
| `docs/architecture.md` 等 | 新增 | 阶段 5 文档 | 本阶段只交付 implementation-plan |
| `scripts/verify-build.mjs` | 新增（阶段 5） | 检查 404/RSS/sitemap/Pagefind/草稿/链接 | 只用 Node 内置模块，不加大依赖 |
| `package.json` | 修改（阶段 1） | 修复 `type-check` 脚本；可加 `verify` | 不升级全部依赖 |

---

## 9. 数据模型与配置草案

### 9.1 个人信息与站点配置（已按 GitHub 资料核对）

2026-10-20 通过 GitHub API 核对到的真实资料：

| 字段 | 值 | 来源/说明 |
|---|---|---|
| GitHub 用户名 | `YunfeiSHU` | `https://github.com/YunfeiSHU` |
| GitHub 显示名 | `YuiMon` | `GET /users/YunfeiSHU` 的 `name` |
| GitHub bio | `YuifeiSHU Email : YuiMon05@163.com` | 原文如此（`YuifeiSHU` 可能是笔误） |
| 公开邮箱字段 | 空 | GitHub `email` 为空；邮箱从 bio 中提取为 `YuiMon05@163.com` |
| 头像 | `https://avatars.githubusercontent.com/u/159683858?v=4` | 已下载验证：460×460 JPEG，约 32 KB |
| 现有站点 | `https://YunfeiSHU.github.io/` | 当前为 Hugo 博客，标题 `YunfeiSHU's Blog`，副标题 `记录技术学习与生活思考的地方` |
| 公开仓库数 | 5 | 见 9.3 的仓库映射 |

`src/config.ts` 建议值：

```ts
siteConfig = {
  title: "YunfeiSHU's Blog",
  subtitle: "记录技术学习与生活思考的地方", // 来自现有 Pages 站点
  description: "YunfeiSHU 的技术博客：Go、Java、MySQL、Redis、计算机网络与 AI 应用。",
  lang: "zh_CN",
  themeColor: { hue: 250, fixed: false },
  banner: { enable: false, src: "", position: "center", credit: {...} },
  toc: { enable: true, depth: 2 },
  favicon: [...],
  ogImage: "", // 阶段 5 再补；为空则不输出 og:image，避免假图
}

profileConfig = {
  name: "YuiMon", // GitHub 显示名；导航/站点标题仍用 YunfeiSHU
  bio: "YuifeiSHU Email : YuiMon05@163.com", // GitHub bio 原文；如需更自然的简介请确认
  avatar: "assets/images/avatar.jpg", // 从 GitHub 头像下载，替换 demo-avatar
  links: [
    { name: "GitHub", icon: "fa6-brands:github", url: "https://github.com/YunfeiSHU" },
    { name: "Email", icon: "fa6-solid:envelope", url: "mailto:YuiMon05@163.com" },
  ],
}

homeConfig = {
  intro: "记录技术学习、项目实践与日常思考。",
  techStack: ["Go", "Java", "MySQL", "Redis", "计算机网络", "AI 应用"],
  githubUrl: "https://github.com/YunfeiSHU", // 从 profile links 派生，避免重复
  featuredProjectSlugs: ["media-community-backend", "ai-assistant"],
}
```

仍需你确认的两处：

1. **显示名**：GitHub API 的 `name` 是 `YuiMon`，但旧站/GitHub 用户名是 `YunfeiSHU`。计划用 `YuiMon` 作为 Profile 显示名、`YunfeiSHU's Blog` 作为站点名；如果你希望统一显示 `YunfeiSHU`，阶段 1 改一个字段即可。
2. **邮箱**：GitHub 公开 email 为空，bio 中写的是 `YuiMon05@163.com`；旧 Hugo 站显示 `yunfeishu2005@gmail.com`。计划采用 GitHub bio 中的 `YuiMon05@163.com`，旧邮箱不主动公开。

其他要求：

- 未提供的首页 intro/About 经历/Giscus 配置仍用显式占位或空状态，**不伪造**。
- 导航 GitHub 与 Profile GitHub 从同一处读取，避免两个 URL。
- 头像使用本次下载的 GitHub 头像；不再使用 `demo-avatar.png`。
- banner 默认关闭，用户提供图片后再开启。
- 站点部署地址固定为 `https://YunfeiSHU.github.io/`，`base: "/"`。

### 9.2 Giscus 配置

```ts
type GiscusConfig = {
  enable: boolean;          // 默认 false
  repo: string;             // "owner/repo"，公开
  repoId: string;           // 公开
  category: string;         // 讨论分类名
  categoryId: string;       // 公开
  mapping: "pathname" | "url" | "title" | "og:title" | "specific";
  strict: "0" | "1";
  reactionsEnabled: "0" | "1";
  emitMetadata: "0" | "1";
  inputPosition: "top" | "bottom";
  lang: string;             // "zh-CN"
  theme: "preferred_color_scheme" | "light" | "dark";
}
```

- 默认 `enable: false`；缺 `repoId`/`categoryId` 时隐藏评论区并只在开发控制台提示。
- `mapping: "pathname"` 保证每篇文章唯一；不同文章不会共用一个 discussion。
- 不写任何 GitHub token/secret；Giscus 只需要公开 ID。
- 主题：初始 `preferred_color_scheme` 或按 `html.dark` 选 `light/dark`；切换主题时向 `https://giscus.app` iframe `postMessage({ giscus: { setConfig: { theme } } })`。
- Swup：`Comments` 组件在 `onMount` 创建、`onDestroy` 清理；页面切换后重新创建，避免串评论。

### 9.3 项目数据

```ts
export type ProjectCategory = "Java 微服务" | "AI 应用";

export interface Project {
  slug: string;              // 预留给未来详情页
  name: string;
  summary: string;           // 一句话
  stack: string[];           // 技术栈
  features: string[];        // 核心功能
  challenges: string[];      // 设计取舍与已知限制
  repoUrl: string;           // 真实 GitHub 仓库
  category: ProjectCategory;
  featured: boolean;
  updated: string;           // 最近更新时间，用于展示
}
```

- 只收录用户确认真实存在的项目；没有项目时 `/projects/` 显示空状态，不生成虚构卡片。
- 项目分类只是组织建议，不为了“看起来丰富”而编造。

**已核对的仓库映射（5 个公开仓库，2026-10-20）：**

| 仓库 | 类型 | 语言/技术栈（来自仓库元数据/README） | 建议分类 | 是否精选 | 说明 |
|---|---|---|---|---|---|
| `media-community-backend` | 自有项目 | Java 17、Spring Boot/Cloud、Nacos、Dubbo 3、MyBatis、Go、Gin/GORM、MySQL 8、Redis 7、RabbitMQ、MinIO、SRS/FFmpeg、Docker Compose/K8s | Java 微服务 | 是 | 音视频社区后端：账号/商品/订单 + 点播/直播/弹幕；README 有架构、服务清单、已知限制 |
| `ai-assistant` | 自有项目 | Go 1.24、Gin、Kratos(gRPC)、Python 3.12、FastAPI、LangChain/LangGraph、MySQL、Redis、Milvus、MinIO、Kafka、Docker Compose | AI 应用 | 是 | 个人智能 Agent 平台；README 有 Go/Python 数据权威归属、RAG/Memory/MCP、现状与差距 |
| `golang_interview` | 笔记仓库 | Markdown；Golang、Docker、Git、Linux、MySQL、Redis、操作系统、计算机网络 | 数据结构与底层原理 | 否 | Golang 后端面试八股总结；不是可运行服务，本轮不放进“最近更新项目”展示 |
| `Resume` | fork / 模板 | Markdown、CSS、Typora 主题 | 工具/模板 | 否 | 上游模板的 fork，不能当作个人原创项目宣传；不展示 |
| `YunfeiSHU.github.io` | 旧站点 | Hugo、CSS | 站点/基础设施 | 否 | 当前 Hugo 博客；确认替换为 Fuwari，不列为项目 |

> 用户确认的项目范围：**只展示最近更新的两个自有项目**（`media-community-backend`、`ai-assistant`，`updated_at` 均为 2026-10-01）。`golang_interview`、`Resume`、旧博客不进入 Projects 页面；完整列表仍可通过 GitHub 链接查看。

项目卡片的“技术难点与设计取舍”只使用 README 中明确写出的内容，例如：

- `media-community-backend`：Java/Go 双体系共用同一 MySQL/Redis 的命名空间隔离；统一网关/JWT 身份；Dubbo RPC 与 RabbitMQ 事件边界；分片上传/断点续传；已知限制（Go 未接 Nacos、弹幕单实例、转码 mock、短信/邮件为学习模式）。
- `ai-assistant`：Go/Python 按“一份数据只有一个权威属主”切分；Chat/ChatStream 走 gRPC、其余 HTTP 透传；配额/限流/熔断；RAG/Memory/MCP；已知差距（K8s/CI 未完成、无检索评测集、长驻 gRPC 的 503 缺陷）。
- `golang_interview`：只写“整理 Go/MySQL/Redis/网络/OS 等笔记”，不编造性能数字或上线成果。
- `Resume`：只写“基于上游 Markdown 简历模板的 fork”，不宣称个人设计。
- `YunfeiSHU.github.io`：只写“旧 Hugo 博客，已由 Fuwari 新站替代”，不虚构访问量。

---

## 10. 分阶段实施顺序与验收

### 阶段 1：个人化配置 + 基线修复

**顺序：**

1. 修 `astro check` 两个错误（先 `LightDarkSwitch`，再 `ArchivePanel`），每改一个跑一次 `pnpm check`。
2. 修 `type-check`（补类型或调整脚本），`pnpm type-check` 通过。
3. 增加 `.gitattributes`/`.gitignore`，确认 `biome ci` 通过。
4. 下载 GitHub 头像到 `src/assets/images/avatar.jpg`（已核对为 460×460 JPEG），替换 `demo-avatar.png` 的配置引用；不删除 demo 资源，避免影响示例文章。
5. 改 `src/config.ts`/`src/types/config.ts`：
   - `title: "YunfeiSHU's Blog"`、`subtitle: "记录技术学习与生活思考的地方"`、`description`、`lang: "zh_CN"`、`hue: 250`；
   - `profileConfig.name: "YuiMon"`、bio 用 GitHub 原文、GitHub/Email 链接；
   - 站点 URL 固定为 `https://YunfeiSHU.github.io/`，`base: "/"`；
   - 暂不接 Projects/Giscus；导航暂不加 Projects（页面未就绪，避免死链）。
6. `astro.config.mjs` 的 `site` 改为 `https://YunfeiSHU.github.io/`；阶段 5 再参数化 `SITE_URL`/`BASE_PATH`。
7. About 页：阶段 1 若需要发布，先把 `src/content/spec/about.md` 的 demo 文案替换为最小真实资料（姓名、GitHub、邮箱、技术方向），不写虚构经历；完整 About 在阶段 2 完成。
8. 跑 `pnpm check`、`pnpm type-check`、`biome ci`、`pnpm build`、`pnpm dev`；移动端/主题手测。

**验收：**

- `pnpm check` 0 errors；`pnpm type-check` 0；`biome ci` 0；`pnpm build` 0。
- 首页/文章/归档/About 均可打开；中文 UI 生效；明暗/主题色可切换。
- 页面不再显示 demo 姓名 `Lorem Ipsum`、demo Twitter/Steam 链接；头像来自 GitHub。
- 未提供的首页 intro/Giscus 用空状态/占位，不显示假链接。
- 页面无横向溢出（至少 375px）。

### 阶段 2：Projects + About + 首页展示

**顺序：**

1. 新增 `src/data/projects.ts`：只放最近更新的两个自有项目（`media-community-backend`、`ai-assistant`）；`golang_interview`、`Resume`、旧博客不展示。
2. 新增 `ProjectCard.astro`，复用 `card-base`/`btn-regular`/标签样式；卡片展示真实仓库链接、技术栈、功能、设计取舍/已知限制。
3. 新增 `/projects/` 页面：2 个项目卡片 + GitHub 全部仓库链接；无数据时保留空状态。
4. 新增 `HomeIntro`/`FeaturedProjects`，只在首页第 1 页渲染；精选 2 个项目，保持 Fuwari 设计。
5. 导航加 Projects；About 页加入项目入口；首页加 About 入口。
6. 技术难点/取舍只引用 README 明确内容（见 9.3），不写性能数字、上线成果或未实现能力。
7. 响应式测试 375/768/1024/1440；链接检查；构建。

**验收：**

- `/projects/` 200，展示 2 个真实项目；空数据有空状态。
- 首页有简介、技术方向、GitHub、精选项目、最新文章、About 入口；不变成企业官网。
- About 内容真实；无虚构经历。
- 所有按钮/链接真实可用；无假统计/假项目。

### 阶段 3：标签/分类/搜索增强

**顺序：**

1. 先复测现有功能：`?tag=`、`?category=`、`?uncategorized=`、组合、Swup 从归档到归档的导航。
2. 修 `ArchivePanel` 类型；加筛选条/计数/chips/清空/空态/URL 同步。
3. 改 `Search.svelte`：结果数、空态、清空、加载、aria、移动端 i18n、Pagefind 语言。
4. 建 2–3 篇真实中文测试文章（或用户提供的文章），覆盖标题/摘要/标签/正文/分类；构建后测试 Pagefind。
5. 根据测试决定是否调整 `pagefind.yml`；不替换 Pagefind。
6. 测试草稿不进列表/搜索/RSS/sitemap。

**验收：**

- 标签列表、分类列表、组合筛选可用；结果数准确；无结果提示明确；清空恢复全部；URL 可分享/刷新后状态一致。
- Pagefind 命中标题、摘要、标签、正文关键词；中文查询实际命中；英文技术词也可命中。
- 草稿不出现在任何公开产物。
- 没有第二套搜索索引/文章模型。

### 阶段 4：Giscus

**顺序：**

1. 确认用户仓库公开、Discussions 开启、Giscus App 授权、分类和 ID。
2. 增加配置类型/默认关闭；新增 Comments 组件；接入文章页。
3. 主题同步；Swup 重挂载；失败降级；两篇文章评论隔离测试。
4. 没有真实配置时，完成代码和文档，但把“真实评论验证”标为未完成。

**验收：**

- 配置完整时每篇文章 discussion 正确、不串；明暗主题正确；切换页面后仍正确。
- 外部服务失败时正文仍可读；配置缺失时评论区隐藏/提示。
- 不提交任何私密 token；公开配置才进客户端。

### 阶段 5：404、SEO、部署、文档、全面验收

**顺序：**

1. 新增 404 页面并确认 `dist/404.html`。
2. `Layout` 补 canonical/og:image/og:locale/article times/JSON-LD。
3. `astro.config` 参数化 site/base；决定部署平台。
4. 增加 GitHub Pages deploy workflow 或 Vercel/Netlify 文档；真实部署后再记录 URL。
5. 写 `docs/architecture.md`、`configuration.md`、`testing.md`、`deployment.md`；重写 README。
6. 全面测试：构建、路由、链接、RSS/sitemap/robots/404、搜索、筛选、主题、响应式、SEO、评论（若有）。
7. 更新 `docs/implementation-plan.md` 的完成状态和遗留问题。

**验收：**

- 404 正常；canonical/OG 图片存在且 URL 正确；RSS/sitemap/robots 正常。
- 所有页面链接可用；移动端 375/768/1024/1440 无横向溢出。
- 构建/检查/测试有真实记录；没有虚构的部署/评论/数据。

---

## 11. 测试计划与验收标准

### 11.1 命令基线

```powershell
pnpm install --frozen-lockfile
pnpm check                 # Astro/Svelte/TS 诊断
pnpm type-check            # tsc（阶段 1 修复后应通过）
pnpm exec biome ci ./src   # 格式/静态检查
pnpm build                 # astro build + pagefind
pnpm preview --host 127.0.0.1 --port 4322
pnpm dev --host 127.0.0.1 --port 4323
```

### 11.2 必须覆盖的测试

| 测试 | 方法 | 通过标准 |
|---|---|---|
| 依赖安装 | `pnpm install --frozen-lockfile` | 无 lockfile 变更；构建脚本正常 |
| 类型/格式 | `pnpm check`、`pnpm type-check`、`biome ci` | 0 errors（阶段 1 后） |
| 正式构建 | `pnpm build` | 0；Pagefind 索引生成 |
| 开发启动 | `pnpm dev` | 端口监听，`/` 200，无白屏 |
| 文章渲染 | `/posts/<slug>/` | 标题/正文/代码/公式/TOC/封面正常 |
| 草稿 | 构建后 grep `Draft Example` | 列表/RSS/sitemap/搜索均无 |
| 标签筛选 | `/archive/?tag=Markdown` | 只出现对应文章；数量正确 |
| 分类筛选 | `/archive/?category=Guides` | 只出现对应文章 |
| 组合筛选 | `?tag=...&category=...` | 交集正确；无结果有空态 |
| 清空/URL | 点击清空/刷新/后退 | 状态与 URL 一致 |
| 中文搜索 | 真实中文文章 + Pagefind | 标题/摘要/标签/正文关键词命中 |
| 英文技术词 | `goroutine`、`MySQL` | 中文索引中也可命中 |
| 无结果 | 不存在的词 | 明确空态，不白屏 |
| 主题 | 亮/暗/跟随系统 + hue | 颜色/代码块/评论（若有）一致 |
| 响应式 | 375/768/1024/1440 | 无横向溢出；导航可用 |
| RSS | `/rss.xml` | 5+ 篇；无草稿；链接正确 |
| sitemap | `/sitemap-index.xml` | 包含公开页面；无草稿/404 |
| robots | `/robots.txt` | sitemap 指向正确 |
| 404 | `/does-not-exist/` | 自定义 404（阶段 5） |
| SEO | 查看 head | canonical/OG image/description 正确 |
| 评论 | 两篇文章 | discussion 不串；主题同步；失败降级 |

### 11.3 视口与浏览器

- 视口：375×667、768×1024、1024×768、1440×900。
- 浏览器：Chrome/Edge 最新；本轮已用 Headless Chrome 做归档筛选验证。
- 检查：`document.documentElement.scrollWidth <= window.innerWidth`，导航/搜索/主题按钮可点，代码块可横向滚动而不是撑破页面。

### 11.4 中文搜索的验收细节

本轮已做临时验证（测试文章已删除）：

- 临时文章 `lang: zh_CN` 构建后 Pagefind 识别 `zh-cn` 和 `en` 两种语言；
- 默认实例（Node 无 DOM）走 en 索引，中文查询 0；
- 显式 `options({ language: "zh-cn" })` 后：“并发/协程/通道/数据竞争/Go 并发/goroutine”各命中 1 篇；
- 结论：Pagefind 能索引中文，但**运行时必须选对语言**；阶段 1 设 `siteConfig.lang = "zh_CN"` 后，页面 `<html lang="zh-CN">` 会让默认实例走 zh-cn，阶段 3 再在 `Search.svelte` 显式指定，确保设置 `lang: en` 的文章页也能按站点语言搜索，或至少明确行为。

---

## 12. 风险、限制与待确认事项

### 12.1 已确认信息与仍需确认的信息

**已确认（2026-10-20）：**

1. 部署平台：GitHub Pages；站点地址 `https://YunfeiSHU.github.io/`，用户站点仓库名为 `YunfeiSHU/YunfeiSHU.github.io`，`base: "/"`。
2. 姓名/邮箱：显示名 `YuiMon`，邮箱 `YuiMon05@163.com`；头像、GitHub 采用 GitHub 资料。
3. 项目范围：只展示最近更新的两个自有项目 `media-community-backend`、`ai-assistant`；`golang_interview`、`Resume`、旧博客不进入 Projects。
4. 部署方式：用 Fuwari 替换旧 Hugo 站；保留旧仓库历史，不删除旧内容。
5. 现有站点：`YunfeiSHU.github.io` 目前是 Hugo 博客，标题 `YunfeiSHU's Blog`，副标题 `记录技术学习与生活思考的地方`。

**仍需确认：**

1. **About 内容**：除 GitHub bio/仓库外，是否有真实的学习/项目经历需要写？没有就保持简短，不虚构。
2. **Giscus**：是否启用；公开仓库、Discussions 分类、`repoId`、`categoryId` 尚未提供。
3. **许可证**：Fuwari 本身 MIT；文章默认 CC BY-NC-SA 4.0，是否保留？

未提供时：使用显式占位/空状态，不编造；不把模板 demo 内容当个人资料发布。

### 12.2 环境限制

- 阶段 0 时直接 HTTPS 访问 GitHub raw/API、Vercel demo 失败；2026-10-20 复查时 `api.github.com` 与 `YunfeiSHU.github.io` 已可访问，`github.com` HTML 仍超时。结论仍以实际源码/构建/本地浏览器为准，不把外部页面当运行结果。
- Node 24 + pnpm 9.14.4 构建通过，但模板中文文档写 Node <= 22；CI 用 Node 22/23。阶段 1 建议统一 Node 22 LTS，避免 sharp/esbuild/Pagefind 的平台差异。
- 首次用 pnpm 10 安装时，沙箱阻止写 `%LOCALAPPDATA%\pnpm\.tools`，并出现 `ERR_PNPM_SYMLINK_FAILED`；改用 pnpm 9.14.4 + Corepack 后正常。日常开发应让 pnpm 使用 `packageManager` 固定的 9.14.4，不要用 pnpm 10 的 `--config.node-linker=hoisted` 临时方案。
- 本机 `core.autocrlf=true` 会把 checkout 变成 CRLF，导致 Biome 63 个格式误报；已在本仓库设置 `core.autocrlf=false` 并重写为 LF。阶段 1 加 `.gitattributes` 固化。

### 12.3 技术风险

1. **样式入口竞态**：本轮用 `markdown.css` 的 `@import` 修复；后续新增 CSS 时，避免在独立 CSS 文件里 `@apply` 另一个文件的自定义类。优先把共享类放到同一 `@layer` 文件，或显式 import。
2. **归档页 client:only**：无 JS/SEO 可见性差；阶段 3 先做最小增强，阶段 5 再评估 SSR。
3. **Pagefind 语言**：必须显式设置，否则混合语言站点查询会落到错误索引；中文没有 stemming，属预期。
4. **Giscus 外部依赖**：没有真实仓库配置无法验证；主题同步/Swup 重挂载需要实际浏览器测试。
5. **主题/过渡回归**：修改 `Layout` head 或 `MainGridLayout` 时，检查 Swup、TOC、PhotoSwipe、banner 高度、移动端菜单。
6. **无测试框架**：阶段 5 增加轻量 Node 校验脚本；不为了“有测试”引入大依赖。
7. **上游更新**：不要一次性升级全部依赖；如需要，单独评估 Astro/Svelte/Tailwind/Pagefind 的破坏性变更。

---

## 13. 本轮实际执行记录

### 13.1 源码

| 步骤 | 命令/操作 | 结果 |
|---|---|---|
| 克隆 | `git clone --depth 1 https://github.com/saicaca/fuwari.git .fuwari-tmp` | 成功 |
| 移动 | 将 `.fuwari-tmp` 内容移动到工作区根目录，保留 `.git` | 成功；原有任务书未动 |
| 加深历史 | `git fetch --deepen=500 origin main` | 成功 |
| 基线 | `git log -1` | `6d39b0d...`（2025-12-12） |

### 13.2 依赖安装

| 尝试 | 结果 | 说明 |
|---|---|---|
| `pnpm install --frozen-lockfile`（pnpm 10，沙箱） | 失败 | `EPERM` 创建 `%LOCALAPPDATA%\pnpm\.tools\pnpm\9.14.4_tmp_*`；沙箱阻止工作区外写入 |
| 同上 + `manage-package-manager-versions=false` | 部分成功后失败 | `ERR_PNPM_SYMLINK_FAILED Maximum call stack size exceeded` |
| 同上 + `--config.node-linker=hoisted` | 成功（非官方布局） | 忽略 sharp/esbuild/swup/@parcel/watcher 构建脚本；store 落在项目内，dev 启动很慢 |
| **`corepack pnpm install --frozen-lockfile`（9.14.4）** | **成功** | 50.6 秒；postinstall 正常；node_modules 为 pnpm 标准布局；store 在 `%LOCALAPPDATA%\pnpm\store\v3` |

### 13.3 检查与构建

| 命令 | 结果 | 关键输出 |
|---|---|---|
| `pnpm check` | 失败（2 errors） | `Navbar.astro:54` LightDarkSwitch `client:only` 类型；`archive.astro:12` `PostForList[]` vs `Post[]` |
| `pnpm type-check` | 失败（11 errors） | `constants.ts` 2、`content/config.ts` 2、`rss.xml.ts` 1、Expressive Code 2、utils 4；均为 TS9010/9013/9007 |
| `pnpm exec biome ci ./src` | 成功 | LF 下 0 errors；CRLF 下曾误报 63 个格式错误 |
| `pnpm build`（原始） | 失败 | `markdown.css:23` `The 'link' class does not exist`；多次干净构建可复现 |
| `pnpm build`（修复后） | 成功 | 8 页面；Pagefind 6 页/678 词/1 语言；连续两次干净构建均成功 |
| `pnpm dev` | 成功 | 8.2s ready；`/` 200；`/posts/guide/` 200 |
| `pnpm preview` | 成功 | 路由 200；未知路径 404 |

### 13.4 功能验证

| 验证 | 结果 |
|---|---|
| `/`、`/about/`、`/archive/`、`/posts/guide/`、RSS、sitemap、robots、Pagefind JS | 均 200 |
| `/does-not-exist/` | 404；但 `dist/404.html` 不存在，是 Astro 默认 404 |
| Pagefind 英文查询 | `guide`=1、`astro`=1、`markdown`=4、不存在中文词=0 |
| 临时中文文章 | Pagefind 识别 `zh-cn`；显式 language 后中文查询命中；测试文章已删除并重建 |
| 归档 `?tag=Markdown` | 3 篇（expressive-code、markdown、markdown-extended） |
| 归档 `?category=Guides` | 1 篇（guide） |
| 归档 `?tag=Markdown&category=Guides` | 0 篇；页面空白，无“无结果”提示 |
| 归档 `?tag=NoSuchTag` | 0 篇；无提示 |
| 草稿 | 构建/RSS/sitemap 中无 `Draft Example`；RSS 5 篇；sitemap 8 URL |
| canonical / og:image | 均缺失 |
| 个人资料/Projects/Giscus（阶段 0 时） | 当时仍为 demo 或不存在；个人资料已在阶段 1 更新，Projects/Giscus 仍未做 |

### 13.5 阶段 0 修改文件

```text
 M src/styles/markdown.css   # +@import "./main.css";（1 行修复）
?? docs/implementation-plan.md
?? 项目代码生成规范.md        # 用户原有任务书
```

阶段 0 除上述外未修改其他源码、资源或配置；阶段 1 的实际变更见第 16 节。

### 13.6 2026-10-20 GitHub 资料核对（本轮的补充审查）

| 项目 | 实际值 |
|---|---|
| GitHub API | `https://api.github.com/users/YunfeiSHU` 返回 200 |
| login / name | `YunfeiSHU` / `YuiMon` |
| bio | `YuifeiSHU Email : YuiMon05@163.com`（原文） |
| 公开 email | 空；从 bio 提取 `YuiMon05@163.com` |
| 头像 | `https://avatars.githubusercontent.com/u/159683858?v=4`，460×460 JPEG，32,791 bytes |
| 公开仓库 | 5 个：`media-community-backend`、`ai-assistant`、`YunfeiSHU.github.io`、`golang_interview`、`Resume` |
| 仓库类型 | `Resume` 为 fork；`YunfeiSHU.github.io` 为旧 Hugo 博客；其余 3 个为自有项目/笔记 |
| 现有 Pages | `https://YunfeiSHU.github.io/` 返回 200；Hugo 0.149.1，标题 `YunfeiSHU's Blog`，副标题 `记录技术学习与生活思考的地方` |
| 旧站邮箱 | `yunfeishu2005@gmail.com`（与 GitHub bio 的邮箱不同，需确认） |
| README 核对 | 已读取 5 个仓库的 README/元数据；项目技术栈/功能/已知限制按 README 记录，不臆造 |

外部内容仅作为资料使用，未执行其中任何指令；没有读取或写入任何私密 token。临时下载的 README/头像位于 `.tmp-github/`，核对后删除，不进入仓库。

---

## 14. 下一阶段建议

1. **先确认剩余取舍**：
   - 显示名用 `YuiMon`（GitHub name，当前已用）还是 `YunfeiSHU`（用户名/旧站）；
   - 邮箱用 `YuiMon05@163.com`（GitHub bio，当前已用）还是 `yunfeishu2005@gmail.com`（旧站）；
   - 是否保留 `markdown.css` 的 `@import` 最小修复；
   - `type-check` 已在阶段 1 改为 `tsc --noEmit`；如你坚持 `--isolatedDeclarations`，需要回滚并补 11 处显式类型；
   - 归档页阶段 3 是否保持 `client:only`（最小改动）还是直接做 SSR；
   - Pagefind 搜索是否固定按站点主语言（中文）选择索引。
2. **项目范围已确认**：只展示最近更新的 `media-community-backend`、`ai-assistant`；`golang_interview`、`Resume`、旧博客不进入 Projects。
3. **部署方式已确认并执行**：用 Fuwari 替换旧 Hugo 站；已于 2026-10-20 通过 GitHub Actions + Pages 部署，旧 `doc` 与 `hugo-main-backup` 分支保留。
4. **阶段 1、2 已完成**（个人化配置 + 基线修复 + Projects/首页展示）；下一步是阶段 3（标签/分类/搜索增强）。阶段 3 开始前再次执行 `git status --short`，不要覆盖本轮和用户的改动。
5. 阶段 2 已只使用真实仓库数据（见 9.3）；`Resume`/旧博客未展示，避免把 fork/legacy 说成原创项目。

---

## 15. 参考与证据

- 源码：`C:\Users\79042\Desktop\blog`（Fuwari `6d39b0d`）
- 关键文件：`package.json`、`astro.config.mjs`、`src/config.ts`、`src/types/config.ts`、`src/content/config.ts`、`src/pages/*`、`src/components/Search.svelte`、`src/components/ArchivePanel.svelte`、`src/layouts/Layout.astro`、`src/layouts/MainGridLayout.astro`、`pagefind.yml`、`.github/workflows/*`
- 构建产物：`dist/`（`index.html`、`about/`、`archive/`、`posts/*`、`rss.xml`、`sitemap-*.xml`、`robots.txt`、`pagefind/`）
- 本地临时验证：Headless Chrome（归档筛选）、Pagefind Node API（英文/中文查询）、临时中文文章（已删除）
- 上游文档：`README.md`、`docs/README.zh-CN.md`、`CONTRIBUTING.md`、`LICENSE`（MIT）

> 本文件中的“通过/成功”均来自本轮实际命令输出；未执行的 GitHub Actions、Giscus 线上评论、真实部署、真实中文文章搜索（最终构建）均未标记为已完成。

---

## 16. 阶段 1 执行记录（2026-10-20）

### 16.1 完成内容

| 项目 | 实际变更 | 结果 |
|---|---|---|
| `astro check` 类型错误 | `LightDarkSwitch.svelte` 增加可选 `class` prop；`ArchivePanel.svelte` 的 `category` 改为 `string \| null`，props 加默认值 | `pnpm check`：0 errors（1 个既有 hint） |
| `type-check` | `package.json` 的 `type-check` 改为 `tsc --noEmit`，去掉与 app 不匹配的 `--isolatedDeclarations` | `pnpm type-check`：0 |
| 换行/格式 | 新增 `.gitattributes`（`* text=auto eol=lf`）；`.gitignore` 增加本地缓存 | `biome ci ./src`：0 |
| 站点配置 | `title: "YunfeiSHU's Blog"`、`subtitle: "记录技术学习与生活思考的地方"`、`lang: "zh_CN"`、`hue: 250` | 中文 UI/页面语言生效 |
| 个人资料 | `name: "YuiMon"`、GitHub bio 原文、头像、GitHub/Email 链接 | 首页/侧边栏显示真实资料，无 Lorem Ipsum/Twitter/Steam |
| 头像 | 从 GitHub 下载 460×460 JPEG 到 `src/assets/images/avatar.jpg` | Astro 优化为 25,350 bytes webp |
| 站点 URL | `astro.config.mjs` 的 `site` 改为 `https://YunfeiSHU.github.io/`，`base: "/"` | `og:url`/RSS 链接指向 GitHub Pages（Astro 输出小写主机名） |
| About | `src/content/spec/about.md` 改为最小真实资料（姓名/GitHub/Email/方向），移除 demo | `/about/` 无 demo 文案 |

### 16.2 验证结果

| 命令/检查 | 结果 |
|---|---|
| `pnpm check` | 0 errors；1 hint（`language-badge.ts` 未使用 `_cssVar`，既有） |
| `pnpm type-check` | 0 |
| `pnpm exec biome ci ./src` | 0 |
| `pnpm build` | 成功；8 页面；Pagefind 6 页/696 词/1 语言 `zh-cn` |
| `pnpm dev` | 成功；`/` 200，`/about/` 200 |
| `/`、`/about/`、`/archive/`、`/posts/guide/`、RSS、sitemap、robots | 均 200 |
| Headless Edge 归档 | `/archive/?tag=Markdown` 显示 3 篇文章，侧边栏为 `YuiMon`，无 `Lorem Ipsum` |
| Pagefind 查询 | `YunfeiSHU`=1（About）、`技术`=1（About）、`GitHub`=2、`markdown`=4、`Guide`=1 |
| 中文搜索备注 | 索引语言已是 `zh-cn`；CJK 查询 `不存在的中文词` 仍命中 About（按单字切分导致），阶段 3 需要评估是否需要搜索语言/分词优化 |
| 头像 | `avatar.7ECxJlRr_Z2mPEIz.webp`，25,350 bytes |
| 个人资料 | 首页无 `Lorem Ipsum`/Twitter/Steam；显示 `YuiMon`、GitHub、邮箱 |

### 16.3 本阶段修改文件

```text
 M .gitignore
 M astro.config.mjs
 M package.json
 M src/components/ArchivePanel.svelte
 M src/components/LightDarkSwitch.svelte
 M src/config.ts
 M src/content/spec/about.md
 M src/styles/markdown.css
?? .gitattributes
?? src/assets/images/avatar.jpg
?? docs/implementation-plan.md
?? 项目代码生成规范.md
```

### 16.4 未完成/未验证

- **Projects 页面、首页个人展示**：已在阶段 2 完成（见第 17 节）；完整 About 仍只有最小真实资料。
- **Giscus**：阶段 4；仍无 repo/category/ID。
- **标签/分类/搜索 UI 增强、404、canonical/OG image、部署工作流**：阶段 3/5。
- **Demo 文章**：5 篇模板示例仍保留在 `src/content/posts`，没有当作个人文章删除或改写；阶段 5 决定是否移除或标记。
- **真实部署**：尚未推送/部署；不能声称 `https://YunfeiSHU.github.io/` 已切换到新站。
- **姓名/邮箱**：已确认采用 GitHub 的 `YuiMon` / `YuiMon05@163.com`。
- **中文搜索质量**：`不存在的中文词` 返回 About 结果，说明 CJK 单字匹配可能产生误召回；阶段 3 用真实中文文章测试并决定是否调整。

---

## 17. 阶段 2 执行记录（2026-10-20）

### 17.1 项目范围（按用户确认）

只展示 GitHub 上**最近更新的两个自有项目**：

| 项目 | 仓库 | 更新时间 | 分类 |
|---|---|---|---|
| 音视频社区后端 | `YunfeiSHU/media-community-backend` | 2026-10-01 | Java 微服务 |
| 个人智能 Agent 平台 | `YunfeiSHU/ai-assistant` | 2026-10-01 | AI 应用 |

不展示：`golang_interview`（笔记）、`Resume`（fork 模板）、`YunfeiSHU.github.io`（旧 Hugo 站）。完整仓库列表由 Projects 页的 GitHub 链接提供。

### 17.2 新增/修改文件

| 文件 | 内容 |
|---|---|
| `src/data/projects.ts` | 2 个项目的真实数据：摘要、技术栈、功能、设计取舍/已知限制、repo URL、更新时间 |
| `src/components/ProjectCard.astro` | 项目卡片；`compact` 模式用于首页；展示真实 GitHub 链接 |
| `src/pages/projects.astro` | `/projects/` 页面；2 张卡片 + GitHub 全部仓库链接 |
| `src/components/home/HomeIntro.astro` | 首页个人简介、技术方向、Projects/GitHub/About 入口 |
| `src/components/home/FeaturedProjects.astro` | 首页精选项目（2 个，compact 卡片） |
| `src/pages/[...page].astro` | 首页第 1 页渲染 HomeIntro/FeaturedProjects；加“最新文章”标题与归档入口 |
| `src/config.ts` | 导航加“项目”；新增 `homeConfig`（intro/techStack/featuredProjectSlugs） |
| `src/content/spec/about.md` | 增加项目作品集入口 |

### 17.3 验证结果

| 命令/检查 | 结果 |
|---|---|
| `pnpm check` | 0 errors；1 hint（既有） |
| `pnpm type-check` | 0（需在 build 完成后运行，避免 `.astro` 类型生成竞态） |
| `pnpm exec biome ci ./src` | 0 |
| `pnpm build` | 成功；9 个页面；Pagefind 6 页/711 词/1 语言 `zh-cn` |
| `pnpm dev` | 成功；`/`、`/projects/`、`/about/` 均 200 |
| `/projects/` | 200；标题 `项目 - YunfeiSHU's Blog`；含 2 个项目、2 个真实 repo 链接 |
| `/` | 200；含 `Hello, I'm YuiMon`、技术栈、精选项目、最新文章、项目导航 |
| 路由 | `/`、`/projects/`、`/about/`、`/archive/`、`/posts/guide/` 均 200 |
| 375px 首页 | CDP 截图；`innerWidth=375`，`scrollWidth=375`，无横向溢出 |
| 1440px Projects | CDP 截图；`innerWidth=1440`，`scrollWidth=1440`，无横向溢出 |
| 四档视口 | 首页/Projects 在 375、768、1024、1440 下 `scrollWidth` 均等于 `innerWidth`，无横向溢出 |
| 头像 | GitHub 头像实际为 JPEG（460×460），已改名 `avatar.jpg`，构建输出 25,350 bytes webp |
| 视觉 | 移动端“精选项目/全部项目”标题已加水平内边距，不再贴屏幕边缘 |

### 17.4 尚未完成

- Giscus（阶段 4）。
- 标签/分类/搜索 UI 增强（阶段 3）。
- 404、canonical/OG image、RSS/sitemap 的最终校验（阶段 5）。
- 用 Fuwari 替换旧 Hugo 的**实际推送/部署**：已在阶段 5 完成（见 18.3），旧 `doc` 与 `hugo-main-backup` 分支保留。
- 完整 About 经历内容（用户未提供，保持最小真实资料）。
- 模板 demo 文章仍保留，未删除或改写。

---

## 18. 阶段 3–5 执行记录（2026-10-20）

### 18.1 阶段 3：标签/分类/搜索

- `ArchivePanel.svelte`：新增标签多选、分类下拉、结果计数、清空筛选、空态、URL 同步（`history.replaceState` + `popstate`）。
- `archive.astro`：传入 `allTags`/`allCategories` 计数。
- `Search.svelte`：结果数、空态、清空、加载状态、`aria-live`、移动端 i18n、Pagefind 语言。
- `Navbar.astro`：Pagefind 初始化显式设置 `language: pagefindLanguage`（`zh_CN` → `zh-cn`）。
- 文章正文末尾加入 `sr-only` 标签/分类/摘要元数据，使标签与分类可被 Pagefind 命中，不改变视觉布局。
- 实测：UI 搜索 `markdown` = 4 条；`zzzznotfound` = 0 条并显示空态；中文临时文章 `并发/调度器/中文搜索/数据竞争/goroutine` 均命中；`?tag=Markdown` = 3 篇，组合 `category=Guides` = 0 篇并显示空态、清空恢复 6 篇。
- 已知限制：Pagefind CJK 单字切分会让 `不存在的中文词` 命中 About；未替换 Pagefind，记录为后续优化项。

### 18.2 阶段 4：Giscus

- `src/types/config.ts` 新增 `GiscusConfig`。
- `src/config.ts` 新增 `giscusConfig`，默认 `enable: false`，所有 ID 为空。
- 新增 `Comments.svelte`：官方脚本、pathname 映射、主题同步、Swup 生命周期清理、失败提示、缺配置时隐藏。
- 文章页 License 后接入 `<Comments client:only="svelte">`。
- 实测：默认关闭时文章 HTML 不含 `giscus.app`，正文正常。
- **未完成**：没有真实 repo/category/repoId/categoryId，未进行线上评论、主题同步、跨文章隔离验证；不能声称评论已可用。

### 18.3 阶段 5：404/SEO/部署/文档

- 新增 `src/pages/404.astro`，`dist/404.html` 生成，带 `noindex` 与返回首页/归档。
- `Layout.astro`：canonical、og:image/twitter:image、og:locale、article 时间、WebSite JSON-LD；文章 JSON-LD 增加 image/dateModified/mainEntityOfPage。
- 新增 `public/og-default.png`（1200×630，真实站点标题/GitHub 头像）。
- `astro.config.mjs`：支持 `SITE_URL`/`BASE_PATH`；sitemap 排除 404。
- 新增 `.github/workflows/deploy.yml`：GitHub Actions + Pages；更新 `build.yml` 为 `pnpm build`，修复 `biome.yml` 固定版本。
- 新增 `scripts/verify-build.mjs` 与 `pnpm verify`。
- 新增 `README.md`、`docs/architecture.md`、`configuration.md`、`testing.md`、`deployment.md`。
- 最终实测：`pnpm check` 0、`pnpm type-check` 0、`biome ci` 0、`pnpm build` 成功（10 HTML、Pagefind 6 页/720 词/zh-cn）、`pnpm verify` 42/42、404 正常、canonical/OG 正常、主题切换正常、四档视口无横向溢出。
- **部署状态**：已于 2026-10-20 通过 GitHub Actions run `39401637522` 部署成功；`https://YunfeiSHU.github.io/`、Projects、About、Archive、RSS、sitemap、Pagefind JS、OG 图片均返回 200；未知路径返回自定义 404。旧 `doc` 与 `hugo-main-backup` 分支保留。
