<script>
  import { MetaTags } from "svelte-meta-tags";
  export let data;
</script>

{#if !data.error}
  <MetaTags
    title={data.rule}
    description={data.summary}
    openGraph={{
      url: "https://www.url.ie/a",

      title: `Rule ${data.rule}${data.evergreen ? " 🌲" : ""}`,
      description: data.summary.replaceAll("\n", " "),
      siteName: "FRC Rules Search",
      themeColor: "#ff00ff",
      images: [
        ...data.images.map((x) => {
          return { url: x.src, height: x.height, width: x.width, alt: x.alt };
        }),
      ],
    }}
  />
  <div>
  </div>
  <div class="prose">
    <h1>
      {data.rule}
      {#if data.evergreen}🌲{/if}
    </h1>
    <div>{@html data.text}</div>
  </div>
{:else}
  Error loading data
{/if}
