import {MeiliSearch} from 'meilisearch'
import { Rule } from '../utils';
export default defineEventHandler(async (event)=> {
  const url = getRequestURL(event);
  
  let query = url.searchParams?.get("query")?.toUpperCase() ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-${year}`;
  const index = await client.index(indexName);
  const searchResults = await index.search<Rule>(query, {
    filter: `name = '${query}'`,
  });
  if (searchResults.hits.length === 0) {
    throw  { error: "no such rule" };
  }
  const rule = searchResults.hits[0];
  return rule;


});