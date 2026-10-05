'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const WorkspaceHome = dynamic(() => import('./WorkspaceHome'), {
  loading: () => <p className="p-8 text-sm text-outline">Loading your dashboard…</p>,
});

export function HomeExperience({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tradedairy_user') || '{}');
      if (stored.isLoggedIn === true) {
        if (stored.isOnboarded === true) {
          setWorkspace(true);
        } else {
          router.replace('/onboarding');
        }
      }
    } catch {}
  }, [router]);

  return workspace ? <WorkspaceHome /> : <>{children}</>;
}
