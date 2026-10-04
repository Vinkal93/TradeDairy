'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TradeProvider } from '../../context/TradeContext';
import { AppShell } from '../layout/AppShell';
const Dashboard = dynamic(() => import('../../app/dashboard-view'), {loading: () => <p className="p-8">Loading your dashboard…</p>});
export function HomeExperience({children}: {children: React.ReactNode}) {
 const [workspace, setWorkspace] = useState(false);
 useEffect(() => {try {setWorkspace(JSON.parse(localStorage.getItem('tradedairy_user') || '{}').isLoggedIn === true);} catch {}}, []);
 return workspace ? <TradeProvider><AppShell><Dashboard /></AppShell></TradeProvider> : <>{children}</>;
}

