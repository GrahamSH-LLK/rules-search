import rules from "$lib/rules.json";
const rulesArr = Object.values(rules);
import lunr from "lunr";
import { json } from "@sveltejs/kit";

const idx = lunr(function () {
  this.ref("name");
  this.field("text");
  this.field("name");

  rulesArr.forEach(function (doc) {
    this.add(doc);
  }, this);
});

export function GET({ url }) {
  let query = url.searchParams.get("query") ?? "";
  let x = idx.search(query);
  return json(
    x.map((x) => {
      return { name: x.ref, text: rules[x.ref].text };
    })
  );
}
