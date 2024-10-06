<script>
  import { MetaTags } from "svelte-meta-tags";
  //import rules from "$lib/rules.json";
  import { page } from "$app/stores";

  export let data;
  import { onMount } from "svelte";
  import { pa } from "@accuser/svelte-plausible-analytics";

  const { addEvent } = pa;

  let searchValue = "";
  let filter = "";
  let currResults = [];
  let error = {};
  const search = async () => {
    setParam("query", searchValue);
    setParam("filter", filter);
    if (semanticSearch) {
      //addEvent("semantic_search");
    }
    try {
      let res = await fetch(
        `/api/search?year=${data.year}&query=${searchValue}&semantic=${semanticSearch}&filter=${filter}`,
        {
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      let json = await res.json();

      currResults = json.hits;
    } catch (e) {
      currResults = [];
      console.log('hi', e)

    }
  };
  let semanticSearch = data.year == new Date().getFullYear();
  const debounce = (callback, wait = 300) => {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => callback(...args), wait);
    };
  };
  const setParam = (param, value) => {
    $page.url.searchParams.set(param, value);
    history.replaceState(history.state, "", $page.url);
  };
  const toggle = () => {
    semanticSearch = !semanticSearch;
    setParam("semantic", semanticSearch);
    search();
  };
  const share = async (rule) => {
    const shareData = {
      title: `Rule ${rule}`,
      text: `Learn about rule ${rule}`,
      url: `https://frctools.com/${data.year}/rule/${rule}`,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(
        `https://frctools.com/${data.year}/rule/${rule}`
      );
    }
  };
  onMount(async () => {
    if (window) {
      let params = new URLSearchParams(window.location.search);
      searchValue = params.get("query") ? params.get("query") : "";
      filter = params.get("filter") ? params.get("filter") : "";
      semanticSearch = false; /*params.get("semantic")
        ? params.get("semantic") == "true"
        : true;*/
      await search();
    }
  });
</script>

{#if !data.error}
  <MetaTags
    title="FRC Rules Search"
    description="A semantic search for FRC manual rules"
    openGraph={{
      url: "https://www.url.ie/a",

      title: "FRC Rules Search",
      description: "A semantic search for FRC manual rules",
      siteName: "FRC Rules Search",
      themeColor: "#ff00ff",
      images: [],
    }}
  />
  <div>
    <form class="my-4">
      <div class="flex">
        <label
          for="search-dropdown"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >Search</label
        >
        {#if data.year == 2024 && false}
          <button
            class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600"
            type="button"
            on:click={toggle}
            >{semanticSearch
              ? "Disable Semantic Search"
              : "Enable Semantic Search"}</button
          >
        {/if}

        <div class="relative w-full">
          <input
            type="search"
            id="search"
            class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
            placeholder="Search anything to find a relevant rule"
            required
            bind:value={searchValue}
            on:input={debounce(search)}
          />
          <input
            type="text"
            id="filter"
            class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
            placeholder=""
            bind:value={filter}
            on:input={debounce(search)}
          />
        </div>
      </div>
    </form>
    {#if !currResults.length}
      <div class="max-w-full p-2 py-4 my-2 border border-gray-200 rounded-md">
        No results!
      </div>
    {/if}
    {#each currResults as res}
      <div class="prose max-w-full p-2 my-2 border border-gray-200 rounded-md">
        <div class="flex justify-between flex-row">
          <h3 class="m-0">
            <a href={`/${data.year}/rule/${res.name}`}>
              {res.name}
              {#if res.evergreen}<span title="Evergreen rule">🌲</span>{/if}
            </a>
          </h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 cursor-pointer"
            on:click={share(res.name)}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        </div>
        <div>{@html res.text}</div>
      </div>
    {/each}
    <p class="font-extralight italic">
      <!--Last updated {data.lastUpdated.toLocaleString()}-->
    </p>
  </div>
{:else}
  Error loading
{/if}
