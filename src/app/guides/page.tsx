import Link from 'next/link';
import { PublicShell } from '../../components/public/PublicShell';
import { guides } from '../../lib/public-content';
import { pageMetadata } from '../../lib/seo';
export const metadata=pageMetadata('Trading Journal Guides & Performance Basics','Practical guides to trading journal templates, net P&L after costs and performance metrics. Learn a consistent record-keeping routine.','/guides');
export default function GuidesPage(){return <PublicShell><h1 className="text-3xl sm:text-5xl font-semibold">Trading journal guides</h1><p className="text-on-surface-variant mt-5 max-w-3xl leading-relaxed">Practical guides for recording executions, reconciling costs and reviewing your trading history. Educational information for record keeping, not investment recommendations.</p><div className="grid md:grid-cols-3 gap-6 mt-10">{Object.entries(guides).map(([slug,g])=><Link key={slug} className="card" href={'/guides/'+slug}><h2 className="section-title">{g.title}</h2><p className="text-sm text-outline mt-4 leading-relaxed">{g.description}</p><span className="text-primary text-sm block mt-5">Read guide →</span></Link>)}</div></PublicShell>;}

