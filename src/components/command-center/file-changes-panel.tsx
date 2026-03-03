'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface FileChange {
  filePath: string;
  diff: string;
  timestamp: Date;
}

interface FileChangesPanelProps {
  conversationId: string;
}

export function FileChangesPanel({ conversationId }: FileChangesPanelProps) {
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);

  // Listen to SSE stream for file_change events
  useEffect(() => {
    if (!conversationId) return;

    const eventSource = new EventSource(`/api/bridge/events?conversationId=${conversationId}`);

    eventSource.addEventListener('file_change', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setFileChanges((prev) => [
          ...prev,
          {
            filePath: data.filePath,
            diff: data.diff,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to parse file_change event:', error);
      }
    });

    eventSource.onerror = () => {
      console.error('EventSource error for file changes');
      eventSource.close();
    };

    return () => eventSource.close();
  }, [conversationId]);

  return (
    <div className="space-y-4 p-4">
      {fileChanges.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-sm">No file changes yet</p>
          <p className="text-xs mt-2">
            File modifications by the remote agent will appear here
          </p>
        </div>
      ) : (
        fileChanges.map((change, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono font-semibold text-foreground">
                  {change.filePath}
                </code>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(change.timestamp, { addSuffix: true })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono leading-relaxed">
                {change.diff}
              </pre>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
