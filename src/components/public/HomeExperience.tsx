'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const WorkspaceHome=dynamic(()=>import('./WorkspaceHome'),{loading:()=> <p className="p-8">Loading your dashboard…</p>});
export function HomeExperience({children}:{children:React.ReactNode}) {
 const [workspace,setWorkspace]=useState(false);
 useEffect(()=>{try{setWorkspace(JSON.parse(localStorage.getItem('tradedairy_user')||'{}').isLoggedIn===true);}catch{}},[]);
 return workspace?<WorkspaceHome/>:<>{children}</>;
}

