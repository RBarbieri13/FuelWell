#!/usr/bin/env node
/**
 * Build the full Phase 0.5 Review PDF — cover + TOC + App Map body + Flow Chart body +
 * mockup deck (one per page, sectioned).
 *
 * Output: docs/ios-guide/pdfs/FuelWell-Phase-0.5-Review.pdf
 *
 * Edit the SCREENS catalog below when adding/removing mockup slugs.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { marked } = require('marked');

const REPO = path.resolve(__dirname, '..', '..');
const PNG_DIR = path.join(REPO, 'docs/ios-guide/mockups');
const OUT = path.join(REPO, 'docs/ios-guide/pdfs/FuelWell-Phase-0.5-Review.pdf');
const APP_MAP_MD = path.join(REPO, 'docs/ios-guide/APP-MAP.md');
const FLOW_MD = path.join(REPO, 'docs/ios-guide/FLOW-CHART.md');
const MERMAID_BUNDLE = path.resolve(__dirname, 'node_modules/mermaid/dist/mermaid.min.js');

// Mockup catalog lives in screens-catalog.js (shared with build-compressed.js).
const { SCREENS } = require('./screens-catalog.js');

function tagBadge(tag) {
  if (!tag) return '';
  const colors = {
    NEW: '#00D278',
    REDESIGN: '#A855F7',
    UPDATED: '#00B4D8',
    REFERENCE: '#9CA3AF',
    LEGACY: '#EF4444',
  };
  const bg = colors[tag] || '#6B7280';
  return `<span class="tag" style="background:${bg}">${tag}</span>`;
}

function processMd(md) {
  // Strip mermaid blocks, mark placeholders
  let idx = 0;
  const blocks = [];
  const stripped = md.replace(/```mermaid\s*([\s\S]*?)```/g, (_, code) => {
    const id = `mm-${idx++}`;
    blocks.push({ id, code: code.trim() });
    return `<div class="mermaid-host" data-mermaid-id="${id}"></div>`;
  });
  return { html: marked.parse(stripped, { gfm: true }), mermaidBlocks: blocks };
}

function buildHtml() {
  const appMap = processMd(fs.readFileSync(APP_MAP_MD, 'utf8'));
  const flow = processMd(fs.readFileSync(FLOW_MD, 'utf8'));
  const allMermaid = [...appMap.mermaidBlocks, ...flow.mermaidBlocks];

  const tocSections = Array.from(new Set(SCREENS.map(s => s.section)));

  const coverStats = {
    mockups: SCREENS.filter(s => s.tag !== 'LEGACY').length,
    sections: tocSections.length,
    tabs: 5,
  };

  // Section deck HTML
  let deckHtml = '';
  let lastSection = null;
  for (const s of SCREENS) {
    if (s.section !== lastSection) {
      deckHtml += `<div class="section-cover">
        <div class="kicker">Section</div>
        <h1 class="section-title">${s.section}</h1>
        <div class="section-list">
          ${SCREENS.filter(x => x.section === s.section).map(x => `<div class="section-row">${tagBadge(x.tag)}<span>${x.title}</span></div>`).join('')}
        </div>
      </div>`;
      lastSection = s.section;
    }
    const pngPath = path.join(PNG_DIR, s.slug + '.png');
    const pngExists = fs.existsSync(pngPath);
    deckHtml += `<div class="mockup-page">
      <div class="mockup-header">
        <div class="mockup-section">${s.section}</div>
        <h2 class="mockup-title">${s.title} ${tagBadge(s.tag)}</h2>
        <div class="mockup-slug">${s.slug}.png</div>
      </div>
      <div class="mockup-image-wrap">
        ${pngExists
          ? `<img src="file://${pngPath}" />`
          : `<div class="missing">missing PNG: ${s.slug}.png</div>`}
      </div>
    </div>`;
  }

  const mermaidJs = fs.readFileSync(MERMAID_BUNDLE, 'utf8');
  const mermaidInit = allMermaid.length
    ? `
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'Inter, sans-serif', themeVariables: { primaryColor: '#00D278', primaryTextColor: '#0A0A0F', lineColor: '#6B7280', edgeLabelBackground: '#FFFFFF' } });
      const blocks = ${JSON.stringify(allMermaid)};
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
      })();`
    : `window.__mermaid_done__ = true;`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>FuelWell · Phase 0.5 Review</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@500;600;700&display=swap" rel="stylesheet">
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
  html, body { margin:0; padding:0; background: var(--surface); color: var(--body); font-family: 'Inter', -apple-system, sans-serif; font-size: 11pt; line-height: 1.55; }

  /* Cover */
  .cover { padding: 100px 56px 64px; background: linear-gradient(135deg, #F4F5F7 0%, #FFFFFF 100%); border-bottom: 6px solid var(--action); min-height: 95vh; display:flex; flex-direction:column; justify-content:space-between; }
  .cover .brand { font-family: 'DM Sans', sans-serif; font-size: 12pt; letter-spacing: 0.2em; color: var(--action); font-weight:700; text-transform: uppercase; }
  .cover h1 { font-family: 'Outfit', sans-serif; font-size: 56pt; line-height: 1.02; font-weight: 900; color: var(--ink); margin: 16px 0 12px; letter-spacing: -0.02em; }
  .cover .lede { font-size: 14pt; color: var(--muted); max-width: 60ch; line-height: 1.5; }
  .cover .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
  .cover .stat { padding: 18px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
  .cover .stat .num { font-family: 'Outfit', sans-serif; font-size: 32pt; font-weight: 800; color: var(--ink); }
  .cover .stat .lbl { font-family: 'DM Sans', sans-serif; font-size: 9pt; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; }
  .cover .meta { font-size: 9pt; color: var(--muted); margin-top: 32px; }

  /* TOC */
  .toc { padding: 72px 56px; page-break-before: always; }
  .toc h2 { font-family: 'Outfit', sans-serif; font-size: 26pt; color: var(--ink); margin: 0 0 24px; font-weight:800; }
  .toc-section { padding: 12px 0; border-top: 1px solid var(--border); display:flex; justify-content:space-between; }
  .toc-section .name { font-family: 'DM Sans', sans-serif; font-weight: 700; color: var(--ink); font-size: 12pt; }
  .toc-section .count { color: var(--muted); font-size: 10pt; }

  /* MD body */
  .doc { padding: 48px 56px; page-break-before: always; }
  .doc-cover { padding: 80px 56px 56px; page-break-before: always; border-bottom: 1px solid var(--border); }
  .doc-cover .kicker { font-family: 'DM Sans', sans-serif; font-size: 10pt; letter-spacing: 0.18em; color: var(--action); font-weight: 700; text-transform: uppercase; }
  .doc-cover h1 { font-family: 'Outfit', sans-serif; font-size: 42pt; font-weight: 900; color: var(--ink); margin: 8px 0 16px; letter-spacing: -0.01em; }
  .doc-cover .desc { font-size: 13pt; color: var(--muted); max-width: 70ch; }
  .doc h1 { font-family: 'Outfit', sans-serif; font-size: 22pt; color: var(--ink); margin: 32px 0 12px; border-bottom: 2px solid var(--action); padding-bottom: 6px; font-weight: 800; }
  .doc h2 { font-family: 'Outfit', sans-serif; font-size: 16pt; color: var(--ink); margin: 24px 0 8px; font-weight: 700; }
  .doc h3 { font-family: 'Outfit', sans-serif; font-size: 12pt; color: var(--ink); margin: 18px 0 6px; font-weight: 700; }
  .doc h4 { font-family: 'Outfit', sans-serif; font-size: 10.5pt; color: var(--ink); margin: 14px 0 4px; font-weight: 700; }
  .doc p { margin: 8px 0; }
  .doc strong { color: var(--ink); font-weight: 600; }
  .doc ul, .doc ol { padding-left: 22px; margin: 8px 0; }
  .doc li { margin: 3px 0; }
  .doc hr { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
  .doc blockquote { margin: 12px 0; padding: 10px 14px; background: var(--soft); border-left: 4px solid var(--action); border-radius: 4px; font-size: 10pt; }
  .doc table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; page-break-inside: auto; }
  .doc thead { background: var(--inverted); color: #fff; }
  .doc th, .doc td { text-align: left; padding: 5px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .doc tr { page-break-inside: avoid; }
  .doc code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 8.5pt; background: var(--soft); padding: 1px 5px; border-radius: 3px; color: var(--ink); }
  .doc pre { background: var(--inverted); color: #E5E7EB; border-radius: 8px; padding: 14px 16px; font-size: 8.5pt; }
  .doc pre code { background: transparent; color: inherit; padding: 0; }
  .mermaid-host { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin: 14px 0; page-break-inside: avoid; }
  .mermaid-host svg { max-width: 100%; height: auto; }

  /* Section cover */
  .section-cover { page-break-before: always; padding: 80px 56px; min-height: 80vh; display:flex; flex-direction:column; justify-content:center; }
  .section-cover .kicker { font-family: 'DM Sans', sans-serif; font-size: 10pt; letter-spacing: 0.18em; color: var(--action); font-weight: 700; text-transform: uppercase; }
  .section-cover .section-title { font-family: 'Outfit', sans-serif; font-size: 44pt; font-weight: 900; color: var(--ink); margin: 12px 0 32px; letter-spacing: -0.01em; }
  .section-list { display: flex; flex-direction: column; gap: 8px; max-width: 600px; }
  .section-row { display:flex; align-items:center; gap: 10px; padding: 8px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 10pt; }

  /* Mockup */
  .mockup-page { page-break-before: always; padding: 36px 40px; min-height: 95vh; display: flex; flex-direction: column; }
  .mockup-header { margin-bottom: 12px; }
  .mockup-section { font-family: 'DM Sans', sans-serif; font-size: 9pt; letter-spacing: 0.12em; color: var(--action); font-weight: 700; text-transform: uppercase; }
  .mockup-title { font-family: 'Outfit', sans-serif; font-size: 16pt; color: var(--ink); margin: 4px 0 2px; font-weight: 800; display:flex; align-items:center; gap: 10px; }
  .mockup-slug { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 8pt; color: var(--muted); }
  .mockup-image-wrap { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .mockup-image-wrap img { max-width: 100%; max-height: 92vh; object-fit: contain; border: 1px solid var(--border); border-radius: 8px; }
  .missing { color: #EF4444; font-family: 'JetBrains Mono', ui-monospace, monospace; padding: 24px; border: 2px dashed #EF4444; border-radius: 8px; }

  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-size: 8pt; font-weight: 700; color: #fff; letter-spacing: 0.06em; text-transform: uppercase; }

  @page { size: A4 portrait; margin: 14mm 12mm 16mm 12mm; }
</style>
</head>
<body>

<!-- COVER -->
<section class="cover">
  <div>
    <div class="brand">FuelWell · Phase 0.5</div>
    <h1>Phase 0.5<br/>Review Packet</h1>
    <div class="lede">Consolidated App Map v2.1 · Flow Chart v2.1 · ${SCREENS.filter(s => s.tag !== 'LEGACY').length}-screen mockup deck. Incorporates the Phase 0.5.3 review pass (D1–D19) — Max + Robby + audit consolidation, dated 2026-05-21.</div>
    <div class="stats">
      <div class="stat"><div class="num">${coverStats.mockups}</div><div class="lbl">Mockups</div></div>
      <div class="stat"><div class="num">${coverStats.sections}</div><div class="lbl">Sections</div></div>
      <div class="stat"><div class="num">${coverStats.tabs}</div><div class="lbl">Tabs (Home·Meals·Coach·Exercise·Progress)</div></div>
    </div>
  </div>
  <div class="meta">Branch · feature/phase-0-realignment · Build · ${new Date().toISOString().slice(0,10)}</div>
</section>

<!-- TOC -->
<section class="toc">
  <h2>Contents</h2>
  ${tocSections.map(sec => `
    <div class="toc-section">
      <div class="name">${sec}</div>
      <div class="count">${SCREENS.filter(s => s.section === sec).length} screens</div>
    </div>
  `).join('')}
</section>

<!-- APP MAP -->
<section class="doc-cover">
  <div class="kicker">Spec doc</div>
  <h1>App Map v2.1</h1>
  <div class="desc">Tab structure, screen inventory, navigation rules. Includes the Phase 0.5.3 updates: single-word tab labels, Day 1 Dashboard welcome mode, Macro History deep-link, Learn home removed, voice mode dropped.</div>
</section>
<section class="doc">${appMap.html}</section>

<!-- FLOW CHART -->
<section class="doc-cover">
  <div class="kicker">Spec doc</div>
  <h1>Flow Chart v2.1</h1>
  <div class="desc">Per-screen flows, cross-cutting rules, navigation graph. Includes Phase 0.5.3 updates: dynamic Daily Recap trigger, offline write queue, Coach typing indicator, notification preview privacy.</div>
</section>
<section class="doc">${flow.html}</section>

<!-- MOCKUP DECK -->
${deckHtml}

<script>${mermaidJs}</script>
<script>${mermaidInit}</script>
</body></html>`;
}

async function main() {
  const html = buildHtml();
  const tmpHtml = OUT.replace(/\.pdf$/, '.tmp.html');
  fs.writeFileSync(tmpHtml, html);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1240, height: 1754 } });
  const page = await ctx.newPage();
  await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__mermaid_done__, { timeout: 30000 });
  await page.waitForTimeout(800);

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `<div style="font-family:Inter,sans-serif;font-size:8pt;color:#6B7280;width:100%;padding:0 12mm;display:flex;justify-content:space-between;"><span>FuelWell · Phase 0.5 Review · ${new Date().toISOString().slice(0,10)}</span><span class="pageNumber"></span></div>`,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
  });

  await browser.close();
  fs.unlinkSync(tmpHtml);
  const sz = (fs.statSync(OUT).size / (1024 * 1024)).toFixed(2);
  console.log(`[build-combined] wrote ${OUT} (${sz} MB)`);
}

main().catch(e => { console.error(e); process.exit(2); });
