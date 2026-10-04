'use client';
import { TradeProvider } from '../../context/TradeContext';
import { AppShell } from '../layout/AppShell';
import Dashboard from '../../app/dashboard-view';
export default function WorkspaceHome(){return <TradeProvider><AppShell><Dashboard/></AppShell></TradeProvider>;}

