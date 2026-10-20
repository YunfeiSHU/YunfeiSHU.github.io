---
title: "如何用本项目写文章并发布到网站"
published: 2026-10-20
updated: 2026-10-20
description: "从新建 Markdown、填写 frontmatter、本地预览，到 git push 触发 GitHub Actions 部署的完整流程。"
tags: ["Fuwari", "Markdown", "GitHub Pages", "写作"]
category: "站点维护"
draft: false
lang: zh_CN
---

这篇教程说明如何在这个 Fuwari 博客里写一篇文档，并把它发布到 <https://YunfeiSHU.github.io/>。

整条链路是：

```text
写 Markdown → 填 frontmatter → 本地预览 → git commit / push
→ GitHub Actions 构建 → GitHub Pages 上线
```

不需要手动上传 `dist/`，也不需要在服务器上部署。

## 1. 文章放在哪里

文章统一放在：

```text
src/content/posts/
```

文件名会变成 URL 的一部分：

| 文件 | 访问地址 |
|---|---|
| `src/content/posts/my-first-post.md` | `/posts/my-first-post/` |
| `src/content/posts/guide/index.md` | `/posts/guide/` |

建议：

- 文件名使用英文、小写、短横线，例如 `go-concurrency-notes.md`；
- 不要在文件名里使用空格、中文或特殊符号；
- 一篇文章一个文件；需要附带图片时，可以建同名目录 + `index.md`。

## 2. 新建文章

### 方式 A：脚本创建（推荐）

在项目根目录执行：

```bash
pnpm new-post how-to-write-and-publish
```

脚本会生成 `src/content/posts/how-to-write-and-publish.md`，并写入基础 frontmatter。随后打开文件修改标题、摘要、标签和正文。

### 方式 B：手动创建

直接新建文件：

```text
src/content/posts/my-first-post.md
```

粘贴下面的模板：

```markdown
---
title: "文章标题"
published: 2026-10-20
updated: 2026-10-20
description: "一句话摘要，用于列表和 SEO。"
image: ""
tags: ["Go", "并发"]
category: "Go 后端"
draft: false
lang: zh_CN
---

正文从这里开始。
```

### 方式 C：在 GitHub 网页上创建

不想在本地操作时：

1. 打开仓库 `https://github.com/YunfeiSHU/YunfeiSHU.github.io`；
2. 进入 `src/content/posts/`；
3. 点击 **Add file → Create new file**；
4. 输入文件名（例如 `my-first-post.md`），粘贴 frontmatter 和正文；
5. 直接 **Commit changes** 到 `main`；
6. GitHub Actions 会自动构建并部署。

网页方式不会在本地跑检查，提交后请查看 Actions 是否成功。

## 3. frontmatter 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 文章标题 |
| `published` | 是 | 发布日期，例如 `2026-10-20` |
| `updated` | 否 | 更新日期，有值时会显示 |
| `description` | 否 | 摘要，用于首页卡片和 SEO |
| `image` | 否 | 封面图；相对文章目录，或以 `/` 开头表示 `public/` |
| `tags` | 否 | 标签数组，例如 `["Go", "并发"]` |
| `category` | 否 | 单个分类，例如 `"Go 后端"` |
| `draft` | 否 | `true` 时不会发布 |
| `lang` | 否 | 文章语言，例如 `zh_CN`；不填则跟随站点 |

:::warning
`draft: true` 的文章在本地 `pnpm dev` 中仍可能看到，但不会进入正式构建、RSS、sitemap 或 Pagefind 搜索索引。发布前务必改成 `false`。
:::

## 4. 正文怎么写

支持标准 Markdown，以及本项目已有的扩展：

### 标题与目录

```markdown
## 二级标题
### 三级标题
```

右侧目录由标题自动生成；站点配置中 `toc.depth` 控制显示层级。

### 代码块

````markdown
```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```
````

代码块支持语言高亮、复制按钮、行号和折叠（由 Expressive Code 提供）。

### 表格、引用、列表

```markdown
| 字段 | 说明 |
|---|---|
| title | 标题 |

> 这是一段引用。

- 列表项
- 列表项
```

### 提示框

```markdown
:::note
普通提示。
:::

:::tip
建议做法。
:::

:::warning
需要注意的风险。
:::
```

### 数学公式

```markdown
行内公式：$E = mc^2$

块级公式：

$$
\frac{a}{b} = c
$$
```

### 图片

图片有两种放法：

1. **相对文章目录**（推荐，构建时会优化）：

   ```text
   src/content/posts/my-post/
   ├── index.md
   └── cover.jpg
   ```

   frontmatter 写 `image: "./cover.jpg"`，正文写 `![说明](./cover.jpg)`。

