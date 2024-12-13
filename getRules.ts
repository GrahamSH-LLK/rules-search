import { JSDOM } from "jsdom";
import fs from "fs/promises";
import { MeiliSearch, MeiliSearchApiError, type Embedders } from "meilisearch";
export const ruleRegex = /^([a-zA-Z])(\d{3})$/;
export const getDocument = async (currYear: number, ftc: boolean = false) => {
  const res = await fetch(
    !ftc
      ? `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/${currYear}GameManual.htm`
      : `https://ftc-resources.firstinspires.org/file/ftc/game/cm-html`
  );
  const dec = new TextDecoder("windows-1252"); // word exports are in windows-1252 text format * just because*
  const arrBuffer = await res.arrayBuffer();
  const ui8array = new Uint8Array(arrBuffer);
  const html = dec.decode(ui8array);

  // Use jsdom to parse the HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;
  return document;
};
/**
 * Fixes image URLs since we aren't hosted on the same path as the real manual
 * @param currYear Current year
 * @param document The document to fix
 */
export const fixImages = (
  currYear: number,
  document: Document,
  ftc: boolean
) => {
  const images = document.querySelectorAll("img");
  const prefix = !ftc
    ? `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/`
    : `https://ftc-resources.firstinspires.org/file/ftc/game/cm-html/`;
  // Iterate through each image and update the src attribute
  images.forEach((image) => {
    const currentSrc = image.getAttribute("src");
    if (currentSrc) {
      // Prefix the image URL with the specified prefix
      const newSrc = prefix +currentSrc;
      image.setAttribute("src", newSrc);
    }
  });
};

/**
 * Switches rule links from anchor links to frctools.com links
 * @param currYear Current year
 * @param document
 */
export const fixRuleLinks = (
  currYear: number,
  document: Document,
  ftc: boolean
) => {
  const links = document.querySelectorAll(`a[href^="#"]`);
  links.forEach((link) => {
    let slug = link.getAttribute("href")?.split("#")[1];
    if (slug?.match(ruleRegex)) {
      link.setAttribute(
        "href",
        `https://frctools.com/${currYear}${ftc ? "-ftc" : ""}/${slug}`
      );
    }
  });
};
/*
 * Fixes the broken rule numbers in A tag names (2024 rules R901 to R906 are in attribute names as 815-820)
 */
export const fixRuleNumbers = (
  currYear: number,
  document: Document,
  ftc: boolean
) => {
  if (currYear !== 2024) {
    return console.warn(`Remove fixRuleNumbers preprocessor`);
  }
  const elements = document.querySelectorAll('[class*="RuleNumber"]');
  elements.forEach((element) => {
    const aTags = element.querySelectorAll("a[name]");
    for (let aTag of aTags) {
      const name = aTag.getAttribute("name");
      if (name?.match(ruleRegex)) {
        const [_, letter, number] = name.match(ruleRegex)!;
        const numberInt = parseInt(number);
        if (numberInt >= 815 && numberInt <= 820 && letter == "R") {
          aTag.setAttribute("name", `${letter}${numberInt + 86}`);
        }
      }
    }
  });
};

export interface Rule {
  name: string;
  type: Type;
  text: string;
  summary: string;
  additionalContent: AdditionalContent[];
  evergreen: boolean;
  textContent: string;
}

