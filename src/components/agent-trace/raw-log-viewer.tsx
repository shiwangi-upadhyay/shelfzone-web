import { useState } from 'react';
import { SessionEvent } from '@/hooks/use-session-events';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RawLogViewerProps {
  events: SessionEvent[];
}

export function RawLogViewer({ events }: RawLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch =
      !searchQuery ||
      event.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const eventTypes = ['all', ...Array.from(new Set(events.map((e) => e.type)))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-1 font-mono text-xs">
          {filteredEvents.map((event) => {
            const isExpanded = expandedIds.has(event.id);
            return (
              <div
                key={event.id}
                className="bg-black/5 dark:bg-white/5 rounded p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => toggleExpand(event.id)}
                  className="w-full text-left flex items-start gap-2"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      {event.tokensIn !== undefined && (
                        <span className="text-muted-foreground">
                          in:{event.tokensIn}
                        </span>
                      )}
                      {event.tokensOut !== undefined && (
                        <span className="text-muted-foreground">
                          out:{event.tokensOut}
                        </span>
                      )}
                      {event.cost !== undefined && (
                        <span className="text-muted-foreground">
                          ${event.cost.toFixed(6)}
                        </span>
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="truncate text-muted-foreground">
                        {event.content.substring(0, 100)}
                      </p>
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="ml-5 mt-2 p-3 bg-black/10 dark:bg-white/10 rounded border">
                    <pre className="whitespace-pre-wrap break-words">
                      {event.content}
                    </pre>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-muted-foreground mb-2">Metadata:</p>
                        <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
