import { JSDOM } from "jsdom";
import fs from "fs/promises";
export const ruleRegex = /^([a-zA-Z])(\d{3})$/;
export const getDocument = async (currYear) => {
    const res = await fetch(`https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/${currYear}GameManual.htm`);
    const dec = new TextDecoder("windows-1252"); // word exports are in windows-1252 text format * just because*
    const arrBuffer = await res.arrayBuffer();
    const ui8array = new Uint8Array(arrBuffer);
    const html = dec.decode(ui8array);
    // Use jsdom to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    return document;
};
export const fixImages = (currYear, document) => {
    const images = document.querySelectorAll("img");
    // Iterate through each image and update the src attribute
    images.forEach((image) => {
        const currentSrc = image.getAttribute("src");
        if (currentSrc) {
            // Prefix the image URL with the specified prefix
            const newSrc = `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/` +
                currentSrc;
            image.setAttribute("src", newSrc);
        }
    });
};
export const fixRuleLinks = (currYear, document) => {
    const links = document.querySelectorAll(`a[href^="#"]`);
    links.forEach((link) => {
        var _a;
        let slug = (_a = link.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.split("#")[1];
        if (slug === null || slug === void 0 ? void 0 : slug.match(ruleRegex)) {
            link.setAttribute("href", `https://frctools.com/${currYear}/rule/${slug}`);
        }
    });
};
/*
 * Fixes the broken rule numbers in A tag names (2024 rules R901 to R906 are in attribute names as 815-820)
 */
export const fixRuleNumbers = (currYear, document) => {
    if (currYear !== 2024) {
        return console.warn(`Remove fixRuleNumbers preprocessor`);
    }
    const elements = document.querySelectorAll('[class*="RuleNumber"]');
    elements.forEach((element) => {
        const aTags = element.querySelectorAll("a[name]");
        for (let aTag of aTags) {
            const name = aTag.getAttribute("name");
            if (name === null || name === void 0 ? void 0 : name.match(ruleRegex)) {
                const [_, letter, number] = name.match(ruleRegex);
                const numberInt = parseInt(number);
                if (numberInt >= 815 && numberInt <= 820 && letter == "R") {
                    aTag.setAttribute("name", `${letter}${numberInt + 86}`);
                }
            }
        }
    });
};
export var AdditionalContentType;
(function (AdditionalContentType) {
    AdditionalContentType["Box"] = "box";
    AdditionalContentType["Image"] = "image";
    AdditionalContentType["Text"] = "text";
})(AdditionalContentType || (AdditionalContentType = {}));
export var Type;
(function (Type) {
    Type["Rule"] = "rule";
    Type["Section"] = "section";
})(Type || (Type = {}));
export const getRulesCorpus = (document) => {
    var _a, _b, _c, _d;
    const sectionsAndRules = document.querySelectorAll(`div > h2, [class*="RuleNumber"]`);
    let output = {};
    for (let rule of sectionsAndRules) {
        const section = rule.tagName.toLowerCase() == "h2";
        const additionalContent = [];
        const htmlContent = [];
        const ruleSelector = `:has(h2), [class*="RuleNumber]` + section
            ? ``
            : `:not([align="center"])`;
        traverseUntilSelector(ruleSelector, rule, (element) => {
            htmlContent.push(element.outerHTML);
            additionalContent.push({
                text: element.textContent,
                type: element.querySelector('[class*="BlueBox"]')
                    ? AdditionalContentType.Box
                    : AdditionalContentType.Text,
            });
            let images = element.querySelectorAll("img");
            for (const image of images) {
                additionalContent.push({
                    type: "image",
                    src: image.src,
                    width: image.width,
                    height: image.height,
                    alt: image.alt,
                });
            }
        });
        const key = (_d = (section ? (_b = (_a = rule === null || rule === void 0 ? void 0 : rule.textContent) === null || _a === void 0 ? void 0 : _a.match(/^\d+\.\d(\.\d)?/)) === null || _b === void 0 ? void 0 : _b[0] : (_c = [...rule.querySelectorAll("a")].find((element) => {
            var _a;
            return (_a = element.getAttribute("name")) === null || _a === void 0 ? void 0 : _a.match(ruleRegex);
        })) === null || _c === void 0 ? void 0 : _c.getAttribute("name"))) !== null && _d !== void 0 ? _d : `FIXME${Math.floor(Math.random() * 100)}`;
        output[key] = {
            name: key,
            type: section ? Type.Section : Type.Rule,
            text: htmlContent.join("\n"),
            summary: rule.textContent || '',
            additionalContent,
            evergreen: false,
            textContent: (rule === null || rule === void 0 ? void 0 : rule.textContent) || '',
        };
    }
};
const traverseUntilSelector = (selector, element, callback) => {
    let currentElement = element;
    while (currentElement && !currentElement.matches(selector)) {
        callback(currentElement);
        if (!currentElement.nextElementSibling)
            break;
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
};
