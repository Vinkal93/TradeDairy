export type AssetClass = 'Equity' | 'Futures' | 'Options' | 'Forex' | 'Crypto' | 'Commodities';
export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED';
export type MarketCondition = 'Trending' | 'Ranging' | 'Volatile' | 'Unclear';
export type EmotionalState = 'Calm' | 'Confident' | 'Fear' | 'FOMO' | 'Greedy' | 'Revenge';
export type SetupType = 'Breakout' | 'Pullback' | 'Support Demand' | 'Reversal' | 'Momentum' | 'ORB' | 'Mean Reversion' | 'Custom';

export type ChargeSegment = 'equity-intraday' | 'equity-delivery' | 'futures' | 'options' | 'manual';
export interface ChargeRates { sttBuy: number; sttSell: number; exchange: number; stamp: number }
export interface ChargeConfig {
  brokeragePerOrder: number;
  brokerageMode: 'flat' | 'capped';
  brokeragePercent: number;
  deliveryBrokeragePerOrder: number;
  exchange: 'NSE' | 'BSE';
  gstPercent: number;
  dpCharge: number;
  otherCharges: number;
  overrides?: Partial<Record<ChargeSegment, ChargeRates>>;
}
export interface ChargeBreakdown {
  brokerage: number; stt: number; exchange: number; sebi: number;
  stamp: number; gst: number; dp: number; other: number; total: number;
  buyTurnover: number; sellTurnover: number;
}
export interface EncryptedCredential { salt: string; iv: string; ciphertext: string }

export interface Trade {
  id: string;
  instrument: string;
  assetClass: AssetClass;
  side: TradeSide;
  status: TradeStatus;
  date: string; // YYYY-MM-DD
  entryTime: string; // e.g. "10:15 AM"
  exitTime?: string; // e.g. "11:35 AM"
  holdingTime?: string; // e.g. "1h 20m"
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  target?: number;
  grossPnl: number;
  charges: number;
  netPnl: number;
  roi: number; // percentage
  rrRatio?: number; // e.g. 2.8
  setup: SetupType | string;
  marketCondition?: MarketCondition;
  emotion?: EmotionalState;
  notes?: string;
  rulesFollowed: boolean;
  chartImage?: string;
  accountId: string;
  accountName?: string;
  strikePrice?: number;
  expiryDate?: string;
  optionType?: 'CE' | 'PE';
  createdAt: string;
  segment?: ChargeSegment;
  chargeBreakdown?: ChargeBreakdown;
  chargeConfig?: ChargeConfig;
  buyOrders?: number;
  sellOrders?: number;
  chargeMode?: 'auto' | 'manual';
}

export interface TradingAccount {
  id: string;
  broker: 'Zerodha' | 'Groww' | 'Angel One' | 'Upstox' | 'Dhan' | 'Custom Broker';
  accountName: string;
  capital: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  accountNumber?: string;
  isManual: boolean;
  isActive: boolean;
  color: string;
  logoInitial: string;
  chargeConfig?: ChargeConfig;
  brokerLoginId?: string;
  encryptedPassword?: EncryptedCredential;
}

export interface DailyJournal {
  id: string;
  date: string; // YYYY-MM-DD
  preMarketNotes?: string;
  postMarketNotes: string;
  emotionalState: EmotionalState;
  starRating: number; // 1 - 5
  rulesFollowed: boolean;
  mindsetTags: string[];
  mistakeTags: string[];
  tradesCount?: number;
  dayPnl?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  tradingAlias: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  primaryMarket: string;
  baseCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
  activeStyles: string[];
  dailyMaxLoss: number;
  dailyMaxTrades: number;
  defaultRiskPerTrade: number;
  avatar: string;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  plan: 'Free' | 'Pro';
  activeSessions?: DeviceSession[];
  indexLotSizes?: Record<string, number>;
}

export const DEFAULT_INDEX_LOT_SIZES: Record<string, number> = {
  NIFTY: 25,
  BANKNIFTY: 15,
  FINNIFTY: 25,
  MIDCPNIFTY: 50,
  SENSEX: 10,
  BANKEX: 15,
  'NIFTY NEXT 50': 10,
};

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // percentage e.g. 62.5
  totalGrossProfit: number;
  totalGrossLoss: number;
  totalCharges: number;
  netRealizedPnl: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
  expectancy: number;
  bestDay: { date: string; pnl: number; tradesCount: number };
  worstDay: { date: string; pnl: number; tradesCount: number };
  profitableDaysCount: number;
  lossDaysCount: number;
  totalDaysTraded: number;
}
