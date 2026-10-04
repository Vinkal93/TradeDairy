const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relativePath) {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  new Function('exports', 'module', outputText)(module.exports, module);
  return module.exports;
}

const { localDate, matchesTimeframe } = load('src/lib/dates.ts');
const { csvCell, parseCSV } = load('src/lib/csv.ts');

test('Today uses the local day and excludes yesterday and future dates', () => {
  const now = new Date(2026, 9, 5, 0, 15);
  assert.equal(localDate(now), '2026-10-05');
  assert.equal(matchesTimeframe('2026-10-05', 'Today', now), true);
  assert.equal(matchesTimeframe('2026-10-04', 'Today', now), false);
  assert.equal(matchesTimeframe('2026-10-06', 'Today', now), false);
});

test('This Week starts on Monday, including across a year boundary', () => {
  const now = new Date(2027, 0, 1, 12);
  assert.equal(matchesTimeframe('2026-12-28', 'This Week', now), true);
  assert.equal(matchesTimeframe('2026-12-27', 'This Week', now), false);
  assert.equal(matchesTimeframe('2027-01-02', 'This Week', now), false);
});

test('Month and year filters respect boundaries while All Time includes history', () => {
  const now = new Date(2026, 9, 5, 12);
  assert.equal(matchesTimeframe('2026-09-30', 'This Month', now), false);
  assert.equal(matchesTimeframe('2026-10-01', 'This Month', now), true);
  assert.equal(matchesTimeframe('2025-12-31', 'This Year', now), false);
  assert.equal(matchesTimeframe('2026-01-01', 'This Year', now), true);
  assert.equal(matchesTimeframe('2025-01-01', 'All Time', now), true);
});

test('CSV round trip preserves commas, quotes, multiline notes and zero charges', () => {
  const row = ['NIFTY, weekly', 'quoted "note"', 'line1\nline2', 0];
  assert.deepEqual(parseCSV(row.map(csvCell).join(',')), [row.map(String)]);
});

test('CSV accepts BOM and Windows line endings and rejects incomplete quotes', () => {
  assert.deepEqual(parseCSV('\uFEFFA,B\r\n1,2\r\n'), [['A', 'B'], ['1', '2']]);
  assert.throws(() => parseCSV('"unclosed'));
});
