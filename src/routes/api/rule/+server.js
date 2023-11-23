import rules from "$lib/rules.json";
import { json } from "@sveltejs/kit";

export function GET({ url }) {
  let query = url.searchParams.get("query").toUpperCase() ?? "";

  return json(rules[query] ? rules[query] : { error: "no such rule" });
}
