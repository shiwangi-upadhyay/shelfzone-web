'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { Send, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserBubble, EventCard } from './message-cards';
import type { TraceEvent, StreamMessage } from '@/hooks/use-command-center';

interface ChatPanelProps {
  messages: StreamMessage[];
  events: TraceEvent[];
  totalCost: number;
  isCompleted: boolean;
  isLoading: boolean;
  onSend: (instruction: string) => void;
  disabled?: boolean;
}

export function ChatPanel({
  messages,
  events,
  totalCost,
  isCompleted,
  isLoading,
  onSend,
  disabled,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages/events
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, events.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Cost bar */}
      <div className="flex h-10 items-center justify-between border-b px-4 bg-card">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Cost: ${totalCost.toFixed(4)}</span>
        </div>
        {isCompleted && (
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            ✓ Complete
          </span>
        )}
        {isLoading && !isCompleted && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Running…
          </span>
        )}
      </div>

      {/* Message stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-3 p-4">
          {messages.length === 0 && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-foreground">Command Center</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Send an instruction to your master agent. Watch as it delegates, reasons, and completes tasks in real-time.
              </p>
            </div>
          )}
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserBubble key={msg.id} content={msg.content!} timestamp={msg.timestamp} />
            ) : null
          )}
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {isCompleted && (
            <div className="animate-in slide-in-from-bottom-2 duration-500 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                🎉 Task Complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t bg-card p-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter instruction for master agent…"
            className="min-h-[44px] max-h-32 resize-none text-sm"
            disabled={disabled || isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled || isLoading}
            className="h-[44px] w-[44px] shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