export interface AdditionalContent {
  type: AdditionalContentType;
}
export interface AdditionalContentImage extends AdditionalContent {
  type: AdditionalContentType.Image;
  text?: string;
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export enum AdditionalContentType {
  Box = "box",
  Image = "image",
  Text = "text",
}

export enum Type {
  Rule = "rule",
  Section = "section",
}

export interface AdditionalContentText extends AdditionalContent {
  type: AdditionalContentType.Box | AdditionalContentType.Text;
  text: string;
}
export const getRulesCorpus = (document: Document) => {
  const sectionsAndRules = document.querySelectorAll(
    `div > h2, [class*="RuleNumber"]`
  );
  let output: Record<string, Rule> = {};
  for (let rule of sectionsAndRules) {
    if (rule.textContent?.trim() == "") {
      continue;
    }
    const section = rule.tagName.toLowerCase() == "h2";
    const additionalContent: AdditionalContent[] = [];
    const htmlContent: string[] = [];
    const ruleSelector =
      `:has(h2), h2, [class*="RuleNumber"], [class*=RulesNumber], [class*=TRules-Evergreen]` +
      (section ? `` : `:not([align="center"])`);
    if (!rule.nextElementSibling) return;
    traverseUntilSelector(ruleSelector, rule, (element: Element) => {
      htmlContent.push(element.outerHTML);
      additionalContent.push({
        text: element.textContent,
        type: element.querySelector('[class*="BlueBox"]')
          ? AdditionalContentType.Box
          : AdditionalContentType.Text,
      } as AdditionalContentText);
      let images = element.querySelectorAll("img");
      for (const image of images) {
        additionalContent.push({
          type: "image",
          src: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        } as AdditionalContentImage);
      }
    });
    const key =
      (section
        ? rule?.textContent?.match(/^\d+\.\d(\.\d)?/)?.[0]
        : [...rule.querySelectorAll("a")]
            .find((element) => {
              return element.getAttribute("name")?.match(ruleRegex);
            })
            ?.getAttribute("name")) ??
      rule?.querySelector("b:first-child")?.textContent?.trim() ?? rule.querySelector(`span.Headline-Evergreen:first-child`)?.textContent?.trim() ??
      `FIXME${Math.floor(Math.random() * 100)}`;

    output[key] = {
      name: key,
      type: section ? Type.Section : Type.Rule,
      text: htmlContent.join("\n"),
      summary: rule.textContent || "",
      additionalContent,
      evergreen: false,
      textContent: rule?.textContent || "",
    };
  }

  return output;
};

/**
 * Recursively traverses DOM elements until a matching selector is found.
 * @param {string} selector The CSS selector to match.
 * @param {Element} element The element to start traversing from.
 * @param {Function} callback The function to call for each matching element. **Is** called on passed in element.
 * @returns {void}
 * @private
 */
const traverseUntilSelector = (
  selector: string,
  element: Element,
  callback: Function
) => {
  callback(element);
  let currentElement = element.nextElementSibling;
  while (currentElement && !currentElement.matches(selector)) {
    callback(currentElement);
    if (!currentElement.nextElementSibling) break;
    currentElement = currentElement.nextElementSibling;
  }
};

export const scrapeRules = async () => {
  const currYear = 2025;
  const ftc = true;
  const document = await getDocument(currYear, ftc);
  const enabledPreprocessors = [fixImages, fixRuleLinks, fixRuleNumbers];
  for (const preprocessor of enabledPreprocessors) {
    preprocessor(currYear, document, ftc);
  }
  const rules = await getRulesCorpus(document);
  console.log("Scraping done. Writing to file...");

  const client = new MeiliSearch({
    host: "http://meilisearch.frctools.com",
    apiKey: process.env.MEILI_WRITE_KEY,
  });

  if (!rules) {
    return;
  }
  const index = `rules-${currYear}${ftc ? "-ftc" : ""}`;
  const idx = client.index(index);
  if (process.env.CLEAR === "true") {
    await client.deleteIndexIfExists(index);
  }

  try {
    await idx.fetchInfo();
  } catch (error: any) {
    if (
      error instanceof MeiliSearchApiError &&
      error.cause?.code == "index_not_found"
    ) {
      client.createIndex(index);
      console.log(`Created index ${index}`);
    } else {
      throw error;
    }
  }
  const attributes = await idx.getFilterableAttributes();
  const wantedAttributes = ["text", "name", "evergreen", "type", "textContent"];
  for (const attribute of wantedAttributes) {
    if (!attributes.includes(attribute)) {
      await idx.updateFilterableAttributes(wantedAttributes);
      break;
    }
  }

  const currEmbedderSettings = await client.index(index).getEmbedders();
  const wantedEmbedderSettings: Embedders = {
    default: {
      source: "openAi",
      apiKey: process.env.OPENAI_KEY,
      model: "text-embedding-3-large",
      dimensions: 3072,
      documentTemplateMaxBytes: 800,
      documentTemplate:
        "An rule for a robotics competition with the content '{{doc.text}}'",
    },
  };
  if (
    !currEmbedderSettings ||
    !Object.keys(currEmbedderSettings).length ||
    !currEmbedderSettings["default"]
  ) {
    await client.index(index).updateEmbedders(wantedEmbedderSettings);
  }
  console.log(rules)
  client
    .index(index)
    .addDocuments(
      Object.values(rules).map((rule) => {
        return {
          ...rule,
          id: btoa(rule.name).replaceAll("=", ""),
        };
      }),
      { primaryKey: "id" }
    )
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
};
await scrapeRules();
