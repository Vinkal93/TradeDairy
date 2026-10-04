import type { MetadataRoute } from 'next';
import { SITE_URL, isPreview } from '../lib/seo';
export default function robots():MetadataRoute.Robots {
 if(isPreview)return {rules:{userAgent:'*',disallow:'/'},sitemap:SITE_URL+'/sitemap.xml'};
 return {rules:[{userAgent:'*',allow:'/',disallow:'/api/'},{userAgent:['OAI-SearchBot','ChatGPT-User','PerplexityBot'],allow:'/',disallow:'/api/'}],sitemap:SITE_URL+'/sitemap.xml',host:SITE_URL};
}

