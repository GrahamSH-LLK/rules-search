import { MeiliSearch } from "meilisearch";
import { Rule } from "../utils";
export default defineEventHandler(async (event) => {
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
    throw { error: "no such rule" };
  }
  const rule = searchResults.hits[0];
  setResponseHeader(event, "content-type", "application/activity+json");
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      {
        Hashtag: "as:Hashtag",
        sensitive: "as:sensitive",
      },
    ],
    id: `https:\/\/frctools.com\/apub?year=${year}&rule=${rule}`,
    type: "Note",
    attributedTo:
      "https://frctools.coms/api/actor",
    content: rule.text,
    contentMap: {
      en: rule.text,
    },
    url: `https:\/\/frctools.com/${year}/rule/${rule.name}`,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    mediaType: "text/html",
  };
});
