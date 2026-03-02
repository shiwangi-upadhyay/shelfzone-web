import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DelegationCardProps {
  agentName: string;
  instruction: string;
  reason?: string;
  status: 'delegating' | 'complete';
  cost?: number;
}

export function DelegationCard({
  agentName,
  instruction,
  reason,
  status,
  cost,
}: DelegationCardProps) {
  return (
    <div
      className={cn(
        'my-3 rounded-lg border p-4 transition-all',
        status === 'delegating'
          ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20'
          : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
      )}
    >
      <div className="flex items-start gap-3">
        {status === 'delegating' ? (
          <ArrowRight className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400 animate-pulse" />
        ) : (
          <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-400" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'text-sm font-semibold',
                status === 'delegating'
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-green-700 dark:text-green-300'
              )}
            >
              {status === 'delegating' ? 'Delegating to' : 'Completed by'} {agentName}
            </span>
            {cost !== undefined && (
              <span className="text-xs text-muted-foreground">
                ${cost.toFixed(4)}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground/80 mb-1">{instruction}</p>

          {reason && (
            <p className="text-xs text-muted-foreground italic">
              Reason: {reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
