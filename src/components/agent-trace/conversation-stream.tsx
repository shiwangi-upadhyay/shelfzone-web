import { SessionEvent } from '@/hooks/use-session-events';
import { EventCard } from './event-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationStreamProps {
  events: SessionEvent[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ConversationStream({
  events,
  isLoading,
  emptyMessage = 'No events yet',
}: ConversationStreamProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </ScrollArea>
  );
}
