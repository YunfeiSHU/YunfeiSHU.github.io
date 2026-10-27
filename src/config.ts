import type {
	ExpressiveCodeConfig,
	GiscusConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "YunfeiSHU's Blog",
	subtitle: "记录技术学习与生活思考的地方",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
	ogImage: "/og-default.png",
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "项目",
			url: "/projects/",
		},
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/YunfeiSHU", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "YuiMon",
	bio: "YuifeiSHU Email : YuiMon05@163.com",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/YunfeiSHU",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:YuiMon05@163.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const homeConfig = {
	intro: "记录技术学习、项目实践与日常思考。",
	techStack: ["Go", "Java", "MySQL", "Redis", "计算机网络", "AI 应用"],
	featuredProjectSlugs: ["media-community", "ai-assistant"],
};

/**
 * Giscus 公开配置。启用前必须补齐 repo/repoId/category/categoryId，
 * 并确认仓库公开、Discussions 已开启、Giscus App 已授权。
 * 这里只允许公开 ID，不要放任何 token/secret。
 */
export const giscusConfig: GiscusConfig = {
	enable: false,
	repo: "",
	repoId: "",
	category: "",
	categoryId: "",
	mapping: "pathname",
	strict: "0",
	reactionsEnabled: "1",
	emitMetadata: "0",
	inputPosition: "top",
	lang: "zh-CN",
	theme: "preferred_color_scheme",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
