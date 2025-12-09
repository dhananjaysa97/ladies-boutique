'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'leenas-visitor-id';

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return undefined;
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useTrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window === 'undefined') return;

    const sessionId = getOrCreateSessionId();

    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        userAgent: window.navigator.userAgent,
      }),
    }).catch(err => {
      console.error('Visit tracking failed', err);
    });
  }, [pathname]);
}
