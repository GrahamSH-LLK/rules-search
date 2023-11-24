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

<div>
  <p>Search anything below to find a relavent rule</p>
  <input bind:value on:input={search} />
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
