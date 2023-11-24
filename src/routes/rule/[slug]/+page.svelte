<script>
  import { MetaTags } from "svelte-meta-tags";
  export let data;
</script>

<MetaTags
  title={data.rule}
  description={data.summary}
  openGraph={{
    url: "https://www.url.ie/a",

    title: `Rule ${data.rule}`,
    description: data.summary.replaceAll("\n", " "),
    siteName: "FRC Rules Search",
    themeColor: "#ff00ff",
    images: [...data.images.map((x) => {
        return { url: x.src, height: x.height, width: x.width, alt: x.alt };
      })],
    
  }}
/>
<div>
  <a href="/">Home</a>
</div>
<div>
  <h1>{data.rule}</h1>
  <div>{@html data.text}</div>
</div>
