'use client';

import { AGENT_EMOJI, StatusDot, MODEL_LABELS } from './agent-badge';
import { cn } from '@/lib/utils';

interface AgentNode {
  id: string;
  name: string;
  status: string;
  totalCost: number;
  model?: string;
  type?: string;
}

interface AgentTreeProps {
  agents: AgentNode[];
  onAgentClick: (agent: AgentNode) => void;
}

export function AgentTree({ agents, onAgentClick }: AgentTreeProps) {
  if (!agents.length) return null;

  const master = agents[0];
  const subs = agents.slice(1);

  return (
    <div className="space-y-0">
      {/* Master agent */}
      <button
        onClick={() => onAgentClick(master)}
        className={cn(
          'flex items-center gap-3 w-full text-left rounded-lg p-3',
          'border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20',
          'hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors',
        )}
      >
        <span className="text-lg">{AGENT_EMOJI[master.name] || '🤖'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{master.name}</span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
              Master
            </span>
            {master.model && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                {MODEL_LABELS[master.model] || master.model}
              </span>
            )}
            <StatusDot status={master.status} />
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          ${Number(master.totalCost).toFixed(2)}
        </span>
      </button>

      {/* Sub-agents */}
      {subs.length > 0 && (
        <div className="ml-5 border-l border-border/60 pl-0">
          {subs.map((agent, i) => (
            <div key={agent.id} className="relative">
              {/* Horizontal connector */}
              <div className="absolute left-0 top-1/2 w-4 border-t border-border/60 -translate-y-1/2" />
              {/* Vertical line extension for non-last items */}
              {i < subs.length - 1 && (
                <div className="absolute left-0 top-1/2 bottom-0 border-l border-border/60" />
              )}
              <button
                onClick={() => onAgentClick(agent)}
                className={cn(
                  'flex items-center gap-3 w-full text-left ml-4 rounded-lg px-3 py-2',
                  'hover:bg-muted/50 transition-colors',
                )}
              >
                <span className="text-sm">{AGENT_EMOJI[agent.name] || '🤖'}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-sm">{agent.name}</span>
                  {agent.model && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      {MODEL_LABELS[agent.model] || agent.model}
                    </span>
                  )}
                  <StatusDot status={agent.status} />
                </div>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  ${Number(agent.totalCost).toFixed(2)}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
