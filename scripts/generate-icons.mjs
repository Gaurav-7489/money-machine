// Renders public/icons/icon.svg to the PNG sizes the manifest and iOS need.
// Usage: npm run icons   (requires Playwright's Chromium)
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("../public/icons/icon.svg", import.meta.url), "utf8");
const targets = [
  { file: "icon-192.png", size: 192, pad: 0, bg: "transparent" },
  { file: "icon-512.png", size: 512, pad: 0, bg: "transparent" },
  { file: "apple-touch-icon.png", size: 180, pad: 0, bg: "#ffffff" },
  // maskable: keep the mark inside the 80% safe zone on a solid background
  { file: "maskable-512.png", size: 512, pad: 0.14, bg: "#ffffff" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  const inner = Math.round(t.size * (1 - t.pad * 2));
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<html><body style="margin:0;background:${t.bg};display:grid;place-items:center;width:${t.size}px;height:${t.size}px">
      <div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`,
  );
  await page.screenshot({ path: new URL(`../public/icons/${t.file}`, import.meta.url).pathname, omitBackground: t.bg === "transparent" });
  console.log("wrote", t.file);
}
await browser.close();
