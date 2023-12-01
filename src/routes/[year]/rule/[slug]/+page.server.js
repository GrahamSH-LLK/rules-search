export const load = async ({ params }) => {
  let rules;
  try {
    rules = (await import(`../../../../lib/${params.year}.json`)).default;
  } catch (e) {
    console.log(e);
    return { error: true };
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
