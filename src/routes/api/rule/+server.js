import { json } from "@sveltejs/kit";
import fs from 'fs/promises'
import path from 'path'
export async function GET({ url }) {
  let query = url.searchParams.get("query").toUpperCase() ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const rules = JSON.parse(await fs.readFile(path.resolve(`src/lib/${year}.json`)));

  return json(rules[query] ? rules[query] : { error: "no such rule" });
}
