import { createApp, eventHandler, toNodeListener, createRouter } from "h3";
import { listen } from "listhen";
import puppeteer from "puppeteer";
const browser = await puppeteer.launch({
  defaultViewport: {
    width: 2400,
    height: 1080,
  },
});

// Create a new page
// this is sus, i feel like there's absolutely a race here?
// it's never happened tho
const page = await browser.newPage();

const takeScreenshot = async (rule) => {
  await page.goto(`https://frctools.com/2025/rule/${rule}`);
  const element = await page.waitForSelector(".prose");
  if (!element) {
    throw new Error("Could not find rule");
  }
  const buffer = await element.screenshot({
    optimizeForSpeed: true,
  });

  return buffer;
};
const app = createApp();
const router = createRouter();
router.get(
  "/rule/:rule/image.png",
  eventHandler(async (event) => {
    const img = await takeScreenshot(event.context.params.rule.toUpperCase());
    return img;
  }),
);
app.use(router);
listen(toNodeListener(app));
