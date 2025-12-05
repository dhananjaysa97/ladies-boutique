'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    (async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (e) {
        // ignore errors
        console.error('Visit tracking failed', e);
      }
    })();
  }, [pathname]);

  return null;
}
