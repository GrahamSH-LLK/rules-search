<script>
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
  const search = () => {
    let x = idx.search(value);
    currResults = x;
  };
</script>

<h1 class="text-3xl font-bold underline">Fuzzy Rule Search</h1>
<p>Search anything below to find a relavent rule</p>
<input bind:value on:input={search} />
{#each currResults as res}
<div class="prose-lg bg-indigo-50">  <h3>{res.ref}</h3>
  <div >{@html rules[res.ref].text}</div>
</div>

{/each}
