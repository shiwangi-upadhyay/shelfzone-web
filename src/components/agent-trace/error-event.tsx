import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ErrorEventProps {
  content: string;
  errorType?: string;
  fixDescription?: string;
  timestamp: string;
  cost?: number;
}

export function ErrorEvent({
  content,
  errorType,
  fixDescription,
  timestamp,
  cost,
}: ErrorEventProps) {
  const isFixed = !!fixDescription;

  return (
    <div className="space-y-2">
      {/* Error */}
      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-red-900 dark:text-red-100">
                  Error
                </span>
                {errorType && (
                  <Badge variant="destructive" className="text-xs">
                    {errorType}
                  </Badge>
                )}
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
            <p className="text-sm whitespace-pre-wrap text-red-800 dark:text-red-200">
              {content}
            </p>
          </div>
        </div>
      </Card>

      {/* Fix */}
      {isFixed && (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4 ml-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm text-green-900 dark:text-green-100 block mb-2">
                Fixed
              </span>
              <p className="text-sm whitespace-pre-wrap text-green-800 dark:text-green-200">
                {fixDescription}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
