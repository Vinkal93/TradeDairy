'use client';
import { useTrades, TimeframeFilter } from '../../context/TradeContext';
import { fieldClass } from './ChargeEditor';
export function TradeFilters() {
  const { accounts, selectedAccount, setSelectedAccount, selectedTimeframe, setTimeframe } = useTrades();
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
    <label className="sr-only" htmlFor="timeframe">Timeframe</label><select id="timeframe" className={fieldClass} value={selectedTimeframe} onChange={e => setTimeframe(e.target.value as TimeframeFilter)}>{['Today', 'This Week', 'This Month', 'This Year', 'All Time'].map(t => <option key={t}>{t}</option>)}</select>
    <label className="sr-only" htmlFor="account-filter">Account</label><select id="account-filter" className={fieldClass} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}><option value="ALL">All accounts</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}</select>
  </div>;
}
