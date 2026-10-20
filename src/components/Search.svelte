<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let searched = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>pnpm build && pnpm preview</mark> instead.",
	},
];

const openPanel = (): void => {
	document
		.getElementById("search-panel")
		?.classList.remove("float-panel-closed");
};

const closePanel = (): void => {
	document.getElementById("search-panel")?.classList.add("float-panel-closed");
};

const togglePanel = (): void => {
	document
		.getElementById("search-panel")
		?.classList.toggle("float-panel-closed");
};

const search = async (keyword: string): Promise<void> => {
	const query = keyword.trim();
	if (!query) {
		result = [];
		searched = false;
		closePanel();
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;
	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(query);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		searched = true;
		openPanel();
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		searched = true;
		openPanel();
	} finally {
		isSearching = false;
	}
};

const clearSearch = (): void => {
	keywordDesktop = "";
	keywordMobile = "";
	result = [];
	searched = false;
	isSearching = false;
	closePanel();
};

const handleKeydown = (event: KeyboardEvent): void => {
	if (event.key === "Escape") {
		clearSearch();
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		if (keywordDesktop) search(keywordDesktop);
		if (keywordMobile) search(keywordMobile);
	};

	if (import.meta.env.DEV) {
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", initializeSearch);
		document.addEventListener("pagefindloaderror", initializeSearch);

		// Fallback in case events are not caught or pagefind is already loaded.
		setTimeout(() => {
			if (!initialized) {
				initializeSearch();
			}
		}, 2000);
	}

	document.addEventListener("keydown", handleKeydown);
	return () => {
		document.removeEventListener("keydown", handleKeydown);
		document.removeEventListener("pagefindready", initializeSearch);
		document.removeEventListener("pagefindloaderror", initializeSearch);
	};
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile);
	})();
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
    <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop} on:focus={() => search(keywordDesktop)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2" aria-live="polite">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
        <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    {#if isSearching}
        <div class="px-3 py-4 text-sm text-50">搜索中…</div>
    {:else if searched}
        <div class="flex items-center justify-between gap-3 px-3 py-2">
            <div class="text-xs text-50">
                共 {result.length} 条结果
            </div>
            <button class="btn-plain h-7 rounded-md px-2 text-xs font-bold" on:click={clearSearch}>
                清空
            </button>
        </div>

        {#if result.length === 0}
            <div class="px-3 py-5 text-sm text-50">
                没有找到相关内容。试试更短的关键词，或检查标签/分类筛选。
            </div>
        {/if}

        {#each result as item}
            <a href={item.url}
               class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
           rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
                <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                    {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
                </div>
                <div class="transition text-sm text-50">
                    {@html item.excerpt}
                </div>
            </a>
        {/each}
    {/if}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
</style>
