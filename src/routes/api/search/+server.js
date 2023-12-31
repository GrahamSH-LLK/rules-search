import lunr from "lunr";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let query = url.searchParams.get("query") ?? "";
  let year = url.searchParams.get("year") ?? new Date().getFullYear();
  const rules = (await import(`../../../lib/${year}.js`)).default;
  const rulesArr = Object.values(rules);

  const idx = lunr(function () {
    this.ref("name");
    this.field("text");
    this.field("name");

    rulesArr.forEach(function (doc) {
      this.add(doc);
    }, this);
  });

  let x = idx.search(query);
  return json(
    x.map((x) => {
      return { name: x.ref, text: rules[x.ref].text };
    }),
  );
}
