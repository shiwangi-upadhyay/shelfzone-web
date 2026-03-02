'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  type: 'delegation_start' | 'delegation_progress' | 'delegation_complete' | 'delegation_error' | 'agent_switch' | 'token_update';
  timestamp: number;
  data: {
    agentId?: string;
    agentName?: string;
    task?: string;
    progress?: number;
    status?: string;
    tokenUsage?: {
      used: number;
      limit: number;
      percentage: number;
    };
    error?: string;
    traceSessionId?: string;
  };
}

interface ActivityItemProps {
  event: ActivityEvent;
}

function ActivityItem({ event }: ActivityItemProps) {
  const { type, timestamp, data } = event;
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getIcon = () => {
    switch (type) {
      case 'delegation_start':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'delegation_complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'delegation_error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delegation_progress':
        return <Activity className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'delegation_start':
        return `${data.agentName} started`;
      case 'delegation_complete':
        return `${data.agentName} completed`;
      case 'delegation_error':
        return `${data.agentName} failed`;
      case 'delegation_progress':
        return `${data.agentName} progress`;
      case 'token_update':
        return 'Token usage updated';
      default:
        return 'Activity';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'delegation_start':
        return data.task || 'Working...';
      case 'delegation_error':
        return data.error || 'Unknown error';
      case 'delegation_progress':
        return `${data.progress}% complete`;
      case 'token_update':
        return `${data.tokenUsage?.used.toLocaleString()} / ${data.tokenUsage?.limit.toLocaleString()} tokens`;
      default:
        return data.status || '';
    }
  };

  return (
    <div className="flex gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{getTitle()}</p>
          <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 break-words">{getMessage()}</p>
        {type === 'delegation_progress' && data.progress !== undefined && (
          <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivitySidebar() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Get auth token from localStorage (same format as api.ts)
    const authData = localStorage.getItem('shelfzone-auth');
    if (!authData) {
      setError('Not authenticated');
      return;
    }

    let token: string;
    try {
      const parsed = JSON.parse(authData);
      token = parsed.state?.accessToken;
      if (!token) {
        setError('No access token found');
        return;
      }
    } catch {
      setError('Invalid auth data');
      return;
    }

    // Connect to SSE endpoint
    // Note: EventSource doesn't support custom headers, so we pass token in query
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/command-center/activity/stream?token=${encodeURIComponent(token)}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const event: ActivityEvent = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
      } catch (err) {
        console.error('[ActivitySidebar] Failed to parse event:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h2 className="font-semibold">Live Activity</h2>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            <div
              className={cn(
                'w-2 h-2 rounded-full mr-2',
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              )}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
      <ScrollArea className="flex-1 p-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Send a message to see live updates
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event, index) => (
              <ActivityItem key={`${event.timestamp}-${index}`} event={event} />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
