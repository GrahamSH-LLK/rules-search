<script>
  import { MetaTags } from "svelte-meta-tags";
  //import rules from "$lib/rules.json";
  import { page } from "$app/stores"; 

  export let data;
  import lunr from "lunr";
  import { onMount } from "svelte";
  let idx;
  let rulesArr;
  const rules = data.rules;
  import { pa } from '@accuser/svelte-plausible-analytics';

  const { addEvent } = pa;

  if (!data.error) {
    rulesArr = Object.values(rules);
    idx = lunr(function () {
      this.ref("name");
      this.field("text");
      this.field("name");

      rulesArr.forEach(function (doc) {
        this.add(doc);
      }, this);
    });
  }
  let value = "";
  let currResults = [];
  const search = async () => {
    setParam('query', value)
    if (semanticSearch) {
      addEvent("semantic_search")
      let res = await fetch(`https://search.grahamsh.com/search`, {
        method: "post",
        body: JSON.stringify({ query: value }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      let json = await res.json();
      let results = json.data.map((x) => {
        return { ...rules[x.text], ref: x.text };
      });
      currResults = results;
    } else {
      addEvent("search")
      let x = idx.search(value);
      currResults = x;
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
    $page.url.searchParams.set(param,value); 
    history.replaceState(history.state, '', $page.url)

  }
  const toggle = () => {
    
    semanticSearch = !semanticSearch;
    setParam("semantic", semanticSearch)
    search();
  };
  onMount(async () => {
    if (window) {
      let params = new URLSearchParams(window.location.search)
      value = params.get("query") ? params.get("query") : "";
      semanticSearch = params.get("semantic") ? params.get("semantic") == "true" : true;
      await search();
    }
  })
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
        {#if data.year == new Date().getFullYear()}
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
            id="search-dropdown"
            class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
            placeholder="Search anything to find a relevant rule"
            required
            bind:value
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
        <h3>
          <a href={`/rule/${res.ref}`}>
            {res.ref}
            {#if rules[res.ref].evergreen}<span title="Evergreen rule">🌲</span
              >{/if}
          </a>
        </h3>
        <div>{@html rules[res.ref].text}</div>
      </div>
    {/each}
    <p class="font-extralight italic">Last updated {data.lastUpdated.toLocaleString()}</p>
  </div>
{:else}
  Error loading
{/if}