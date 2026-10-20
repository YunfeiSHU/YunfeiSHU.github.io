# 测试记录

## 环境

- Windows，Node.js 24.16.0（CI 使用 Node 22）
- pnpm 9.14.4
- Chrome/Edge Headless（CDP）用于页面与视口检查
- 日期：2026-10-20

## 命令

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm type-check
pnpm exec biome ci ./src
pnpm build
pnpm verify
pnpm dev
pnpm preview
```

> `pnpm type-check` 应在 `pnpm build` 完成后运行；两者并发时，`.astro` 类型生成可能被清空，导致临时类型错误。

## 实际结果

| 检查 | 结果 |
|---|---|
| `pnpm check` | 0 errors，1 个既有 hint（`language-badge.ts` 未使用变量） |
| `pnpm type-check` | 0 |
| `pnpm exec biome ci ./src` | 0 |
| `pnpm build` | 成功；6 个 HTML（首页/About/Archive/Projects/教程/404）；Pagefind 2 页/477 词/`zh-cn` |
| `pnpm verify` | 34/34 通过 |
| `pnpm dev` | `/`、`/projects/`、`/about/` 均 200 |
| 路由 | `/`、`/projects/`、`/about/`、`/archive/`、`/posts/how-to-write-and-publish/`、RSS、sitemap、robots 均 200 |
| 404 | `/does-not-exist/` 返回 404 + 自定义“页面不存在”，`noindex` |
| canonical | `https://yunfeishu.github.io/` |
| og:image | `https://yunfeishu.github.io/og-default.png` |
| article:published_time | 文章页存在 |
| Giscus 默认关闭 | 文章 HTML 不含 `giscus.app`，正文正常 |
| 主题切换 | auto → light → dark，`html.dark` 与 `localStorage.theme` 同步 |
| 视口 | 首页、Projects、404 在 375/768/1024/1440 下 `scrollWidth == innerWidth` |

## 搜索与筛选

### 英文搜索（UI 实测）

- 输入 `markdown`：面板显示“共 1 条结果”（教程文章）。
- 输入 `zzzznotfound`：显示“共 0 条结果”和空态提示。
- 点击“清空”：输入与结果清空，面板关闭。

### 中文搜索（临时文章实测，测试后已删除）

临时文章：`Go 并发编程：goroutine 与 channel 示例`，`lang: zh_CN`。

| 查询 | 结果 |
|---|---|
| `并发` | 1（临时文章） |
| `调度器`（仅摘要） | 1 |
| `中文搜索`（仅标签） | 1 |
| `数据竞争`（正文） | 1 |
| `goroutine` | 1 |
| `不存在的中文词` | 1（About，CJK 单字切分导致误召回） |

结论：

- 标题、摘要、标签、正文关键词均可命中；标签/分类通过文章正文末尾的 `sr-only` 元数据进入索引。
- Pagefind 对 `zh-cn` 不做 stemming，属预期。
- CJK 单字切分可能带来误召回；阶段 3 保留了该已知限制，后续可评估搜索词过滤或更换分词策略，但不要替换 Pagefind。

### 归档筛选（浏览器实测）

| 操作 | 结果 |
|---|---|
| `/archive/?tag=Markdown` | 1 篇（教程），URL 正确 |
| 再选分类 `Guides` | URL 变为 `?tag=Markdown&category=Guides`，0 篇，显示“没有符合条件的文章” |
| 点击“清空筛选” | URL 回到 `/archive/`，1 篇 |
| 标签/分类计数 | 标签与分类旁显示数量 |
| 无结果 | 空态 + 清空按钮 |

### 线上部署实测（2026-10-20）

- GitHub Actions `Deploy to GitHub Pages` run `39402145957` 成功（build 41s、deploy 10s）。
- 线上 `https://YunfeiSHU.github.io/` 的搜索框输入 `markdown`：显示“共 1 条结果”。
- 线上 `/archive/?tag=Markdown`：显示“共 1 篇文章”（教程）。
- 线上未知路径返回自定义 404。

## 未完成/未验证

- **Giscus 真实评论**：没有 repo/category/ID 和真实仓库 Discussions，未进行线上评论验证；组件默认关闭，仅完成代码与配置说明。
- **真实部署**：已于 2026-10-20 通过 GitHub Actions run `39401637522` 部署；线上首页、Projects、About、Archive、RSS、sitemap、Pagefind JS、OG 图片均返回 200，未知路径返回自定义 404。旧 `doc` 与 `hugo-main-backup` 分支保留。
- **真实文章内容**：已将 Fuwari 示例文章替换为一篇真实教程《如何用本项目写文章并发布到网站》；如需更多技术文章，继续按该流程添加。
- **完整 About 经历**：用户未提供，保持最小真实资料。
- **Safari/Firefox**：未测试；已用 Chromium 内核检查。
