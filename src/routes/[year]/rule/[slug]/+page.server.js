import fs from "fs/promises";
import path from 'path'
export const prerender = true;
export const load = async ({ params }) => {
  let rules;
  try {
    rules = JSON.parse(await fs.readFile(path.resolve(`src/lib/${params.year}.json`)));
    
  } catch (e){
    console.log(e)
    return {error: true}
  }
  const rule = rules[params.slug.toUpperCase()];
  if (!rule) {
    return {
      error: true,
    };
  }
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
