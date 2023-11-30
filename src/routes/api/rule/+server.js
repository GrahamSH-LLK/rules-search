import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let query = url.searchParams.get("query").toUpperCase() ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const rules = (await import(`../../../lib/${year}.js`)).default;

  return json(rules[query] ? rules[query] : { error: "no such rule" });
}
