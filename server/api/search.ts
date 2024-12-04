import { MeiliSearch } from "meilisearch";
import { Rule } from "../utils";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  let query = url.searchParams.get("query") ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  let semantic = url.searchParams.get("semantic") == "true";
  if (query == '') {
   return {
      hits: []
      
   }
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
      semanticRatio: 0.8,
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
