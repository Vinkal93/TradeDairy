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
const { calculateCharges, calculatePnl, DEFAULT_CHARGES } = load('src/lib/charges.ts');
const { encryptPassword, decryptPassword } = load('src/lib/vault.ts');

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

test('₹10 per order options round trip applies turnover taxes and net P&L', () => {
  const charges = calculateCharges({ entryPrice: 100, exitPrice: 110, quantity: 50, side: 'BUY', segment: 'options', date: '2026-10-05', config: { ...DEFAULT_CHARGES, brokeragePerOrder: 10 } });
  assert.equal(charges.brokerage, 20);
  assert.equal(charges.stt, 8.25);
  assert.equal(charges.exchange, 3.73);
  assert.equal(charges.gst, 4.27);
  assert.equal(charges.total, 36.41);
  assert.deepEqual(calculatePnl(100, 110, 50, 'BUY', charges.total), { grossPnl: 500, netPnl: 463.59, roi: 9.27 });
});

test('Sell-first taxes use actual sell turnover and buy-side stamp duty', () => {
  const charges = calculateCharges({ entryPrice: 110, exitPrice: 100, quantity: 50, side: 'SELL', segment: 'options', date: '2026-10-05' });
  assert.equal(charges.sellTurnover, 5500); assert.equal(charges.buyTurnover, 5000);
  assert.equal(charges.stt, 8.25); assert.equal(charges.stamp, 0.15);
  assert.equal(charges.brokerage, 40);
  assert.equal(calculatePnl(110, 100, 50, 'SELL', charges.total).grossPnl, 500);
  assert.equal(calculatePnl(100, 110, 50, 'SELL', 0).netPnl, -500);
});

test('Open trades charge only their entry order and have no realized P&L', () => {
  const buy = calculateCharges({ entryPrice: 100, quantity: 50, side: 'BUY', segment: 'options', date: '2026-10-05' });
  const sell = calculateCharges({ entryPrice: 100, quantity: 50, side: 'SELL', segment: 'options', date: '2026-10-05' });
  assert.equal(buy.brokerage, 20); assert.equal(buy.stt, 0); assert.equal(sell.stt, 7.5);
  assert.deepEqual(calculatePnl(100, undefined, 50, 'BUY', buy.total), { grossPnl: 0, netPnl: 0, roi: 0 });
});

test('GST, multiple orders, capped brokerage, delivery DP and tax overrides work', () => {
  const base = { entryPrice: 100, exitPrice: 110, quantity: 50, side: 'BUY', date: '2026-10-05' };
  const multi = calculateCharges({ ...base, segment: 'options', buyOrders: 2, sellOrders: 3 });
  assert.equal(multi.brokerage, 100);
  const capped = calculateCharges({ ...base, segment: 'equity-intraday', config: { ...DEFAULT_CHARGES, brokerageMode: 'capped' } });
  assert.equal(capped.brokerage, 3.15);
  const delivery = calculateCharges({ ...base, segment: 'equity-delivery' });
  assert.equal(delivery.brokerage, 0); assert.equal(delivery.dp, 15.34); assert.equal(delivery.stt, 10.5); assert.equal(delivery.stamp, 0.75);
  const zero = calculateCharges({ ...base, segment: 'options', config: { ...DEFAULT_CHARGES, brokeragePerOrder: 0, gstPercent: 0, overrides: { options: { sttBuy: 0, sttSell: 0, exchange: 0, stamp: 0 } } } });
  assert.equal(zero.total, 0.01); // SEBI only
});

test('STT changes at the April 2026 boundary', () => {
  const input = { entryPrice: 100, exitPrice: 110, quantity: 50, side: 'BUY', segment: 'options' };
  assert.equal(calculateCharges({ ...input, date: '2026-03-31' }).stt, 5.5);
  assert.equal(calculateCharges({ ...input, date: '2026-04-01' }).stt, 8.25);
});

test('Small gross wins can become losses after charges', () => {
  const result = calculatePnl(100, 100.1, 50, 'BUY', 30);
  assert.equal(result.grossPnl, 5); assert.equal(result.netPnl, -25);
});

test('Password vault round trip rejects wrong passphrases and uses fresh salts', async () => {
  const first = await encryptPassword('test-password-only', 'a-long-test-passphrase');
  const second = await encryptPassword('test-password-only', 'a-long-test-passphrase');
  assert.notEqual(first.salt, second.salt); assert.notEqual(first.iv, second.iv);
  assert(!JSON.stringify(first).includes('test-password-only'));
  assert.equal(await decryptPassword(first, 'a-long-test-passphrase'), 'test-password-only');
  await assert.rejects(() => decryptPassword(first, 'wrong-passphrase'));
});
