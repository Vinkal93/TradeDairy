import Link from 'next/link';
export default function NotFound() {
  return <div className="card max-w-lg mx-auto my-10 text-center space-y-4"><p className="text-sm text-outline">404</p><h1 className="page-title">Page not found</h1><p className="text-sm text-on-surface-variant">This page may have moved or the address is incorrect.</p><Link href="/" className="btn-primary inline-block">Go to dashboard</Link></div>;
}
