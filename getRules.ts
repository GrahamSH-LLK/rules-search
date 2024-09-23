import { JSDOM } from "jsdom";
import fs from "fs/promises";
export const ruleRegex = /^([a-zA-Z])(\d{3})$/;
export const getDocument = async (currYear: number) => {
  const res = await fetch(
    `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/${currYear}GameManual.htm`
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
export const fixImages = (currYear: number, document: Document) => {
  const images = document.querySelectorAll("img");

  // Iterate through each image and update the src attribute
  images.forEach((image) => {
    const currentSrc = image.getAttribute("src");
    if (currentSrc) {
      // Prefix the image URL with the specified prefix
      const newSrc =
        `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/` +
        currentSrc;
      image.setAttribute("src", newSrc);
    }
  });
};
export const fixRuleLinks = (currYear: number, document: Document) => {
  const links = document.querySelectorAll(`a[href^="#"]`);
  links.forEach((link) => {
    let slug = link.getAttribute("href")?.split("#")[1];
    if (slug?.match(ruleRegex)) {
      link.setAttribute(
        "href",
        `https://frctools.com/${currYear}/rule/${slug}`
      );
    }
  });
};
/*
 * Fixes the broken rule numbers in A tag names (2024 rules R901 to R906 are in attribute names as 815-820)
 */
export const fixRuleNumbers = (currYear: number, document: Document) => {
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
    const section = rule.tagName.toLowerCase() == "h2";
    const additionalContent: AdditionalContent[] = [];
    const htmlContent: string[] = [];
    const ruleSelector =
      `:has(h2), h2, [class*="RuleNumber"]` + (section
        ? ``
        : `:not([align="center"])`);
    if (!rule.nextElementSibling) return
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
    const key = (section ? rule?.textContent?.match(/^\d+\.\d(\.\d)?/)?.[0] :[...rule.querySelectorAll("a")].find((element) => {
        return element.getAttribute("name")?.match(ruleRegex);
  
    })?.getAttribute("name")) ?? `FIXME${Math.floor(Math.random() * 100)}`;

    output[key] = {
        name: key,
        type: section? Type.Section : Type.Rule,
        text: htmlContent.join("\n"),
        summary: rule.textContent || '',
        additionalContent,
        evergreen: false,
        textContent: rule?.textContent || '',
      };
    }


  return output;
};

/*
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
  const currYear = new Date().getFullYear();
  const document = await getDocument(currYear);
  const enabledPreprocessors = [fixImages, fixRuleLinks, fixRuleNumbers];
  for (const preprocessor of enabledPreprocessors) {
    preprocessor(currYear, document);
  }
  const rules = await getRulesCorpus(document);
  console.log("Scraping done. Writing to file...");
  await fs.writeFile(`./src/lib/${currYear}.json`, JSON.stringify(rules));
  await fs.writeFile(
    `./src/lib/${currYear}.js`,
    `export default ${JSON.stringify(rules)}


    export const LAST_UPDATED="${new Date().toString()}" // this is a bodge and a half
    `
  );


};
await scrapeRules();