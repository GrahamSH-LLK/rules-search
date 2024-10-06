import { JSDOM } from "jsdom";
import fs from "fs/promises";
const currYear = new Date().getFullYear();

const imageUrlPrefix = `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/`;

const fetchAndParse = async (url) => {
  try {
    // Fetch HTML content from the URL
    const response = await fetch(url);
    const dec = new TextDecoder("windows-1252");
    const arrBuffer = await response.arrayBuffer();
    const ui8array = new Uint8Array(arrBuffer);
    const html = dec.decode(ui8array);

    // Use jsdom to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const images = document.querySelectorAll("img");

    // Iterate through each image and update the src attribute
    images.forEach((image) => {
      const currentSrc = image.getAttribute("src");
      if (currentSrc) {
        // Prefix the image URL with the specified prefix
        const newSrc = imageUrlPrefix + currentSrc;
        image.setAttribute("src", newSrc);
      }
      if (image.src.includes("image081.png")) {
        image.remove(); // remove the extra image after sections
      }
    });
    const links = document.querySelectorAll(`a[href^="#"]`);
    links.forEach((link) => {
      let slug = link.getAttribute("href").split("#")[1];
      if (slug.match(/^([a-zA-Z])(\d{3})$/)) {
        link.setAttribute(
          "href",
          `https://frctools.com/${currYear}/rule/${slug}`
        );
      }
    });

    const rules = extractRuleNumberText(document);
    // Access and manipulate the DOM as needed
    await fs.writeFile(`./src/lib/${currYear}.json`, JSON.stringify(rules));
    await fs.writeFile(
      `./src/lib/${currYear}.js`,
      `export default ${JSON.stringify(rules)}

      export const LAST_UPDATED="${new Date().toString()}"
      `
    );
  } catch (error) {
    console.error("Error fetching or parsing the HTML:", error.message);
  }
};

const url = `https://ftc-resources.firstinspires.org/file/ftc/game/cm-html`;
fetchAndParse(url);

function extractRuleNumberText(document: Document): string {
  // Select the first element with a class containing 'RuleNumber'
  const elements = document.querySelectorAll('[class*="RuleNumber"]');

  // Object to store the results
  const result = {};
  const otherElements = document.querySelectorAll("div > h2");
  otherElements.forEach((element, index) => {
    const htmlArr: string[] = [];
    const textArray: RuleToken[] = [];
    let currentElement = element.nextElementSibling;
    textArray.push({ type: "text", text: element.textContent } as TextToken);
    while (
      currentElement &&
      !currentElement.className.includes("RuleNumber") &&
      !currentElement.querySelector("h2")
    ) {
      htmlArr.push(currentElement.outerHTML);
      textArray.push({
        text: currentElement.textContent,
        type: currentElement.querySelector('[class*="BlueBox"]')
          ? "box"
          : "text",
      } as TextToken);
      let images = currentElement.querySelectorAll("img");
      for (const image of images) {
        textArray.push({
          type: "image",
          src: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        } as ImageToken);
      }
      currentElement = currentElement.nextElementSibling;
    }
    let key = element?.textContent?.match(/^\d+\.\d(\.\d)?/)?.[0];
    if (!key) return;
    if (
      element.textContent?.includes("1.") &&
      !element.textContent.includes("1.4")
    )
      return;
    result[key] = {
      name: key,
      type: "section",
      textContent: textArray.reduce((prev, next) => {
        if (next.type == "text") {
          return prev + " " + next.text;
        } else {
          return prev;
        }
      }, ""),
      text: element.outerHTML + htmlArr.join(""),
      summary: element.textContent,
      additionalContent: textArray,
      evergreen: element.className.includes("Evergreen"),
    };
  });

  // Iterate through the selected elements
  elements.forEach((element, index) => {
    // Find the next element with a different 'RuleNumber' class

    // Extract the text from siblings until the next 'RuleNumber' element
    const htmlArr = [];
    const textArray: RuleToken[] = [];
    let currentElement = element.nextElementSibling;
    textArray.push({ type: "text", text: element.textContent } as TextToken);
    while (
      currentElement &&
      (!currentElement.className.includes("RuleNumber") ||
        currentElement.getAttribute("align") == "center") &&
      !currentElement.querySelector("h2")
    ) {
      htmlArr.push(currentElement.outerHTML);
      textArray.push({
        text: currentElement.textContent,
        type: currentElement.querySelector('[class*="BlueBox"]')
          ? "box"
          : "text",
      });
      let images = currentElement.querySelectorAll("img");
      for (const image of images) {
        textArray.push({
          type: "image",
          src: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        });
      }
      currentElement = currentElement.nextElementSibling;
    }

    // Create an object key based on the 'RuleNumber' class
    let key = "";
    const els = [...element.querySelectorAll("a")];
    //console.log(els);
    for (const el of els) {
      if (el?.name?.match(/^([a-zA-Z])(\d{3})$/)?.length > 0) {
        key = el.name;
      }
    }

    // Add the result to the object
    result[key] = {
      name: key,
      type: "rule",
      text: element.outerHTML + htmlArr.join(""),
      summary: element.textContent,
      additionalContent: textArray,
      evergreen: element.className.includes("Evergreen"),
      textContent: textArray.reduce((prev, next) => {
        if (next.type == "text" || next.type == "box") {
          return prev + " " + next.text;
        } else {
          return prev;
        }
      }, ""),
    };

  });

  // Output the final object
  return result;
}

interface Rule {
  name: string;
  type: "rule" | "";
  text: string;
  summary: string;
}
interface RuleToken {
  type: "text" | "box" | "image";
}
interface TextToken extends RuleToken {
  type: "text";
  text: string;
}
interface BoxToken extends RuleToken {
  type: "box";
  text: string;
}
interface ImageToken extends RuleToken {
  type: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
}
