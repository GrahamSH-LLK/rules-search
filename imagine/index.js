import { createApp, eventHandler, toNodeListener, createRouter } from "h3";
import { listen } from "listhen";
import nodeHtmlToImage from "node-html-to-image";
const app = createApp();
const router = createRouter()

router.get(
  "/rule/:rule",
  eventHandler(async (event) => {

    const res = await fetch(`https://frctools.com/api/rule?query=${event.context.params.rule}&year=2024`);
    const html = (await res.json()).text
    const img = await nodeHtmlToImage({
      output: "./image.png",
      html: `<html>
          <head>
            <style>
              /*body {
                width: 2480px;
                height: 3508px;
              }*/
            </style>
          </head>
          <body>${html}</body>
        </html>
        `,
    });
    return img;
  })
);
app.use(router)
listen(toNodeListener(app));
