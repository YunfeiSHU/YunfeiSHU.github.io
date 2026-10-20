# 部署说明（GitHub Pages + GitHub Actions）

## 目标

- 站点：<https://YunfeiSHU.github.io/>
- 仓库：`YunfeiSHU/YunfeiSHU.github.io`
- 用户站点根路径，`base: "/"`，不需要子路径配置
- 用 Fuwari 替换旧 Hugo 站，旧内容不删除

## 实际部署记录（2026-10-20）

已实际执行：

- 旧 `main` 备份为 `hugo-main-backup`；
- 旧 `doc` 分支保留（旧 Hugo 构建产物 / 回滚点）；
- Fuwari 源码推送到 `main`，commit `b927fe9e97715632bf9a77eb26c071c78a8b1d5b`；
- Pages `build_type` 从 `legacy` 改为 `workflow`；
- Actions `Deploy to GitHub Pages` run `39401637522`：build 46s、deploy 11s，成功；
- 线上 `https://YunfeiSHU.github.io/`、`/projects/`、`/about/`、`/archive/`、`/404.html`、`/rss.xml`、`/sitemap-index.xml`、`/pagefind/pagefind.js`、`/og-default.png` 均返回 200；
- 未知路径返回 404，内容为自定义“页面不存在”。

当前仓库分支：

- `main`：Fuwari 新站源码；
- `doc`：旧 Hugo 构建产物；
- `hugo-main-backup`：旧 Hugo 源内容。

## 部署前状态（历史）

- 默认分支 `main`：旧 Hugo 源内容；
- 分支 `doc`：旧 Hugo 构建产物，Pages 当时从 `doc` 分支发布；
- Pages `build_type` 为 `legacy`。

## 工作流

`.github/workflows/deploy.yml`：

- 触发：push 到 `main`、手动 `workflow_dispatch`
- 权限：`contents: read`、`pages: write`、`id-token: write`
- 步骤：checkout → pnpm 9.14.4 → Node 22 → `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm type-check` → `pnpm build` → `configure-pages` → `upload-pages-artifact` → `deploy-pages`
- 产物：`dist/`（含 Pagefind）

`build.yml` 仍用于 push/PR 的检查与构建；`biome.yml` 使用项目固定 Biome 版本。

## 复现/后续部署步骤

以下命令已用于本次部署，后续更新可在具备仓库写权限的环境重复执行：

```bash
# 1. 先备份旧 main
git fetch https://github.com/YunfeiSHU/YunfeiSHU.github.io.git main:refs/remotes/target/main
git push https://github.com/YunfeiSHU/YunfeiSHU.github.io.git refs/remotes/target/main:refs/heads/hugo-main-backup

# 2. 将本仓库 main 推到目标仓库 main
git remote add target https://github.com/YunfeiSHU/YunfeiSHU.github.io.git
git push target main --force

# 3. 将 Pages 切换为 GitHub Actions
gh api -X PUT repos/YunfeiSHU/YunfeiSHU.github.io/pages \
  -f build_type=workflow
```

推送后：

```bash
gh run list --repo YunfeiSHU/YunfeiSHU.github.io --limit 5
gh run watch --repo YunfeiSHU/YunfeiSHU.github.io
```

也可以在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

## 环境变量

`astro.config.mjs` 支持：

- `SITE_URL`：默认 `https://YunfeiSHU.github.io/`
- `BASE_PATH`：默认 `/`

用户站点不需要设置；如果以后改成项目站点（`username.github.io/repo/`），在构建环境中设置 `BASE_PATH=/repo/`，并把 `SITE_URL` 改成完整站点地址。

## 自定义域名

1. 在仓库 Settings → Pages 填写 Custom domain；
2. 在 DNS 配置 CNAME；
3. 等待 GitHub 校验证书；
4. `SITE_URL` 改成自定义域名，重新构建。

不要在域名未确定时把 `example.com` 写成正式地址。

## 回滚

旧站仍可从以下位置恢复：

- `doc` 分支（旧 Hugo 构建产物）
- `hugo-main-backup` 分支（旧 Hugo 源内容）

将 Pages 的 `build_type` 改回 `legacy`，source 指向 `doc`，即可恢复旧站。

## 部署验收

- GitHub Actions `Deploy to GitHub Pages` 运行成功；
- <https://YunfeiSHU.github.io/> 返回 200，标题为 `YunfeiSHU's Blog`；
- `/projects/`、`/about/`、`/archive/`、`/posts/...` 可访问；
- `/404.html` 正常；
- `pagefind/pagefind.js` 可访问，搜索可用；
- 移动端/明暗主题正常；
- 旧 `doc` 分支和备份分支仍存在。

> 本文档描述部署步骤；实际是否已部署，以 GitHub Actions 运行记录和线上页面为准，不以本文档代替部署结果。
