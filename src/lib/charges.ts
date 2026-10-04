import { ChargeBreakdown, ChargeConfig, ChargeRates, ChargeSegment, TradeSide } from '../types';

export const DEFAULT_CHARGES: ChargeConfig = {
  brokeragePerOrder: 20, brokerageMode: 'flat', brokeragePercent: 0.03,
  deliveryBrokeragePerOrder: 0, exchange: 'NSE', gstPercent: 18,
  dpCharge: 15.34, otherCharges: 0,
};
export const CHARGE_LABELS: Record<ChargeSegment, string> = {
  'equity-intraday': 'Equity · Intraday', 'equity-delivery': 'Equity · Delivery',
  futures: 'Futures', options: 'Options', manual: 'Other markets · Manual charges',
};
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

// Percentages, not fractions. Current exchange rates checked against zerodha.com/charges.
// Contract-note totals may differ because of daily rounding, settlement and broker-specific fees.
export function ratesFor(segment: ChargeSegment, config: ChargeConfig, date: string): ChargeRates {
  const legacy = date < '2026-04-01';
  const old = date < '2024-10-01';
  const nse = config.exchange === 'NSE';
  const rates: Record<ChargeSegment, ChargeRates> = {
    'equity-intraday': { sttBuy: 0, sttSell: 0.025, exchange: nse ? 0.00307 : 0.00375, stamp: 0.003 },
    'equity-delivery': { sttBuy: 0.1, sttSell: 0.1, exchange: nse ? 0.00307 : 0.00375, stamp: 0.015 },
    futures: { sttBuy: 0, sttSell: old ? 0.0125 : legacy ? 0.02 : 0.05, exchange: nse ? 0.00183 : 0, stamp: 0.002 },
    options: { sttBuy: 0, sttSell: old ? 0.0625 : legacy ? 0.1 : 0.15, exchange: nse ? 0.03553 : 0.0325, stamp: 0.003 },
    manual: { sttBuy: 0, sttSell: 0, exchange: 0, stamp: 0 },
  };
  return config.overrides?.[segment] || rates[segment];
}

export function calculateCharges(input: {
  entryPrice: number; exitPrice?: number; quantity: number; side: TradeSide;
  segment: ChargeSegment; date: string; config?: ChargeConfig;
  buyOrders?: number; sellOrders?: number;
}): ChargeBreakdown {
  const c = { ...DEFAULT_CHARGES, ...input.config };
  const closed = input.exitPrice !== undefined;
  const entry = input.entryPrice * input.quantity;
  const exit = (input.exitPrice || 0) * input.quantity;
  const buyTurnover = input.side === 'BUY' ? entry : closed ? exit : 0;
  const sellTurnover = input.side === 'SELL' ? entry : closed ? exit : 0;
  const buyOrders = buyTurnover ? input.buyOrders ?? 1 : 0;
  const sellOrders = sellTurnover ? input.sellOrders ?? 1 : 0;
  const delivery = input.segment === 'equity-delivery';
  const brokerageLeg = (turnover: number, orders: number) => {
    if (!orders) return 0;
    if (delivery) return c.deliveryBrokeragePerOrder * orders;
    if (c.brokerageMode === 'capped' && input.segment !== 'options') {
      return Math.min(c.brokeragePerOrder * orders, turnover * c.brokeragePercent / 100);
    }
    return c.brokeragePerOrder * orders;
  };
  const rates = ratesFor(input.segment, c, input.date);
  const turnover = buyTurnover + sellTurnover;
  const brokerage = roundMoney(brokerageLeg(buyTurnover, buyOrders) + brokerageLeg(sellTurnover, sellOrders));
  const stt = roundMoney((buyTurnover * rates.sttBuy + sellTurnover * rates.sttSell) / 100);
  const exchange = roundMoney(turnover * rates.exchange / 100);
  const sebi = roundMoney(turnover / 1000000); // ₹10 per crore
  const stamp = roundMoney(buyTurnover * rates.stamp / 100);
  const gst = roundMoney((brokerage + exchange + sebi) * c.gstPercent / 100);
  const dp = delivery && sellTurnover > 0 ? c.dpCharge : 0; // already includes GST
  const other = c.otherCharges;
  return { brokerage, stt, exchange, sebi, stamp, gst, dp, other,
    total: roundMoney(brokerage + stt + exchange + sebi + stamp + gst + dp + other), buyTurnover, sellTurnover };
}

export function calculatePnl(entry: number, exit: number | undefined, quantity: number, side: TradeSide, charges: number) {
  if (exit === undefined) return { grossPnl: 0, netPnl: 0, roi: 0 };
  const grossPnl = roundMoney((side === 'BUY' ? exit - entry : entry - exit) * quantity);
  const netPnl = roundMoney(grossPnl - charges);
  return { grossPnl, netPnl, roi: entry * quantity > 0 ? roundMoney(netPnl / (entry * quantity) * 100) : 0 };
}
