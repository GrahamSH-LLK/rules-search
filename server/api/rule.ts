import {MeiliSearch} from 'meilisearch'
import { Rule } from '../utils';
export default defineEventHandler(async (event)=> {
  const url = getRequestURL(event);
  
  let query = url.searchParams?.get("query")?.toUpperCase() ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const MEILI_READ_KEY = `511e67e52684dfba7dbeddbf37795d7b71abce169ad510580f41c09f09e676cc`;
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