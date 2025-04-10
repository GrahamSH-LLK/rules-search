import { MeiliSearch } from "meilisearch";
import { Rule } from "../utils";
//import { parseHTML} from "linkedom";

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
  /*const { document } = parseHTML(rule.text);
  document.querySelectorAll(`div:is([style*="margin-left: 1.0in; margin-right: 1.0in"]):has(.BlueBox), div:is([style*="margin-left:1.0in;margin-right:1.0in"]):has(.BlueBox)`).forEach((blueBoxContainer)=> {
   const blockquote = document.createElement("blockquote");
   blockquote.append(...blueBoxContainer.children);
   blueBoxContainer.after(blockquote);
   blueBoxContainer.remove();
});*/
  setResponseHeader(event, "content-type", "application/activity+json");
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      {
        Hashtag: "as:Hashtag",
        sensitive: "as:sensitive",
      },
    ],
    id: `https:\/\/frctools.com\/apub?year=${year}&rule=${rule.name}`,
    type: "Note",
    attributedTo: "https://frctools.com/api/actor",
    content: rule.text,//document.toString(),
    contentMap: {
      en: rule.text//document.toString(),
    },
    url: `https:\/\/frctools.com/${year}/rule/${rule.name}`,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    mediaType: "text/html",
  };
});
