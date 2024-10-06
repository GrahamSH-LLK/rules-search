import { MeiliSearch } from "meilisearch";
import { json, error } from "@sveltejs/kit";

export async function GET({ url }) {
  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  let query = url.searchParams.get("query") ?? "";
  let filter = url.searchParams.get("filter") ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  let semantic = url.searchParams.get("semantic") == "true";
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-ftc-${year}`;
  const index = await client.index(indexName);
  let options = {
    filter,
  };
  if (semantic) {
    options["hybrid"] = {
      embedder: "default",
      semanticRatio: 0.8,
    };
  }
  try {
    const searchResults = await index.search(query, options);
    return json(searchResults);
  } catch (e) {
    error(400, e);
  }
}
