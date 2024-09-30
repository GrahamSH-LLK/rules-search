import { MeiliSearch } from "meilisearch";
export const load = async ({ params }) => {
  let query = params.slug;
  let year = params.year;

  const MEILI_READ_KEY = `2db41b6a1ce3e0daf62e36d67f996e60f41a07807588971a050d7bfb74df5efe`;
  const client = new MeiliSearch({
    host: "https://meilisearch.frctools.com",
    apiKey: MEILI_READ_KEY,
  });
  const indexName = `rules-${year}`;
  const index = await client.index(indexName);
  const searchResults = await index.search('', {
    filter: `name = '${query}'`,
  });
  console.log(searchResults)

  if (searchResults.hits.length === 0) {
    return { error: "no such rule" };
  }
  const rule = searchResults.hits[0];
  return {
    rule: rule.name,
    summary: rule.summary,
    text: rule.text,
    images: rule.additionalContent.filter((x) => {
      return x.type == "image";
    }),
    evergreen: rule.evergreen,
  };
};
