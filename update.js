import { JSDOM } from "jsdom";
import fs from "fs/promises";
const currYear = 2022; //new Date().getFullYear();

const fetchAndParse = async (url) => {
  try {
    // Fetch HTML content from the URL
    const response = await fetch(url);
    const dec = new TextDecoder("windows-1252"); //Here I can inform the desired charset
    const arrBuffer = await response.arrayBuffer();
    const ui8array = new Uint8Array(arrBuffer);
    const html = dec.decode(ui8array);

    // Use jsdom to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    //console.log(document)
    const imageUrlPrefix = `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/`;
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
        image.remove();
      }
    });

    const x = extractRuleNumberText(document);
    // Access and manipulate the DOM as needed
    await fs.writeFile(`./src/lib/${currYear}.json`, JSON.stringify(x));
    await fs.writeFile(
      `./src/lib/${currYear}.js`,
      "export default " + JSON.stringify(x),
    );
  } catch (error) {
    console.error("Error fetching or parsing the HTML:", error.message);
  }
};

const url = `https://firstfrc.blob.core.windows.net/frc${currYear}/Manual/HTML/${currYear}FRCGameManual.htm`;
fetchAndParse(url);

function extractRuleNumberText(document) {
  // Select the first element with a class containing 'RuleNumber'
  const elements = document.querySelectorAll('[class*="RuleNumber"]');

  // Object to store the results
  const result = {};
  const otherElements = document.querySelectorAll("div > h2");
  otherElements.forEach((element, index) => {
    const nextRuleNumberIndex = Array.from(elements).findIndex(
      (el, i) => i > index,
    );

    const htmlArr = [];
    const textArray = [];
    let currentElement = element.parentElement.nextElementSibling;
    textArray.push({ type: "text", text: element.textContent });
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
    let key = element.textContent.match(/^\d+\.\d+/)[0];
    result[key] = {
      name: key,
      textContent:
        element.textContent +
        textArray.reduce((prev, next) => {
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

    // Move the index to the next 'RuleNumber' element
    if (nextRuleNumberIndex !== -1) {
      index = nextRuleNumberIndex - 1;
    }
  });

  // Iterate through the selected elements
  elements.forEach((element, index) => {
    // Find the next element with a different 'RuleNumber' class
    const nextRuleNumberIndex = Array.from(elements).findIndex(
      (el, i) => i > index && el.className.includes("RuleNumber"),
    );

    // Extract the text from siblings until the next 'RuleNumber' element
    const htmlArr = [];
    const textArray = [];
    let currentElement = element.nextElementSibling;
    textArray.push({ type: "text", text: element.textContent });
    while (
      currentElement &&
      !currentElement.className.includes("Rule") &&
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
      text: element.outerHTML + htmlArr.join(""),
      summary: element.textContent,
      additionalContent: textArray,
      evergreen: element.className.includes("Evergreen"),
      textContent:
        element.textContent +
        textArray.reduce((prev, next) => {
          if (next.type == "text") {
            return prev + " " + next.text;
          } else {
            return prev;
          }
        }, ""),
    };

    // Move the index to the next 'RuleNumber' element
    if (nextRuleNumberIndex !== -1) {
      index = nextRuleNumberIndex - 1;
    }
  });

  // Output the final object
  return result;
}
