
export const load = async ({ params }) => {
  let rules;
  let lastUpdated;
  if (params.year.includes("favicon")) return { error: true };
  //console.log(rules);
  return {
    lastUpdated,
    year: params.year,
  };
};