2. **放在 `public/`**：

   ```text
   public/images/my-photo.jpg
   ```

   正文写 `![说明](/images/my-photo.jpg)`。

:::tip
图片文件名使用英文；路径大小写要和实际文件一致。正式构建会检查并优化相对路径的图片。
:::

## 5. 标签与分类怎么选

- 标签用于具体技术点，例如 `Go`、`Redis`、`MySQL`、`并发`；
- 分类用于大领域，一篇文章只填一个，例如：
  - `Go 后端`
  - `Java 微服务`
  - `数据库`
  - `计算机网络`
  - `AI 应用`
  - `站点维护`

标签和分类会自动出现在归档页、侧边栏和搜索索引中，不需要手动维护列表。

## 6. 本地预览

启动开发服务器：

```bash
pnpm dev
```

打开 <http://localhost:4321>，检查：

- 标题、正文、代码块、图片；
- 右侧目录；
- 标签、分类、归档；
- 明暗主题；
- 移动端宽度。

:::note
开发环境的搜索使用占位结果，不能验证真实全文搜索。真实 Pagefind 搜索要在 `pnpm build` 之后才能测试。
:::

## 7. 提交前的检查

```bash
pnpm check
pnpm type-check
pnpm exec biome ci ./src
pnpm build
pnpm verify
```

说明：

- `pnpm check`：Astro/Svelte/TypeScript 诊断；
- `pnpm type-check`：`tsc --noEmit`；
- `biome ci`：格式与静态检查；
- `pnpm build`：生成 `dist/` 和 Pagefind 索引；
- `pnpm verify`：检查 404、RSS、sitemap、Pagefind、内部链接、草稿泄漏等。

本地预览正式构建：

```bash
pnpm preview
```

打开 <http://localhost:4321>，在搜索框输入一个正文关键词，确认 Pagefind 能命中这篇文章。

## 8. 发布到网站

### 本地 git 流程（推荐）

```bash
git status
git add src/content/posts/my-first-post.md
git commit -m "post: add my first post"
git push origin main
```

推送后，GitHub Actions 会自动执行：

1. 安装依赖；
2. `pnpm check` + `pnpm type-check`；
3. `pnpm build`（含 Pagefind）；
4. 上传 `dist/`；
5. 部署到 GitHub Pages。

在仓库的 **Actions → Deploy to GitHub Pages** 查看进度；成功后访问：

```text
https://YunfeiSHU.github.io/posts/my-first-post/
```

### GitHub 网页流程

直接编辑/新建文件并提交到 `main`，效果与本地 push 相同。

### 发布后检查

- 文章 URL 能打开；
- 首页出现文章卡片；
- `/archive/` 出现文章，标签/分类筛选正常；
- 站内搜索能搜到标题、摘要、标签或正文关键词；
- RSS 和 sitemap 包含新文章；
- 手机宽度没有横向溢出。

## 9. 常见问题

### 页面 404

- 文件名和 URL 是否一致；
- 是否已经成功构建并部署；
- 站点使用尾斜杠，访问 `/posts/xxx/` 而不是 `/posts/xxx`；
- 是否把文件放进了 `src/content/posts/`，而不是 `public/`。

### 搜索找不到

- 开发环境搜索是占位结果，必须 `pnpm build` 后测试；
- 新文章是否已经进入构建；
- 草稿不会进入索引；
- 中文搜索使用 `zh-cn` 索引，标签/分类通过正文元数据进入索引。

### 图片不显示

- 相对路径是否以文章目录为基准；
- `public` 图片是否以 `/` 开头；
- 文件名大小写是否一致；
- 构建日志中是否有 `Image file not found`。

### 草稿没有出现在网站

这是预期行为：生产构建会过滤 `draft: true`。确认 frontmatter 改成 `draft: false` 并重新部署。

### 部署失败

先本地执行：

```bash
pnpm check
pnpm type-check
pnpm build
```

再到 Actions 日志中查看具体报错；不要直接在线上手改 `dist/`。

## 10. 发布前检查清单

- [ ] 文件在 `src/content/posts/`，文件名是英文短横线；
- [ ] `title`、`published` 已填写；
- [ ] `draft` 为 `false`；
- [ ] 标签/分类符合站点规范；
- [ ] 图片路径正确；
- [ ] `pnpm check`、`pnpm type-check`、`pnpm build` 通过；
- [ ] 本地预览过文章、标签、搜索；
- [ ] 提交并 push 到 `main`；
- [ ] Actions 部署成功；
- [ ] 线上 URL、RSS、sitemap 正常。

---

按这个流程，新增一篇文档只需要“写 Markdown → 本地检查 → push”，网站会自动更新。
