import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ToolCallEventProps {
  toolName: string;
  command?: string;
  result?: string;
  timestamp: string;
  cost?: number;
}

export function ToolCallEvent({
  toolName,
  command,
  result,
  timestamp,
  cost,
}: ToolCallEventProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
      >
        <span className="text-xl">🔧</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm">Tool Call: {toolName}</span>
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
          {command && !expanded && (
            <p className="text-xs text-muted-foreground truncate font-mono">
              {command}
            </p>
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {command && (
            <div>
              <p className="text-xs font-medium mb-1 text-muted-foreground">Command:</p>
              <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                {command}
              </pre>
            </div>
          )}
          {result && (
            <div>
              <p className="text-xs font-medium mb-1 text-muted-foreground">Result:</p>
              <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded border max-h-96 overflow-y-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
