'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommandOutput {
  command: string;
  output: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  conversationId: string;
}

export function TerminalPanel({ conversationId }: TerminalPanelProps) {
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputs]);

  // Listen to SSE stream for command events
  useEffect(() => {
    if (!conversationId) return;

    const eventSource = new EventSource(`/api/bridge/events?conversationId=${conversationId}`);

    eventSource.addEventListener('command', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setOutputs((prev) => [
          ...prev,
          {
            command: data.command,
            output: data.output,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to parse command event:', error);
      }
    });

    eventSource.onerror = () => {
      console.error('EventSource error for terminal output');
      eventSource.close();
    };

    return () => eventSource.close();
  }, [conversationId]);

  return (
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-[500px] overflow-hidden flex flex-col">
      {outputs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-gray-500">Terminal ready</p>
            <p className="text-xs text-gray-600 mt-2">
              Command output from remote agent will appear here
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
          {outputs.map((cmd, idx) => (
            <div key={idx} className="mb-4">
              <div className="text-blue-400 flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <span>{cmd.command}</span>
              </div>
              <pre className="whitespace-pre-wrap mt-1 text-green-300 leading-relaxed">
                {cmd.output}
              </pre>
              {idx < outputs.length - 1 && (
                <div className="border-t border-gray-800 my-3" />
              )}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
