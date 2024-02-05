import { createApp, eventHandler, toNodeListener, createRouter } from "h3";
import { listen } from "listhen";
//import nodeHtmlToImage from "node-html-to-image";
import puppeteer from "puppeteer";
import rules from "../src/lib/2024.js";
const browser = await puppeteer.launch();

// Create a new page
const page = await browser.newPage();

const takeScreenshot = async (html) => {
  await page.setContent(html, { waitUntil:'domcontentloaded' });
  const element = await page.$("body");
  const buffer = await element.screenshot({
   /* type: screenshot.type,
    omitBackground: screenshot.transparent,
    encoding: screenshot.encoding,
  quality: screenshot.quality,*/
  optimizeForSpeed: true  });

  return buffer;
};
const app = createApp();
const router = createRouter();
router.get(
  "/rule/:rule/image.png",
  eventHandler(async (event) => {
    let html;
    try {html = rules[event.context.params.rule.toUpperCase()].text;
    } catch {
        return "error 404"
    }
    //  const res = await fetch(`https://frctools.com/api/rule?query=${event.context.params.rule}&year=2024`);
    //const html = (await res.json()).text
    const img = await takeScreenshot(html)
    return img;
  })
);
app.use(router);
listen(toNodeListener(app));
