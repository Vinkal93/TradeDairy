import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicShell } from '../../../components/public/PublicShell';
import { guides } from '../../../lib/public-content';
import { pageMetadata, SITE_URL, serializeJsonLd } from '../../../lib/seo';
export const dynamicParams = false;
export function generateStaticParams(){return Object.keys(guides).map(slug=>({slug}));}
function getGuide(slug:string){if(!Object.prototype.hasOwnProperty.call(guides,slug))notFound();return guides[slug as keyof typeof guides];}
export function generateMetadata({params}:{params:{slug:string}}):Metadata {const g=getGuide(params.slug);return pageMetadata(g.title,g.description,'/guides/'+params.slug);}
export default function GuidePage({params}:{params:{slug:string}}){
 const g=getGuide(params.slug),url=SITE_URL+'/guides/'+params.slug;
 const schema={'@context':'https://schema.org','@graph':[{'@type':'Article',headline:g.title,description:g.description,mainEntityOfPage:url,author:{'@type':'Organization',name:'TradeDairy',url:SITE_URL},publisher:{'@type':'Organization',name:'TradeDairy',url:SITE_URL},image:SITE_URL+'/social-card.png'},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:'Guides',item:SITE_URL+'/guides'},{'@type':'ListItem',position:3,name:g.title,item:url}]}]};
 return <PublicShell><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/><article className="max-w-3xl mx-auto"><Link href="/guides" className="text-primary text-sm">← Trading guides</Link><h1 className="text-3xl sm:text-4xl leading-tight font-semibold mt-6">{g.title}</h1><p className="text-sm text-outline mt-4">By TradeDairy · Educational guide</p><p className="text-lg text-on-surface-variant leading-relaxed mt-7">{g.intro}</p>{g.sections.map(([title,text])=><section key={title} className="mt-9"><h2 className="text-xl font-semibold">{title}</h2><p className="leading-relaxed text-on-surface-variant mt-3">{text}</p></section>)}{params.slug==='how-to-calculate-net-pnl'&&<p className="text-sm mt-8 text-outline">Transaction-charge reference: <a className="text-primary underline" href="https://zerodha.com/charges" rel="noreferrer" target="_blank">Zerodha’s published charge schedule</a>. Check your broker’s current contract note.</p>}<nav className="border-t border-surface-container mt-10 pt-6 flex flex-wrap gap-5 text-primary text-sm" aria-label="Next steps"><Link href="/trading-journal">Explore the journal →</Link><Link href="/brokerage-calculator">Try the charges calculator →</Link><Link href="/guides">More guides →</Link></nav></article></PublicShell>;
}

