export async function GET({ fetch, setHeaders }) {
  setHeaders({
    "Content-Type": "application/xml",
  });
  const site = "https://frctools.com";
  const years = [2024];
  // (await import(`../../../lib/${year}.js`)).default;
  const rules = await Promise.all(years.map(async (year) => {
    const ruleset = await import(`../../lib/${year}.js`);
    return {
      year,
      rules: ruleset.default,
      lastUpdated: ruleset.LAST_UPDATED,
    };
  }));
  let rulesStr = ``;
  for (let year of rules) {
    rulesStr += `<url>
    <loc>${site}/${year.year}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
    </url>
    `;
    for (let rule of Object.keys(year.rules)) {
      rulesStr += `<url>
      <loc>${site}/${year.year}/rule/${rule}</loc>
      <priority>0.6</priority>
      <changefreq>monthly</changefreq>
      </url>
      `;
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${site}</loc>
<changefreq>daily</changefreq>
<priority>0.7</priority>
</url>
${rulesStr}
</urlset>
  `;
  return new Response(sitemap);
}
