#!/usr/bin/env node
// Development helper: opens the page in headless Chrome and saves a screenshot.
//
//   node tools/snap.js [--url http://localhost:8080/?rpm=900] [--out shot.png] [--wait 1500]
//                      [--width 1280] [--height 720] [--eval "js run in the page before the wait"]
//                      [--fire 600]   (hold the trigger this many ms, ending right before the shot)
//                      [--ads]        (hold aim-down-sights)

import { parseArgs } from "node:util"
import puppeteer from "puppeteer-core"

const { values: opts } = parseArgs({
    options: {
        url: { type: "string", default: "http://localhost:8080/" },
        out: { type: "string", default: "shot.png" },
        wait: { type: "string", default: "1500" },
        width: { type: "string", default: "1280" },
        height: { type: "string", default: "720" },
        eval: { type: "string" },
        fire: { type: "string" },
        ads: { type: "boolean", default: false },
        chrome: { type: "string", default: process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" }
    }
})

const browser = await puppeteer.launch({
    executablePath: opts.chrome,
    headless: "new",
    args: ["--use-angle=metal", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"]
})
try {
    const page = await browser.newPage()
    await page.setViewport({ width: Number(opts.width), height: Number(opts.height) })
    page.on("console", (m) => console.log(`[page:${m.type()}] ${m.text()}`))
    page.on("pageerror", (e) => console.log(`[page:error] ${e.message}`))
    await page.goto(opts.url)
    await page.waitForFunction(() => window.__blastin?.frames > 5 || window.__blastin?.error, { timeout: 60000 })
    if (opts.eval) await page.evaluate(opts.eval)
    if (opts.ads) await page.evaluate(() => window.__blastin.debugInput({ ads: true }))
    const fire = Number(opts.fire ?? 0)
    await new Promise((r) => setTimeout(r, Math.max(0, Number(opts.wait) - fire)))
    if (fire) {
        await page.evaluate(() => window.__blastin.debugInput({ fire: true }))
        await new Promise((r) => setTimeout(r, fire))
    }
    const error = await page.evaluate(() => window.__blastin?.error)
    if (error) console.log(`[page:error] ${error}`)
    await page.screenshot({ path: opts.out })
    console.log(`saved ${opts.out}`)
} finally {
    await browser.close()
}
