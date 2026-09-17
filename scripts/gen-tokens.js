// Generates src/shared/theme/tokens.cjs from tokens.ts so tailwind.config.js (CommonJS) can consume it.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../src/shared/theme/tokens.ts'), 'utf8');
const body = src
  .replace(/\/\*\*[\s\S]*?\*\//, '')
  .replace(/export const (\w+) = /g, 'const $1 = ')
  .replace(/ as const;/g, ';');
fs.writeFileSync(
  path.join(__dirname, '../src/shared/theme/tokens.cjs'),
  '// GENERATED from tokens.ts by scripts/gen-tokens.js. Do not edit.\n' +
    body +
    '\nmodule.exports = { colors, radius, fonts };\n',
);
console.log('tokens.cjs written');
