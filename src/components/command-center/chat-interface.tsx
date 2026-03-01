'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { Send, Loader2, DollarSign, User, Bot as BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { TraceEvent, StreamMessage } from '@/hooks/use-command-center';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: StreamMessage[];
  events: TraceEvent[];
  totalCost: number;
  isCompleted: boolean;
  isLoading: boolean;
  onSend: (instruction: string) => void;
  disabled?: boolean;
}

// Simple markdown-ish rendering (basic support for code blocks, bold, lists)
function formatContent(content: string) {
  // Code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let parts: any[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || '', content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts = [{ type: 'text', content }];
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return (
            <pre key={i} className="rounded-lg bg-slate-100 dark:bg-slate-900 p-3 overflow-x-auto">
              <code className="text-xs font-mono text-slate-800 dark:text-slate-200">
                {part.content}
              </code>
            </pre>
          );
        }
        
        // Simple inline formatting for text
        const lines = part.content.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line: string, li: number) => {
              // Bold: **text**
              line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              // Inline code: `code`
              line = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">$1</code>');
              // Lists
              const isList = line.match(/^[\-\*]\s/);
              
              if (isList) {
                return (
                  <div key={li} className="flex gap-2">
                    <span>•</span>
                    <span dangerouslySetInnerHTML={{ __html: line.replace(/^[\-\*]\s/, '') }} />
                  </div>
                );
              }
              
              return line.trim() ? (
                <p key={li} dangerouslySetInnerHTML={{ __html: line }} />
              ) : null;
            })}
          </div>
        );
      })}
    </div>
  );
}

function UserMessage({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div className="flex justify-end gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[75%] space-y-1">
        <div className="rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-white">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        <p className="text-right text-[10px] font-mono text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

function AgentMessage({ event }: { event: TraceEvent }) {
  const d = event.data;
  const agentName = (d.fromAgent as any)?.name || (d.agentName as string) || 'Agent';
  const agentEmoji = (d.agentEmoji as string) || '🤖';
  const content = (d.content as string) || (d.text as string) || (d.message as string) || '';
  const model = (d.model as string) || (d.metadata as any)?.model;
  const cost = d.cost as string | number | undefined;
  const tokenCount = d.tokenCount as number | undefined;

  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
        {agentEmoji}
      </div>
      <div className="flex-1 max-w-[75%] space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-foreground">{agentName}</span>
          {model && (
            <span className="text-[10px] font-mono text-muted-foreground">{model}</span>
          )}
        </div>
        <div className="rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-900 px-4 py-3">
          <div className="text-sm text-foreground prose-sm prose-slate dark:prose-invert max-w-none">
            {formatContent(content)}
          </div>
        </div>
        {(tokenCount || cost) && (
          <div className="flex gap-3 text-[10px] font-mono text-muted-foreground">
            {tokenCount && <span>{tokenCount} tokens</span>}
            {cost && <span>${Number(cost).toFixed(4)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function DelegationCard({ event }: { event: TraceEvent }) {
  const d = event.data;
  const fromName = (d.fromAgent as any)?.name || 'Agent';
  const fromEmoji = (d.fromEmoji as string) || '🤖';
  const toName = (d.agentName as string) || 'Agent';
  const toEmoji = (d.agentEmoji as string) || '🤖';
  const instruction = (d.instruction as string) || '';

  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 shrink-0" />
      <div className="flex-1 max-w-[75%]">
        <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{fromEmoji}</span>
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              {fromName}
            </span>
            <span className="text-purple-600 dark:text-purple-400">→</span>
            <span className="text-lg">{toEmoji}</span>
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
              {toName}
            </span>
          </div>
          {instruction && (
            <p className="text-xs text-purple-700 dark:text-purple-300 pl-1">
              "{instruction}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionCard({ event }: { event: TraceEvent }) {
  const d = event.data;
  const content = (d.content as string) || (d.result as string) || (d.message as string) || 'Done.';
  const agentName = (d.agentName as string) || (d.fromAgent as any)?.name || 'Agent';
  const agentEmoji = (d.agentEmoji as string) || '✓';

  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 shrink-0" />
      <div className="flex-1 max-w-[75%]">
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{agentEmoji}</span>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {agentName} completed
            </span>
          </div>
          <div className="text-sm text-emerald-700 dark:text-emerald-200 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface({
  messages,
  events,
  totalCost,
  isCompleted,
  isLoading,
  onSend,
  disabled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages/events
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 100);
    }
  }, [messages.length, events.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          {messages.length === 0 && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-foreground">Command Center</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Send an instruction to your agents. Watch as they delegate, reason, and complete tasks in real-time.
              </p>
            </div>
          )}
          
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} content={msg.content!} timestamp={msg.timestamp} />
            ) : null
          )}
          
          {events.map((event) => {
            if (event.type === 'agent:message') {
              return <AgentMessage key={event.id} event={event} />;
            }
            if (event.type === 'agent:delegation') {
              return <DelegationCard key={event.id} event={event} />;
            }
            if (event.type === 'agent:completion') {
              return <CompletionCard key={event.id} event={event} />;
            }
            return null;
          })}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t bg-card p-4">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="min-h-[52px] max-h-40 resize-none text-sm"
            disabled={disabled || isLoading}
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled || isLoading}
            className="h-[52px] w-[52px] shrink-0"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        <p className="mx-auto max-w-4xl mt-2 text-[11px] text-muted-foreground text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
