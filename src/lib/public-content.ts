export const topics = {
  "trading-journal": {
    "title": "Trading Journal for Stocks, Futures & Options",
    "description": "Record actual trades, account brokerage, net P&L, trading notes and daily reflections in TradeDairy’s online trading journal.",
    "intro": "A trading journal brings execution facts and decision notes together. TradeDairy helps you record trades, understand their costs and review your own process across a ledger, calendar and performance dashboard.",
    "sections": [
      [
        "Record the essentials without a long form",
        "Choose your account, instrument, date, direction and quantity. Enter actual buy and sell prices. Quick Log keeps entry short; Basic entry lets you add optional timing, stop loss, target, setup, emotion and notes. Leaving the exit blank records an open position, without inventing a realised result."
      ],
      [
        "Measure the result after fees",
        "Gross profit can hide transaction costs. Save account-specific per-order brokerage and estimate applicable STT, exchange fees, SEBI fees, stamp duty and GST for regular Indian equity and F&O trades. Broker rounding and special settlement can differ, so use the actual contract-note total for exact records."
      ],
      [
        "Review your records in one workspace",
        "Saved trades feed the ledger, dashboard, calendar and analytics. Filter by trading account and timeframe. Monetary comparisons should use the same currency; INR and USD results are not meaningfully added without an exchange-rate conversion. Export a CSV or backup when you need a portable copy."
      ],
      [
        "Write down the decision, not just the price",
        "The daily journal supports a pre-market plan and a post-market reflection. Explain why you entered, what changed, and whether you followed the intended risk plan. A useful review can identify a process issue even when a trade made money. No journal can promise better returns."
      ]
    ],
    "faqs": [
      [
        "What is a trading journal?",
        "A trading journal records entries, exits, position sizes, costs and the reasons behind trades. It provides a consistent history for reviewing decisions and performance."
      ],
      [
        "Can TradeDairy record short trades?",
        "Yes. Select Sell first, enter the entry sell price and the exit buy-back price, and record the actual quantity and charges."
      ],
      [
        "Does adding an account connect to my broker?",
        "No. Account records and optional saved credentials do not place orders or establish a broker integration."
      ],
      [
        "Does TradeDairy provide investment advice?",
        "No. TradeDairy supports record keeping and review. It does not recommend securities, promise returns or replace a broker contract note."
      ]
    ]
  },
  "intraday-trading-journal": {
    "title": "Intraday Trading Journal for Daily Trade Reviews",
    "description": "Journal intraday equity trades with actual prices, quantity, brokerage and net P&L. Review each session through TradeDairy’s calendar and daily journal.",
    "intro": "An intraday journal keeps the session’s execution facts and trading decisions together. Record actual prices and costs, then review the day without reconstructing it from memory.",
    "sections": [
      [
        "Record a long or short intraday trade",
        "Choose Equity · Intraday and the relevant trading account. Buy first records a long trade; Sell first records a short trade. Enter the instrument, date and units traded. Use actual execution prices rather than intended prices. An exit price closes the journal record; leaving it blank keeps the position open."
      ],
      [
        "Count orders correctly",
        "With flat per-order brokerage, one buy and one sell count as two executed orders. Multiple fills within one order are not necessarily separate chargeable orders. For separate orders, adjust the buy and sell order counts. Brokerage caps, percentage pricing and taxes can depend on the account and instrument."
      ],
      [
        "Make daily review practical",
        "Write a short pre-market plan and an end-of-day reflection. Optional setup, emotion and rule-following notes connect the execution to its context. Record uncertainty when you cannot recall a detail. Reviewing a losing trade is easier when the note describes what happened instead of trying to justify it afterwards."
      ],
      [
        "Read the daily result in context",
        "Calendar totals and daily bars summarise recorded net P&L. A profitable day does not prove a strategy works. Keep missing records, costs and sample size in mind, and compare the same account and currency over a consistent period. Contract-note reconciliation helps keep the review accurate."
      ]
    ],
    "faqs": [
      [
        "Can Quick Log be used for intraday trades?",
        "Yes. Quick Log records essential account, price, quantity and charge details. Optional notes can be added during review."
      ],
      [
        "Are intraday charges a fixed extra amount?",
        "No. Charges depend on turnover, segment, exchange, date and brokerage settings. Use the actual contract note when exact fees are required."
      ]
    ]
  },
  "options-trading-journal": {
    "title": "Options Trading Journal with Brokerage & Net P&L",
    "description": "Record options premium trades with actual quantity, buy and sell prices, per-order brokerage and net profit after transaction charges.",
    "intro": "An options journal should show the premium paid or received, the quantity traded and the costs that changed the result. TradeDairy records both buy-first and sell-first options premium trades.",
    "sections": [
      [
        "Use a clear contract name",
        "Include the underlying, expiry, strike and call or put in the instrument name. Similar contracts may have different expiries. The instrument field is your own record; it does not validate a live exchange symbol or fetch an option chain. Clear labels make later review and CSV exports easier to interpret."
      ],
      [
        "Quantity means units, not lots",
        "Multiply the number of lots by the applicable contract lot size. Lot sizes can change, so check the actual contract. Gross P&L for a buy-first premium trade is sell premium minus buy premium, multiplied by units. A sell-first trade uses entry sell premium minus exit buy premium."
      ],
      [
        "Reconcile premium trades and settlement",
        "Regular premium buy and sell estimates use the configured brokerage and relevant transaction charges. Exercised options and special settlement can involve different tax treatment. Do not assume a normal premium-trade estimate includes those costs; enter the contract-note total for an exact journal record."
      ],
      [
        "Keep multi-leg notes explicit",
        "Record each leg separately and use notes to link related legs. TradeDairy does not currently calculate a combined strategy payoff, option Greeks or live mark-to-market values. Account and timeframe filters help you review the entered history, but incomplete legs can make a strategy-level result misleading."
      ]
    ],
    "faqs": [
      [
        "Can I record an option sell?",
        "Yes. Use Sell first, record sold premium as entry and buy-back premium as exit, then enter actual units and costs."
      ],
      [
        "Does the journal calculate live Greeks?",
        "No. It works with the execution prices and details you enter, rather than a live options data feed."
      ]
    ]
  }
};
export const guides = {
  "trading-journal-template": {
    "title": "Trading Journal Template: What to Record for Every Trade",
    "description": "A practical trading journal template with execution fields, account charges, setup, risk notes and a repeatable daily review workflow.",
    "intro": "A useful journal template is short enough to fill consistently and detailed enough to explain the result. Begin with execution facts, then add the reasoning you will need during review.",
    "sections": [
      [
        "Essential execution fields",
        "Record date, account, instrument, segment, direction, quantity, entry price, exit price and charges. When a position is still open, leave the exit blank. Keep realised results separate from estimates for open positions. Use complete instrument labels, including expiry and strike where relevant."
      ],
      [
        "Decision and risk fields",
        "Add an entry reason or setup, an intended stop loss and target, whether the plan was followed and a short note about any change. Emotion labels may help you review patterns, but are not diagnoses. Do not invent missing information; an honest blank is more useful than a guessed explanation."
      ],
      [
        "A repeatable daily workflow",
        "Before the session, write the plan. After execution, record the basics. Once the contract note arrives, reconcile costs. At the end of the day, reflect on decisions. During weekly review, compare trades from the same account and currency and check for missing records before interpreting the metrics."
      ],
      [
        "Using the template in TradeDairy",
        "Basic entry includes optional timing, risk and notes. Quick Log focuses on essentials. Both save into the same ledger and feed the calendar and dashboard. Export a CSV for an independent copy; use the full backup when you need fields that may not be represented in a spreadsheet."
      ]
    ]
  },
  "how-to-calculate-net-pnl": {
    "title": "How to Calculate Net Trading P&L After Brokerage & Taxes",
    "description": "Understand buy-first and sell-first profit formulas, per-order brokerage and the difference between gross and net P&L after transaction costs.",
    "intro": "Gross P&L describes the price result. Net P&L subtracts execution costs. Use actual prices, actual units and the broker’s contract note when an exact result is required.",
    "sections": [
      [
        "The closed-trade formulas",
        "Buy-first gross P&L = (sell price − buy price) × quantity. Sell-first gross P&L = (entry sell price − exit buy price) × quantity. Net P&L = gross P&L − total transaction charges. These formulas describe a closed trade, not the live value of an open position."
      ],
      [
        "An illustrative calculation",
        "Buying 50 units at ₹100 and selling at ₹110 produces ₹500 gross profit. If actual total costs are ₹35, net profit is ₹465. The ₹35 is an illustrative contract-note total, not a tax quotation. A trade with ₹10 gross profit and ₹35 costs is a ₹25 net loss."
      ],
      [
        "Brokerage is one part of the cost",
        "At flat ₹10 per executed order, one buy and one sell produce ₹20 brokerage before applicable taxes and other fees. At ₹20 per order, the same pair produces ₹40 brokerage. STT, exchange fees, SEBI fees, stamp duty and GST depend on segment, turnover, date and settings; they are not a universal extra ₹8 or ₹9."
      ],
      [
        "Reconcile the estimate with the contract note",
        "Normal Indian equity and F&O estimates can differ from broker rounding and special settlement. DP charges can apply to delivery sales, while exercised options need separate treatment. Use your actual charge total for exact records. The calculator is a record-keeping aid, not a tax filing or investment advisory service."
      ]
    ]
  },
  "trading-performance-metrics": {
    "title": "Trading Performance Metrics: Win Rate, Profit Factor & Drawdown",
    "description": "Interpret win rate, net P&L, average wins and losses, profit factor and drawdown when reviewing your trading journal.",
    "intro": "Metrics summarise a set of records. Their usefulness depends on accurate costs, consistent currencies, complete entries and enough observations to support a comparison.",
    "sections": [
      [
        "Win rate and net outcome",
        "Win rate is winning closed trades divided by all closed trades, multiplied by 100. A net win is profitable after fees. Open trades are excluded and breakeven closed trades remain in the denominator. A high win rate does not imply overall profitability if losses are much larger than wins."
      ],
      [
        "Average results and profit factor",
        "Average win is the mean positive net result; average loss is the magnitude of the mean negative net result. Profit factor is the sum of positive net results divided by the magnitude of negative net results. With wins and no losses, the ratio is unbounded. That does not demonstrate reliability or predict future outcomes."
      ],
      [
        "Cumulative P&L and drawdown",
        "A cumulative net P&L curve adds closed-trade results in order. Drawdown measures a fall from a previous peak. TradeDairy’s recorded curve describes the history entered in the journal. It is not a complete broker equity curve including deposits, withdrawals, margin balances or unrealised positions."
      ],
      [
        "Compare like with like",
        "Use the same account, currency and review period. Do not combine INR and USD results without a specified conversion. Missing losing trades or fees distort the statistics. A few trades may look impressive by chance, so treat small samples as incomplete evidence and review the decision process alongside the numbers."
      ]
    ]
  }
};

