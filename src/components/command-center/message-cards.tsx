'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TraceEvent } from '@/hooks/use-command-center';
import {
  ChevronDown,
  ChevronRight,
  Brain,
  GitBranch,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

// ---- User bubble ----
export function UserBubble({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div className="flex justify-end animate-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[70%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-white">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p className="mt-1 text-right text-[10px] font-mono opacity-60">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

// ---- Thinking card ----
export function ThinkingCard({ event }: { event: TraceEvent }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-left text-sm transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50"
      >
        <Brain className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="flex-1 font-medium text-amber-800 dark:text-amber-300">Thinking…</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-amber-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-amber-500" />
        )}
      </button>
      {expanded && (
        <div className="mt-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2">
          <p className="text-xs text-amber-900 dark:text-amber-200 font-mono whitespace-pre-wrap">
            {(event.data.text as string) || JSON.stringify(event.data)}
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Delegation card ----
export function DelegationCard({ event }: { event: TraceEvent }) {
  const d = event.data;
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <GitBranch className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-purple-800 dark:text-purple-300">Delegated to</span>
        <span className="text-lg">{(d.agentEmoji as string) || '🤖'}</span>
        <span className="font-semibold text-purple-900 dark:text-purple-200">
          {(d.agentName as string) || 'Agent'}
        </span>
      </div>
      {typeof d.instruction === 'string' && d.instruction && (
        <p className="mt-1.5 text-xs text-purple-700 dark:text-purple-300 font-mono pl-6">
          {d.instruction}
        </p>
      )}
    </div>
  );
}

// ---- Tool call card ----
export function ToolCallCard({ event }: { event: TraceEvent }) {
  const [expanded, setExpanded] = useState(false);
  const d = event.data;
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left text-sm"
      >
        <Wrench className="h-4 w-4 text-slate-500" />
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {(d.toolName as string) || 'tool'}
        </span>
        <span className="flex-1" />
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
      {expanded && Boolean(d.result) && (
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-100 dark:bg-slate-800 p-2 text-xs font-mono text-slate-600 dark:text-slate-300">
          {typeof d.result === 'string' ? d.result : JSON.stringify(d.result, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ---- Error card ----
export function ErrorCard({ event }: { event: TraceEvent }) {
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span className="font-medium text-red-800 dark:text-red-300">Error</span>
      </div>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300 font-mono pl-6">
        {(event.data.message as string) || (event.data.error as string) || JSON.stringify(event.data)}
      </p>
    </div>
  );
}

// ---- Fix card ----
export function FixCard({ event }: { event: TraceEvent }) {
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="font-medium text-green-800 dark:text-green-300">Fix Applied</span>
      </div>
      <p className="mt-1 text-xs text-green-700 dark:text-green-300 font-mono pl-6">
        {(event.data.description as string) || JSON.stringify(event.data)}
      </p>
    </div>
  );
}

// ---- Completion card ----
export function CompletionCard({ event }: { event: TraceEvent }) {
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <span className="font-semibold text-emerald-800 dark:text-emerald-300">Task Complete</span>
      </div>
      <p className="mt-1.5 text-sm text-emerald-700 dark:text-emerald-200 pl-6 whitespace-pre-wrap">
        {(event.data.content as string) || (event.data.result as string) || (event.data.message as string) || 'Done.'}
      </p>
      {Boolean(event.data.cost || event.data.tokenCount) && (
        <div className="mt-1.5 pl-6 flex gap-3 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          {event.data.tokenCount ? <span>{String(event.data.tokenCount)} tokens</span> : null}
          {event.data.cost ? <span>Cost: ${Number(event.data.cost).toFixed(4)}</span> : null}
        </div>
      )}
    </div>
  );
}

// ---- Agent message card ----
export function AgentMessageCard({ event }: { event: TraceEvent }) {
  const d = event.data;
  const agentName = (d.fromAgent as any)?.name || (d.agentName as string) || 'Agent';
  const model = (d.model as string) || (d.metadata as any)?.model;
  const cost = d.cost as string | number | undefined;
  const tokenCount = d.tokenCount as number | undefined;

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">{agentName}</span>
        {model && (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">{model}</span>
        )}
      </div>
      <div className="text-sm text-foreground whitespace-pre-wrap pl-6">
        {(d.content as string) || (d.text as string) || (d.message as string) || ''}
      </div>
      {(tokenCount || cost) && (
        <div className="mt-2 pl-6 flex gap-3 text-[10px] font-mono text-muted-foreground">
          {tokenCount && <span>{tokenCount} tokens</span>}
          {cost && <span>${Number(cost).toFixed(4)}</span>}
        </div>
      )}
    </div>
  );
}

// ---- Render event by type ----
export function EventCard({ event }: { event: TraceEvent }) {
  switch (event.type) {
    case 'agent:thinking':
      return <ThinkingCard event={event} />;
    case 'agent:delegation':
      return <DelegationCard event={event} />;
    case 'agent:tool_call':
      return <ToolCallCard event={event} />;
    case 'agent:error':
      return <ErrorCard event={event} />;
    case 'agent:fix':
      return <FixCard event={event} />;
    case 'agent:message':
      return <AgentMessageCard event={event} />;
    case 'agent:completion':
      return <CompletionCard event={event} />;
    default:
      return null;
  }
}
