<script lang="ts">
import { onMount } from "svelte";
import { giscusConfig } from "../config";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

let { title = "" }: { title?: string } = $props();

const configured = Boolean(
	giscusConfig.enable &&
		giscusConfig.repo &&
		giscusConfig.repoId &&
		giscusConfig.category &&
		giscusConfig.categoryId,
);

let container: HTMLDivElement | undefined;
let failed = $state(false);

const getTheme = (): "light" | "dark" => {
	if (giscusConfig.theme === "light" || giscusConfig.theme === "dark") {
		return giscusConfig.theme;
	}
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

onMount(() => {
	if (!configured || !container) {
		if (giscusConfig.enable && !configured) {
			console.warn(
				"[Giscus] enable=true 但 repo/repoId/category/categoryId 不完整，评论区已隐藏。",
			);
		}
		return;
	}

	const script = document.createElement("script");
	script.src = "https://giscus.app/client.js";
	script.async = true;
	script.crossOrigin = "anonymous";
	script.setAttribute("data-repo", giscusConfig.repo);
	script.setAttribute("data-repo-id", giscusConfig.repoId);
	script.setAttribute("data-category", giscusConfig.category);
	script.setAttribute("data-category-id", giscusConfig.categoryId);
	script.setAttribute("data-mapping", giscusConfig.mapping);
	if (giscusConfig.term) {
		script.setAttribute("data-term", giscusConfig.term);
	}
	script.setAttribute("data-strict", giscusConfig.strict);
	script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
	script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
	script.setAttribute("data-input-position", giscusConfig.inputPosition);
	script.setAttribute("data-theme", getTheme());
	script.setAttribute("data-lang", giscusConfig.lang);
	script.setAttribute("data-loading", "lazy");
	script.onerror = () => {
		failed = true;
	};
	container.appendChild(script);

	const syncTheme = () => {
		const iframe = container?.querySelector("iframe");
		iframe?.contentWindow?.postMessage(
			{ giscus: { setConfig: { theme: getTheme() } } },
			"https://giscus.app",
		);
	};

	const observer = new MutationObserver(syncTheme);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});

	return () => {
		observer.disconnect();
		container?.replaceChildren();
	};
});
</script>

{#if configured}
    <section class="card-base mb-6 p-6" aria-label={`${i18n(I18nKey.comments)}${title ? ` - ${title}` : ""}`}>
        <div class="mb-4 text-lg font-bold text-90">{i18n(I18nKey.comments)}</div>
        <div class="giscus" bind:this={container}></div>
        {#if failed}
            <p class="mt-3 text-sm text-50">
                评论加载失败，文章内容仍可正常阅读。请检查网络或 Giscus 配置。
            </p>
        {/if}
    </section>
{/if}
