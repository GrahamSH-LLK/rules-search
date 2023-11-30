import fs from 'fs/promises'
import path from 'path'
export const load = async ({ params }) => {
  let rules;
  try {
    rules = JSON.parse(await fs.readFile(path.resolve(`src/lib/${params.year}.json`)));
    
  } catch (e){
    console.log(e)
    return {error: true}
  }
  return {
    rules,
    year: params.year
  };
};
