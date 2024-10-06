import { json } from "@sveltejs/kit";
import {MeiliSearch} from 'meilisearch'
export async function GET({ url }) {
  let query = url.searchParams.get("query").toUpperCase() ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-ftc-${year}`;
  const index = await client.index(indexName);
  const searchResults = await index.search(query, {
    filter: `name = '${query}'`,
  });
  if (searchResults.hits.length === 0) {
    return json({ error: "no such rule" });
  }
  const rule = searchResults.hits[0];
  return json(rule);


}
