'use client';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { isPublicRoute } from '../../lib/seo';
const PrivateWorkspace=dynamic(()=>import('./PrivateWorkspace'),{loading:()=> <p className="p-8">Loading your workspace…</p>});
export function SiteFrame({children}:{children:React.ReactNode}) {
 const path=usePathname();
 return isPublicRoute(path)?<>{children}</>:<PrivateWorkspace>{children}</PrivateWorkspace>;
}

