<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

interface TagCount {
	name: string;
	count: number;
}

interface CategoryCount {
	name: string;
	count: number;
}

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string | null;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

export let sortedPosts: Post[] = [];
export let allTags: TagCount[] = [];
export let allCategories: CategoryCount[] = [];

let selectedTags: string[] = [];
let selectedCategory = "";
let groups: Group[] = [];
let filteredCount = 0;
let ready = false;

const UNCATEGORIZED = "__uncategorized__";

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

function filterPosts() {
	let filteredPosts: Post[] = sortedPosts;

	if (selectedTags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => selectedTags.includes(tag)),
		);
	}

	if (selectedCategory === UNCATEGORIZED) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	} else if (selectedCategory) {
		filteredPosts = filteredPosts.filter(
			(post) => (post.data.category || "").trim() === selectedCategory,
		);
	}

	filteredCount = filteredPosts.length;

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);
	groups = groupedPostsArray;
}

function readParams() {
	const params = new URLSearchParams(window.location.search);
	selectedTags = params.getAll("tag");
	const category = params.get("category") || "";
	selectedCategory =
		category || (params.get("uncategorized") === "true" ? UNCATEGORIZED : "");
}

function updateUrl() {
	const params = new URLSearchParams();
	for (const tag of selectedTags) {
		params.append("tag", tag);
	}
	if (selectedCategory === UNCATEGORIZED) {
		params.set("uncategorized", "true");
	} else if (selectedCategory) {
		params.set("category", selectedCategory);
	}
	const query = params.toString();
	const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
	window.history.replaceState(null, "", next);
}

function applyFilters() {
	updateUrl();
	filterPosts();
}

function toggleTag(tag: string) {
	selectedTags = selectedTags.includes(tag)
		? selectedTags.filter((item) => item !== tag)
		: [...selectedTags, tag];
	applyFilters();
}

function changeCategory(event: Event) {
	const target = event.target as HTMLSelectElement;
	selectedCategory = target.value;
	applyFilters();
}

function clearFilters() {
	selectedTags = [];
	selectedCategory = "";
	applyFilters();
}

onMount(() => {
	readParams();
	filterPosts();
	ready = true;

	const onPopState = () => {
		readParams();
		filterPosts();
	};
	window.addEventListener("popstate", onPopState);
	return () => window.removeEventListener("popstate", onPopState);
});
</script>

<div class="card-base mb-4 p-5 md:p-6">
    <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
            <div class="text-lg font-bold text-90">筛选</div>
            <div class="text-sm text-50" aria-live="polite">共 {filteredCount} 篇文章</div>
        </div>
        <button
            class:list={[
                "btn-regular h-9 rounded-lg px-3 text-sm font-bold active:scale-95",
                { "pointer-events-none opacity-40": selectedTags.length === 0 && !selectedCategory },
            ]}
            on:click={clearFilters}
            aria-label="清空全部筛选"
        >
            清空筛选
        </button>
    </div>

    {#if allTags.length > 0}
        <div class="mt-4">
            <div class="mb-2 text-sm font-bold text-75">标签</div>
            <div class="flex flex-wrap gap-2">
                {#each allTags as tag}
                    <button
                        class:list={[
                            "btn-regular h-8 rounded-lg px-2.5 text-xs font-medium active:scale-95",
                            { "!bg-[var(--primary)] !text-white dark:!text-black/70": selectedTags.includes(tag.name) },
                        ]}
                        on:click={() => toggleTag(tag.name)}
                        aria-pressed={selectedTags.includes(tag.name)}
                    >
                        {tag.name}
                        <span class="ml-1 opacity-60">{tag.count}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    {#if allCategories.length > 0}
        <div class="mt-4 flex flex-wrap items-center gap-3">
            <label for="archive-category" class="text-sm font-bold text-75">分类</label>
            <select
                id="archive-category"
                value={selectedCategory}
                on:change={changeCategory}
                class="h-9 rounded-lg bg-[var(--btn-regular-bg)] px-3 text-sm text-[var(--btn-content)] outline-none"
            >
                <option value="">全部分类</option>
                {#each allCategories as category}
                    <option value={category.name}>{category.name}（{category.count}）</option>
                {/each}
                <option value={UNCATEGORIZED}>未分类</option>
            </select>
        </div>
    {/if}
</div>

{#if ready && filteredCount === 0}
    <div class="card-base p-8 text-center">
        <div class="text-lg font-bold text-90">没有符合条件的文章</div>
        <p class="mt-2 text-sm text-50">换一个标签或分类，或者清空筛选。</p>
        <button class="btn-regular mt-4 h-9 rounded-lg px-4 text-sm font-bold active:scale-95" on:click={clearFilters}>
            清空筛选
        </button>
    </div>
{:else}
    <div class="card-base px-8 py-6">
        {#each groups as group}
            <div>
                <div class="flex flex-row w-full items-center h-[3.75rem]">
                    <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                        {group.year}
                    </div>
                    <div class="w-[15%] md:w-[10%]">
                        <div
                                class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                      -outline-offset-[2px] z-50 outline-3"
                        ></div>
                    </div>
                    <div class="w-[70%] md:w-[80%] transition text-left text-50">
                        {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                    </div>
                </div>

                {#each group.posts as post}
                    <a
                            href={getPostUrlBySlug(post.slug)}
                            aria-label={post.data.title}
                            class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                    >
                        <div class="flex flex-row justify-start items-center h-full">
                            <!-- date -->
                            <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                                {formatDate(post.data.published)}
                            </div>

                            <!-- dot and line -->
                            <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                                <div
                                        class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                           bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                           outline outline-4 z-50
                           outline-[var(--card-bg)]
                           group-hover:outline-[var(--btn-plain-bg-hover)]
                           group-active:outline-[var(--btn-plain-bg-active)]"
                                ></div>
                            </div>

                            <!-- post title -->
                            <div
                                    class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                         group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                         text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                            >
                                {post.data.title}
                            </div>

                            <!-- tag list -->
                            <div
                                    class="hidden md:block md:w-[15%] text-left text-sm transition
                         whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
                            >
                                {formatTag(post.data.tags)}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/each}
    </div>
{/if}
