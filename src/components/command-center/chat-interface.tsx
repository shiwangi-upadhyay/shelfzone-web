'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, User, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { CostDisplay, ConversationCostData } from './cost-display';

interface ChatInterfaceProps {
  selectedAgentId: string | null;
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }>;
  isStreaming: boolean;
  streamingContent: string;
  conversationCost: ConversationCostData | null;
  onSend: (message: string) => void;
  onStopGenerating: () => void;
  disabled?: boolean;
  error?: string | null;
}

interface Agent {
  id: string;
  name: string;
  emoji?: string;
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

function AgentMessage({ 
  content, 
  timestamp, 
  agentName, 
  agentEmoji,
  isStreaming 
}: { 
  content: string; 
  timestamp: string; 
  agentName: string; 
  agentEmoji: string;
  isStreaming?: boolean;
}) {
  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base shadow-sm">
        {agentEmoji}
      </div>
      <div className="flex-1 max-w-[70%] space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{agentName}</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              typing...
            </span>
          )}
        </div>
        <div className="rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-900 px-4 py-2.5 shadow-sm">
          <div className="text-[15px] leading-relaxed text-foreground">
            <MarkdownRenderer content={content} />
            {isStreaming && <span className="inline-block w-1.5 h-4 bg-foreground ml-1 animate-pulse" />}
          </div>
        </div>
        {!isStreaming && (
          <p className="text-[10px] text-muted-foreground px-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator({ agentName, agentEmoji }: { agentName: string; agentEmoji: string }) {
  return (
    <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
        {agentEmoji}
      </div>
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-900">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Thinking...</span>
      </div>
    </div>
  );
}

export function ChatInterface({
  selectedAgentId,
  messages,
  isStreaming,
  streamingContent,
  conversationCost,
  onSend,
  onStopGenerating,
  disabled,
  error,
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

  // Auto-scroll on new messages/streaming content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [messages.length, streamingContent, isStreaming]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming || disabled) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const hasWaitingForFirstChunk = isStreaming && !streamingContent;

  return (
    <div className="flex flex-1 flex-col min-w-0 bg-background">
      {/* Cost Display - Fixed at top */}
      {conversationCost && conversationCost.totalCost > 0 && (
        <div className="border-b bg-card/50 px-6 py-2.5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            💬 Conversation Cost
          </div>
          <CostDisplay conversationCost={conversationCost} />
        </div>
      )}
      
      {/* Message stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-6 pb-8">
          {messages.length === 0 && !isStreaming && (
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
          
          {/* Render messages */}
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
            ) : (
              <AgentMessage 
                key={msg.id} 
                content={msg.content} 
                timestamp={msg.timestamp}
                agentName={agentName}
                agentEmoji={agentEmoji}
              />
            )
          )}

          {/* Show "Thinking..." while waiting for first chunk */}
          {hasWaitingForFirstChunk && (
            <ThinkingIndicator agentName={agentName} agentEmoji={agentEmoji} />
          )}

          {/* Show streaming message */}
          {isStreaming && streamingContent && (
            <AgentMessage
              content={streamingContent}
              timestamp={new Date().toISOString()}
              agentName={agentName}
              agentEmoji={agentEmoji}
              isStreaming={true}
            />
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="max-w-md rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
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
              disabled={disabled || isStreaming}
              rows={1}
            />
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={onStopGenerating}
                className="h-[56px] w-[56px] shrink-0 shadow-sm"
                title="Stop generating"
              >
                <Square className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || disabled}
                className="h-[56px] w-[56px] shrink-0 shadow-sm"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
          <p className="mx-auto max-w-3xl mt-2 text-[11px] text-muted-foreground text-center">
            {isStreaming ? 'Click stop to interrupt generation' : 'Press Enter to send • Shift+Enter for new line'}
          </p>
        </form>
      </div>
    </div>
  );
}
