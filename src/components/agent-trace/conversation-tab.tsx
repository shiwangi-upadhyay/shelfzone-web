'use client';

import { useSessionEvents } from '@/hooks/use-session-events';
import { EventCard } from './event-card';
import { Skeleton } from '@/components/ui/skeleton';

export function ConversationTab({ sessionId }: { sessionId: string | null }) {
  const { data: events, isLoading } = useSessionEvents(sessionId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
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
