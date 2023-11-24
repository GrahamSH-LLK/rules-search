import rules from "$lib/rules";
export const load = ({ params }) => {
  const rule = rules[params.slug.toUpperCase()];
  if (!rule) {
    return {
        error: true
    }
  }
  return {
    rule: rule.name,
    summary: rule.summary,
    text: rule.text,
    images: rule.additionalContent.filter((x) => {
      return x.type == "image";
    }),
  };
};
