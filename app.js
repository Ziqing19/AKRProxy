const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: false, limit: "20mb" }));

app.post("/proxy", async (req, res) => {
  const data = req.body;
  console.log("request data",data)
  if (!data.url) return res.sendStatus(400);
  const url = data.url;
  delete data.url;
  let resRaw;
  console.log(Object.keys(data).length);
  if (Object.keys(data).length) {
    resRaw = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    resRaw = await fetch(url);
  }
  console.log(resRaw.status);
  console.log(resRaw.statusText);
  resRaw.body.pipe(res);
});

app.get("/ping", (req, res) => {
  console.log("PING at", new Date());
  res.sendStatus(200);
});

app.get("/parse-youtube-url",async (req, res) => {
  const { url } = req.body;
  if (!url.includes("youtube.com/watch")) {
    return res.sendStatus(400);
  }
  try {
    const id = url.match(/\?v=([^&?]+)/)[1];
    const listUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YoutubeToken}`;
    const listRaw = await fetch(listUrl);
    const listData = await listRaw.json();
    const channelId = listData.items[0]["snippet"]["channelId"];
    const channelUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${process.env.YoutubeToken}`;
    const channelRaw = await fetch(channelUrl);
    const channelData = await channelRaw.json();
    res.send({listData, channelData});
  } catch (err) {
    res.sendStatus(400);
  }
});

app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`
