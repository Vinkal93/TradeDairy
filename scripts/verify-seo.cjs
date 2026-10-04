const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.argv[2] || 'http://localhost:3105').replace(/\/$/, '');
const origin = 'https://www.tradedairy.online';
const routes = ['/', '/trading-journal', '/intraday-trading-journal', '/options-trading-journal', '/brokerage-calculator', '/guides', '/guides/trading-journal-template', '/guides/how-to-calculate-net-pnl', '/guides/trading-performance-metrics', '/about', '/privacy'];
const privateRoutes = ['/accounts', '/add-trade', '/analytics', '/broker-sync', '/calendar', '/journal', '/login', '/onboarding', '/settings', '/settings/charges', '/su', '/trades'];
async function get(path, options={}) {
 const response = await fetch(base+path,{signal:AbortSignal.timeout(20000),...options});
 return {response,html:await response.text()};
}
(async()=>{
 const titles = new Set(), report=[];
 for (const path of routes) {
  const {response,html}=await get(path);
  assert.equal(response.status,200,path+' HTTP status');
  const readable=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  assert.equal((readable.match(/<h1\b/gi)||[]).length,1,path+' one server-rendered H1');
  const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  assert.ok(title&&!titles.has(title),path+' unique title'); titles.add(title);
  assert.ok(/<meta\b[^>]*name="description"[^>]*content="[^"]{50,}"/i.test(html),path+' description');
  const canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  assert.equal(canonical,origin+(path==='/'?'':path),path+' canonical');
  assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html),path+' public indexable');
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag')||''),path+' public header');
  assert.ok(/<meta\b[^>]*property="og:image"/i.test(html),path+' share image');
  assert.ok(/<meta\b[^>]*name="twitter:card"/i.test(html),path+' twitter card');
  const schemas=Array.from(html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)).map(m=>JSON.parse(m[1]));
  if(!['/guides','/about','/privacy'].includes(path)) assert.ok(schemas.length,path+' JSON-LD');
  assert.ok(readable.includes('href="/trading-journal"'),path+' linked public navigation');
  assert.ok(!readable.includes('href="/su"'),path+' admin not linked');
  report.push({path,status:response.status,title,canonical,schemas:schemas.length});
  console.log('PASS public '+path);
 }
 for(const path of privateRoutes){
  const {response,html}=await get(path);
  assert.equal(response.status,200,path+' private HTTP');
  assert.ok(/noindex/.test(response.headers.get('x-robots-tag')||''),path+' private noindex header');
  assert.ok(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html),path+' private noindex metadata');
  console.log('PASS private '+path);
 }
 const {html:sitemap}=await get('/sitemap.xml');
 const locations=Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map(m=>m[1]);
 assert.deepEqual(locations.sort(),routes.map(p=>origin+(p==='/'?'':p)).sort(),'public-only sitemap');
 assert.ok(!sitemap.includes('<lastmod>'),'no fabricated modification dates');
 const {html:robots}=await get('/robots.txt');
 assert.ok(robots.includes('OAI-SearchBot')&&robots.includes('Allow: /'),'search crawler access');
 assert.ok(robots.includes('Disallow: /api/'),'API excluded');
 assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'),'canonical sitemap');
 assert.ok(!robots.includes('/su'),'secret portal not advertised in robots');
 const {html:llms}=await get('/llms.txt');
 assert.ok(llms.includes(origin+'/trading-journal')&&!llms.includes('/su'),'public discovery summary');
 const missing=await get('/guides/not-a-real-guide'); assert.equal(missing.response.status,404,'unknown guide is 404');
 const http = require('node:http');
 const redirect = await new Promise((resolve,reject)=>{
  const req=http.get(base+'/trading-journal',{headers:{Host:'tradedairy.online'}},response=>{
   response.resume(); resolve({status:response.statusCode,location:response.headers.location});
  }); req.setTimeout(10000,()=>req.destroy(new Error('Redirect request timed out'))); req.on('error',reject);
 });
 assert.equal(redirect.status,308,'non-www redirect');
 assert.equal(redirect.location,origin+'/trading-journal','non-www canonical host');
 const image=await fetch(base+'/social-card.png',{signal:AbortSignal.timeout(20000)});
 assert.equal(image.status,200,'share image response');
 assert.ok(image.headers.get('content-type').includes('image/png'),'PNG share image');
 const png=Buffer.from(await image.arrayBuffer());
 assert.equal(png.readUInt32BE(16),1200,'image width'); assert.equal(png.readUInt32BE(20),630,'image height');
 fs.mkdirSync('artifacts',{recursive:true});
 fs.writeFileSync('artifacts/seo-verification.json',JSON.stringify({verifiedAt:new Date().toISOString(),base,publicPages:report,privateRoutes,status:'passed'},null,2));
 console.log('PASS sitemap, crawler rules, llms.txt, 404, canonical redirect and share image');
 console.log('SEO verification passed: '+routes.length+' public pages and '+privateRoutes.length+' private pages.');
})().catch(error=>{console.error(error);process.exitCode=1;});

