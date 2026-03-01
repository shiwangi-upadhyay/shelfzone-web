'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import type { TraceEvent, StreamMessage } from '@/hooks/use-command-center';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  selectedAgentId: string | null;
  messages: StreamMessage[];
  events: TraceEvent[];
  totalCost: number;
  isCompleted: boolean;
  isLoading: boolean;
  onSend: (instruction: string) => void;
  disabled?: boolean;
}

interface Agent {
  id: string;
  name: string;
  emoji?: string;
}

// Simple markdown-ish rendering
function formatContent(content: string) {
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
            <pre key={i} className="rounded-lg bg-slate-900 dark:bg-slate-950 p-3 overflow-x-auto">
              <code className="text-xs font-mono text-slate-100">
                {part.content}
              </code>
            </pre>
          );
        }
        
        const lines = part.content.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line: string, li: number) => {
              line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              line = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">$1</code>');
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
    <div className="flex justify-end gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="max-w-[70%] space-y-1">
        <div className="rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-2.5 text-white shadow-sm">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <p className="text-right text-[10px] text-muted-foreground px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
        <User className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

function AgentMessage({ event, agentName, agentEmoji }: { event: TraceEvent; agentName: string; agentEmoji: string }) {
  const d = event.data;
  const content = (d.content as string) || (d.text as string) || (d.message as string) || '';
  const timestamp = event.timestamp;

  if (!content.trim()) return null;

  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base shadow-sm">
        {agentEmoji}
      </div>
      <div className="flex-1 max-w-[70%] space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{agentName}</span>
        </div>
        <div className="rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-900 px-4 py-2.5 shadow-sm">
          <div className="text-[15px] leading-relaxed text-foreground">
            {formatContent(content)}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export function ChatInterface({
  selectedAgentId,
  messages,
  events,
  isLoading,
  onSend,
  disabled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch selected agent info
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get<{ data: Agent[] }>('/api/agent-portal/agents');
      return res.data;
    },
  });

  const selectedAgent = agentsData?.find(a => a.id === selectedAgentId);
  const agentName = selectedAgent?.name || 'Agent';
  const agentEmoji = selectedAgent?.emoji || '🤖';

  // Auto-scroll on new messages/events
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
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
    <div className="flex flex-1 flex-col min-w-0 bg-background">
      {/* Message stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-6 pb-8">
          {messages.length === 0 && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">{selectedAgentId ? agentEmoji : '💬'}</div>
              <h3 className="text-xl font-semibold text-foreground">
                {selectedAgentId ? `Chat with ${agentName}` : 'Select an agent to start'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                {selectedAgentId 
                  ? 'Send a message to begin your conversation'
                  : 'Choose an agent from the sidebar to start chatting'
                }
              </p>
            </div>
          )}
          
          {/* Render user messages and agent responses */}
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} content={msg.content!} timestamp={msg.timestamp} />
            ) : null
          )}
          
          {/* Render agent messages (filter out non-message events) */}
          {events.map((event) => {
            if (event.type === 'agent:message') {
              return <AgentMessage key={event.id} event={event} agentName={agentName} agentEmoji={agentEmoji} />;
            }
            return null;
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
                {agentEmoji}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-900">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-card/50">
        {selectedAgentId && (
          <div className="mx-auto max-w-3xl px-6 pt-2">
            <p className="text-xs text-muted-foreground">
              Talking to: <span className="font-semibold text-foreground">{agentName}</span>
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[56px] max-h-40 resize-none text-[15px] shadow-sm"
              disabled={disabled || isLoading}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || disabled || isLoading}
              className="h-[56px] w-[56px] shrink-0 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="mx-auto max-w-3xl mt-2 text-[11px] text-muted-foreground text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
