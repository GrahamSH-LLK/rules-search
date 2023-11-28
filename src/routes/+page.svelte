<script>
  import { MetaTags } from "svelte-meta-tags";
  import rules from "$lib/rules.json";
  const rulesArr = Object.values(rules);
  import lunr from "lunr";
  const idx = lunr(function () {
    this.ref("name");
    this.field("text");
    this.field("name");

    rulesArr.forEach(function (doc) {
      this.add(doc);
    }, this);
  });

  let value = "";
  let currResults = [];
  const search = async () => {
    if (semanticSearch) {
      let res = await fetch(`https://search.grahamsh.com/search`, {
        method: "post",
        body: JSON.stringify({"query":value}),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      let json = await res.json();
      let results = json.data.map((x) => {
        return {...rules[x.text], ref: x.text};
      })
      currResults = results;
    } else {
      let x = idx.search(value);
      currResults = x;
    }
  };
  let semanticSearch = false;
</script>

<div>
  <p>Search anything below to find a relavent rule</p>
  <label
    >Use Semantic Search<input
      type="checkbox"
      bind:checked={semanticSearch}
    /></label
  >
  <input bind:value on:change={search} />
  {#each currResults as res}
    <div class="prose w-full p-2 my-2 border border-indigo-950 rounded-md">
      <h3>
        <a href={`/rule/${res.ref}`}>
          {res.ref}
          {#if rules[res.ref].evergreen}🌲{/if}
        </a>
      </h3>
      <div>{@html rules[res.ref].text}</div>
    </div>
  {/each}
</div>
