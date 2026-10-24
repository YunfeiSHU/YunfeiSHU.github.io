import Slugger from "github-slugger";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";

const HEADING = /^h([1-6])$/;
const KATEX_MATHML = "katex-mathml";

function hasClass(node, className) {
	const value = node.properties?.className;
	return Array.isArray(value) && value.includes(className);
}

/**
 * 取标题里"人眼可见"的文字。
 * KaTeX 会把同一段公式输出两次（可视的 katex-html + 无障碍用的 katex-mathml），
 * 直接取纯文本会得到 "固定 SSS：最优必是 a=1a=1a=1"，所以跳过 MathML 克隆。
 */
function visibleText(node) {
	if (node.type === "text") return node.value;
	if (node.type !== "element") return "";
	if (hasClass(node, KATEX_MATHML)) return "";
	return (node.children ?? []).map(visibleText).join("");
}

function containsMath(node) {
	if (node.type !== "element") return false;
	if (hasClass(node, "katex")) return true;
	return (node.children ?? []).some(containsMath);
}

/**
 * 收集带渲染后公式的目录条目，写入 frontmatter.tocEntries。
 *
 * 必须放在 rehype-katex 之后、rehype-autolink-headings 之前：
 * 前者保证标题里的公式已经变成 KaTeX 的 HTML，后者会往标题末尾插入 "#" 锚点，
 * 若在它之后序列化，锚点也会被搬进目录。
 *
 * 含公式的标题同时换成"去掉公式噪音"的 id（Astro 自带的标题收集器会沿用
 * 已经存在的 id），避免出现 "固定-sss最优必是-a1a1a1" 这种锚点。
 */
export function rehypeTocEntries() {
	return (tree, file) => {
		const headings = [];
		visit(tree, "element", (node) => {
			const match = HEADING.exec(node.tagName ?? "");
			if (!match) return;
			node.properties = node.properties ?? {};
			headings.push({ node, depth: Number.parseInt(match[1], 10) });
		});

		const slugger = new Slugger();
		const usedSlugs = new Set(
			headings
				.filter(({ node }) => !containsMath(node))
				.map(({ node }) => node.properties.id)
				.filter(Boolean),
		);

		const entries = headings.map(({ node, depth }) => {
			let slug = node.properties.id;
			if (containsMath(node)) {
				let candidate = slugger.slug(visibleText(node));
				while (candidate && usedSlugs.has(candidate)) {
					candidate = slugger.slug(visibleText(node));
				}
				if (candidate) {
					slug = candidate;
					usedSlugs.add(slug);
					node.properties.id = slug;
				}
			}

			return {
				depth,
				slug,
				html: toHtml({ type: "root", children: node.children ?? [] }),
			};
		});

		file.data.astro ??= {};
		file.data.astro.frontmatter ??= {};
		file.data.astro.frontmatter.tocEntries = entries;
	};
}
