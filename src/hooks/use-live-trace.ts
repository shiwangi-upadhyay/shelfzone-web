'use client';

import { useEffect, useRef, useState } from 'react';

export function useLiveTrace(traceId: string | null, enabled = false) {
  const [events, setEvents] = useState<unknown[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!traceId || !enabled) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const es = new EventSource(`${apiUrl}/api/traces/${traceId}/stream`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents(prev => [...prev, data]);
      } catch {}
    };

    es.onerror = () => { es.close(); };

    return () => { es.close(); };
  }, [traceId, enabled]);

  return { events };
}
