/** 目录条目：由 rehype-toc-entries 在构建期生成，html 是公式已渲染好的标题内容。 */
export type TocEntry = {
	depth: number;
	slug: string;
	html: string;
};
