import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingEventProps {
  content: string;
  timestamp: string;
  cost?: number;
}

export function ThinkingEvent({ content, timestamp, cost }: ThinkingEventProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
      >
        <span className="text-xl">🧠</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm text-amber-900 dark:text-amber-100">
              Thinking
            </span>
            <div className="flex items-center gap-2">
              {cost !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ${cost.toFixed(6)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground truncate">
              {content.substring(0, 100)}...
            </p>
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <pre className="text-xs whitespace-pre-wrap font-mono bg-white dark:bg-black/20 p-3 rounded border">
            {content}
          </pre>
        </div>
      )}
    </Card>
  );
}
