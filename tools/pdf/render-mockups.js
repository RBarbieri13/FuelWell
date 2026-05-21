#!/usr/bin/env node
/**
 * Render every HTML in docs/ios-guide/mockups/html/ to a same-named PNG in docs/ios-guide/mockups/.
 *
 * - Viewport 1440 x 900, deviceScaleFactor: 2 (matches existing 2880-wide PNGs)
 * - fullPage screenshot, type=png
 * - Applies M21 JS-escape patch (\\' -> \') on the fly when present, to make
 *   re-exports from Claude Design render without throwing.
 *
 * Usage:
 *   node tools/pdf/render-mockups.js            # render all
 *   node tools/pdf/render-mockups.js 20 28      # render only matching slugs (substring)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..', '..');
const HTML_DIR = path.join(REPO, 'docs/ios-guide/mockups/html');
const PNG_DIR = path.join(REPO, 'docs/ios-guide/mockups');

async function main() {
  const filter = process.argv.slice(2);
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html')).sort();
  const targets = filter.length
    ? files.filter(f => filter.some(p => f.includes(p)))
    : files;

  console.log(`[render-mockups] Rendering ${targets.length} of ${files.length} mockups`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const t0 = Date.now();
  let ok = 0, fail = 0;
  for (const f of targets) {
    const slug = f.replace(/\.html$/, '');
    const htmlPath = path.join(HTML_DIR, f);
    const pngPath = path.join(PNG_DIR, slug + '.png');

    // M21 JS-escape patch
    let src = fs.readFileSync(htmlPath, 'utf8');
    if (src.includes("\\\\'")) {
      console.log(`  [patch] ${slug}: replacing \\\\' with \\'`);
      src = src.replace(/\\\\'/g, "\\'");
      fs.writeFileSync(htmlPath, src);
    }

    try {
      const url = 'file://' + htmlPath;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(400); // settle fonts
      const buf = await page.screenshot({ fullPage: true, type: 'png' });
      fs.writeFileSync(pngPath, buf);
      const kb = (buf.length / 1024).toFixed(0);
      console.log(`  [ok]    ${slug}  (${kb} KB)`);
      ok++;
    } catch (e) {
      console.error(`  [FAIL]  ${slug}: ${e.message}`);
      fail++;
    }
  }

  await browser.close();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[render-mockups] done: ${ok} ok, ${fail} failed, ${elapsed}s`);
  if (fail > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(2); });
