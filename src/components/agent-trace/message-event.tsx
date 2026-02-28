import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MessageEventProps {
  type: 'in' | 'out';
  sender?: string;
  recipient?: string;
  content: string;
  timestamp: string;
  cost?: number;
}

export function MessageEvent({
  type,
  sender,
  recipient,
  content,
  timestamp,
  cost,
}: MessageEventProps) {
  const isIncoming = type === 'in';

  return (
    <Card
      className={cn(
        'p-4',
        isIncoming
          ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20'
          : 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{isIncoming ? '📥' : '📤'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-medium text-sm',
                  isIncoming
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-green-900 dark:text-green-100'
                )}
              >
                {isIncoming ? 'From' : 'To'}:
              </span>
              <span className="text-sm font-semibold">
                {isIncoming ? sender : recipient}
              </span>
            </div>
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
