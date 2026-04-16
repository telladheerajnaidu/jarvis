import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

async function main() {
  // Convert markdown to HTML using pandoc
  console.log('Converting markdown to HTML...');
  const mdPath = resolve('docs/WALKTHROUGH.md');

  execSync(`pandoc "${mdPath}" -o docs/WALKTHROUGH_temp.html --standalone --embed-resources --resource-path=docs -M title="" --css=docs/pdf-style.css 2>/dev/null || pandoc "${mdPath}" -o docs/WALKTHROUGH_temp.html --standalone --self-contained --resource-path=docs -M title="" 2>/dev/null || pandoc "${mdPath}" -o docs/WALKTHROUGH_temp.html --standalone --resource-path=docs -M title=""`, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  // Read the HTML and inject CSS for better styling
  let html = readFileSync('docs/WALKTHROUGH_temp.html', 'utf8');

  // Inject PDF styling
  const css = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.55;
        color: #1a1a1a;
        max-width: 100%;
        margin: 0;
        padding: 20px 40px;
      }
      h1 { font-size: 22pt; margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 8px; }
      h2 { font-size: 16pt; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 6px; page-break-after: avoid; }
      h3 { font-size: 13pt; margin-top: 20px; page-break-after: avoid; }
      h4 { font-size: 11pt; margin-top: 15px; }
      p { margin: 8px 0; }
      code {
        background: #f4f4f4;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 0.9em;
        font-family: "SF Mono", "JetBrains Mono", Menlo, monospace;
      }
      pre {
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        font-size: 9pt;
        line-height: 1.4;
        page-break-inside: avoid;
      }
      pre code { background: none; padding: 0; }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;
        font-size: 10pt;
        page-break-inside: avoid;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 6px 10px;
        text-align: left;
      }
      th { background: #f0f0f0; font-weight: 600; }
      tr:nth-child(even) { background: #fafafa; }
      img {
        max-width: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin: 10px 0;
        page-break-inside: avoid;
      }
      hr { border: none; border-top: 2px solid #e0e0e0; margin: 25px 0; }
      blockquote {
        border-left: 3px solid #0891b2;
        margin: 12px 0;
        padding: 8px 16px;
        background: #f0fdf4;
      }
      .sourceCode .kw { color: #0550ae; }
      .sourceCode .st { color: #0a3069; }
      .sourceCode .dv { color: #0550ae; }
      .sourceCode .co { color: #6e7781; }
      .sourceCode .dt { color: #953800; }
      .diff-added, .sourceCode .va { color: #116329; }
      .diff-removed { color: #82071e; }
      strong { font-weight: 600; }
      @media print {
        body { padding: 0; }
        h2 { page-break-before: auto; }
        .sourceCode { page-break-inside: avoid; }
      }
    </style>
  `;

  html = html.replace('</head>', css + '</head>');

  // Fix image paths to be absolute file:// URLs
  const docsDir = resolve('docs');
  html = html.replace(/src="\.\/screenshots\//g, `src="file://${docsDir}/screenshots/`);
  html = html.replace(/src="screenshots\//g, `src="file://${docsDir}/screenshots/`);

  // Write the styled HTML
  const { writeFileSync } = await import('fs');
  const styledPath = resolve('docs/WALKTHROUGH_styled.html');
  writeFileSync(styledPath, html);

  // Use Playwright to generate PDF
  console.log('Generating PDF with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${styledPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.pdf({
    path: 'docs/WALKTHROUGH.pdf',
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;margin-top:5px;">Jarvis Debug Lab -- Interview Walkthrough (Hitesh Singh Solanki)</div>',
    footerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;margin-bottom:5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();

  // Clean up temp files
  execSync('rm -f docs/WALKTHROUGH_temp.html docs/WALKTHROUGH_styled.html');

  console.log('PDF generated: docs/WALKTHROUGH.pdf');
}

main().catch((e) => { console.error(e); process.exit(1); });
