export interface InstrumentItem {
  symbol: string;
  name: string;
  category: 'Index' | 'Stock' | 'Custom';
  exchange?: 'NSE' | 'BSE' | 'MCX';
  lotSize?: number;
  aliases?: string[];
}

export const MAJOR_INDICES: InstrumentItem[] = [
  // Core Benchmark & Traded Indices
  { symbol: 'NIFTY 50', name: 'Nifty 50 Benchmark Index', category: 'Index', exchange: 'NSE', lotSize: 50, aliases: ['nifty', 'nifty50', 'nf', 'nifty 50'] },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank Index', category: 'Index', exchange: 'NSE', lotSize: 15, aliases: ['bank', 'banknifty', 'bnf', 'bank nifty', 'nifty bank'] },
  { symbol: 'FINNIFTY', name: 'Nifty Financial Services Index', category: 'Index', exchange: 'NSE', lotSize: 25, aliases: ['finnifty', 'fin nifty', 'fin', 'financial'] },
  { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select Index', category: 'Index', exchange: 'NSE', lotSize: 50, aliases: ['midcpnifty', 'midcap', 'midcp', 'midcap nifty'] },
  { symbol: 'NIFTY NEXT 50', name: 'Nifty Next 50 Index', category: 'Index', exchange: 'NSE', lotSize: 10, aliases: ['next50', 'junior nifty', 'nifty next'] },
  { symbol: 'SENSEX', name: 'BSE S&P Sensex Index', category: 'Index', exchange: 'BSE', lotSize: 10, aliases: ['sensex', 'bse30', 'bse'] },
  { symbol: 'BANKEX', name: 'BSE Bankex Index', category: 'Index', exchange: 'BSE', lotSize: 15, aliases: ['bankex', 'bse bank'] },
  { symbol: 'SENSEX 50', name: 'BSE Sensex 50 Index', category: 'Index', exchange: 'BSE', lotSize: 25, aliases: ['sensex50'] },

  // Sectoral Indices
  { symbol: 'NIFTY IT', name: 'Nifty Information Technology', category: 'Index', exchange: 'NSE', lotSize: 25, aliases: ['it', 'nifty it', 'tech'] },
  { symbol: 'NIFTY AUTO', name: 'Nifty Automobile Sector', category: 'Index', exchange: 'NSE', aliases: ['auto', 'nifty auto', 'automobile'] },
  { symbol: 'NIFTY PHARMA', name: 'Nifty Pharmaceuticals Sector', category: 'Index', exchange: 'NSE', aliases: ['pharma', 'nifty pharma', 'healthcare'] },
  { symbol: 'NIFTY FMCG', name: 'Nifty Fast Moving Consumer Goods', category: 'Index', exchange: 'NSE', aliases: ['fmcg', 'nifty fmcg'] },
  { symbol: 'NIFTY METAL', name: 'Nifty Metals & Mining Sector', category: 'Index', exchange: 'NSE', aliases: ['metal', 'nifty metal', 'steel'] },
  { symbol: 'NIFTY REALTY', name: 'Nifty Real Estate Sector', category: 'Index', exchange: 'NSE', aliases: ['realty', 'real estate', 'nifty realty'] },
  { symbol: 'NIFTY PSU BANK', name: 'Nifty Public Sector Banks', category: 'Index', exchange: 'NSE', aliases: ['psu bank', 'psu', 'nifty psu'] },
  { symbol: 'NIFTY PVT BANK', name: 'Nifty Private Bank Index', category: 'Index', exchange: 'NSE', aliases: ['pvt bank', 'private bank'] },
  { symbol: 'NIFTY ENERGY', name: 'Nifty Energy & Power Index', category: 'Index', exchange: 'NSE', aliases: ['energy', 'power', 'nifty energy'] },
  { symbol: 'NIFTY INFRA', name: 'Nifty Infrastructure Sector', category: 'Index', exchange: 'NSE', aliases: ['infra', 'infrastructure'] },
  { symbol: 'NIFTY COMMODITIES', name: 'Nifty Commodities Index', category: 'Index', exchange: 'NSE', aliases: ['commodities'] },
  { symbol: 'NIFTY MEDIA', name: 'Nifty Media & Entertainment', category: 'Index', exchange: 'NSE', aliases: ['media'] },
  { symbol: 'NIFTY PSE', name: 'Nifty Public Sector Enterprises', category: 'Index', exchange: 'NSE', aliases: ['pse'] },
  { symbol: 'NIFTY MNC', name: 'Nifty Multinational Companies', category: 'Index', exchange: 'NSE', aliases: ['mnc'] },
  { symbol: 'NIFTY OIL & GAS', name: 'Nifty Oil and Gas Index', category: 'Index', exchange: 'NSE', aliases: ['oil', 'gas', 'oil and gas'] },
  { symbol: 'NIFTY HEALTHCARE', name: 'Nifty Healthcare Index', category: 'Index', exchange: 'NSE', aliases: ['healthcare'] },
  { symbol: 'NIFTY CHEMICALS', name: 'Nifty Chemicals Index', category: 'Index', exchange: 'NSE', aliases: ['chemicals'] },

  // Broad Market Indices
  { symbol: 'NIFTY 100', name: 'Nifty 100 Broad Market Index', category: 'Index', exchange: 'NSE', aliases: ['nifty100'] },
  { symbol: 'NIFTY 200', name: 'Nifty 200 Broad Market Index', category: 'Index', exchange: 'NSE', aliases: ['nifty200'] },
  { symbol: 'NIFTY 500', name: 'Nifty 500 Broad Market Index', category: 'Index', exchange: 'NSE', aliases: ['nifty500'] },
  { symbol: 'NIFTY MIDCAP 50', name: 'Nifty Midcap 50 Index', category: 'Index', exchange: 'NSE', aliases: ['midcap50'] },
  { symbol: 'NIFTY MIDCAP 100', name: 'Nifty Midcap 100 Index', category: 'Index', exchange: 'NSE', aliases: ['midcap100'] },
  { symbol: 'NIFTY MIDCAP 150', name: 'Nifty Midcap 150 Index', category: 'Index', exchange: 'NSE', aliases: ['midcap150'] },
  { symbol: 'NIFTY SMALLCAP 50', name: 'Nifty Smallcap 50 Index', category: 'Index', exchange: 'NSE', aliases: ['smallcap50'] },
  { symbol: 'NIFTY SMALLCAP 100', name: 'Nifty Smallcap 100 Index', category: 'Index', exchange: 'NSE', aliases: ['smallcap100', 'smallcap'] },
  { symbol: 'NIFTY SMALLCAP 250', name: 'Nifty Smallcap 250 Index', category: 'Index', exchange: 'NSE', aliases: ['smallcap250'] },
  { symbol: 'INDIA VIX', name: 'India Volatility Index', category: 'Index', exchange: 'NSE', aliases: ['vix', 'volatility'] },
];

export const TOP_STOCKS: InstrumentItem[] = [
  // === NIFTY 50 & Heavyweights ===
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 550, aliases: ['hdfc', 'hdfc bank'] },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 700, aliases: ['icici'] },
  { symbol: 'INFY', name: 'Infosys Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400, aliases: ['infosys'] },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', category: 'Stock', exchange: 'NSE', lotSize: 175, aliases: ['tata consultancy'] },
  { symbol: 'ITC', name: 'ITC Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1600 },
  { symbol: 'SBIN', name: 'State Bank of India', category: 'Stock', exchange: 'NSE', lotSize: 750, aliases: ['sbi', 'state bank'] },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', category: 'Stock', exchange: 'NSE', lotSize: 475, aliases: ['airtel'] },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150, aliases: ['l&t', 'larsen'] },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400, aliases: ['kotak'] },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 625, aliases: ['axis'] },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300, aliases: ['hul', 'unilever'] },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', category: 'Stock', exchange: 'NSE', lotSize: 125, aliases: ['bajaj finance'] },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', category: 'Stock', exchange: 'NSE', lotSize: 700, aliases: ['tata motors', 'tamot'] },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 350, aliases: ['sun pharma'] },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 50, aliases: ['maruti suzuki'] },
  { symbol: 'TITAN', name: 'Titan Company Ltd', category: 'Stock', exchange: 'NSE', lotSize: 175 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', category: 'Stock', exchange: 'NSE', lotSize: 200, aliases: ['asian paints'] },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', category: 'Stock', exchange: 'NSE', lotSize: 350, aliases: ['hcl'] },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300, aliases: ['adani'] },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & Special Economic Zone', category: 'Stock', exchange: 'NSE', lotSize: 400 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', category: 'Stock', exchange: 'NSE', lotSize: 5500, aliases: ['tata steel'] },
  { symbol: 'NTPC', name: 'NTPC Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1500 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India', category: 'Stock', exchange: 'NSE', lotSize: 1800 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2100 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100, aliases: ['ultratech'] },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', category: 'Stock', exchange: 'NSE', lotSize: 3850 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250, aliases: ['nestle'] },
  { symbol: 'WIPRO', name: 'Wipro Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1500 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', category: 'Stock', exchange: 'NSE', lotSize: 350, aliases: ['mahindra'] },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', category: 'Stock', exchange: 'NSE', lotSize: 675 },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', category: 'Stock', exchange: 'NSE', lotSize: 600 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1400 },
  { symbol: 'CIPLA', name: 'Cipla Ltd', category: 'Stock', exchange: 'NSE', lotSize: 650 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1800 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', category: 'Stock', exchange: 'NSE', lotSize: 900 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 200 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150, aliases: ['royal enfield'] },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', category: 'Stock', exchange: 'NSE', lotSize: 125 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', category: 'Stock', exchange: 'NSE', lotSize: 75 },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Ltd', category: 'Stock', exchange: 'NSE', lotSize: 125 },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2850 },
  { symbol: 'TRENT', name: 'Trent Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100, aliases: ['zudio', 'westside'] },

  // === High Momentum, Next 50 & Popular Retail Stocks ===
  { symbol: 'ZOMATO', name: 'Zomato Ltd', category: 'Stock', exchange: 'NSE', aliases: ['blinkit'] },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd', category: 'Stock', exchange: 'NSE', aliases: ['jio'] },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150, aliases: ['defense'] },
  { symbol: 'DLF', name: 'DLF Ltd', category: 'Stock', exchange: 'NSE', lotSize: 825 },
  { symbol: 'VEDL', name: 'Vedanta Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1150 },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1500 },
  { symbol: 'PFC', name: 'Power Finance Corporation', category: 'Stock', exchange: 'NSE', lotSize: 1300 },
  { symbol: 'REC', name: 'REC Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1500 },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2625 },
  { symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism', category: 'Stock', exchange: 'NSE', lotSize: 875 },
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders', category: 'Stock', exchange: 'NSE' },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'GRSE', name: 'Garden Reach Shipbuilders & Engineers', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BDL', name: 'Bharat Dynamics Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SUZLON', name: 'Suzlon Energy Ltd', category: 'Stock', exchange: 'NSE', aliases: ['wind energy'] },
  { symbol: 'CDSL', name: 'Central Depository Services India', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BSE', name: 'BSE Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MCX', name: 'Multi Commodity Exchange of India', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ANGELONE', name: 'Angel One Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MOTILALOFS', name: 'Motilal Oswal Financial Services', category: 'Stock', exchange: 'NSE' },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100 },
  { symbol: 'KEI', name: 'KEI Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RRKABEL', name: 'R R Kabel Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'DIXON', name: 'Dixon Technologies Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100 },
  { symbol: 'KAYNES', name: 'Kaynes Technology India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SYRMA', name: 'Syrma SGS Technology Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100 },
  { symbol: 'COFORGE', name: 'Coforge Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100 },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', category: 'Stock', exchange: 'NSE', lotSize: 275 },
  { symbol: 'LTTS', name: 'L&T Technology Services Ltd', category: 'Stock', exchange: 'NSE', lotSize: 100 },
  { symbol: 'CYIENT', name: 'Cyient Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment & Fin', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', category: 'Stock', exchange: 'NSE', lotSize: 550 },
  { symbol: 'MANAPPURAM', name: 'Manappuram Finance Ltd', category: 'Stock', exchange: 'NSE', lotSize: 3000 },
  { symbol: 'POONAWALLA', name: 'Poonawalla Fincorp Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'L&TFH', name: 'L&T Finance Holdings Ltd', category: 'Stock', exchange: 'NSE', lotSize: 4462 },
  { symbol: 'SUNDARMFIN', name: 'Sundaram Finance Ltd', category: 'Stock', exchange: 'NSE' },

  // === Banking Giants (Private & PSU) ===
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', category: 'Stock', exchange: 'NSE', lotSize: 2925, aliases: ['bob'] },
  { symbol: 'CANBK', name: 'Canara Bank', category: 'Stock', exchange: 'NSE', lotSize: 4500, aliases: ['canara'] },
  { symbol: 'PNB', name: 'Punjab National Bank', category: 'Stock', exchange: 'NSE', lotSize: 8000 },
  { symbol: 'UNIONBANK', name: 'Union Bank of India', category: 'Stock', exchange: 'NSE', lotSize: 5000 },
  { symbol: 'INDIANB', name: 'Indian Bank', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'IOB', name: 'Indian Overseas Bank', category: 'Stock', exchange: 'NSE' },
  { symbol: 'UCOBANK', name: 'UCO Bank', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CENTRALBK', name: 'Central Bank of India', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BANKINDIA', name: 'Bank of India', category: 'Stock', exchange: 'NSE', lotSize: 4500 },
  { symbol: 'MAHABANK', name: 'Bank of Maharashtra', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PSB', name: 'Punjab & Sind Bank', category: 'Stock', exchange: 'NSE' },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 7500, aliases: ['idfc'] },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 5000 },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2500 },
  { symbol: 'RBLBANK', name: 'RBL Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2500 },
  { symbol: 'YESBANK', name: 'Yes Bank Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SOUTHBANK', name: 'South Indian Bank Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KARURVYSYA', name: 'Karur Vysya Bank Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CUB', name: 'City Union Bank Ltd', category: 'Stock', exchange: 'NSE', lotSize: 3100 },
  { symbol: 'EQUITASBNK', name: 'Equitas Small Finance Bank', category: 'Stock', exchange: 'NSE' },
  { symbol: 'UJJIVANSFB', name: 'Ujjivan Small Finance Bank', category: 'Stock', exchange: 'NSE' },

  // === Railways, Infrastructure & Capital Goods ===
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'IRCON', name: 'Ircon International Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RITES', name: 'RITES Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RAILTEL', name: 'RailTel Corporation of India', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TITAGARH', name: 'Titagarh Rail Systems Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TEXRAIL', name: 'Texmaco Rail & Engineering', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JWL', name: 'Jupiter Wagons Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SIEMENS', name: 'Siemens Ltd', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'ABB', name: 'ABB India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 125 },
  { symbol: 'CUMMINSIND', name: 'Cummins India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'THERMAX', name: 'Thermax Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AIAENG', name: 'AIA Engineering Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SCHNEIDER', name: 'Schneider Electric Infrastructure', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KEC', name: 'KEC International Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KALPATPOWR', name: 'Kalpataru Projects International', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ENGINERSIN', name: 'Engineers India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NBCC', name: 'NBCC (India) Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NCC', name: 'NCC Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PNCINFRA', name: 'PNC Infratech Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'GRINFRA', name: 'G R Infraprojects Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KNRCON', name: 'KNR Constructions Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ASHOKA', name: 'Ashoka Buildcon Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'HBLPOWER', name: 'HBL Power Systems Ltd', category: 'Stock', exchange: 'NSE' },

  // === Energy, Power, Green & Renewables ===
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ADANIENSOL', name: 'Adani Energy Solutions Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ATGL', name: 'Adani Total Gas Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NHPC', name: 'NHPC Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SJVN', name: 'SJVN Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'IREDA', name: 'Indian Renewable Energy Dev Agency', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JSWENERGY', name: 'JSW Energy Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TORNTPOWER', name: 'Torrent Power Ltd', category: 'Stock', exchange: 'NSE', lotSize: 375 },
  { symbol: 'CESC', name: 'CESC Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'IEX', name: 'Indian Energy Exchange Ltd', category: 'Stock', exchange: 'NSE', lotSize: 3750 },
  { symbol: 'TATAINVEST', name: 'Tata Investment Corporation', category: 'Stock', exchange: 'NSE' },
  { symbol: 'INDOCO', name: 'Indoco Remedies Ltd', category: 'Stock', exchange: 'NSE' },

  // === Automotive & EV Ecosystem ===
  { symbol: 'EXIDEIND', name: 'Exide Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2400 },
  { symbol: 'AMARAJABAT', name: 'Amara Raja Energy & Mobility', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd', category: 'Stock', exchange: 'NSE', lotSize: 25 },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson International', category: 'Stock', exchange: 'NSE', lotSize: 4400 },
  { symbol: 'BHARATFORG', name: 'Bharat Forge Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'MRF', name: 'MRF Ltd', category: 'Stock', exchange: 'NSE', lotSize: 5 },
  { symbol: 'APOLLOTYRE', name: 'Apollo Tyres Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1700 },
  { symbol: 'CEATLTD', name: 'CEAT Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JKTYRE', name: 'JK Tyre & Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SONACOMS', name: 'Sona BLW Precision Forgings', category: 'Stock', exchange: 'NSE' },
  { symbol: 'UNOMINDA', name: 'Uno Minda Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TIINDIA', name: 'Tube Investments of India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ENDURANCE', name: 'Endurance Technologies Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CRAFTSMAN', name: 'Craftsman Automation Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'OLECTRA', name: 'Olectra Greentech Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JBMMA', name: 'JBM Auto Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ELECTCAST', name: 'Electrosteel Castings Ltd', category: 'Stock', exchange: 'NSE' },

  // === Metals & Mining ===
  { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power Ltd', category: 'Stock', exchange: 'NSE', lotSize: 625 },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 8000 },
  { symbol: 'NMDC', name: 'NMDC Ltd', category: 'Stock', exchange: 'NSE', lotSize: 4500 },
  { symbol: 'NATIONALUM', name: 'National Aluminium Co Ltd', category: 'Stock', exchange: 'NSE', lotSize: 7500 },
  { symbol: 'HINDCOPPER', name: 'Hindustan Copper Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'HINDZINC', name: 'Hindustan Zinc Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'APLAPOLLO', name: 'APL Apollo Tubes Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'JINDALSAW', name: 'Jindal Saw Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RATNAMANI', name: 'Ratnamani Metals & Tubes Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'WELCORP', name: 'Welspun Corp Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KIOCL', name: 'KIOCL Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MOIL', name: 'MOIL Ltd', category: 'Stock', exchange: 'NSE' },

  // === Oil, Gas & Petrochemicals ===
  { symbol: 'GAIL', name: 'GAIL (India) Ltd', category: 'Stock', exchange: 'NSE', lotSize: 4675 },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', category: 'Stock', exchange: 'NSE', lotSize: 9750 },
  { symbol: 'HINDPETRO', name: 'Hindustan Petroleum Corporation', category: 'Stock', exchange: 'NSE', lotSize: 2700 },
  { symbol: 'PETRONET', name: 'Petronet LNG Ltd', category: 'Stock', exchange: 'NSE', lotSize: 3000 },
  { symbol: 'IGL', name: 'Indraprastha Gas Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1375 },
  { symbol: 'MGL', name: 'Mahanagar Gas Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400 },
  { symbol: 'GUJGASLTD', name: 'Gujarat Gas Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1250 },
  { symbol: 'GSPL', name: 'Gujarat State Petronet Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'OIL', name: 'Oil India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CASTROLIND', name: 'Castrol India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AEGISCHEM', name: 'Aegis Logistics Ltd', category: 'Stock', exchange: 'NSE' },

  // === Pharma, Healthcare & Biotech ===
  { symbol: 'LUPIN', name: 'Lupin Ltd', category: 'Stock', exchange: 'NSE', lotSize: 425 },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd', category: 'Stock', exchange: 'NSE', lotSize: 550 },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'ZYDUSLIFE', name: 'Zydus Lifesciences Ltd', category: 'Stock', exchange: 'NSE', lotSize: 450 },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd', category: 'Stock', exchange: 'NSE', lotSize: 125 },
  { symbol: 'BIOCON', name: 'Biocon Ltd', category: 'Stock', exchange: 'NSE', lotSize: 2500 },
  { symbol: 'GLENMARK', name: 'Glenmark Pharmaceuticals Ltd', category: 'Stock', exchange: 'NSE', lotSize: 725 },
  { symbol: 'IPCALAB', name: 'IPCA Laboratories Ltd', category: 'Stock', exchange: 'NSE', lotSize: 650 },
  { symbol: 'ABBOTINDIA', name: 'Abbott India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 25 },
  { symbol: 'MANKIND', name: 'Mankind Pharma Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MEDANTA', name: 'Global Health Ltd (Medanta)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NH', name: 'Narayana Hrudayalaya Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KIMS', name: 'Krishna Institute of Medical Sciences', category: 'Stock', exchange: 'NSE' },
  { symbol: 'RAINBOW', name: 'Rainbow Childrens Medicare', category: 'Stock', exchange: 'NSE' },
  { symbol: 'LALPATHLAB', name: 'Dr. Lal PathLabs Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'METROPOLIS', name: 'Metropolis Healthcare Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400 },
  { symbol: 'SYNGENE', name: 'Syngene International Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'AJANTPHARM', name: 'Ajanta Pharma Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NATCOPHARM', name: 'Natco Pharma Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JBCHEPHARM', name: 'J.B. Chemicals & Pharmaceuticals', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SUVENPHAR', name: 'Suven Pharmaceuticals Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ERIS', name: 'Eris Lifesciences Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'GLAND', name: 'Gland Pharma Ltd', category: 'Stock', exchange: 'NSE' },

  // === FMCG, Consumption & Retail ===
  { symbol: 'VBL', name: 'Varun Beverages Ltd', category: 'Stock', exchange: 'NSE', aliases: ['pepsi'] },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'DABUR', name: 'Dabur India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1250 },
  { symbol: 'MARICO', name: 'Marico Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1200, aliases: ['parachute', 'saffola'] },
  { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Ltd', category: 'Stock', exchange: 'NSE', lotSize: 200 },
  { symbol: 'PGHH', name: 'Procter & Gamble Hygiene and Health', category: 'Stock', exchange: 'NSE' },
  { symbol: 'EMAMILTD', name: 'Emami Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JYOTHYLAB', name: 'Jyothy Labs Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PATANJALI', name: 'Patanjali Foods Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AWL', name: 'Adani Wilmar Ltd', category: 'Stock', exchange: 'NSE', aliases: ['fortune'] },
  { symbol: 'UBL', name: 'United Breweries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400, aliases: ['kingfisher'] },
  { symbol: 'MCDOWELL-N', name: 'United Spirits Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500, aliases: ['diageo'] },
  { symbol: 'RADICO', name: 'Radico Khaitan Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SULA', name: 'Sula Vineyards Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1250, aliases: ['dominos'] },
  { symbol: 'DEVYANI', name: 'Devyani International Ltd', category: 'Stock', exchange: 'NSE', aliases: ['kfc', 'pizza hut'] },
  { symbol: 'WESTLIFE', name: 'Westlife Foodworld Ltd', category: 'Stock', exchange: 'NSE', aliases: ['mcdonalds'] },
  { symbol: 'SAPPHIRE', name: 'Sapphire Foods India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd (DMart)', category: 'Stock', exchange: 'NSE', aliases: ['dmart'] },

  // === Textiles, Apparels & Footwear ===
  { symbol: 'PAGEIND', name: 'Page Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 15, aliases: ['jockey'] },
  { symbol: 'RAYMOND', name: 'Raymond Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'VEDANTFASH', name: 'Vedant Fashions Ltd (Manyavar)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KPRMILL', name: 'K.P.R. Mill Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TRIDENT', name: 'Trident Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ALOKINDS', name: 'Alok Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CAMPUS', name: 'Campus Activewear Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BATAINDIA', name: 'Bata India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 375 },
  { symbol: 'RELAXO', name: 'Relaxo Footwears Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'METROBRAND', name: 'Metro Brands Ltd', category: 'Stock', exchange: 'NSE' },

  // === Real Estate & Building Materials ===
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd', category: 'Stock', exchange: 'NSE', lotSize: 475 },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd', category: 'Stock', exchange: 'NSE', lotSize: 700 },
  { symbol: 'PHOENIXLTD', name: 'The Phoenix Mills Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BRIGADE', name: 'Brigade Enterprises Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SOBHA', name: 'Sobha Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SIGNATURE', name: 'Signatureglobal (India) Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'LODHA', name: 'Macrotech Developers Ltd (Lodha)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KOLTEPATIL', name: 'Kolte-Patil Developers Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SUNTECK', name: 'Sunteck Realty Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', category: 'Stock', exchange: 'NSE', lotSize: 900 },
  { symbol: 'ACC', name: 'ACC Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'DALBHARAT', name: 'Dalmia Bharat Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', category: 'Stock', exchange: 'NSE', lotSize: 25 },
  { symbol: 'RAMCOCEM', name: 'The Ramco Cements Ltd', category: 'Stock', exchange: 'NSE', lotSize: 850 },
  { symbol: 'JKCEMENT', name: 'JK Cement Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'STARCEMENT', name: 'Star Cement Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ASTRAL', name: 'Astral Ltd', category: 'Stock', exchange: 'NSE', lotSize: 400 },
  { symbol: 'SUPREMEIND', name: 'Supreme Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'FINPIPE', name: 'Finolex Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PRINCEPIPE', name: 'Prince Pipes and Fittings Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250, aliases: ['fevicol'] },
  { symbol: 'BERGEPAINT', name: 'Berger Paints India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1100 },
  { symbol: 'KANSAINER', name: 'Kansai Nerolac Paints Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KAJARIACER', name: 'Kajaria Ceramics Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CERA', name: 'Cera Sanitaryware Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CENTURYPLY', name: 'Century Plyboards (India) Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'GREENPANEL', name: 'Greenpanel Industries Ltd', category: 'Stock', exchange: 'NSE' },

  // === Chemicals & Agrochemicals ===
  { symbol: 'SRF', name: 'SRF Ltd', category: 'Stock', exchange: 'NSE', lotSize: 375 },
  { symbol: 'NAVINFLUOR', name: 'Navin Fluorine International', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'AARTIIND', name: 'Aarti Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'TATACHEM', name: 'Tata Chemicals Ltd', category: 'Stock', exchange: 'NSE', lotSize: 550 },
  { symbol: 'ATUL', name: 'Atul Ltd', category: 'Stock', exchange: 'NSE', lotSize: 75 },
  { symbol: 'COROMANDEL', name: 'Coromandel International Ltd', category: 'Stock', exchange: 'NSE', lotSize: 700 },
  { symbol: 'PIIND', name: 'PI Industries Ltd', category: 'Stock', exchange: 'NSE', lotSize: 250 },
  { symbol: 'UPL', name: 'UPL Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1300 },
  { symbol: 'BAYERCROP', name: 'Bayer CropScience Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SUMICHEM', name: 'Sumitomo Chemical India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CLEAN', name: 'Clean Science and Technology', category: 'Stock', exchange: 'NSE' },
  { symbol: 'FINEORG', name: 'Fine Organic Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'FLUOROCHEM', name: 'Gujarat Fluorochemicals Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ANURAS', name: 'Anupam Rasayan India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CASTROL', name: 'Castrol India Ltd', category: 'Stock', exchange: 'NSE' },

  // === New-Age Tech, Internet, Media & Aviation ===
  { symbol: 'PAYTM', name: 'One 97 Communications (Paytm)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures (Nykaa)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'DELHIVERY', name: 'Delhivery Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'POLICYBZR', name: 'PB Fintech Ltd (PolicyBazaar)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'IDEA', name: 'Vodafone Idea Ltd', category: 'Stock', exchange: 'NSE', aliases: ['vi'] },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd (IndiGo)', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'SPICEJET', name: 'SpiceJet Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'PVRINOX', name: 'PVR INOX Ltd', category: 'Stock', exchange: 'NSE', lotSize: 407 },
  { symbol: 'ZEEL', name: 'Zee Entertainment Enterprises', category: 'Stock', exchange: 'NSE', lotSize: 3000 },
  { symbol: 'SUNTV', name: 'Sun TV Network Ltd', category: 'Stock', exchange: 'NSE', lotSize: 1500 },
  { symbol: 'NETWORK18', name: 'Network18 Media & Investments', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TV18BRDCST', name: 'TV18 Broadcast Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AFFLE', name: 'Affle (India) Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ROUTE', name: 'Route Mobile Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TANLA', name: 'Tanla Platforms Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JUSTDIAL', name: 'Just Dial Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'NAUKRI', name: 'Info Edge (India) Ltd (Naukri)', category: 'Stock', exchange: 'NSE', lotSize: 150 },
  { symbol: 'INDMART', name: 'IndiaMART InterMESH Ltd', category: 'Stock', exchange: 'NSE', lotSize: 300 },
  { symbol: 'CARTRADE', name: 'CarTrade Tech Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'EASEMYTRIP', name: 'Easy Trip Planners Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MAPMYINDIA', name: 'C.E. Info Systems (MapMyIndia)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'HONASA', name: 'Honasa Consumer Ltd (Mamaearth)', category: 'Stock', exchange: 'NSE' },

  // === Hotels, Leisure & Jewellery ===
  { symbol: 'INDHOTEL', name: 'The Indian Hotels Company (Taj)', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'EIHOTEL', name: 'EIH Ltd (Oberoi Hotels)', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CHALET', name: 'Chalet Hotels Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'LEMONTree', name: 'Lemon Tree Hotels Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SENCO', name: 'Senco Gold Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'VAIBHAVGBL', name: 'Vaibhav Global Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'THANGAMAYL', name: 'Thangamayil Jewellery Ltd', category: 'Stock', exchange: 'NSE' },

  // === Electricals, Consumer Durables & Electronics ===
  { symbol: 'HAVELLS', name: 'Havells India Ltd', category: 'Stock', exchange: 'NSE', lotSize: 500 },
  { symbol: 'VOLTAS', name: 'Voltas Ltd', category: 'Stock', exchange: 'NSE', lotSize: 600 },
  { symbol: 'BLUESTARCO', name: 'Blue Star Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'WHIRLPOOL', name: 'Whirlpool of India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer Electricals', category: 'Stock', exchange: 'NSE', lotSize: 1800 },
  { symbol: 'ORIENTELEC', name: 'Orient Electric Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'AMBER', name: 'Amber Enterprises India Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'SYMPHONY', name: 'Symphony Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'VGUARD', name: 'V-Guard Industries Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'BAJAJELEC', name: 'Bajaj Electricals Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'FINCABLES', name: 'Finolex Cables Ltd', category: 'Stock', exchange: 'NSE' },

  // === Paper, Packaging & Logistics ===
  { symbol: 'CONCOR', name: 'Container Corporation of India', category: 'Stock', exchange: 'NSE', lotSize: 1000 },
  { symbol: 'BLUEDART', name: 'Blue Dart Express Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'TCIEXP', name: 'TCI Express Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'MAHLOG', name: 'Mahindra Logistics Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'ALLCARGO', name: 'Allcargo Logistics Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'VRLLOG', name: 'VRL Logistics Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'JKPAPER', name: 'JK Paper Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'WESTCOASTP', name: 'West Coast Paper Mills Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'POLYPLEX', name: 'Polyplex Corporation Ltd', category: 'Stock', exchange: 'NSE' },
  { symbol: 'UFlex', name: 'UFLEX Ltd', category: 'Stock', exchange: 'NSE' },
];

const CUSTOM_STORAGE_KEY = 'tradedairy_custom_instruments';

export function getCustomInstruments(): InstrumentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomInstrument(item: InstrumentItem): InstrumentItem[] {
  const existing = getCustomInstruments();
  const cleanSymbol = item.symbol.trim().toUpperCase();
  const alreadyExists = existing.some(
    (e) => e.symbol.toUpperCase() === cleanSymbol
  );

  const formattedItem: InstrumentItem = {
    ...item,
    symbol: cleanSymbol,
    category: item.category || 'Custom',
    exchange: item.exchange || 'NSE',
  };

  const updated = alreadyExists
    ? existing.map((e) => (e.symbol.toUpperCase() === cleanSymbol ? formattedItem : e))
    : [formattedItem, ...existing];

  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom instrument', e);
  }
  return updated;
}

export function deleteCustomInstrument(symbol: string): InstrumentItem[] {
  const existing = getCustomInstruments();
  const clean = symbol.trim().toUpperCase();
  const updated = existing.filter((e) => e.symbol.toUpperCase() !== clean);
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom instrument', e);
  }
  return updated;
}

export function searchInstruments(query: string): InstrumentItem[] {
  const custom = getCustomInstruments();
  const all = [...custom, ...MAJOR_INDICES, ...TOP_STOCKS];

  if (!query || !query.trim()) {
    // Return top popular indices and active heavyweights first
    return all.slice(0, 35);
  }

  const clean = query.trim().toUpperCase();
  const cleanNoSpaces = clean.replace(/[\s\-_]+/g, '');

  const exact: InstrumentItem[] = [];
  const startsWith: InstrumentItem[] = [];
  const aliasMatch: InstrumentItem[] = [];
  const includes: InstrumentItem[] = [];

  for (const item of all) {
    const sym = item.symbol.toUpperCase();
    const symNoSpaces = sym.replace(/[\s\-_]+/g, '');
    const name = item.name.toUpperCase();
    const aliases = (item.aliases || []).map((a) => a.toUpperCase());

    // 1. Exact match (with or without spaces, e.g. "BANK NIFTY" === "BANKNIFTY")
    if (sym === clean || symNoSpaces === cleanNoSpaces) {
      exact.push(item);
      continue;
    }

    // 2. Starts with symbol
    if (sym.startsWith(clean) || symNoSpaces.startsWith(cleanNoSpaces)) {
      startsWith.push(item);
      continue;
    }

    // 3. Alias match (e.g. "bank nifty" matches BANKNIFTY aliases)
    const matchesAlias = aliases.some(
      (a) => a === clean || a.replace(/[\s\-_]+/g, '') === cleanNoSpaces || a.includes(clean)
    );
    if (matchesAlias) {
      aliasMatch.push(item);
      continue;
    }

    // 4. Includes anywhere in symbol or descriptive name
    if (sym.includes(clean) || name.includes(clean) || symNoSpaces.includes(cleanNoSpaces)) {
      includes.push(item);
    }
  }

  // Deduplicate results while keeping priority
  const seen = new Set<string>();
  const combined: InstrumentItem[] = [];

  for (const item of [...exact, ...startsWith, ...aliasMatch, ...includes]) {
    const key = item.symbol.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
    if (combined.length >= 60) break;
  }

  return combined;
}
