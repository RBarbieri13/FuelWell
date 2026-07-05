#!/usr/bin/env node
/**
 * Convert a markdown file to a branded A4 PDF using Playwright Chromium.
 * Handles mermaid code blocks inline via the locally-bundled mermaid package.
 *
 * Usage:
 *   node tools/pdf/build-doc-pdf.js <input.md> <output.pdf> "<kicker>" "<title>" "<subtitle>"
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { marked } = require('marked');

const MERMAID_BUNDLE = path.resolve(__dirname, 'node_modules/mermaid/dist/mermaid.min.js');

function buildHtml({ md, kicker, title, subtitle }) {
  // Pull mermaid blocks out so we can render them after marked processes the rest.
  let blockIdx = 0;
  const mermaidBlocks = [];
  const stripped = md.replace(/```mermaid\s*([\s\S]*?)```/g, (_, code) => {
    const id = `mermaid-${blockIdx++}`;
    mermaidBlocks.push({ id, code: code.trim() });
    return `<div class="mermaid-host" data-mermaid-id="${id}"></div>`;
  });

  const bodyHtml = marked.parse(stripped, { gfm: true, breaks: false });
  const mermaidJs = fs.readFileSync(MERMAID_BUNDLE, 'utf8');

  const mermaidInit = mermaidBlocks.length
    ? `
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'Inter, sans-serif', themeVariables: { primaryColor: '#00D278', primaryTextColor: '#0A0A0F', lineColor: '#6B7280', edgeLabelBackground: '#FFFFFF' } });
      const blocks = ${JSON.stringify(mermaidBlocks)};
      (async () => {
        for (const b of blocks) {
          const host = document.querySelector('[data-mermaid-id="' + b.id + '"]');
          try {
            const { svg } = await mermaid.render(b.id + '-svg', b.code);
            host.innerHTML = svg;
          } catch (e) {
            host.innerHTML = '<pre style="color:#EF4444">mermaid render failed: ' + e.message + '</pre>';
          }
        }
        window.__mermaid_done__ = true;
      })();
    `
    : `window.__mermaid_done__ = true;`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #F4F5F7;
    --surface: #FFFFFF;
    --ink: #0A0A0F;
    --body: #1F2937;
    --muted: #6B7280;
    --border: #E5E7EB;
    --soft: #EEF0F3;
    --brand: #47E7B0;
    --action: #00D278;
    --orange: #E87A1D;
    --inverted: #0F1117;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--surface); color: var(--body); font-family: 'Inter', -apple-system, sans-serif; font-size: 11pt; line-height: 1.55; }
  .page { padding: 48px 56px; }
  .cover { padding: 96px 56px 64px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .kicker { font-family: 'DM Sans', sans-serif; font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--action); font-weight: 700; }
  h1.title { font-family: 'Outfit', sans-serif; font-size: 36pt; font-weight: 800; color: var(--ink); margin: 8px 0 12px; letter-spacing: -0.01em; }
  .subtitle { color: var(--muted); font-size: 12pt; max-width: 70ch; }
  h1 { font-family: 'Outfit', sans-serif; font-size: 22pt; color: var(--ink); margin: 32px 0 12px; border-bottom: 2px solid var(--action); padding-bottom: 6px; font-weight: 800; }
  h2 { font-family: 'Outfit', sans-serif; font-size: 16pt; color: var(--ink); margin: 24px 0 8px; font-weight: 700; }
  h3 { font-family: 'Outfit', sans-serif; font-size: 12pt; color: var(--ink); margin: 18px 0 6px; font-weight: 700; }
  h4 { font-family: 'Outfit', sans-serif; font-size: 10.5pt; color: var(--ink); margin: 14px 0 4px; font-weight: 700; }
  p { margin: 8px 0; }
  strong { color: var(--ink); font-weight: 600; }
  em { color: var(--body); }
  a { color: var(--action); text-decoration: none; }
  ul, ol { padding-left: 22px; margin: 8px 0; }
  li { margin: 3px 0; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
  blockquote { margin: 12px 0; padding: 10px 14px; background: var(--soft); border-left: 4px solid var(--action); color: var(--body); border-radius: 4px; font-size: 10pt; }
  blockquote p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; page-break-inside: auto; }
  thead { background: var(--inverted); color: #fff; }
  th, td { text-align: left; padding: 6px 9px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: 0.02em; }
  tr { page-break-inside: avoid; }
  code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 9pt; background: var(--soft); padding: 1px 5px; border-radius: 3px; color: var(--ink); }
  pre { background: var(--inverted); color: #E5E7EB; border-radius: 8px; padding: 14px 16px; overflow: hidden; font-size: 9pt; }
  pre code { background: transparent; color: inherit; padding: 0; }
  .mermaid-host { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 18px; margin: 16px 0; page-break-inside: avoid; }
  .mermaid-host svg { max-width: 100%; height: auto; }
  @page { size: A4 portrait; margin: 14mm 12mm 16mm 12mm; }
  /* Footer is rendered by Playwright */
</style>
</head>
<body>
  <div class="cover">
    <div class="kicker">${kicker}</div>
    <h1 class="title">${title}</h1>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="page">
    ${bodyHtml}
  </div>
  <script>${mermaidJs}</script>
  <script>${mermaidInit}</script>
</body></html>`;
}

async function main() {
  const [, , input, output, kicker, title, subtitle] = process.argv;
  if (!input || !output) {
    console.error('usage: build-doc-pdf.js <input.md> <output.pdf> <kicker> <title> <subtitle>');
    process.exit(1);
  }
  const md = fs.readFileSync(input, 'utf8');
  const html = buildHtml({ md, kicker: kicker || '', title: title || path.basename(input), subtitle: subtitle || '' });
  // For debugging: write to a temp file
  const tmpHtml = output.replace(/\.pdf$/, '.tmp.html');
  fs.writeFileSync(tmpHtml, html);

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__mermaid_done__, { timeout: 20000 });
  await page.waitForTimeout(400);

  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `<div style="font-family: Inter, sans-serif; font-size:8pt; color:#6B7280; width:100%; padding:0 12mm; display:flex; justify-content:space-between;"><span>FuelWell · ${title}</span><span class="pageNumber"></span></div>`,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
  });

  await browser.close();
  fs.unlinkSync(tmpHtml);
  const sz = (fs.statSync(output).size / 1024).toFixed(0);
  console.log(`[build-doc-pdf] wrote ${output} (${sz} KB)`);
}

main().catch(e => { console.error(e); process.exit(2); });
