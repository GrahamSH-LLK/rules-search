import { MeiliSearch } from "meilisearch";
import { Rule } from "../utils";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const MEILI_READ_KEY = `511e67e52684dfba7dbeddbf37795d7b71abce169ad510580f41c09f09e676cc`;
  let query = url.searchParams.get("query") ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  let semantic = url.searchParams.get("semantic") == "true";
  if (query == "") {
    return {
      hits: [],
    };
  }
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-${year}`;
  const index = await client.index(indexName);
  let options: any = {};
  if (semantic) {
    options["hybrid"] = {
      embedder: "default",
      semanticRatio: 0.5,
    };
  }

  const searchResults = await index.search<Rule>(query, options);
  return searchResults;
});
/*
export async function OPTIONS({}) {
  return new Response('', {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

}*/
