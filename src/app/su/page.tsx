import { adminConfigured, isAdminSession } from '../../lib/adminAuth';
import { AdminPortal } from './portal';
export const metadata = { title: 'Private administration', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function SuperAdminPage() { return <AdminPortal configured={adminConfigured()} authenticated={isAdminSession()} />; }
