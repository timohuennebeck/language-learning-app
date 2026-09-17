// Screenshots every route listed in design/screens.json from a running `expo start --web`
// server (default http://localhost:8081) at the design's frame size, and writes a side-by-side
// image (reference | app) per screen into design/compare/.
//
//   npm run web            (in another terminal)
//   node scripts/app-shots.js [baseUrl] [nameFilter]
//
// Requires: npx playwright install chromium   (or CHROMIUM_PATH=/path/to/chrome)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE = process.argv[2] || 'http://localhost:8081';
const FILTER = process.argv[3];
const ROOT = path.join(__dirname, '..', 'design');
const APP = path.join(ROOT, 'app-shots');
const CMP = path.join(ROOT, 'compare');
const REF = path.join(ROOT, 'reference');
const screens = JSON.parse(fs.readFileSync(path.join(ROOT, 'screens.json'), 'utf8'));

const SESSION = {
  onboardingComplete: false,
  name: 'Maja',
  appLanguage: 'de',
  learningLanguage: 'fr',
  level: 'A2',
  targetLevel: 'B2',
  dailyGoalMinutes: 15,
  reminder: { hour: 20, minute: 30, repeat: 0 },
  goal: 'media',
  plusActive: true,
};

function sideBySide(refPath, appPath, out) {
  const a = PNG.sync.read(fs.readFileSync(refPath));
  const b = PNG.sync.read(fs.readFileSync(appPath));
  const o = new PNG({ width: a.width + b.width + 12, height: Math.max(a.height, b.height) });
  o.data.fill(255);
  PNG.bitblt(a, o, 0, 0, a.width, a.height, 0, 0);
  PNG.bitblt(b, o, 0, 0, b.width, b.height, a.width + 12, 0);
  fs.writeFileSync(out, PNG.sync.write(o));
}

(async () => {
  fs.mkdirSync(APP, { recursive: true });
  fs.mkdirSync(CMP, { recursive: true });
  // Set CHROMIUM_PATH to use a pre-installed browser instead of Playwright's own download.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined,
  );
  for (const item of screens) {
    if (FILTER && !item.name.includes(FILTER)) continue;
    const ctx = await browser.newContext({
      viewport: { width: 402, height: item.h || 874 },
      deviceScaleFactor: 1,
    });
    await ctx.addInitScript(
      (session) => localStorage.setItem('yori.session.v1', JSON.stringify(session)),
      { ...SESSION, onboardingComplete: !!item.onboarded },
    );
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    try {
      await page.goto(BASE + item.route, { waitUntil: 'networkidle', timeout: 240000 });
      await page.waitForTimeout(item.wait || 1800);
      const file = path.join(APP, item.name + '.png');
      await page.screenshot({ path: file });
      const ref = path.join(REF, item.ref);
      if (fs.existsSync(ref)) sideBySide(ref, file, path.join(CMP, item.name + '.png'));
      console.log(errors.length ? 'ERR' : 'ok ', item.name, errors.join(' | '));
    } catch (e) {
      console.log('FAIL', item.name, e.message.slice(0, 160));
    }
    await ctx.close();
  }
  await browser.close();
})();
