#!/usr/bin/env node
// Tiny static file server for local development. The page itself needs no build step; any static
// host (GitHub Pages, `python3 -m http.server`, ...) works just as well.
//
//   node tools/serve.js [port]

import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080)
const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".glb": "model/gltf-binary",
    ".wav": "audio/wav",
    ".png": "image/png",
    ".svg": "image/svg+xml"
}

http.createServer((req, res) => {
    const url = new URL(req.url, "http://x")
    let file = path.join(root, decodeURIComponent(url.pathname))
    if (!file.startsWith(root)) return res.writeHead(403).end()
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html")
    if (!fs.existsSync(file)) return res.writeHead(404).end("not found")
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" })
    fs.createReadStream(file).pipe(res)
}).listen(port, () => console.log(`blastin: http://localhost:${port}/`))
