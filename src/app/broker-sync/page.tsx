import Link from 'next/link';
export default function BrokerSyncPage() {
  return <div className="card max-w-xl mx-auto space-y-4"><h1 className="page-title">Broker import</h1><p className="text-sm text-on-surface-variant">Automatic broker sync is not connected. Record trades manually or import a TradeDairy CSV export.</p><div className="flex flex-wrap gap-3"><Link href="/add-trade" className="btn-primary">Record a trade</Link><Link href="/trades" className="btn-secondary">Import CSV</Link></div></div>;
}
