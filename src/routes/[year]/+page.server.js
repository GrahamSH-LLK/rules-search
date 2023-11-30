export const load = async ({ params }) => {
  let rules;
  try {
    rules = (await import(`../../lib/${params.year}.js`)).default;
  } catch (e) {
    console.log(e);
    return { error: true };
  }
  //console.log(rules);
  return {
    rules: rules,
    year: params.year,
  };
};
