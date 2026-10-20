import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const failures = [];
const checks = [];

function check(name, ok, detail = "") {
	checks.push({ name, ok, detail });
	if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function fileExists(relative) {
	return fs.existsSync(path.join(dist, relative));
}

function read(relative) {
	return fs.readFileSync(path.join(dist, relative), "utf8");
}

const required = [
	"index.html",
	"404.html",
	"projects/index.html",
	"about/index.html",
	"archive/index.html",
	"rss.xml",
	"sitemap-index.xml",
	"sitemap-0.xml",
	"robots.txt",
	"og-default.png",
	"pagefind/pagefind-entry.json",
];

for (const file of required) {
	check(`required ${file}`, fileExists(file));
}

const index = fileExists("index.html") ? read("index.html") : "";
check("canonical on home", index.includes('rel="canonical"'));
check("og:image on home", index.includes('property="og:image"'));
check("home has profile", index.includes("YuiMon"));
check("home has project nav", index.includes('href="/projects/"'));
check("no demo profile", !index.includes("Lorem Ipsum"));

const notFound = fileExists("404.html") ? read("404.html") : "";
check("404 is noindex", notFound.includes('name="robots" content="noindex"'));

const sitemap = fileExists("sitemap-0.xml") ? read("sitemap-0.xml") : "";
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
check("sitemap has urls", locs.length > 0, `${locs.length}`);
check("sitemap excludes 404", !locs.some((url) => url.endsWith("/404/")));

for (const url of locs) {
	const pathname = new URL(url).pathname;
	const relative = pathname.endsWith("/")
		? path.join(pathname.slice(1), "index.html")
		: pathname.slice(1);
	check(`sitemap target ${pathname}`, fileExists(relative));
}

const rss = fileExists("rss.xml") ? read("rss.xml") : "";
check("rss has items", rss.includes("<item>"));
check("draft excluded from rss", !rss.includes("Draft Example"));
check("draft excluded from home", !index.includes("Draft Example"));
check("draft excluded from sitemap", !sitemap.includes("Draft Example"));

const pagefindEntry = fileExists("pagefind/pagefind-entry.json")
	? JSON.parse(read("pagefind/pagefind-entry.json"))
	: {};
check(
	"pagefind index has language",
	Boolean(pagefindEntry.languages && Object.keys(pagefindEntry.languages).length),
);

const htmlFiles = fs
	.readdirSync(dist, { recursive: true })
	.filter((file) => typeof file === "string" && file.endsWith(".html"))
	.map((file) => path.join(dist, file));

const internalLinks = new Set();
for (const file of htmlFiles) {
	const html = fs.readFileSync(file, "utf8");
	for (const match of html.matchAll(/href="([^"]+)"/g)) {
		const href = match[1];
		if (
			href.startsWith("/") &&
			!href.startsWith("/_astro/") &&
			!href.startsWith("/pagefind/") &&
			!href.startsWith("/favicon/") &&
			!href.startsWith("//")
		) {
			internalLinks.add(href.split("#")[0].split("?")[0]);
		}
	}
}

for (const href of internalLinks) {
	if (href === "/rss.xml" || href === "/sitemap-index.xml" || href === "/robots.txt") {
		continue;
	}
	const relative = href.endsWith("/")
		? path.join(href.slice(1), "index.html")
		: href.slice(1);
	check(`internal link ${href}`, fileExists(relative));
}

for (const item of checks) {
	console.log(`${item.ok ? "PASS" : "FAIL"}  ${item.name}${item.detail ? ` (${item.detail})` : ""}`);
}

console.log(`\n${checks.length - failures.length}/${checks.length} checks passed`);
if (failures.length) {
	console.error(`\n${failures.length} failure(s):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}
