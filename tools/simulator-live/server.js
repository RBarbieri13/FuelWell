const http = require("http");
const { execFile } = require("child_process");

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const intervalMs = Number(process.env.FUELWELL_SHOT_INTERVAL_MS || 750);

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FuelWell Simulator</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      background: #111;
      color: #eee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: grid;
      min-height: 100vh;
      place-items: center;
    }
    img {
      display: block;
      max-height: 96vh;
      max-width: 100vw;
      object-fit: contain;
    }
    .status {
      bottom: 12px;
      color: #aaa;
      font-size: 12px;
      left: 12px;
      position: fixed;
    }
  </style>
</head>
<body>
  <img id="shot" alt="FuelWell iOS simulator">
  <div class="status" id="status">FuelWell live simulator</div>
  <script>
    const img = document.getElementById("shot");
    const status = document.getElementById("status");

    async function refresh() {
      const next = new Image();
      next.onload = () => {
        img.src = next.src;
        status.textContent = "FuelWell live simulator";
      };
      next.onerror = () => {
        status.textContent = "Waiting for simulator screenshot...";
      };
      next.src = "/shot?t=" + Date.now();
    }

    refresh();
    setInterval(refresh, ${intervalMs});
  </script>
</body>
</html>`;

function screenshot(response) {
  execFile(
    "/usr/bin/xcrun",
    ["simctl", "io", "booted", "screenshot", "--type=png", "-"],
    { encoding: "buffer", maxBuffer: 8 * 1024 * 1024 },
    (error, stdout) => {
      if (error) {
        response.writeHead(500, { "content-type": "text/plain" });
        response.end(String(error));
        return;
      }

      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "image/png"
      });
      response.end(stdout);
    }
  );
}

http.createServer((request, response) => {
  if (request.url.startsWith("/shot")) {
    screenshot(response);
    return;
  }

  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok\n");
    return;
  }

  response.writeHead(200, { "content-type": "text/html" });
  response.end(page);
}).listen(port, host, () => {
  console.log(`FuelWell simulator view: http://${host}:${port}`);
});
