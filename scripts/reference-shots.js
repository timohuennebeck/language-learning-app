// Renders the Claude Design export (bundled HTML) in Chromium and screenshots every
// screen's device frame at native size into design/reference/.
//
//   node scripts/reference-shots.js path/to/claude-design-all-screens.html
//
// Requires: npx playwright install chromium   (or CHROMIUM_PATH=/path/to/chrome)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
if (!SRC) {
  console.error('usage: node scripts/reference-shots.js <design.html>');
  process.exit(1);
}
const OUT = path.join(__dirname, '..', 'design', 'reference');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // Set CHROMIUM_PATH to use a pre-installed browser instead of Playwright's own download.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined,
  );
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
  });
  await page.goto('file://' + path.resolve(SRC));
  await page.waitForFunction(
    () => document.querySelectorAll('[data-om-starter="ios-frame"]').length >= 60,
    null,
    { timeout: 120000 },
  );
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.fonts.ready);
  for (const s of await page.$$('[data-screen-label]')) {
    const label = await s.getAttribute('data-screen-label');
    const frame = await s.$('[data-om-starter="ios-frame"]');
    if (!frame) continue;
    await frame.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const file = label.replace(/[^\w\-]+/g, '_') + '.png';
    await frame.screenshot({ path: path.join(OUT, file) });
    console.log('saved', file);
  }
  await browser.close();
})();
