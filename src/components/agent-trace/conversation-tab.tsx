'use client';

import { useSessionEvents } from '@/hooks/use-session-events';
import { useAgentSessions } from '@/hooks/use-agent-sessions';
import { EventCard } from './event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export function ConversationTab({ sessionId, agentId }: { sessionId: string | null; agentId: string | null }) {
  // If sessionId is provided, use it directly
  // Otherwise, fetch most recent session for the agent
  const { data: sessions, isLoading: sessionsLoading } = useAgentSessions(sessionId ? null : agentId, { limit: 1 });
  const resolvedSessionId = sessionId || (sessions && sessions[0]?.id) || null;
  
  const { data: events, isLoading: eventsLoading } = useSessionEvents(resolvedSessionId);

  const isLoading = sessionId ? eventsLoading : (sessionsLoading || eventsLoading);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!resolvedSessionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No sessions found</p>
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No events yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
