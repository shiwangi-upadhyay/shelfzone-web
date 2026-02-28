import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { SessionEvent } from './use-session-events';

export function useLiveTrace(traceId: string) {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!traceId || !token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(
      `${apiUrl}/api/traces/${traceId}/live?token=${token}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const newEvent = JSON.parse(event.data) as SessionEvent;
        setEvents((prev) => [...prev, newEvent]);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setIsConnected(false);
      setError('Connection lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [traceId, token]);

  const clearEvents = () => setEvents([]);

  return {
    events,
    isConnected,
    error,
    clearEvents,
  };
}
