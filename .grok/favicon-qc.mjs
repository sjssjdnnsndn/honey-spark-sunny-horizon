import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const svg = readFileSync("/workspace/public/favicon.svg", "utf8");
const html = `<!doctype html>
<html><body style="margin:0;background:#6b7280">
<div style="display:flex;gap:24px;padding:24px;align-items:flex-end">
  <div>
    <div style="width:16px;height:16px;line-height:0">${svg}</div>
    <div style="font:11px sans-serif;color:#fff;margin-top:6px">16</div>
  </div>
  <div>
    <div style="width:32px;height:32px;line-height:0">${svg}</div>
    <div style="font:11px sans-serif;color:#fff;margin-top:6px">32</div>
  </div>
  <div>
    <div style="width:64px;height:64px;line-height:0">${svg}</div>
    <div style="font:11px sans-serif;color:#fff;margin-top:6px">64</div>
  </div>
</div>
</body></html>`;
writeFileSync("/workspace/.grok/favicon-qc.html", html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 160 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL("/workspace/.grok/favicon-qc.html").href);
await page.screenshot({ path: "/workspace/.grok/favicon-qc.png" });
await browser.close();
console.log("ok");
