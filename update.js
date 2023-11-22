import { JSDOM } from 'jsdom';
import fs from 'fs/promises'
const fetchAndParse = async (url) => {
  try {
    // Fetch HTML content from the URL
    const response = await fetch(url);
    const html = await response.text();

    // Use jsdom to parse the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    //console.log(document)
    const x = extractRuleNumberText(document);
    // Access and manipulate the DOM as needed
    await fs.writeFile('./src/lib/rules.json',JSON.stringify(x))
  } catch (error) {
    console.error('Error fetching or parsing the HTML:', error.message);
  }
};

const url = 'https://firstfrc.blob.core.windows.net/frc2023/Manual/HTML/2023FRCGameManual.htm';
fetchAndParse(url);

function extractRuleNumberText(document) {
    // Select the first element with a class containing 'RuleNumber'
    const elements = document.querySelectorAll('[class*="RuleNumber"]');
    
    // Object to store the results
    const result = {};
  
    // Iterate through the selected elements
    elements.forEach((element, index) => {
      // Extract the class names of the current element
      const classNames = element.className.split(' ');
  
      // Find the class that includes 'RuleNumber'
      const ruleNumberClass = classNames.find(className => className.includes('RuleNumber'));
  
      // Find the next element with a different 'RuleNumber' class
      const nextRuleNumberIndex = Array.from(elements).findIndex((el, i) => i > index && el.className.includes('RuleNumber'));
  
      // Extract the text from siblings until the next 'RuleNumber' element
      const textArray = [];
      let currentElement = element.nextElementSibling;
  
      while (currentElement && !currentElement.className.includes('RuleNumber')) {
        textArray.push(currentElement.outerHTML);
        currentElement = currentElement.nextElementSibling;
      }
  
      // Create an object key based on the 'RuleNumber' class
        let key = '';
      const els = [...element.querySelectorAll('a')]
        //console.log(els);
      for (const el of els) {
          if (el?.name?.match(/^([a-zA-Z])(\d{3})$/)?.length > 0) {
              key = el.name;
          }
      }
      //const key = ruleNumberClass + (index + 1);
  
      // Add the result to the object
      result[key] = {
        name: key, // Assuming the name is in the element itself
        text: element.outerHTML + textArray.join('')
      };
  
      // Move the index to the next 'RuleNumber' element
      if (nextRuleNumberIndex !== -1) {
        index = nextRuleNumberIndex - 1;
      }
    });
  
    // Output the final object
    return result;
  }
  
  // Call the function
  //extractRuleNumberText();
  