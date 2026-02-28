import { SessionEvent } from '@/hooks/use-session-events';
import { ThinkingEvent } from './thinking-event';
import { ToolCallEvent } from './tool-call-event';
import { MessageEvent } from './message-event';
import { ErrorEvent } from './error-event';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: SessionEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { type, content, metadata, timestamp, cost } = event;

  // Thinking event
  if (type === 'thinking') {
    return <ThinkingEvent content={content} timestamp={timestamp} cost={cost} />;
  }

  // Tool call event
  if (type === 'tool_call') {
    return (
      <ToolCallEvent
        toolName={metadata?.toolName || 'Unknown'}
        command={metadata?.command}
        result={metadata?.result}
        timestamp={timestamp}
        cost={cost}
      />
    );
  }

  // Message in/out events
  if (type === 'instruction' || type === 'message_in') {
    return (
      <MessageEvent
        type="in"
        sender={metadata?.sender || 'Unknown'}
        content={content}
        timestamp={timestamp}
        cost={cost}
      />
    );
  }

  if (type === 'message_out' || type === 'report') {
    return (
      <MessageEvent
        type="out"
        recipient={metadata?.recipient || 'Unknown'}
        content={content}
        timestamp={timestamp}
        cost={cost}
      />
    );
  }

  // Error event
  if (type === 'error' || type === 'fix') {
    return (
      <ErrorEvent
        content={content}
        errorType={metadata?.errorType}
        fixDescription={type === 'fix' ? content : metadata?.fixDescription}
        timestamp={timestamp}
        cost={cost}
      />
    );
  }

  // Delegation event
  if (type === 'delegation') {
    return (
      <Card className="border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">➡️</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-purple-900 dark:text-purple-100">
                  Delegated to
                </span>
                <Badge variant="outline" className="text-xs">
                  {metadata?.subAgentName || 'Sub-agent'}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Completion event
  if (type === 'completion') {
    return (
      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🏁</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-medium text-sm text-green-900 dark:text-green-100">
                Completed
              </span>
              <div className="flex items-center gap-2">
                {cost !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ${Number(cost).toFixed(6)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Fallback for unknown event types
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          {type}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </Card>
  );
}
