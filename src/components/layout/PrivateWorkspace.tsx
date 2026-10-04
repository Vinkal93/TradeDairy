'use client';
import { TradeProvider } from '../../context/TradeContext';
import { AppShell } from './AppShell';
export default function PrivateWorkspace({children}:{children:React.ReactNode}){return <TradeProvider><AppShell>{children}</AppShell></TradeProvider>;}

