'use client';

import { useTrackVisit } from '@/hooks/useTrackeVisit'

export default function TrackVisitClient() {
  useTrackVisit();
  return null; // invisible component
}
