// Prints the vertical runs of non-background pixels at a given x column for the reference and
// the app screenshot of one screen, to compare element positions/heights numerically.
//
//   node scripts/measure-shots.js <screen name> <x> [x2 ...]
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const [name, ...xs] = process.argv.slice(2);
const ROOT = path.join(__dirname, '..', 'design');
const item = JSON.parse(fs.readFileSync(path.join(ROOT, 'screens.json'), 'utf8')).find(
  (i) => i.name === name,
);
if (!item) {
  console.error('unknown screen', name);
  process.exit(1);
}
function runs(file, x) {
  const img = PNG.sync.read(fs.readFileSync(file));
  const px = (y) => {
    const i = (y * img.width + x) * 4;
    return [img.data[i], img.data[i + 1], img.data[i + 2]];
  };
  const base = px(300);
  const near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 24;
  const out = [];
  let start = null;
  for (let y = 0; y < img.height; y++) {
    const isBg = near(px(y), base);
    if (!isBg && start === null) start = y;
    if (isBg && start !== null) {
      out.push(`${start}-${y - 1}(${y - start})`);
      start = null;
    }
  }
  return out.join(' ');
}
for (const x of xs) {
  console.log(`x=${x} REF: ${runs(path.join(ROOT, 'reference', item.ref), Number(x))}`);
  console.log(`x=${x} APP: ${runs(path.join(ROOT, 'app-shots', item.name + '.png'), Number(x))}`);
}
