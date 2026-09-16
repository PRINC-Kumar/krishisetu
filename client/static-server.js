import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist");
const port = process.env.PORT || 5174;
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    const requested = req.url === "/" ? "index.html" : req.url.slice(1);
    const filePath = path.join(dist, requested);
    const safePath =
      filePath.startsWith(dist) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
        ? filePath
        : path.join(dist, "index.html");
    res.writeHead(200, {
      "Content-Type":
        types[path.extname(safePath)] || "application/octet-stream",
    });
    fs.createReadStream(safePath).pipe(res);
  })
  .listen(port, () =>
    console.log(`KrishiSetu client running at http://localhost:${port}`),
  );
