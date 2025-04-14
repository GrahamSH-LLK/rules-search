import { MeiliSearch } from "meilisearch";
import { Rule } from "../utils";
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  let facet = url.searchParams?.get("facet") ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-${year}`;
  const index = await client.index(indexName);
  const { facetHits } = await index.searchForFacetValues({ facetName: facet });
  return facetHits;
});
