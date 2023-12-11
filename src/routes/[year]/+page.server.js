
export const load = async ({ params }) => {
  let rules;
  let lastUpdated;
  if (params.year.includes("favicon")) return { error: true };
  try {
    let res  = (await import(`../../lib/${params.year}.js`));
    rules = res.default;
    lastUpdated = new Date(res.LAST_UPDATED)
  } catch (e) {
    console.log(e);
    return { error: true };
  }
  //console.log(rules);
  return {
    lastUpdated,
    rules: rules,
    year: params.year,
  };
};
